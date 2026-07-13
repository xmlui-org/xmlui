/**
 * Generates the source code for a temporary SSR entry module.
 *
 * This module is built by Vite in SSR mode and produces a bundle
 * whose `renderPath(url)` function renders the app for a given route
 * using react-dom/server's renderToString.
 *
 * The generated entry mirrors the old style-registry SSG contract: a
 * per-route registry wraps the rendered app and returns the collected SSR
 * styles and hashes alongside the markup.
 */

export function getSsgEntrySource(extensionNames: string[] = []): string {
  const extensionImports = extensionNames
    .map((name, index) => `import extension${index} from ${JSON.stringify(name)};`)
    .join("\n");
  const loadedExtensions = extensionNames.map((_, index) => `extension${index}`).join(", ");

  return `
import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { StyleProvider, StyleRegistry, XmluiRoot } from "xmlui";
import type { XmluiModule, Extension } from "xmlui";
${extensionImports}

const runtime = import.meta.glob([
  "./src/**/*.xmlui",
  "./src/**/*.xs",
  "./src/**/config.ts",
  "./src/**/config.js",
  "./src/**/api.ts",
  "./src/**/api.js",
  "./src/**/themes/**/*.ts",
  "./src/**/themes/**/*.js",
], { eager: true });

const loadedExtensions: Extension[] = [${loadedExtensions}];

function findAppModule(): XmluiModule & { kind: "app" } {
  for (const value of Object.values(runtime)) {
    const mod = (value as any)?.default;
    if (mod?.kind === "app") {
      return mod;
    }
  }
  throw new Error(
    "No app module found. Make sure /src/Main.xmlui exists and contains an <App> element."
  );
}

const appModule = findAppModule();
const appConfig = findAppConfig();

export function renderPath(pathname: string) {
  const registry = new StyleRegistry();
  const markup = renderToString(
    React.createElement(
      StyleProvider,
      { styleRegistry: registry },
      React.createElement(
        MemoryRouter,
        { initialEntries: [pathname] },
        React.createElement(XmluiRoot, {
          module: appModule,
        initialUrl: pathname,
        extensions: loadedExtensions,
        appGlobals: { ...(appConfig?.appGlobals ?? {}), isSsg: true },
        icons: appConfig?.icons,
        resources: appConfig?.resources,
        resourceMap: appConfig?.resourceMap,
        themes: appConfig?.themes,
        defaultTheme: appConfig?.defaultTheme,
      })
      )
    )
  );
  return {
    markup,
    ssrStyles: registry.getSsrStyles(),
    ssrHashes: Array.from(registry.cache.keys()).join(","),
    htmlClasses: registry.getRootClasses(),
  };
}

type AppConfig = {
  appGlobals?: Record<string, unknown>;
  icons?: Record<string, string>;
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  themes?: Array<any>;
  defaultTheme?: string;
};

function findAppConfig(): AppConfig | undefined {
  for (const value of Object.values(runtime)) {
    const config = (value as any)?.default;
    if (config && typeof config === "object" && (
      config.appGlobals ||
      config.themes ||
      config.defaultTheme ||
      config.icons ||
      config.resources ||
      config.resourceMap
    )) {
      return config as AppConfig;
    }
  }
  return undefined;
}
`;
}
