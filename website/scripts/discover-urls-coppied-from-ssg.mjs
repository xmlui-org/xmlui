import fs from "fs/promises";
import * as path from "node:path";
import { createXmlUiParser, nodeToComponentDef, extractParam } from "xmlui/parser";

const getRecursiveFileReads = async (dir) => {
  try {
    const files = await fs.readdir(dir);
    return Promise.all(
      files.flatMap(async (file) => {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          return (await getRecursiveFileReads(filePath)).flatMap((item) => item);
        }
        return [filePath];
      }),
    );
  } catch (e) {
    return [];
  }
};

const readDirectory = async (dir) => {
  const promises = await getRecursiveFileReads(dir);
  const buffers = await Promise.all(promises);
  return buffers.flatMap((filePath) => filePath);
};

function getPagesComponent(comp) {
  if (!comp) return null;
  if (comp.type === "Pages") {
    return comp;
  }
  if (comp.children) {
    for (let child of comp.children) {
      let result = getPagesComponent(child);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function substituteParams(url, params) {
  let result = [];
  for (const key in params) {
    const value = params[key];
    if (typeof value === "string" && url.includes(`:${key}`)) {
      result.push(url.replace(`:${key}`, value));
    }
  }
  return result;
}

export async function discoverPaths() {
  const mainXmluiPath = path.resolve("src", "Main.xmlui");

  let mainXmluiTextContent;
  try {
    mainXmluiTextContent = await fs.readFile(mainXmluiPath, "UTF-8");
  } catch (e) {
    console.warn(`Warning: Could not read ${mainXmluiPath}, returning default path.`);
    return ["/"];
  }

  const { parse, getText } = createXmlUiParser(mainXmluiTextContent);
  const parsedMain = parse();
  const compDef = nodeToComponentDef(parsedMain.node, getText, 0);

  const PagesComp = getPagesComponent(compDef);

  const discoveredPaths = new Set();

  if (PagesComp && PagesComp.children) {
    for (const page of PagesComp.children) {
      const url = page.props.url;
      if (!url) continue;

      // Handle staticPaths for dynamic routes
      if (page.props.staticPaths) {
        try {
          const staticPaths = extractParam({}, page.props.staticPaths, undefined, true);
          if (Array.isArray(staticPaths)) {
            staticPaths.forEach((entry) => {
              if (entry.params && typeof entry.params === "object") {
                const concreteUrls = substituteParams(url, entry.params);
                discoveredPaths.add(...concreteUrls);
              }
            });
          }
        } catch (e) {
          console.warn(`Error evaluating staticPaths for url ${url}:`, e);
        }
      }

      // Include the path if it's static (no parameters)
      // Note: If a path is dynamic but has no staticPaths, we skip it for SSG
      // as it will be handled client-side, unless it was expanded above.
      // However, we still need to avoid adding the raw dynamic path (e.g. /user/:id)
      // to the list of paths to fetch.
      if (!url.includes(":") && !url.includes("*")) {
        discoveredPaths.add(url);
      }
    }
  }

  // Discover paths from content directory (Markdown files)
  try {
    const navPanelContent = await readDirectory("content");
    navPanelContent
      .filter((filePath) => filePath.endsWith(".md") && !filePath.startsWith("content/pages/"))
      .map((filePath) => filePath.replace("content/", "/").replace(".md", ""))
      .forEach((p) => discoveredPaths.add(p));
  } catch (e) {
    console.info("no content directory found, skipping content paths");
  }

  if (discoveredPaths.size === 0) {
    return ["/"];
  }

  return Array.from(discoveredPaths);
}
