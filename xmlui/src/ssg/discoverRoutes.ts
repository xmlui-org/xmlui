/**
 * Route discovery for SSG — scans .xmlui files for <Pages>/<Page url="...">
 * components and extracts static routes.
 *
 * Uses the new xmlui parser (parseXmlui) instead of the old xmlUiMarkupToComponent.
 */

import { glob } from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseXmlui } from "../compiler/parseXmlui";
import type { XmluiDocument, XmluiElement } from "../compiler/ir";

export type DiscoverRoutesOptions = {
  /** Where to look for Main.xmlui and the components/ directory */
  srcDir?: string;
  /** When specified, match dynamic routes to files in the content directory */
  contentDir?: string;
};

/**
 * Discovers routes found in Page components inside an xmlui project.
 */
export async function discoverRoutes(
  options: DiscoverRoutesOptions = {},
): Promise<RouteStore> {
  const cwd = process.cwd();
  const srcDir = options.srcDir
    ? path.resolve(cwd, options.srcDir)
    : path.resolve(cwd, "src");

  const extractedRoutes = await extractPageRoutes(srcDir);
  const dynamicRoutes = extractedRoutes.filter(
    (r) => r.includes(":") || r.includes("*"),
  );
  const discovered = new Set<string>(extractedRoutes);
  const navGroupSummaryUrls = await extractNavGroupUrls(srcDir);

  if (options.contentDir && dynamicRoutes.length > 0) {
    const contentDir = path.resolve(cwd, options.contentDir);
    const patterns = dynamicRoutes.map((r) =>
      dynRouteToGlobPattern(r, contentDir),
    );
    const mergedPattern =
      patterns.length === 1 ? patterns[0] : `{${patterns.join(",")}}`;

    const matchedFiles = await glob(mergedPattern, { nodir: true, dot: false });
    for (const filePath of matchedFiles) {
      const relative = path.relative(contentDir, filePath).replace(/\\/g, "/");
      const extension = path.extname(relative);
      const routePath = relative.slice(0, relative.length - extension.length);
      discovered.add(normalizeRoute(`/${routePath}`));
    }
  }

  discovered.add("/");
  return new RouteStore([...discovered], navGroupSummaryUrls);
}

async function extractPageRoutes(srcDir: string): Promise<string[]> {
  const mainXmluiPath = path.join(srcDir, "Main.xmlui");
  let doc: XmluiDocument | null = null;

  try {
    const mainContent = await readFile(mainXmluiPath, "utf-8");
    doc = parseXmlui(mainContent, { sourceId: mainXmluiPath });
  } catch {
    // Main.xmlui not found or invalid
  }

  if (doc) {
    const pages = getPagesElement(doc);
    if (pages) {
      return extractUrls(pages).map(normalizeRoute);
    }
  }

  // Fallback: scan all .xmlui files for a Pages component
  const componentFiles = await glob("**/*.xmlui", {
    nodir: true,
    cwd: process.cwd(),
  });
  for (const file of componentFiles) {
    try {
      const content = await readFile(file, "utf-8");
      const candidate = parseXmlui(content, { sourceId: file });
      const pages = getPagesElement(candidate);
      if (pages) {
        return extractUrls(pages).map(normalizeRoute);
      }
    } catch {
      continue;
    }
  }

  return [];
}

function getPagesElement(doc: XmluiDocument): XmluiElement | null {
  if (doc.kind === "component") return null;
  return findElementByType(doc.root, "Pages");
}

function findElementByType(
  el: XmluiElement,
  type: string,
): XmluiElement | null {
  if (el.type === type) return el;
  for (const child of el.children) {
    if (child.kind === "text") continue;
    const found = findElementByType(child, type);
    if (found) return found;
  }
  return null;
}

async function extractNavGroupUrls(srcDir: string): Promise<Set<string>> {
  const mainXmluiPath = path.join(srcDir, "Main.xmlui");
  try {
    const mainContent = await readFile(mainXmluiPath, "utf-8");
    const doc = parseXmlui(mainContent, { sourceId: mainXmluiPath });
    if (doc.kind === "component") {
      return new Set();
    }
    return extractNavGroupUrlsFromTree(findElementByType(doc.root, "NavPanel"));
  } catch {
    return new Set();
  }
}

function extractNavGroupUrlsFromTree(el: XmluiElement | null): Set<string> {
  const urls = new Set<string>();
  if (el) {
    collectNavGroupUrls(el, urls);
  }
  return urls;
}

function collectNavGroupUrls(el: XmluiElement, urls: Set<string>): void {
  if (el.type === "NavGroup") {
    const to = el.props?.to;
    if (typeof to === "string" && to.length > 0) {
      urls.add(to);
    }
  }
  for (const child of el.children) {
    if (child.kind !== "text") {
      collectNavGroupUrls(child, urls);
    }
  }
}

function extractUrls(pagesEl: XmluiElement): string[] {
  const urls: string[] = [];
  for (const child of pagesEl.children) {
    if (child.kind === "text") continue;
    if (child.type === "Page") {
      const url = child.props?.url;
      if (typeof url === "string" && url.trim().length > 0) {
        urls.push(url);
      }
    }
  }
  return urls;
}

function normalizeRoute(pathname: string): string {
  let route = pathname.trim();
  if (route.length === 0) return "/";
  if (!route.startsWith("/")) route = `/${route}`;
  if (route !== "/" && route.endsWith("/")) route = route.slice(0, -1);
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

export class RouteStore {
  constructor(
    private readonly routes: string[],
    private readonly _navGroupUrls: Set<string> = new Set(),
  ) {}

  /** Routes without ":param" or "*" wildcards — safe for SSG. */
  staticRoutes(): string[] {
    return this.routes.filter((r) => !r.includes(":") && !r.includes("*"));
  }

  allRoutes(): string[] {
    return this.routes;
  }

  /** URLs that are NavGroup summary pages, matching the old website sitemap contract. */
  navGroupUrls(): Set<string> {
    return this._navGroupUrls;
  }
}
