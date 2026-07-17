import React from "react";
import { createRoot, type Root } from "react-dom/client";

import { XmluiRoot } from "./index";
import type { XmluiModule } from "./types";
import type { Extension } from "../extensions";
import type { ThemeTone } from "../styling";
import type { ThemeDefinition } from "../abstractions/ThemingDefs";

let contentRoot: Root | null = null;
let hmrKey = 0;

/**
 * API-compatible with the original xmlui `startApp`.
 *
 * Accepts the result of `import.meta.glob('/src/**', { eager: true })`,
 * finds the app module (the one whose default export has `kind === "app"`),
 * and renders it into `#root`.
 *
 * On HMR updates, re-renders the existing root with a fresh React key so
 * the component tree is fully remounted with the new module's state.
 */
export function startApp(
  runtime: Record<string, unknown>,
  extensions: Extension[] = [],
  appConfigOverride?: StandaloneAppConfig,
): Root {
  const appModule = findAppModule(runtime);
  const appConfig = normalizeAppConfig(
    appConfigOverride ?? findPreferredRuntimeAppConfig(runtime) ?? findAppConfig(runtime),
  );
  return renderApp(appModule, extensions, appConfig);
}

function renderApp(
  appModule: XmluiModule & { kind: "app" },
  extensions: Extension[],
  appConfig: StandaloneAppConfig = {},
): Root {
  const rootElement = ensureRootElement();

  if (!contentRoot) {
    contentRoot = createRoot(rootElement);
  }

  contentRoot.render(
    React.createElement(XmluiRoot, {
      key: hmrKey++,
      module: appModule,
      extensions,
      appGlobals: appConfig.appGlobals,
      xmluiConfig: appConfig.xmluiConfig,
      icons: appConfig.icons,
      resources: appConfig.resources,
      themes: appConfig.themes,
      defaultTheme: appConfig.defaultTheme,
      defaultTone: appConfig.defaultTone,
    }),
  );

  return contentRoot;
}

type StandaloneAppConfig = {
  name?: string;
  appGlobals?: Record<string, unknown>;
  xmluiConfig?: Record<string, unknown>;
  icons?: Record<string, string>;
  resources?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  defaultTone?: ThemeTone;
};

function normalizeAppConfig(appConfig: StandaloneAppConfig | undefined): StandaloneAppConfig | undefined {
  if (!appConfig) {
    return undefined;
  }
  return {
    ...appConfig,
    appGlobals: {
      ...(appConfig.name ? { name: appConfig.name } : {}),
      ...(appConfig.appGlobals ?? {}),
    },
    xmluiConfig: appConfig.xmluiConfig ? { ...appConfig.xmluiConfig } : undefined,
    icons: appConfig.icons ? { ...appConfig.icons } : undefined,
    resources: appConfig.resources ? { ...appConfig.resources } : undefined,
    themes: appConfig.themes ? appConfig.themes.map((theme) => ({ ...theme })) : undefined,
  };
}

function findPreferredRuntimeAppConfig(
  runtime: Record<string, unknown>,
): StandaloneAppConfig | undefined {
  const config = (runtime["/src/config.ts"] as any)?.default;
  return isStandaloneAppConfig(config) ? config : undefined;
}

function findAppConfig(runtime: Record<string, unknown>): StandaloneAppConfig | undefined {
  for (const [path, value] of Object.entries(runtime)) {
    if (!isPreferredAppConfigPath(path)) {
      continue;
    }
    const config = (value as any)?.default;
    if (isStandaloneAppConfig(config)) {
      return config;
    }
  }
  for (const value of Object.values(runtime)) {
    const config = (value as any)?.default;
    if (isStandaloneAppConfig(config)) {
      return config;
    }
  }
  return undefined;
}

function isStandaloneAppConfig(value: unknown): value is StandaloneAppConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const config = value as StandaloneAppConfig;
  if (isThemeDefinitionOnly(config)) {
    return false;
  }
  return Boolean(
    config.appGlobals ||
      config.xmluiConfig ||
      config.icons ||
      config.resources ||
      config.themes ||
      config.defaultTheme ||
      config.defaultTone,
  );
}

function isPreferredAppConfigPath(path: string): boolean {
  return /(^|\/)src\/config\.(cjs|cts|js|jsx|mjs|mts|ts|tsx)$/.test(path);
}

function isThemeDefinitionOnly(value: StandaloneAppConfig): boolean {
  const maybeTheme = value as StandaloneAppConfig & Partial<ThemeDefinition>;
  if (typeof maybeTheme.id !== "string") {
    return false;
  }
  const hasAppConfigShape = Boolean(
    value.appGlobals ||
      value.xmluiConfig ||
      value.icons ||
      value.themes ||
      value.defaultTheme ||
      value.defaultTone,
  );
  if (hasAppConfigShape) {
    return false;
  }
  return Boolean(
    maybeTheme.themeVars ||
      maybeTheme.tones ||
      maybeTheme.extends ||
      maybeTheme.color ||
      maybeTheme.resources,
  );
}

function findAppModule(
  runtime: Record<string, unknown>,
): XmluiModule & { kind: "app" } {
  for (const value of Object.values(runtime)) {
    const mod = (value as any)?.default;
    if (mod?.kind === "app") {
      return mod;
    }
  }
  throw new Error(
    "No app module found in runtime. Make sure /src/Main.xmlui exists and contains an <App> element.",
  );
}

function ensureRootElement(): HTMLElement {
  let el = document.getElementById("root");
  if (!el) {
    el = document.createElement("div");
    el.setAttribute("id", "root");
    document.body.appendChild(el);
  }
  return el;
}
