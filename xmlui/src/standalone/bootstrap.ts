import React from "react";

import { mountXmluiApp, type XmluiModule } from "../runtime";
import { StandaloneExtensionManager, type StandaloneExtension } from "./extensionManager";
import {
  loadStandaloneXmluiApp,
  type StandaloneLoadOptions,
  type StandaloneLoadResult,
} from "./loader";

export { loadStandaloneXmluiApp } from "./loader";

let contentRoot: ReturnType<typeof mountXmluiApp> | undefined;

export type RenderStandaloneOptions = StandaloneLoadOptions & {
  container?: HTMLElement;
};

export type StandaloneGlobal = {
  standalone: StandaloneExtensionManager;
  createElement: typeof React.createElement;
  registerExtension(extensionOrExtensions: StandaloneExtension | StandaloneExtension[] | undefined): void;
  startApp(runtime?: XmluiModule, extensions?: StandaloneExtension | StandaloneExtension[]): Promise<unknown>;
  loadStandaloneXmluiApp(options?: StandaloneLoadOptions): Promise<StandaloneLoadResult>;
  renderStandaloneXmluiApp(options?: RenderStandaloneOptions): Promise<StandaloneLoadResult>;
};

export const standaloneExtensionManager = new StandaloneExtensionManager();

export async function renderStandaloneXmluiApp(
  options: RenderStandaloneOptions = {},
): Promise<StandaloneLoadResult> {
  const result = await loadStandaloneXmluiApp(options);
  const container = options.container ?? ensureRootElement();
  contentRoot = mountXmluiApp(result.module, container, {
    hydrate: container.innerHTML.trim().length > 0,
    extensions: standaloneExtensionManager.listExtensions(),
  });
  return result;
}

export async function startApp(
  runtime?: XmluiModule,
  extensions: StandaloneExtension | StandaloneExtension[] = [],
  extensionManager = standaloneExtensionManager,
): Promise<unknown> {
  extensionManager.registerExtension(extensions);
  const container = ensureRootElement();
  if (runtime) {
    contentRoot = mountXmluiApp(runtime, container, {
      hydrate: container.innerHTML.trim().length > 0,
      extensions: extensionManager.listExtensions(),
    });
    return { module: runtime };
  }
  return renderStandaloneXmluiApp({
    container,
    extensions: extensionManager.listExtensions(),
  });
}

export function installStandaloneAutoStart(): void {
  if (typeof document === "undefined") {
    return;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const islandTargets = document.querySelectorAll("[data-xmlui-src]");
    if (islandTargets.length > 0) {
      renderStandaloneError(
        ensureRootElement(),
        new Error("Standalone XMLUI island startup is not implemented in this experiment."),
      );
      return;
    }
    void startApp(undefined, undefined, standaloneExtensionManager).catch((error) => {
      renderStandaloneError(ensureRootElement(), error);
      console.error(error);
    });
  });
}

export function ensureRootElement(): HTMLElement {
  let rootElement = document.getElementById("root");
  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.setAttribute("id", "root");
    document.body.appendChild(rootElement);
  }
  return rootElement;
}

export function renderStandaloneError(container: HTMLElement, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  container.innerHTML = "";
  const pre = document.createElement("pre");
  pre.setAttribute("role", "alert");
  pre.setAttribute("data-xmlui-standalone-error", "true");
  pre.style.whiteSpace = "pre-wrap";
  pre.style.color = "#991b1b";
  pre.style.background = "#fee2e2";
  pre.style.border = "1px solid #fecaca";
  pre.style.padding = "12px";
  pre.textContent = `XMLUI standalone startup failed:\n${message}`;
  container.appendChild(pre);
}

export function exposeStandaloneGlobal(globalObject: Window & typeof globalThis = window): StandaloneGlobal {
  const api: StandaloneGlobal = {
    standalone: standaloneExtensionManager,
    createElement: React.createElement,
    registerExtension: (extensions) => standaloneExtensionManager.registerExtension(extensions),
    startApp,
    loadStandaloneXmluiApp,
    renderStandaloneXmluiApp,
  };
  globalObject.xmlui = {
    ...(globalObject.xmlui ?? {}),
    ...api,
  };
  return api;
}

export const createElement = React.createElement;

export function registerExtension(
  extensionOrExtensions: StandaloneExtension | StandaloneExtension[] | undefined,
): void {
  standaloneExtensionManager.registerExtension(extensionOrExtensions);
}

declare global {
  interface Window {
    xmlui?: Partial<StandaloneGlobal>;
  }
}
