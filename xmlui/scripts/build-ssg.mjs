import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const productionDir = path.resolve(rootDir, "dist-production");
const ssgDir = path.resolve(rootDir, "dist-ssg");
const renderBundlePath = path.resolve(rootDir, ".xmlui-ssg-ssr/render.mjs");
const searchIndexFile = "__xmlui-search-index.json";
const fallbackFile = "200.html";

const routes = [
  {
    example: "routingState",
    route: "/",
    output: "index.html",
    title: "Standalone routing counter",
  },
  {
    example: "routingState",
    route: "/summary",
    output: "summary/index.html",
    title: "Standalone routing summary",
  },
  {
    example: "counterComponents",
    route: "/counter-components",
    output: "counter-components/index.html",
    title: "Standalone counter with components",
  },
  {
    example: "styleMutation",
    route: "/style-mutation",
    output: "style-mutation/index.html",
    title: "Standalone style mutation",
  },
  {
    example: "extensionCounterBadge",
    route: "/extension-counter-badge",
    output: "extension-counter-badge/index.html",
    title: "Extension counter badge",
  },
];

await assertExists(path.join(productionDir, "index.html"), "Run npm run build:production before build-ssg.");
await assertExists(renderBundlePath, "Run vite build --config vite.ssg-render.config.ts before build-ssg.");

await rm(ssgDir, { recursive: true, force: true });
await mkdir(ssgDir, { recursive: true });
await cp(productionDir, ssgDir, { recursive: true });

const shellHtml = await readFile(path.join(productionDir, "index.html"), "utf-8");
const productionManifest = JSON.parse(await readFile(path.join(productionDir, "xmlui-manifest.json"), "utf-8"));
const renderModule = await import(`${pathToFileURL(renderBundlePath).href}?t=${Date.now()}`);

const searchEntries = [];
const generatedRoutes = [];

for (const route of routes) {
  const markup = renderModule.renderSsgExample(route.example, route.route);
  const html = injectSsgMarkup(shellHtml, {
    markup,
    example: route.example,
    route: route.route,
    relativeRoot: relativeRootForOutput(route.output),
  });
  const outputPath = path.join(ssgDir, route.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
  const text = textContent(markup);
  searchEntries.push({
    path: route.route,
    title: firstHeading(markup) ?? route.title,
    content: text,
    category: categoryForRoute(route.route),
  });
  generatedRoutes.push({
    path: route.route,
    fixture: route.example,
    file: route.output,
  });
}

await writeFile(path.join(ssgDir, fallbackFile), injectSsgMarkup(shellHtml, {
  markup: renderModule.renderSsgExample("routingState", "/"),
  example: "routingState",
  route: "/",
  relativeRoot: ".",
}));
await writeFile(path.join(ssgDir, searchIndexFile), `${JSON.stringify(searchEntries, null, 2)}\n`);

const manifest = {
  schemaVersion: 1,
  mode: "ssg",
  generatedAt: new Date(0).toISOString(),
  productionManifestHash: hash(JSON.stringify(productionManifest)),
  fallbackFile,
  searchIndexFile,
  routes: generatedRoutes,
  assets: [],
  diagnostics: [],
  deferredCompatibility: [
    "full xmlui ssg CLI",
    "content directory route discovery",
    "dynamic route prerendering",
    "full head/search metadata parity",
    "style registry SSR parity",
  ],
};

await writeFile(path.join(ssgDir, "xmlui-ssg-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
manifest.assets = await collectFiles(ssgDir);
await writeFile(path.join(ssgDir, "xmlui-ssg-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated SSG output in ${path.relative(rootDir, ssgDir)}`);
console.log("Generated routes:");
for (const route of generatedRoutes) {
  console.log(`  ${route.path} -> ${route.file}`);
}

function injectSsgMarkup(shellHtml, { markup, example, route, relativeRoot }) {
  const adjusted = shellHtml
    .replaceAll('src="./internal/', `src="${relativeRoot}/internal/`)
    .replaceAll('href="./internal/', `href="${relativeRoot}/internal/`);
  const rootOpen = `<div id="root" data-xmlui-ssg="true" data-xmlui-example="${example}" data-xmlui-ssg-path="${route}" data-xmlui-ssg-search-index-file="${searchIndexFile}">`;
  return adjusted.replace(/<div id="root"><\/div>/, `${rootOpen}${markup}</div>`);
}

function relativeRootForOutput(output) {
  const depth = output.split("/").length - 1;
  return depth === 0 ? "." : Array.from({ length: depth }, () => "..").join("/");
}

function textContent(markup) {
  return markup
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstHeading(markup) {
  const match = markup.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return match ? textContent(match[1]) : undefined;
}

function categoryForRoute(route) {
  const first = route.split("/").filter(Boolean)[0];
  return first || "home";
}

async function collectFiles(directory) {
  const files = [];
  await visit(directory);
  return files.sort();

  async function visit(current) {
    const entries = await import("node:fs/promises").then((fs) => fs.readdir(current, { withFileTypes: true }));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else {
        files.push(path.relative(directory, absolute).replaceAll("\\", "/"));
      }
    }
  }
}

async function assertExists(filePath, message) {
  if (!existsSync(filePath) || !(await stat(filePath)).isFile()) {
    throw new Error(message);
  }
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
