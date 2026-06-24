/**
 * SSG — Static Site Generation CLI command.
 *
 * Builds the project, discovers routes, creates an SSR bundle, and renders
 * every static route to HTML using parallel worker threads.
 *
 * The key improvement over the old implementation is true parallelism:
 * instead of rendering routes one-at-a-time on the main thread (which is
 * bottlenecked by synchronous renderToString), we spawn one worker per CPU
 * core and let them run in parallel.
 */

import { build } from "./build";
import { discoverRoutes } from "../ssg/discoverRoutes";
import { getSsgEntrySource } from "../ssg/ssgEntry";
import { build as viteBuild, type InlineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { xmluiPlugin } from "../vite-plugin/xmluiPlugin";
import { readFile, writeFile, rm, mkdir, cp, stat } from "node:fs/promises";
import { Worker } from "node:worker_threads";
import { availableParallelism } from "node:os";
import path from "node:path";

export type SsgOptions = {
  outDir?: string;
  fallbackFile?: string;
  debug?: boolean;
  contentDir?: string;
};

const TEMP_ENTRY_FILE_NAME = ".xmlui-ssg-entry.tsx";
const WORKER_SCRIPT_NAME = ".xmlui-ssg-worker.mjs";

function log(message: string) {
  console.log(`[xmlui ssg] ${message}`);
}

function getOutputHtmlPath(outDir: string, routePath: string): string {
  if (routePath === "/") {
    return path.join(outDir, "index.html");
  }
  return path.join(outDir, routePath.slice(1), "index.html");
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectCssFiles(
  dir: string,
  base: string = dir,
): Promise<string[]> {
  const paths: string[] = [];
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectCssFiles(fullPath, base)));
    } else if (entry.name.endsWith(".css")) {
      paths.push("/" + path.relative(base, fullPath).replace(/\\/g, "/"));
    }
  }
  return paths;
}

function getWorkerScript(): string {
  // Worker script executed by worker_threads.
  // Written as a plain .mjs file so it runs without tsx transpilation.
  return `
import { parentPort, workerData } from "node:worker_threads";
import { pathToFileURL } from "node:url";

const { bundlePath, routes, batchIndex } = workerData;

const mod = await import(pathToFileURL(bundlePath).href + "?t=" + Date.now());

const results = [];
for (let i = 0; i < routes.length; i++) {
  const route = routes[i];
  try {
    const html = mod.renderPath(route);
    results.push({ route, html });
  } catch (err) {
    results.push({ route, error: err?.message || String(err) });
  }
}

parentPort.postMessage({ batchIndex, results });
`;
}

export const ssg = async ({
  outDir = "dist-ssg",
  fallbackFile = "200",
  debug = false,
  contentDir: _contentDir = "content",
}: SsgOptions = {}) => {
  if (debug) {
    log(
      "debug mode: building and serving with dev server (use 'preview' to test the built output)",
    );
    log(
      "--debug for interactive SSR debugging is not yet implemented for the new runtime.",
    );
    process.exit(0);
  }

  const cwd = process.cwd();
  const outPath = path.resolve(cwd, outDir);
  const distPath = path.resolve(cwd, "dist");
  const ssrBuildPath = path.resolve(cwd, ".xmlui-ssg-ssr");
  const ssrBundlePath = path.join(ssrBuildPath, "render.mjs");
  const tempEntryPath = path.resolve(cwd, TEMP_ENTRY_FILE_NAME);
  const workerScriptPath = path.resolve(cwd, WORKER_SCRIPT_NAME);

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

  // Inject CSS <link> tags so pre-rendered pages are styled even without JS.
  const builtIndexPath = path.join(outPath, "index.html");
  let shellHtml = await readFile(builtIndexPath, "utf-8");
  const cssFilePaths = await collectCssFiles(outPath);
  if (cssFilePaths.length > 0) {
    // Only inject CSS links that aren't already in the shell HTML
    // (Vite may already inject some via the build process)
    const newLinks = cssFilePaths.filter(
      (p) => !shellHtml.includes(`href="${p}"`),
    );
    if (newLinks.length > 0) {
      log(`injecting ${newLinks.length} CSS link(s) into shell HTML`);
      const cssLinks = newLinks
        .map((p) => `<link rel="stylesheet" href="${p}">`)
        .join("\n    ");
      shellHtml = shellHtml.replace(/<\/head>/i, `    ${cssLinks}\n  </head>`);
    }
  }

  // Discover routes
  const routeStore = await discoverRoutes({ contentDir: _contentDir });
  const pathsToRender = routeStore.staticRoutes();

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
    log(`  route: ${route}`);
  }

  // Create temporary SSR entry
  log("creating SSR module");
  await writeFile(tempEntryPath, getSsgEntrySource(), "utf-8");

  // Build SSR bundle
  try {
    log("building SSR module");
    await rm(ssrBuildPath, { recursive: true, force: true });

    const xmlui = xmluiPlugin();

    await viteBuild({
      plugins: [xmlui, react()],
      resolve: {
        extensions: [
          ".js",
          ".ts",
          ".jsx",
          ".tsx",
          ".json",
          ".xmlui",
          ".xmlui.xs",
          ".xs",
        ],
      },
      build: {
        ssr: tempEntryPath,
        outDir: ssrBuildPath,
        emptyOutDir: true,
        minify: false,
        rolldownOptions: {
          input: undefined,
          output: {
            entryFileNames: "render.mjs",
            codeSplitting: false,
          },
        },
      },
    } as InlineConfig);

    if (!(await pathExists(ssrBundlePath))) {
      throw new Error(`failed to build SSR bundle: ${ssrBundlePath}`);
    }

    // === Worker-based parallel rendering ===
    // This is the key improvement: renderToString is CPU-bound and
    // synchronous. By farming routes out to worker threads we get true
    // parallelism across CPU cores.

    const cpuCount = availableParallelism ? availableParallelism() : 4;
    const workerCount = Math.max(
      1,
      Math.min(cpuCount - 1, pathsToRender.length),
    );
    const workerBatches = chunkArray(pathsToRender, workerCount);

    log(
      `rendering ${pathsToRender.length} route(s) across ${workerCount} worker(s) ` +
        `(${cpuCount} CPU cores available)`,
    );

    // Write the worker script to a temp file
    await writeFile(workerScriptPath, getWorkerScript(), "utf-8");

    const workerPromises = workerBatches.map((batch, index) =>
      runWorker(workerScriptPath, {
        bundlePath: ssrBundlePath,
        routes: batch,
        batchIndex: index,
      }),
    );

    const allResults = (await Promise.all(workerPromises)).flat();

    // Sort results back into route order and write files
    const resultMap = new Map<string, string>();
    const errors: string[] = [];
    for (const result of allResults) {
      if (result.error) {
        errors.push(`${result.route}: ${result.error}`);
      } else if (result.html) {
        resultMap.set(result.route, result.html);
      }
    }

    if (errors.length > 0) {
      log(`WARNING: ${errors.length} route(s) failed to render:`);
      for (const err of errors) {
        log(`  ${err}`);
      }
    }

    // Write rendered HTML files (preserving route order)
    for (const route of pathsToRender) {
      const html = resultMap.get(route);
      if (!html) {
        log(`WARNING: no render output for ${route}, skipping`);
        continue;
      }

      const finalHtml = applyRenderToShell(shellHtml, html);
      const outputFile = getOutputHtmlPath(outPath, route);
      const dir = path.dirname(outputFile);
      await mkdir(dir, { recursive: true });
      await writeFile(outputFile, finalHtml, "utf-8");
      log(`  wrote ${outputFile}`);
    }

    // Render fallback
    log(`rendering fallback shell at synthetic route ${fallbackRoute}`);
    const [{ html: fallbackHtml }] = await runWorker(workerScriptPath, {
      bundlePath: ssrBundlePath,
      routes: [fallbackRoute],
      batchIndex: -1,
    });

    if (fallbackHtml) {
      const fallbackOutputHtml = applyRenderToShell(shellHtml, fallbackHtml);
      const fallbackOutputFile = path.join(outPath, `${fallbackBaseName}.html`);
      await writeFile(fallbackOutputFile, fallbackOutputHtml, "utf-8");
      log(`  wrote ${fallbackOutputFile}`);
    }
  } finally {
    await rm(tempEntryPath, { force: true }).catch(() => {});
    await rm(workerScriptPath, { force: true }).catch(() => {});
    await rm(ssrBuildPath, { recursive: true, force: true }).catch(() => {});
  }

  log(`completed. static files are in ${outPath}`);
};

/**
 * Run a worker thread that imports the SSR bundle and renders a batch of routes.
 */
type WorkerResult = { route: string; html?: string; error?: string };

function runWorker(
  workerScript: string,
  workerData: { bundlePath: string; routes: string[]; batchIndex: number },
): Promise<WorkerResult[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerScript, { workerData });

    worker.on(
      "message",
      (msg: { batchIndex: number; results: WorkerResult[] }) => {
        resolve(msg.results);
      },
    );

    worker.on("error", (err) => {
      reject(err);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

function chunkArray<T>(arr: T[], numChunks: number): T[][] {
  const chunks: T[][] = Array.from({ length: numChunks }, () => []);
  for (let i = 0; i < arr.length; i++) {
    chunks[i % numChunks].push(arr[i]);
  }
  return chunks.filter((c) => c.length > 0);
}

/**
 * Applies rendered page markup into the HTML shell.
 * Simplified version: the new runtime doesn't use Helmet/StyleRegistry,
 * so we just inject the rendered markup into the #root div.
 */
function applyRenderToShell(shellHtml: string, renderedMarkup: string): string {
  // Wrap markup in the #root div (replacing any existing placeholder content)
  const rootRe = /(<div\s+id="root")([^>]*)(>)(.*?)(<\/div>)/is;
  const match = rootRe.exec(shellHtml);
  if (match) {
    return (
      shellHtml.slice(0, match.index) +
      match[1] +
      match[2] +
      match[3] +
      renderedMarkup +
      match[5] +
      shellHtml.slice(match.index + match[0].length)
    );
  }

  // Fallback: insert before </body>
  return shellHtml.replace(/<\/body>/i, `${renderedMarkup}</body>`);
}
