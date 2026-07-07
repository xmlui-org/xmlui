import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distSsgDir = path.join(rootDir, "dist-ssg");

const requiredFiles = [
  "index.html",
  "200.html",
  "staticwebapp.config.json",
  "ssg-staticwebapp.config.json",
  "feed.rss",
  "sitemap.xml",
  "resources/logo.svg",
];

const requiredRoutes = [
  { route: "/", file: "index.html", markers: ["data-xmlui-component=\"App\"", "Display milestone"] },
  { route: "/get-started", file: "get-started/index.html", markers: ["Get Started"] },
  { route: "/docs/intro", file: "docs/intro/index.html", markers: ["Introduction"] },
  {
    route: "/docs/guides/playground-and-codefence",
    file: "docs/guides/playground-and-codefence/index.html",
    markers: ["XMLUI codefences and playgrounds"],
  },
  {
    route: "/docs/reference/components/Table",
    file: "docs/reference/components/Table/index.html",
    markers: ["Table"],
  },
  {
    route: "/docs/reference/extensions/xmlui-website-blocks/HeroSection",
    file: "docs/reference/extensions/xmlui-website-blocks/HeroSection/index.html",
    markers: ["HeroSection"],
  },
  {
    route: "/blog/introducing-xmlui",
    file: "blog/introducing-xmlui/index.html",
    markers: ["Introducing XMLUI"],
  },
];

for (const file of requiredFiles) {
  await assertFile(path.join(distSsgDir, file));
}

const indexFiles = await findFiles(distSsgDir, "index.html");
if (indexFiles.length < 250) {
  throw new Error(`Expected at least 250 generated route index.html files, found ${indexFiles.length}`);
}

for (const { route, file, markers } of requiredRoutes) {
  const html = await readFile(path.join(distSsgDir, file), "utf-8");
  assertIncludes(html, "data-xmlui-component=\"App\"", `${route} rendered XMLUI app markup`);
  for (const marker of markers) {
    assertIncludes(html, marker, `${route} content marker`);
  }
}

const staticWebAppConfig = JSON.parse(
  await readFile(path.join(distSsgDir, "staticwebapp.config.json"), "utf-8"),
);
assertEqual(
  staticWebAppConfig.responseOverrides?.["404"]?.rewrite,
  "/200.html",
  "staticwebapp.config.json 404 rewrite",
);

const ssgStaticWebAppConfig = JSON.parse(
  await readFile(path.join(distSsgDir, "ssg-staticwebapp.config.json"), "utf-8"),
);
assertEqual(
  JSON.stringify(staticWebAppConfig),
  JSON.stringify(ssgStaticWebAppConfig),
  "prepared staticwebapp.config.json",
);

const fallback = await readFile(path.join(distSsgDir, "200.html"), "utf-8");
assertIncludes(fallback, "data-xmlui-component=\"App\"", "200.html rendered XMLUI app markup");

const feed = await readFile(path.join(distSsgDir, "feed.rss"), "utf-8");
assertIncludes(feed, "<title>XMLUI Blog</title>", "feed.rss blog title");

const sitemap = await readFile(path.join(distSsgDir, "sitemap.xml"), "utf-8");
assertIncludes(sitemap, "https://docs.xmlui.org/docs", "sitemap docs URL");

const logo = await readFile(path.join(distSsgDir, "resources/logo.svg"), "utf-8");
assertIncludes(logo, "<svg", "resources/logo.svg SVG markup");

console.log(`Verified website SSG output: ${indexFiles.length} index.html files.`);

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

async function findFiles(dir, fileName) {
  const matches = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      matches.push(...(await findFiles(fullPath, fileName)));
    } else if (entry.name === fileName) {
      matches.push(fullPath);
    }
  }
  return matches;
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
