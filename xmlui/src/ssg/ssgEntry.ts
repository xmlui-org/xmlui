/**
 * Generates the source code for a temporary SSR entry module.
 *
 * This module is built by Vite in SSR mode and produces a bundle
 * whose `renderPath(url)` function renders the app for a given route
 * using react-dom/server's renderToString.
 *
 * Compared to the old implementation, this is much simpler because
 * the new runtime uses XmluiRoot directly instead of needing
 * StaticRouter, HelmetProvider, StyleProvider, etc.
 */

export function getSsgEntrySource(extensionNames: string[] = []): string {
  const extensionImports = extensionNames
    .map((name, index) => `import extension${index} from ${JSON.stringify(name)};`)
    .join("\n");
  const loadedExtensions = extensionNames.map((_, index) => `extension${index}`).join(", ");

  return `
import React from "react";
import { renderToString } from "react-dom/server";
import { XmluiRoot } from "xmlui";
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
  return renderToString(
    React.createElement(XmluiRoot, {
      module: appModule,
      initialUrl: pathname,
      extensions: loadedExtensions,
      appGlobals: { ...appGlobalsFromConfig(appConfig), isSsg: true },
    })
  );
}

type RuntimeAppConfig = {
  name?: string;
  resources?: Record<string, string>;
  defaultTheme?: string;
  defaultTone?: string;
  appGlobals?: Record<string, unknown>;
};

function findAppConfig(): RuntimeAppConfig | undefined {
  for (const value of Object.values(runtime)) {
    const config = (value as any)?.default;
    if (config && typeof config === "object" && (
      "appGlobals" in config ||
      "resources" in config ||
      "name" in config ||
      "defaultTheme" in config ||
      "defaultTone" in config
    )) {
      return config as RuntimeAppConfig;
    }
  }
  return undefined;
}

function appGlobalsFromConfig(config: RuntimeAppConfig | undefined): Record<string, unknown> {
  if (!config) {
    return {};
  }
  return {
    ...(config.name ? { name: config.name } : {}),
    ...(config.resources ? { resources: config.resources } : {}),
    ...(config.defaultTheme ? { defaultTheme: config.defaultTheme } : {}),
    ...(config.defaultTone ? { defaultTone: config.defaultTone } : {}),
    ...(config.appGlobals ?? {}),
  };
}
`;
}
