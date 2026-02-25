#!/usr/bin/env node

import "tsx";
import { createServer, type InlineConfig } from "vite";
import { mkdir, readFile, rm, writeFile, cp } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { build } from "./build";
import { getViteConfig } from "./viteConfig";
import { discoverPaths, pathExists } from "./ssg/discoverPaths";

type SsgOptions = {
  outDir?: string;
};

type RenderResult = {
  markup: string;
  ssrStyles: string;
  ssrHashes: string;
  htmlClasses: string;
};

type RenderModule = {
  renderPath: (pathname: string) => RenderResult;
};

const TEMP_ENTRY_FILE_NAME = ".xmlui-ssg-entry.tsx";

function log(message: string) {
  console.log(`[xmlui ssg] ${message}`);
}

function normalizeRoute(pathname: string): string {
  const url = new URL(pathname, "http://localhost");
  let normalized = url.pathname;

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

function getOutputHtmlPath(outDir: string, routePath: string): string {
  if (routePath === "/") {
    return path.join(outDir, "index.html");
  }
  return path.join(outDir, routePath.slice(1), "index.html");
}

function executeInlineScripts(html: string) {
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    const attrs = match[1] || "";
    const content = (match[2] || "").trim();
    const hasSrc = /\bsrc\s*=/.test(attrs);

    if (hasSrc || !content) {
      continue;
    }

    try {
      vm.runInThisContext(content);
    } catch (error) {
      const preview = content.slice(0, 500);
      log(`inline script execution warning: ${preview}`);
      console.error(error);
    }
  }
}

function mergeHtmlClasses(shellHtml: string, htmlClasses: string): string {
  if (!htmlClasses.trim()) {
    return shellHtml;
  }

  return shellHtml.replace(/<html([^>]*?)>/i, (full, attributes: string) => {
    const classMatch = /class=["']([^"']*)["']/.exec(attributes);
    if (!classMatch) {
      return `<html${attributes} class="${htmlClasses}">`;
    }

    const currentClasses = classMatch[1].trim();
    const merged = `${currentClasses} ${htmlClasses}`.trim();
    const newAttributes = attributes.replace(classMatch[0], `class="${merged}"`);
    return `<html${newAttributes}>`;
  });
}

function injectStylesIntoHead(shellHtml: string, ssrStyles: string, ssrHashes: string): string {
  if (!ssrStyles.trim()) {
    return shellHtml;
  }

  const styleTag = `<style data-style-registry="true" data-ssr-hashes="${ssrHashes}">${ssrStyles}</style>`;
  if (shellHtml.includes("</head>")) {
    return shellHtml.replace("</head>", `${styleTag}</head>`);
  }
  return `${styleTag}${shellHtml}`;
}

function injectMarkup(shellHtml: string, markup: string): string {
  const rootRegex = /<div([^>]*\bid=["']root["'][^>]*)>[\s\S]*?<\/div>/i;
  if (rootRegex.test(shellHtml)) {
    return shellHtml.replace(rootRegex, `<div$1>${markup}</div>`);
  }

  if (shellHtml.includes("</body>")) {
    return shellHtml.replace("</body>", `${markup}</body>`);
  }

  return `${shellHtml}${markup}`;
}

function applyRenderToShell(shellHtml: string, renderResult: RenderResult): string {
  let html = shellHtml;
  html = mergeHtmlClasses(html, renderResult.htmlClasses);
  html = injectStylesIntoHead(html, renderResult.ssrStyles, renderResult.ssrHashes);
  html = injectMarkup(html, renderResult.markup);
  if (!html.toLowerCase().startsWith("<!doctype")) {
    return `<!DOCTYPE html>${html}`;
  }
  return html;
}

function getSsgEntrySource(): string {
  return `
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import {
  StandaloneApp,
  StandaloneExtensionManager as ExtMgr,
  StyleProvider,
  StyleRegistry,
} from "xmlui";

const runtime = import.meta.glob("./src/**", { eager: true });

let loadedExtensions: any = [];
try {
  const extensionModule = await import("./extensions");
  loadedExtensions = extensionModule.default || [];
  console.log("loaded extensions: ", loadedExtensions);
} catch {
  loadedExtensions = [];
}

function createExtensionManager() {
  const extensionManager = new ExtMgr();
  extensionManager.registerExtension(loadedExtensions || []);
  return extensionManager;
}

export function renderPath(pathname: string) {
  if (typeof globalThis !== "undefined") {
    globalThis.location = new URL(pathname, "http://localhost") as unknown as Location;
  }

  const registry = new StyleRegistry();
  const app = (
    <StyleProvider styleRegistry={registry}>
      <StaticRouter location={pathname}>
        <StandaloneApp runtime={runtime} extensionManager={createExtensionManager()} />
      </StaticRouter>
    </StyleProvider>
  );

  const markup = renderToString(app);
  return {
    markup,
    ssrStyles: registry.getSsrStyles(),
    ssrHashes: Array.from(registry.cache.keys()).join(","),
    htmlClasses: registry.getRootClasses(),
  };
}
`;
}

export const ssg = async ({ outDir = "xmlui-optimized-output" }: SsgOptions = {}) => {
  const cwd = process.cwd();
  const outPath = path.resolve(cwd, outDir);
  const distPath = path.resolve(cwd, "dist");
  const builtIndexPath = path.join(outPath, "index.html");
  const sourceIndexPath = path.resolve(cwd, "index.html");
  const tempEntryPath = path.resolve(cwd, TEMP_ENTRY_FILE_NAME);

  log(`starting in ${cwd}`);
  log(`cleaning output directory ${outPath}`);
  await rm(outPath, { recursive: true, force: true });
  await mkdir(outPath, { recursive: true });

  log("building project assets");
  await build({
    buildMode: "INLINE_ALL",
    withMock: false,
    withHostingMetaFiles: false,
    withRelativeRoot: false,
    flatDist: false,
  });

  if (!(await pathExists(distPath))) {
    throw new Error(`dist folder was not generated: ${distPath}`);
  }

  log(`copying dist to ${outPath}`);
  await cp(distPath, outPath, { recursive: true });

  const sourceHtml = await readFile(sourceIndexPath, "utf-8");
  executeInlineScripts(sourceHtml);

  const shellHtml = await readFile(builtIndexPath, "utf-8");
  const pathsToRender = (await discoverPaths(cwd)).map(normalizeRoute);

  log(`discovered ${pathsToRender.length} route(s)`);
  for (const route of pathsToRender) {
    log(`route: ${route}`);
  }

  log("creating SSR module");
  await writeFile(tempEntryPath, getSsgEntrySource(), "utf-8");

  const viteConfig = await getViteConfig({});
  const viteServer = await createServer({
    ...viteConfig,
    appType: "custom",
    server: {
      middlewareMode: true,
    },
    define: {
      ...(viteConfig.define || {}),
      "process.env.VITE_BUILD_MODE": JSON.stringify("INLINE_ALL"),
      "process.env.VITE_DEV_MODE": false,
      "process.env.VITE_MOCK_ENABLED": false,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
    },
  } as InlineConfig);

  try {
    const renderModule = (await viteServer.ssrLoadModule(
      `/${TEMP_ENTRY_FILE_NAME}`,
    )) as RenderModule;

    if (!renderModule?.renderPath) {
      throw new Error("failed to load renderPath from temporary SSG entry module");
    }

    for (const route of pathsToRender) {
      log(`rendering ${route}`);
      const rendered = renderModule.renderPath(route);
      const finalHtml = applyRenderToShell(shellHtml, rendered);
      const outputFile = getOutputHtmlPath(outPath, route);
      await mkdir(path.dirname(outputFile), { recursive: true });
      await writeFile(outputFile, finalHtml, "utf-8");
      log(`wrote ${outputFile}`);
    }
  } finally {
    await viteServer.close();
    await rm(tempEntryPath, { force: true });
  }

  log(`completed. static files are in ${outPath}`);
};
