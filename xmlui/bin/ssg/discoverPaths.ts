import { glob } from "glob";
import { stat } from "node:fs/promises";
import path from "node:path";
import { createXmlUiParser, nodeToComponentDef } from "../../src/parsers/xmlui-parser";
import { ComponentDef } from "../../src";

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

function dynRouteToGlobPattern(route: string, contentDir: string): string {
  const normalized = route.startsWith("/") ? route.slice(1) : route;
  const segments = normalized.split("/").filter(Boolean);
  const globSegments = segments.map((seg) => {
    if (seg === "*") return "**";
    if (seg.startsWith(":")) return "*";
    return seg;
  });
  let lastSegment = globSegments[globSegments.length - 1]!;
  if (!lastSegment.endsWith("*")) {
    globSegments[globSegments.length - 1] = lastSegment + "*";
  }
  return path.join(contentDir, ...globSegments);
}

/**
 *
 * @param entrypoint The Main.xmlui file's content or component representation
 * @returns Set of urls from the Page components. The "/" route isn't in it implicitly.
 */
function extractUrls(entrypoint: string | ComponentDef): string[] {
  let componentDef: ComponentNode;
  if (typeof entrypoint === "string") {
    const { parse, getText } = createXmlUiParser(entrypoint);
    const parsedMain = parse();
    componentDef = nodeToComponentDef(parsedMain.node, getText, 0) as ComponentNode;
  } else {
    componentDef = entrypoint;
  }

  const pagesComp = getPagesComponent(componentDef);
  const urls: string[] = [];
  if (pagesComp?.children) {
    for (const page of pagesComp.children) {
      const url = page.props?.url;
      if (typeof url !== "string" || url.trim().length === 0) {
        continue;
      }

      urls.push(url);
    }
  }
  return urls;
}

export async function discoverPaths(
  entrypoint: string | ComponentDef,
  options?: { contentDir?: string },
): Promise<string[]> {
  const extractedRoutes = extractUrls(entrypoint).map(normalizeRoute);

  const staticRoutes = extractedRoutes.filter((r) => !r.includes(":") && !r.includes("*"));
  const dynamicRoutes = extractedRoutes.filter((r) => r.includes(":") || r.includes("*"));

  const discovered = new Set<string>(staticRoutes);

  const contentDir = options?.contentDir || "content";

  if (dynamicRoutes.length > 0) {
    const patterns = dynamicRoutes.map((r) => dynRouteToGlobPattern(r, contentDir));
    const mergedPattern = patterns.length === 1 ? patterns[0] : `{${patterns.join(",")}}`;

    const matchedFiles = await glob(mergedPattern, { nodir: true, dot: false });

    for (const filePath of matchedFiles) {
      const relative = path.relative(contentDir, filePath).replace(/\\/g, "/");
      const extension = path.extname(relative);
      const routePath = relative.slice(0, relative.length - extension.length);
      const normalizedFileRoute = normalizeRoute(`/${routePath}`);
      discovered.add(normalizedFileRoute);
    }
  }

  discovered.add("/");

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
