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

export function getSsgEntrySource(): string {
  return `
import React from "react";
import { renderToString } from "react-dom/server";
import { XmluiRoot } from "xmlui";
import type { XmluiModule, Extension } from "xmlui";

const runtime = import.meta.glob([
  "./**/*.xmlui",
  "./**/*.xs",
  "./**/config.ts",
  "./**/config.js",
  "./**/api.ts",
  "./**/api.js",
  "./**/themes/**/*.ts",
  "./**/themes/**/*.js",
], { eager: true });

const loadedExtensions: Extension[] = [];

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

export function renderPath(pathname: string) {
  return renderToString(
    React.createElement(XmluiRoot, {
      module: appModule,
      initialUrl: pathname,
      extensions: loadedExtensions,
    })
  );
}
`;
}
