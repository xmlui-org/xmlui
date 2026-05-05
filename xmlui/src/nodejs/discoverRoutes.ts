import { glob } from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { ComponentDef } from "../abstractions/ComponentDefs";

type ComponentNode = {
  type?: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
};

export type DiscoverRoutesOptions = {
  /** where to look for Main.xmlui and the components/ directory  */
  srcDir?: string;
  /** When specified, the discovery will attempt to match
   *  dynamic routes to files in the content directory.
   * When there's a match, the concrete occurance of that dynamic route will be added to the static routes.
   *
   *  For example, when contentDir is "content" and there's a `content/blog/introduction.md` file
   * and a matching route `/blog/:article`, then
   * `blog/introduction` will be recognised as a route.
   */
  contentDir?: string;
};

/**
 * Discoveres the routes found in Page components inside an xmlui project
 * @returns A RouteStore to obtain either all or only the static routes.
 */
export async function discoverRoutes(options: DiscoverRoutesOptions = {}): Promise<RouteStore> {
  const cwd = process.cwd();
  const srcDir = options.srcDir ? path.resolve(cwd, options.srcDir) : path.resolve(cwd, "src");
  const mainXmluiPath = path.join(srcDir, "Main.xmlui");

  let compDef: ComponentDef | null = null;
  let pagesComp: ComponentDef | null = null;

  try {
    const mainContent = await readFile(mainXmluiPath, "utf-8");
    const result = xmlUiMarkupToComponent(mainContent, mainXmluiPath);
    if (result.errors.length === 0 && result.component) {
      compDef = result.component as ComponentDef;
      pagesComp = getPagesComponent(compDef);
    }
  } catch {}

  if (!pagesComp) {
    const componentFiles = await glob("**/*.xmlui", {
      nodir: true,
    });

    for (const file of componentFiles) {
      try {
        const content = await readFile(file, "utf-8");
        const result = xmlUiMarkupToComponent(content, file);
        if (result.errors.length === 0) {
          const component =
            "component" in result.component ? result.component.component : result.component;
          const maybePageComp = getPagesComponent(component);
          if (maybePageComp) {
            compDef = component;
            pagesComp = maybePageComp;
            break;
          }
        }
      } catch {
        continue;
      }
    }
  }

  if (!pagesComp) {
    return new RouteStore(["/"], new Set());
  }

  // Extract NavGroup summary page URLs from the NavPanel
  const navPanelComp = getNavPanelComponent(compDef ?? undefined);
  const navGroupSummaryUrls = extractNavGroupUrlsFromTree(navPanelComp ?? undefined);

  const extractedRoutes = extractUrls(pagesComp).map(normalizeRoute);

  const dynamicRoutes = extractedRoutes.filter((r) => r.includes(":") || r.includes("*"));

  const discovered = new Set<string>(extractedRoutes);

  if (options.contentDir && dynamicRoutes.length > 0) {
    const contentDir = path.resolve(cwd, options.contentDir);
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
  const discoveredArray = [...discovered];

  return new RouteStore(discoveredArray, navGroupSummaryUrls);
}

function getPagesComponent(comp: ComponentDef | undefined): ComponentDef | null {
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

function getNavPanelComponent(comp: ComponentDef | undefined): ComponentDef | null {
  if (!comp) return null;
  if (comp.type === "NavPanel") return comp;
  if (Array.isArray(comp.children)) {
    for (const child of comp.children) {
      const result = getNavPanelComponent(child);
      if (result) return result;
    }
  }
  return null;
}

function extractNavGroupUrlsFromTree(comp: ComponentDef | undefined): Set<string> {
  const urls = new Set<string>();
  if (!comp) return urls;
  collectNavGroupUrls(comp.children as ComponentDef[] | undefined, urls);
  return urls;
}

function collectNavGroupUrls(children: ComponentDef[] | undefined, urls: Set<string>): void {
  if (!children) return;
  for (const child of children) {
    if (child.type === "NavGroup" && typeof child.props?.to === "string" && child.props.to) {
      urls.add(child.props.to);
    }
    if (child.children) {
      collectNavGroupUrls(child.children as ComponentDef[], urls);
    }
  }
}

function extractUrls(componentDef: ComponentDef): string[] {
  const pagesComp = getPagesComponent(componentDef);
  const urls: string[] = [];
  if (pagesComp?.children) {
    for (const page of pagesComp.children) {
      const url = (page as ComponentNode).props?.url;
      if (typeof url !== "string" || url.trim().length === 0) {
        continue;
      }

      urls.push(url);
    }
  }
  return urls;
}

export class RouteStore {
  constructor(
    private readonly routes: string[],
    private readonly _navGroupUrls: Set<string> = new Set(),
  ) {}

  /** @returns only static routes (those that do not have `":paramname"` or `"*"` in them).*/
  staticRoutes() {
    return this.routes.filter((r) => !r.includes(":") && !r.includes("*"));
  }

  /** @returns both static and dynamic routes (those that have `":paramname"` or `"*"` in them).*/
  allRoutes() {
    return this.routes;
  }

  /** @returns URLs that are NavGroup summary pages (should be excluded from search indexing). */
  navGroupUrls(): Set<string> {
    return this._navGroupUrls;
  }
}
