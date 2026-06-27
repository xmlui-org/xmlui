import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");

const requiredCopiedFiles = [
  "feed.rss",
  "sitemap.xml",
  "staticwebapp.config.json",
  "ssg-staticwebapp.config.json",
  "resources/logo.svg",
  "resources/logo-dark.svg",
  "resources/favicon.ico",
  "resources/llms.txt",
  "resources/files/releases.json",
  "resources/files/cli-templates.json",
  "xmlui/xmlui-parser.es.js",
];

const requiredGeneratedFiles = [
  "index.html",
  "mockServiceWorker.js",
];

for (const file of requiredGeneratedFiles) {
  await assertFile(path.join(distDir, file));
}

for (const file of requiredCopiedFiles) {
  const publicPath = path.join(publicDir, file);
  const distPath = path.join(distDir, file);
  await assertFile(publicPath);
  await assertFile(distPath);
  await assertSameText(publicPath, distPath);
}

const staticWebAppConfig = JSON.parse(
  await readFile(path.join(distDir, "staticwebapp.config.json"), "utf-8"),
);
assertEqual(
  staticWebAppConfig.navigationFallback?.rewrite,
  "/index.html",
  "staticwebapp.config.json navigationFallback.rewrite",
);
assertEqual(
  staticWebAppConfig.mimeTypes?.[".rss"],
  "application/rss+xml",
  "staticwebapp.config.json .rss MIME type",
);

const ssgStaticWebAppConfig = JSON.parse(
  await readFile(path.join(distDir, "ssg-staticwebapp.config.json"), "utf-8"),
);
assertEqual(
  ssgStaticWebAppConfig.responseOverrides?.["404"]?.rewrite,
  "/200.html",
  "ssg-staticwebapp.config.json 404 rewrite",
);

const feed = await readFile(path.join(distDir, "feed.rss"), "utf-8");
assertIncludes(feed, "<title>XMLUI Blog</title>", "feed.rss blog title");

const sitemap = await readFile(path.join(distDir, "sitemap.xml"), "utf-8");
assertIncludes(sitemap, "https://docs.xmlui.org/docs", "sitemap docs URL");

const logo = await readFile(path.join(distDir, "resources/logo.svg"), "utf-8");
assertIncludes(logo, "<svg", "resources/logo.svg SVG markup");

console.log("Verified website production output copied assets and hosting configs.");

async function assertFile(filePath) {
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      throw new Error(`${path.relative(rootDir, filePath)} is not a file`);
    }
  } catch (error) {
    throw new Error(`Missing expected file: ${path.relative(rootDir, filePath)}`, {
      cause: error,
    });
  }
}

async function assertSameText(expectedPath, actualPath) {
  const [expected, actual] = await Promise.all([
    readFile(expectedPath, "utf-8"),
    readFile(actualPath, "utf-8"),
  ]);
  if (expected !== actual) {
    throw new Error(
      `Copied file changed in dist: ${path.relative(rootDir, actualPath)} does not match ${path.relative(rootDir, expectedPath)}`,
    );
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(value, expected, label) {
  if (!value.includes(expected)) {
    throw new Error(`${label}: expected to include ${JSON.stringify(expected)}`);
  }
}
