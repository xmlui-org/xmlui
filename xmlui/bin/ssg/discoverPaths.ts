import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  createXmlUiParser,
  extractParam,
  nodeToComponentDef,
} from "../../src/parsers/xmlui-parser";

type ComponentNode = {
  type?: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
};

function getPagesComponent(comp: ComponentNode | undefined): ComponentNode | null {
  if (!comp) {
    return null;
  }
  if (comp.type === "Pages") {
    return comp;
  }
  if (Array.isArray(comp.children)) {
    for (const child of comp.children) {
      const result = getPagesComponent(child);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function substituteParams(url: string, params: Record<string, unknown>): string[] {
  let variants: string[] = [url];

  for (const [key, value] of Object.entries(params)) {
    if (!variants.some((variant) => variant.includes(`:${key}`))) {
      continue;
    }

    const values = Array.isArray(value) ? value : [value];
    const next: string[] = [];
    for (const variant of variants) {
      if (!variant.includes(`:${key}`)) {
        next.push(variant);
        continue;
      }

      for (const paramValue of values) {
        if (paramValue === null || paramValue === undefined) {
          continue;
        }
        next.push(variant.split(`:${key}`).join(String(paramValue)));
      }
    }
    variants = next;
  }

  return variants.filter((variant) => !variant.includes(":"));
}

function normalizeRoute(pathname: string): string {
  let route = pathname.trim();
  if (route.length === 0) {
    return "/";
  }
  if (!route.startsWith("/")) {
    route = `/${route}`;
  }
  if (route !== "/" && route.endsWith("/")) {
    route = route.slice(0, -1);
  }
  return route;
}

async function readAllFilesRecursive(dir: string): Promise<string[]> {
  const files: string[] = [];
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readAllFilesRecursive(fullPath)));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

export async function discoverPaths(cwd: string): Promise<string[]> {
  const mainXmluiPath = path.resolve(cwd, "src", "Main.xmlui");
  const discovered = new Set<string>();

  let mainXmluiTextContent: string;
  try {
    mainXmluiTextContent = await readFile(mainXmluiPath, "utf-8");
  } catch {
    return ["/"];
  }

  const { parse, getText } = createXmlUiParser(mainXmluiTextContent);
  const parsedMain = parse();
  const componentDef = nodeToComponentDef(parsedMain.node, getText, 0) as ComponentNode;
  const pagesComp = getPagesComponent(componentDef);

  if (pagesComp?.children) {
    for (const page of pagesComp.children) {
      const url = page.props?.url;
      if (typeof url !== "string" || url.trim().length === 0) {
        continue;
      }

      if (page.props?.staticPaths) {
        try {
          const staticPaths = extractParam({}, page.props.staticPaths, undefined, true);
          if (Array.isArray(staticPaths)) {
            for (const entry of staticPaths) {
              if (!entry || typeof entry !== "object") {
                continue;
              }
              const params = (entry as { params?: Record<string, unknown> }).params;
              if (!params || typeof params !== "object") {
                continue;
              }
              for (const resolved of substituteParams(url, params)) {
                discovered.add(normalizeRoute(resolved));
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to evaluate staticPaths for '${url}'`, error);
        }
      }

      if (!url.includes(":") && !url.includes("*")) {
        discovered.add(normalizeRoute(url));
      }
    }
  }

  const contentDir = path.resolve(cwd, "content");
  const contentFiles = await readAllFilesRecursive(contentDir);
  for (const filePath of contentFiles) {
    if (!filePath.endsWith(".md")) {
      continue;
    }
    const relative = path.relative(contentDir, filePath).replace(/\\/g, "/");
    if (relative.startsWith("pages/") || relative.includes("/pages/")) {
      continue;
    }
    discovered.add(normalizeRoute(`/${relative.replace(/\.md$/, "")}`));
  }

  if (discovered.size === 0) {
    return ["/"];
  }

  return [...discovered];
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}
