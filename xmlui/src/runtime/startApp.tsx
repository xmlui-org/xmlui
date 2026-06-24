import React from "react";
import { createRoot, type Root } from "react-dom/client";

import { XmluiRoot } from "./index";
import type { XmluiModule } from "./types";
import type { Extension } from "../extensions";

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
  return renderApp(appModule, extensions);
}

function renderApp(appModule: XmluiModule & { kind: "app" }, extensions: Extension[]): Root {
  const rootElement = ensureRootElement();

  if (!contentRoot) {
    contentRoot = createRoot(rootElement);
  }

  contentRoot.render(
    React.createElement(XmluiRoot, {
      key: hmrKey++,
      module: appModule,
      extensions,
    }),
  );

  return contentRoot;
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
