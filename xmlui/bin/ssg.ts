#!/usr/bin/env node

import "tsx";
import { createServer, type InlineConfig } from "vite";
import { mkdir, readdir, readFile, rm, writeFile, cp } from "node:fs/promises";
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
const EXTENSION_FILE_CANDIDATES = [
  "extensions.ts",
  "extensions.tsx",
  "extensions.mts",
  "extensions.mjs",
  "extensions.cjs",
  "extensions.js",
];

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

function getSsgEntrySource(extensionImportSpecifiers: string[]): string {
  const extensionLoaderLines = extensionImportSpecifiers
    .map((spec, index) => {
      const safeSpec = JSON.stringify(spec);
      return `  try {\n    const m${index} = await import(${safeSpec});\n    extensions.push(m${index}.default ?? m${index});\n  } catch (error) {\n    console.warn(\"[xmlui ssg] failed to load extension ${spec}\");\n    console.error(error);\n  }`;
    })
    .join("\n");

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

const loadedExtensions: any[] = [];
async function loadExtensions() {
  const extensions: any[] = [];
${extensionLoaderLines}
  return extensions;
}

loadedExtensions.push(...(await loadExtensions()));

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

async function findMonorepoRoot(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  for (let depth = 0; depth < 12; depth++) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (await pathExists(packageJsonPath)) {
      try {
        const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        if (pkg.workspaces) {
          return currentDir;
        }
      } catch {
        // ignore invalid package.json
      }
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) {
      break;
    }
    currentDir = parent;
  }
  return null;
}

async function getWorkspacePatterns(monorepoRoot: string): Promise<string[]> {
  const packageJsonPath = path.join(monorepoRoot, "package.json");
  const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));
  if (Array.isArray(pkg.workspaces)) {
    return pkg.workspaces;
  }
  if (Array.isArray(pkg.workspaces?.packages)) {
    return pkg.workspaces.packages;
  }
  return [];
}

async function getExtensionImportSpecifiers(cwd: string): Promise<string[]> {
  for (const fileName of EXTENSION_FILE_CANDIDATES) {
    const filePath = path.join(cwd, fileName);
    if (!(await pathExists(filePath))) {
      continue;
    }

    const content = await readFile(filePath, "utf-8");
    const matches = content.matchAll(/from\s+["']([^"']+)["']/g);
    const result: string[] = [];
    for (const match of matches) {
      const spec = match[1];
      if (!result.includes(spec)) {
        result.push(spec);
      }
    }
    return result;
  }
  return [];
}

async function getWorkspaceExtensionAliases(cwd: string): Promise<Record<string, string>> {
  const extensionSpecs = new Set(
    (await getExtensionImportSpecifiers(cwd)).filter(
      (spec) => !spec.startsWith(".") && !spec.startsWith("/"),
    ),
  );

  if (extensionSpecs.size === 0) {
    return {};
  }

  const monorepoRoot = await findMonorepoRoot(cwd);
  if (!monorepoRoot) {
    return {};
  }

  const patterns = await getWorkspacePatterns(monorepoRoot);
  const aliases: Record<string, string> = {};

  for (const pattern of patterns) {
    if (!pattern.endsWith("/*")) {
      continue;
    }
    const patternBase = path.join(monorepoRoot, pattern.slice(0, -2));
    if (!(await pathExists(patternBase))) {
      continue;
    }

    const entries = await readdir(patternBase, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageDir = path.join(patternBase, entry.name);
      const packageJsonPath = path.join(packageDir, "package.json");
      if (!(await pathExists(packageJsonPath))) {
        continue;
      }

      try {
        const pkg = JSON.parse(await readFile(packageJsonPath, "utf-8"));
        const packageName = pkg.name as string | undefined;
        if (!packageName || !extensionSpecs.has(packageName)) {
          continue;
        }

        const sourceEntryCandidates = [
          path.join(packageDir, "src", "index.tsx"),
          path.join(packageDir, "src", "index.ts"),
          path.join(packageDir, "src", "index.js"),
        ];

        for (const candidate of sourceEntryCandidates) {
          if (await pathExists(candidate)) {
            aliases[packageName] = candidate;
            break;
          }
        }
      } catch {
        // ignore malformed workspace package.json
      }
    }
  }

  return aliases;
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

  const extensionImportSpecifiers = await getExtensionImportSpecifiers(cwd);
  if (extensionImportSpecifiers.length > 0) {
    log(`detected extensions: ${extensionImportSpecifiers.join(", ")}`);
  }

  log("creating SSR module");
  await writeFile(tempEntryPath, getSsgEntrySource(extensionImportSpecifiers), "utf-8");

  const viteConfig = await getViteConfig({});
  const extensionAliases = await getWorkspaceExtensionAliases(cwd);
  if (Object.keys(extensionAliases).length > 0) {
    log(`using workspace extension aliases: ${Object.keys(extensionAliases).join(", ")}`);
  }

  const existingAlias = viteConfig.resolve?.alias;
  const mergedAlias = Array.isArray(existingAlias)
    ? [
        ...existingAlias,
        ...Object.entries(extensionAliases).map(([find, replacement]) => ({ find, replacement })),
      ]
    : { ...(existingAlias || {}), ...extensionAliases };

  const viteServer = await createServer({
    ...viteConfig,
    resolve: {
      ...(viteConfig.resolve || {}),
      alias: mergedAlias,
    },
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
