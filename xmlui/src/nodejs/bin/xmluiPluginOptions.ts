import { readFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import type { PluginOptions } from "../vite-xmlui-plugin";

type NormalizeXmluiPluginOptionsOptions = {
  devServer?: boolean;
};

type LoadXmluiPluginOptionsOptions = NormalizeXmluiPluginOptionsOptions & {
  /** Project root to read configuration files from. Defaults to `process.cwd()`. */
  cwd?: string;
};

/**
 * A configuration record the build tooling reads settings from. Keys may sit at
 * the top level (`xmlui.config.json`) or under `xmluiConfig` / `appGlobals`
 * (the app description in `src/config.ts` or `config.json`) — the very same
 * places the browser runtime reads them from.
 */
export type XmluiConfigSource = {
  appGlobals?: Record<string, any>;
  xmluiConfig?: Record<string, any>;
  [key: string]: any;
};

/** The two settings that configure script compilation. */
const SCRIPT_COMPILATION_KEYS = ["compileScripts", "reportCompileFallbacks"];

/**
 * Settings that used to configure compilation. They no longer do anything, so a
 * project that still carries one is told what to use instead — silence here is what
 * made the misconfiguration in #3876 expensive to find.
 */
const REMOVED_COMPILATION_KEYS: Record<string, string> = {
  compileBindings: '"compileScripts" now covers bindings, handlers, and code-behind alike',
  compileEventHandlers: '"compileScripts" now covers bindings, handlers, and code-behind alike',
  compiledScriptSourceMaps:
    "source maps are automatic: on under `xmlui start`, off in builds",
  logCompiledEventHandlerSource:
    'use "reportCompileFallbacks" for fallback diagnostics, or `xsVerbose` for per-artifact traces',
};

/** Keys the loader looks for anywhere in a config source, to decide whether to warn. */
const ALL_COMPILATION_KEYS = [
  ...SCRIPT_COMPILATION_KEYS,
  ...Object.keys(REMOVED_COMPILATION_KEYS),
];

/**
 * App description candidates, in resolution order. The first readable file
 * wins; `src/config.*` is the Vite-mode home of `StandaloneAppDescription`,
 * `config.json` the standalone (buildless) one.
 */
const APP_DESCRIPTION_FILES = [
  ["src", "config.ts"],
  ["src", "config.tsx"],
  ["src", "config.mts"],
  ["src", "config.js"],
  ["src", "config.mjs"],
  ["src", "config.json"],
  ["config.json"],
];

export function normalizeXmluiPluginOptions(
  config: XmluiConfigSource,
  options: NormalizeXmluiPluginOptionsOptions = {},
): PluginOptions {
  const xmluiConfig = config.xmluiConfig ?? {};
  const appGlobals = config.appGlobals ?? {};
  // --- Mirrors the runtime merge (see `mergeXmluiConfig` in AppContent):
  // --- `xmluiConfig` overrides `appGlobals`, and an explicit top-level key in
  // --- `xmlui.config.json` overrides both.
  const setting = (key: string) => config[key] ?? xmluiConfig[key] ?? appGlobals[key];
  warnAboutRemovedKeys(config, xmluiConfig, appGlobals);
  const compileScripts = setting("compileScripts") === true;
  return {
    analyze: config.analyze,
    reactiveCycles: config.reactiveCycles,
    accessibility: config.accessibility,
    typeContracts: config.typeContracts,
    compileScripts,
    reportCompileFallbacks: setting("reportCompileFallbacks") === true,
    // --- Source maps exist to debug compiled scripts while developing; a build has
    // --- no use for the payload. Not an app-level setting.
    ...(compileScripts && options.devServer ? { sourceMaps: "external" as const } : {}),
  };
}

const reportedRemovedKeys = new Set<string>();

function warnAboutRemovedKeys(...records: Array<Record<string, any>>): void {
  for (const [key, advice] of Object.entries(REMOVED_COMPILATION_KEYS)) {
    if (reportedRemovedKeys.has(key)) {
      continue;
    }
    if (!records.some((record) => record?.[key] !== undefined)) {
      continue;
    }
    reportedRemovedKeys.add(key);
    console.warn(`[xmlui] "${key}" is no longer supported — ${advice}.`);
  }
}

/** Test seam: the notices are one-shot per process. */
export function resetRemovedCompilationKeyNotices(): void {
  reportedRemovedKeys.clear();
}

/**
 * Merges the two configuration sources the build tooling knows about.
 * `xmlui.config.json` wins over the app description, key by key.
 */
export function mergeXmluiConfigSources(
  appDescription: XmluiConfigSource | undefined,
  xmluiConfigFile: XmluiConfigSource | undefined,
): XmluiConfigSource {
  const appConfig = appDescription ?? {};
  const fileConfig = xmluiConfigFile ?? {};
  return {
    ...fileConfig,
    appGlobals: { ...(appConfig.appGlobals ?? {}), ...(fileConfig.appGlobals ?? {}) },
    xmluiConfig: { ...(appConfig.xmluiConfig ?? {}), ...(fileConfig.xmluiConfig ?? {}) },
  };
}

export async function loadXmluiPluginOptions(
  options: LoadXmluiPluginOptionsOptions = {},
): Promise<PluginOptions> {
  const { cwd = process.cwd(), ...normalizeOptions } = options;
  const xmluiConfigFile = await readXmluiConfigFile(cwd);
  const appDescription = await readAppDescriptionConfig(cwd, xmluiConfigFile);
  if (!xmluiConfigFile && !appDescription) {
    return {};
  }
  return normalizeXmluiPluginOptions(
    mergeXmluiConfigSources(appDescription, xmluiConfigFile),
    normalizeOptions,
  );
}

async function readXmluiConfigFile(cwd: string): Promise<XmluiConfigSource | undefined> {
  try {
    const rawConfig = await readFile(path.join(cwd, "xmlui.config.json"), "utf-8");
    return JSON.parse(rawConfig);
  } catch {
    return undefined;
  }
}

/**
 * Reads the app description (`StandaloneAppDescription`) so that framework
 * settings declared there — script compilation among them — reach the build
 * pipeline as well, not just the browser runtime.
 *
 * The description may use syntax or assets a plain Node import cannot evaluate —
 * `import.meta.glob`, stylesheets, `.xmlui` imports. Those are retried through Vite's
 * module runner, but only for settings `xmlui.config.json` has not already answered,
 * since that retry evaluates the whole module graph the description pulls in. If even
 * that fails the build goes on with `xmlui.config.json` alone, and we complain only
 * when the unreadable file looks like it was configuring script compilation.
 */
async function readAppDescriptionConfig(
  cwd: string,
  xmluiConfigFile: XmluiConfigSource | undefined,
): Promise<XmluiConfigSource | undefined> {
  for (const segments of APP_DESCRIPTION_FILES) {
    const file = path.join(cwd, ...segments);
    let rawConfig: string;
    try {
      rawConfig = await readFile(file, "utf-8");
    } catch {
      continue;
    }
    if (file.endsWith(".json")) {
      try {
        return pickConfigSource(JSON.parse(rawConfig));
      } catch (error) {
        warnUnreadableAppDescription(file, rawConfig, error);
        return undefined;
      }
    }
    try {
      const module = await import(pathToFileURL(file).href);
      return pickConfigSource(module?.default ?? module);
    } catch (nodeImportError) {
      // --- A plain Node import cannot evaluate Vite-only syntax such as
      // --- `import.meta.glob` (the shape the `getLocalIcons()` pattern in our own app
      // --- templates uses) or asset imports. Retry through Vite's module runner — but
      // --- only for settings this project has not already answered in
      // --- `xmlui.config.json`, since the retry evaluates the whole module graph the
      // --- description pulls in.
      if (!hasUnansweredScriptCompilationKey(rawConfig, xmluiConfigFile)) {
        return undefined;
      }
      try {
        return pickConfigSource(await importAppDescriptionThroughVite(cwd, file));
      } catch (viteImportError) {
        warnUnreadableAppDescription(file, rawConfig, viteImportError ?? nodeImportError);
        return undefined;
      }
    }
  }
  return undefined;
}

/**
 * Evaluates the app description with Vite's plugin pipeline applied, so
 * `import.meta.glob`, `.xmlui` imports, and TypeScript all resolve exactly as they do
 * in the browser build. Stylesheets are stubbed out: an app description never needs
 * them, and CSS preprocessing is not configured for the module runner environment.
 */
async function importAppDescriptionThroughVite(cwd: string, file: string): Promise<unknown> {
  const { runnerImport } = await import("vite");
  const { default: viteXmluiPlugin } = await import("../vite-xmlui-plugin");
  const stubbedStyles = new Set<string>();
  const stubStyles = {
    name: "xmlui:app-description-style-stub",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (!/\.(css|scss|sass|less|styl|stylus)(\?.*)?$/.test(id)) {
        return null;
      }
      // --- The stub id must not keep the stylesheet extension, or Vite's CSS
      // --- transform claims it again.
      const stubId = `\0xmlui-style-stub-${stubbedStyles.size}.js`;
      stubbedStyles.add(stubId);
      return stubId;
    },
    load(id: string) {
      return stubbedStyles.has(id) ? "export default {};" : null;
    },
  };
  const imported = await runnerImport<Record<string, any>>(pathToFileURL(file).href, {
    root: cwd,
    configFile: false,
    logLevel: "silent",
    plugins: [
      stubStyles,
      viteXmluiPlugin({
        analyze: "off",
        reactiveCycles: "off",
        accessibility: "off",
        typeContracts: "off",
      }) as any,
    ],
    resolve: {
      extensions: [".js", ".ts", ".jsx", ".tsx", ".json", ".xmlui", ".xmlui.xs", ".xs"],
    },
  });
  const module = imported.module as Record<string, any>;
  return module?.default ?? module;
}

function mentionsScriptCompilation(rawConfig: string): boolean {
  return ALL_COMPILATION_KEYS.some((key) => rawConfig.includes(key));
}

/**
 * True when the app description mentions a script-compilation key that
 * `xmlui.config.json` does not already settle. `xmlui.config.json` wins per key, so
 * reading the description again could not change the outcome for keys it defines.
 */
function hasUnansweredScriptCompilationKey(
  rawConfig: string,
  xmluiConfigFile: XmluiConfigSource | undefined,
): boolean {
  return ALL_COMPILATION_KEYS.some(
    (key) => rawConfig.includes(key) && !definesSetting(xmluiConfigFile, key),
  );
}

function definesSetting(config: XmluiConfigSource | undefined, key: string): boolean {
  if (!config) {
    return false;
  }
  return (
    config[key] !== undefined ||
    config.xmluiConfig?.[key] !== undefined ||
    config.appGlobals?.[key] !== undefined
  );
}

function pickConfigSource(appDescription: unknown): XmluiConfigSource | undefined {
  if (!appDescription || typeof appDescription !== "object") {
    return undefined;
  }
  const { appGlobals, xmluiConfig } = appDescription as XmluiConfigSource;
  return { appGlobals, xmluiConfig };
}

function warnUnreadableAppDescription(file: string, rawConfig: string, error: unknown): void {
  // --- Apps that do not configure script compilation in their description lose
  // --- nothing when we cannot load it, so stay quiet for them.
  if (!mentionsScriptCompilation(rawConfig)) {
    return;
  }
  console.warn(
    `[xmlui] Could not read "${file}" to resolve script compilation settings ` +
      `(${(error as Error)?.message ?? error}). Build-time script compilation stays off; ` +
      `set "compileScripts" in "xmlui.config.json" to enable it.`,
  );
}
