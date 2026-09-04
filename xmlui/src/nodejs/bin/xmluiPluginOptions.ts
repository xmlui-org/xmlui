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

/**
 * Settings that turn XMLUI script compilation on. Used to decide whether an
 * app description we failed to load was worth complaining about.
 */
const SCRIPT_COMPILATION_KEYS = [
  "compileScripts",
  "compileBindings",
  "compileEventHandlers",
  "compiledScriptSourceMaps",
  "logCompiledEventHandlerSource",
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
  const compileScripts = setting("compileScripts");
  const compileBindings = setting("compileBindings") ?? compileScripts;
  const compileEventHandlers = setting("compileEventHandlers") ?? compileScripts;
  const hasScriptCompilation =
    compileScripts === true || compileBindings === true || compileEventHandlers === true;
  const compiledScriptSourceMaps =
    setting("compiledScriptSourceMaps") ??
    (options.devServer && hasScriptCompilation ? "external" : undefined);
  return {
    analyze: config.analyze,
    reactiveCycles: config.reactiveCycles,
    accessibility: config.accessibility,
    typeContracts: config.typeContracts,
    compileScripts,
    compileBindings,
    compileEventHandlers,
    compiledScriptSourceMaps,
    logCompiledEventHandlerSource: setting("logCompiledEventHandlerSource"),
  };
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
  const appDescription = await readAppDescriptionConfig(cwd);
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
 * The app description may import assets the Node process cannot load (SCSS,
 * `import.meta.glob`, and friends). Such a failure is not fatal: the build goes
 * on with `xmlui.config.json` alone, and we only complain when the unreadable
 * file looks like it was trying to configure script compilation.
 */
async function readAppDescriptionConfig(cwd: string): Promise<XmluiConfigSource | undefined> {
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
    } catch (error) {
      warnUnreadableAppDescription(file, rawConfig, error);
      return undefined;
    }
  }
  return undefined;
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
  if (!SCRIPT_COMPILATION_KEYS.some((key) => rawConfig.includes(key))) {
    return;
  }
  console.warn(
    `[xmlui] Could not read "${file}" to resolve script compilation settings ` +
      `(${(error as Error)?.message ?? error}). Build-time script compilation stays off; ` +
      `set "compileScripts" in "xmlui.config.json" to enable it.`,
  );
}
