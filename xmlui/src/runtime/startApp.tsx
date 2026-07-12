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
): Root {
  const appModule = findAppModule(runtime);
  const appConfig = findAppConfig(runtime);
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
  appGlobals?: Record<string, unknown>;
  icons?: Record<string, string>;
  resources?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  defaultTone?: ThemeTone;
};

function findAppConfig(runtime: Record<string, unknown>): StandaloneAppConfig | undefined {
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
  return Boolean(
    config.appGlobals ||
      config.icons ||
      config.resources ||
      config.themes ||
      config.defaultTheme ||
      config.defaultTone,
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
