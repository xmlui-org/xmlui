/**
 *
 # XMLUI SSG

 xmlui-ssg is a static site generator (SSG) that produces HTML pages from your XMLUI applications, which are typically Single Page Applications (SPAs). It's most useful for websites with mainly static content, like blogs, documentations, marketing pages. These generated pages are fully indexable by search engines, boosting SEO.

 The tool performs static analysis on your source code to identify <Page> components: if a route's URL is a plain string, it is marked for SSG, while routes with parameters (like /user/:id) are deferred to the client for dynamic handling. Currently, the implementation boots a temporary Remix server, which generates the HTML from XMLUI (React) components. It uses a web client to snapshot the generated HTML. This workflow will be further streamlined (eliminating the server-client aspect) once our core dependency, react-router is upgraded.
 */

import "tsx";
import { build as viteBuild, createServer, type InlineConfig, type Plugin } from "vite";
import { rmSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile, cp, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "./build";
import { getViteConfig } from "./viteConfig";
import { createXmluiAppDefines } from "./xmluiEnv";
import { parse } from "node-html-parser";
import { discoverRoutes } from "../discoverRoutes";
import { XMLUI_SSG_DATA_ATTRIBUTES } from "../../components-core/rendering/ssgEnv";

type SsgOptions = {
  outDir?: string;
  fallbackFile?: string;
  debug?: boolean;
  contentDir?: string;
};

type RenderResult = {
  markup: string;
  ssrStyles: string;
  ssrHashes: string;
  htmlClasses: string;
  titleTag: string;
  headTags: string;
  htmlAttributes: string;
  bodyAttributes: string;
};

type RenderModule = {
  renderPath: (pathname: string) => RenderResult;
};

type HtmlDocument = ReturnType<typeof parse>;

const TEMP_ENTRY_FILE_NAME = ".xmlui-ssg-entry.tsx";

// Duplicated from xmlui/src/components/App/SearchContext.tsx.
// If you update one, update the other.
const SEARCH_CATEGORIES = ["docs", "blog", "news", "get-started"];
const SEARCH_DEFAULT_CATEGORY = "other";

type SearchItemData = { path: string; title: string; content: string; category?: string };

const SEARCH_INDEX_FILE_NAME = "__xmlui-search-index.json";
const SEARCH_INDEX_STUB_JSON = "[]";
const SSG_WRITE_CONCURRENCY = 16;
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

function getOutputHtmlPath(outDir: string, routePath: string): string {
  if (routePath === "/") {
    return path.join(outDir, "index.html");
  }
  return path.join(outDir, routePath.slice(1), "index.html");
}

function isHtmlNavigationRequest(url: string, acceptHeader?: string): boolean {
  if (!acceptHeader?.includes("text/html")) {
    return false;
  }

  const pathname = new URL(url, "http://localhost").pathname;
  if (pathname === `/${SEARCH_INDEX_FILE_NAME}`) {
    return false;
  }

  if (pathname.startsWith("/@") || pathname.startsWith("/__vite") || pathname.startsWith("/__id")) {
    return false;
  }

  return !path.basename(pathname).includes(".");
}

function appendToHeadOrDocument(document: HtmlDocument, markup: string): void {
  const head = document.querySelector("head");

  if (head) {
    head.append(markup);
  } else {
    document.append(markup);
  }
}

function mergeHtmlClasses(document: HtmlDocument, htmlClasses: string): void {
  if (!htmlClasses.trim()) {
    return;
  }

  const htmlElement = document.querySelector("html");

  if (!htmlElement) {
    return;
  }

  const currentClasses = htmlElement.getAttribute("class") || "";
  const merged = `${currentClasses} ${htmlClasses}`.trim();
  htmlElement.setAttribute("class", merged);
}

function mergeAttributesIntoElement(
  document: HtmlDocument,
  selector: "html" | "body",
  attributesMarkup: string,
): void {
  if (!attributesMarkup.trim()) {
    return;
  }

  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  const attributeSource = parse(`<${selector} ${attributesMarkup}></${selector}>`).querySelector(
    selector,
  );

  if (!attributeSource) {
    return;
  }

  for (const [name, value] of Object.entries(attributeSource.attributes)) {
    if (name === "class") {
      const mergedClasses = `${element.getAttribute("class") || ""} ${value}`.trim();
      if (mergedClasses) {
        element.setAttribute("class", mergedClasses);
      }
      continue;
    }
    element.setAttribute(name, value);
  }
}

function injectStylesIntoHead(document: HtmlDocument, ssrStyles: string, ssrHashes: string): void {
  if (!ssrStyles.trim()) {
    return;
  }

  const styleElement = `<style data-style-registry="true" data-ssr-hashes="${ssrHashes}">${ssrStyles}</style>`;
  appendToHeadOrDocument(document, styleElement);
}

function injectTitleIntoHead(document: HtmlDocument, titleTag: string): void {
  if (!titleTag.trim()) {
    return;
  }

  document.querySelectorAll("title").forEach((title) => title.remove());
  appendToHeadOrDocument(document, titleTag);
}

function injectHeadTags(document: HtmlDocument, headTags: string): void {
  if (!headTags.trim()) {
    return;
  }

  appendToHeadOrDocument(document, headTags);
}

function injectMarkup(document: HtmlDocument, markup: string): void {
  const rootDiv = document.querySelector('div[id="root"]');
  if (rootDiv) {
    const hasSearchIndex = rootDiv.hasAttribute(XMLUI_SSG_DATA_ATTRIBUTES.searchIndexFile);
    if (!hasSearchIndex) {
      rootDiv.setAttribute(XMLUI_SSG_DATA_ATTRIBUTES.searchIndexFile, SEARCH_INDEX_FILE_NAME);
    }
    rootDiv.innerHTML = markup;
    return;
  }

  const body = document.querySelector("body");
  if (body) {
    body.insertAdjacentHTML("beforeend", markup);
    return;
  }

  document.append(markup);
}

/**
 * Extracts a search index entry from the HTML produced by renderToString.
 * Mirrors the DOM-based extraction in PageIndexer (SearchIndexCollector.tsx)
 * by using JSDOM to isolate the page content and extract unescaped text.
 */
function extractSearchEntry(pageUrl: string, markup: string, navLabel = ""): SearchItemData {
  const document = parse(markup);

  const pageRoot =
    document.querySelector(".xmlui-page-root") || document.querySelector("body") || document;

  // Strip style and script tags (and their content)
  const elementsToRemove = pageRoot.querySelectorAll("style, script");
  elementsToRemove.forEach((el) => el.remove());

  // Extract first h1 text as title
  const titleElement = pageRoot.querySelector("h1");
  let title = "";
  if (titleElement) {
    title = (titleElement.textContent || "").trim();
    titleElement.remove();
  }
  if (!title) {
    title = navLabel || pageUrl.split("/").filter(Boolean).pop() || pageUrl;
  }

  // Get the unescaped text content and collapse whitespace
  const content = (pageRoot.textContent || "").replace(/\s+/g, " ").trim();

  const firstSegment = pageUrl.split("/").find((s) => s.length > 0) || "";
  const category = SEARCH_CATEGORIES.includes(firstSegment)
    ? firstSegment
    : SEARCH_DEFAULT_CATEGORY;

  return { path: pageUrl, title, content, category };
}

export function applyRenderToShell(shellHtml: string, renderResult: RenderResult): string {
  const document = parse(shellHtml);
  mergeHtmlClasses(document, renderResult.htmlClasses);
  mergeAttributesIntoElement(document, "html", renderResult.htmlAttributes);
  mergeAttributesIntoElement(document, "body", renderResult.bodyAttributes);
  injectTitleIntoHead(document, renderResult.titleTag);
  injectHeadTags(document, renderResult.headTags);
  injectStylesIntoHead(document, renderResult.ssrStyles, renderResult.ssrHashes);
  injectMarkup(document, renderResult.markup);
  const html = document.toString();
  if (!html.toLowerCase().startsWith("<!doctype")) {
    return `<!DOCTYPE html>${html}`;
  }
  return html;
}

function getSsgEntrySource(extensionImportSpecifiers: string[]): string {
  const extensionLoaderLines = extensionImportSpecifiers
    .map((spec, index) => {
      const safeSpec = JSON.stringify(spec);
      return `  try {\n    const m${index} = await import(${safeSpec});\n    extensions.push(m${index}.default ?? m${index});\n  } catch (error) {\n    console.warn("[xmlui ssg] failed to load extension ${spec}");\n    console.error(error);\n  }`;
    })
    .join("\n");

  return `
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import type { FilledContext } from "react-helmet-async";
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
  const helmetContext: Partial<FilledContext> = {};
  const app = (
    <StyleProvider styleRegistry={registry}>
      <StaticRouter location={pathname}>
        <StandaloneApp
          runtime={runtime}
          extensionManager={createExtensionManager()}
          helmetContext={helmetContext}
        />
      </StaticRouter>
    </StyleProvider>
  );

  const markup = renderToString(app);
  const helmet = helmetContext.helmet;
  return {
    markup,
    ssrStyles: registry.getSsrStyles(),
    ssrHashes: Array.from(registry.cache.keys()).join(","),
    htmlClasses: registry.getRootClasses(),
    titleTag: helmet?.title.toString() || "",
    headTags: [
      helmet?.priority.toString(),
      helmet?.base.toString(),
      helmet?.meta.toString(),
      helmet?.link.toString(),
      helmet?.style.toString(),
      helmet?.script.toString(),
      helmet?.noscript.toString(),
    ]
      .filter(Boolean)
      .join(""),
    htmlAttributes: helmet?.htmlAttributes.toString() || "",
    bodyAttributes: helmet?.bodyAttributes.toString() || "",
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

function mergeAliases(existingAlias: unknown, extensionAliases: Record<string, string>) {
  if (Array.isArray(existingAlias)) {
    return [
      ...existingAlias,
      ...Object.entries(extensionAliases).map(([find, replacement]) => ({ find, replacement })),
    ];
  }
  if (existingAlias && typeof existingAlias === "object") {
    return { ...(existingAlias as Record<string, string>), ...extensionAliases };
  }
  return { ...extensionAliases };
}

function prioritizeTypeScriptExtensions(
  extensions: readonly string[] | undefined,
): string[] | undefined {
  if (!extensions) {
    return undefined;
  }

  const priority = new Map<string, number>([
    [".ts", 0],
    [".tsx", 1],
    [".jsx", 2],
    [".js", 3],
  ]);

  return [...extensions].sort((left, right) => {
    const leftPriority = priority.get(left) ?? 100;
    const rightPriority = priority.get(right) ?? 100;
    return leftPriority - rightPriority;
  });
}

async function runDebugSsgServer() {
  const cwd = process.cwd();
  const sourceIndexPath = path.resolve(cwd, "index.html");
  const tempEntryPath = path.resolve(cwd, TEMP_ENTRY_FILE_NAME);

  log(`starting debug server in ${cwd}`);

  const extensionImportSpecifiers = await getExtensionImportSpecifiers(cwd);
  if (extensionImportSpecifiers.length > 0) {
    log(`detected extensions: ${extensionImportSpecifiers.join(", ")}`);
  }

  log("creating SSR module");
  await writeFile(tempEntryPath, getSsgEntrySource(extensionImportSpecifiers), "utf-8");

  process.once("exit", () => {
    try {
      rmSync(tempEntryPath, { force: true });
    } catch {
      // ignore cleanup issues during process exit
    }
  });

  const viteConfig = await getViteConfig({});
  const extensionAliases = await getWorkspaceExtensionAliases(cwd);
  if (Object.keys(extensionAliases).length > 0) {
    log(`using workspace extension aliases: ${Object.keys(extensionAliases).join(", ")}`);
  }

  const mergedAlias = mergeAliases(viteConfig.resolve?.alias, extensionAliases);
  const basePlugins = Array.isArray(viteConfig.plugins)
    ? viteConfig.plugins
    : viteConfig.plugins
      ? [viteConfig.plugins]
      : [];

  const ssgDebugPlugin: Plugin = {
    name: "xmlui-ssg-debug",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.originalUrl || req.url || "/";
        const pathname = new URL(requestUrl, "http://localhost").pathname;

        if (pathname === `/${SEARCH_INDEX_FILE_NAME}`) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(SEARCH_INDEX_STUB_JSON);
          return;
        }

        if (!isHtmlNavigationRequest(requestUrl, req.headers.accept)) {
          next();
          return;
        }

        try {
          const shellHtml = await readFile(sourceIndexPath, "utf-8");
          const transformedShell = await server.transformIndexHtml(
            requestUrl,
            shellHtml,
            req.originalUrl,
          );
          const renderModule = (await server.ssrLoadModule(
            `${pathToFileURL(tempEntryPath).href}?t=${Date.now()}`,
          )) as RenderModule;

          if (!renderModule?.renderPath) {
            throw new Error("failed to load renderPath from temporary SSG entry module");
          }

          const rendered = renderModule.renderPath(requestUrl);
          const finalHtml = applyRenderToShell(transformedShell, rendered);

          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(finalHtml);
        } catch (error) {
          const err = error as Error;
          server.ssrFixStacktrace(err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end(err.stack || err.message || String(err));
        }
      });
    },
  };

  const server = await createServer({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      alias: mergedAlias,
      extensions: prioritizeTypeScriptExtensions(viteConfig.resolve?.extensions),
    },
    define: {
      ...viteConfig.define,
      ...createXmluiAppDefines({
        buildMode: "ALL",
        devMode: true,
        standalone: false,
        mockEnabled: true,
        includeAllComponents: true,
        inspectUserComponents: true,
      }),
    },
    plugins: [...basePlugins, ssgDebugPlugin],
  } as InlineConfig);

  if (!server.httpServer) {
    throw new Error("HTTP server not available");
  }

  let cleanedUp = false;
  const cleanup = async () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    await rm(tempEntryPath, { force: true });
  };

  const shutdown = async (signal: NodeJS.Signals) => {
    log(`received ${signal}, shutting down debug server`);
    await server.close();
    await cleanup();
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  try {
    await server.listen();
    server.printUrls();
    log(`serving search index stub at /${SEARCH_INDEX_FILE_NAME}`);
  } catch (error) {
    await cleanup();
    throw error;
  }
}

export const ssg = async ({
  outDir = "dist-ssg",
  fallbackFile = "200",
  debug = false,
  contentDir = "content",
}: SsgOptions = {}) => {
  if (debug) {
    await runDebugSsgServer();
    return;
  }

  const cwd = process.cwd();
  const outPath = path.resolve(cwd, outDir);
  const distPath = path.resolve(cwd, "dist");
  const ssrBuildPath = path.resolve(cwd, ".xmlui-ssg-ssr");
  const ssrBundlePath = path.join(ssrBuildPath, "render.mjs");
  const builtIndexPath = path.join(outPath, "index.html");
  const tempEntryPath = path.resolve(cwd, TEMP_ENTRY_FILE_NAME);

  log(`starting in ${cwd}`);
  log(`cleaning output directory ${outPath}`);
  await rm(outPath, { recursive: true, force: true });
  await mkdir(outPath, { recursive: true });

  log("building project assets");
  await build({
    buildMode: "INLINE_ALL",
    withMock: true,
    withHostingMetaFiles: false,
    withRelativeRoot: false,
    flatDist: false,
  });

  if (!(await pathExists(distPath))) {
    throw new Error(`dist folder was not generated: ${distPath}`);
  }

  log(`copying dist to ${outPath}`);
  await cp(distPath, outPath, { recursive: true });

  const shellHtml = await readFile(builtIndexPath, "utf-8");
  const routeStore = await discoverRoutes({ srcDir: "src", contentDir });
  const pathsToRender = routeStore.staticRoutes();
  // Collision detection: a discovered page route must not share the base name of the fallback file.
  const fallbackBaseName = fallbackFile.replace(/\.html$/i, "");
  const fallbackRoute = fallbackBaseName.startsWith("/")
    ? fallbackBaseName
    : `/${fallbackBaseName}`;
  if (pathsToRender.includes(fallbackRoute)) {
    throw new Error(
      `A discovered page route "${fallbackRoute}" conflicts with the fallback file name ` +
        `"${fallbackBaseName}.html". Use --fallback to specify a different name.`,
    );
  }

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
    : { ...existingAlias, ...extensionAliases };

  try {
    log("building SSR module");
    await rm(ssrBuildPath, { recursive: true, force: true });

    await viteBuild({
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias: mergedAlias,
      },
      define: {
        ...viteConfig.define,
        ...createXmluiAppDefines({
          buildMode: "INLINE_ALL",
          devMode: false,
          standalone: false,
          mockEnabled: false,
        }),
        "import.meta.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
      },
      build: {
        ...viteConfig.build,
        ssr: tempEntryPath,
        outDir: ssrBuildPath,
        emptyOutDir: true,
        minify: false,
        rolldownOptions: {
          ...viteConfig.build?.rolldownOptions,
          input: undefined,
          output: {
            ...viteConfig.build?.rolldownOptions?.output,
            entryFileNames: "render.mjs",
            inlineDynamicImports: true,
          },
        },
      },
    } as InlineConfig);

    if (!(await pathExists(ssrBundlePath))) {
      throw new Error(`failed to build SSR bundle: ${ssrBundlePath}`);
    }

    const renderModule = (await import(
      `${pathToFileURL(ssrBundlePath).href}?t=${Date.now()}`
    )) as RenderModule;

    if (!renderModule?.renderPath) {
      throw new Error("failed to load renderPath from temporary SSG entry module");
    }

    const navGroupSummaryUrls = routeStore.navGroupUrls();
    const searchIndex: SearchItemData[] = [];
    let nextRouteIndex = 0;
    const renderedEntries: { routeIndex: number; entry: SearchItemData | null }[] = Array.from(
      { length: pathsToRender.length },
      (_, i) => ({ routeIndex: i, entry: null }),
    );
    const workerCount = Math.min(SSG_WRITE_CONCURRENCY, pathsToRender.length);

    const workers = Array.from({ length: workerCount }, async () => {
      while (true) {
        const routeIndex = nextRouteIndex++;
        if (routeIndex >= pathsToRender.length) {
          return;
        }

        const route = pathsToRender[routeIndex]!;

        log(`rendering ${route}`);
        const rendered = renderModule.renderPath(route);
        const finalHtml = applyRenderToShell(shellHtml, rendered);
        const outputFile = getOutputHtmlPath(outPath, route);
        const dir = path.dirname(outputFile);

        // Exclude NavGroup summary pages from search index
        if (!navGroupSummaryUrls.has(route)) {
          renderedEntries[routeIndex]!.entry = extractSearchEntry(route, rendered.markup);
        }

        await mkdir(dir, { recursive: true });
        await writeFile(outputFile, finalHtml, "utf-8");
        log(`wrote ${outputFile}`);
      }
    });

    await Promise.all(workers);

    for (const { entry } of renderedEntries) {
      if (entry) searchIndex.push(entry);
    }

    const searchIndexFile = path.join(outPath, SEARCH_INDEX_FILE_NAME);
    await writeFile(searchIndexFile, JSON.stringify(searchIndex), "utf-8");
    log(`wrote search index with ${searchIndex.length} entries to ${searchIndexFile}`);

    // Render the fallback file using a synthetic route that no <Page> will match.
    // Even if there is a fallbackRoute prop on the Pages component, that renders a <Navigate> component, which
    // emits no DOM output, so the result remains a good app shell.
    const fallbackRendered = renderModule.renderPath(fallbackFile);
    log(`rendering fallback shell at synthetic route ${fallbackRoute}`);
    const fallbackHtml = applyRenderToShell(shellHtml, fallbackRendered);
    const fallbackOutputFile = path.join(outPath, `${fallbackBaseName}.html`);
    await writeFile(fallbackOutputFile, fallbackHtml, "utf-8");
    log(`wrote ${fallbackOutputFile}`);
  } finally {
    await rm(tempEntryPath, { force: true });
    await rm(ssrBuildPath, { recursive: true, force: true });
  }

  log(`completed. static files are in ${outPath}`);
};

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}
