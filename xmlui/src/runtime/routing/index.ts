export type RoutingMode = "hash" | "history";

export type RouteSnapshot = {
  pathname: string;
  search: string;
  hash: string;
  queryParams: Record<string, string>;
  revision: number;
};

export type CompiledRoutePattern = {
  pattern: string;
  segments: RouteSegment[];
  score: number;
};

type RouteSegment =
  | { kind: "static"; value: string }
  | { kind: "param"; name: string };

type RouteListener = () => void;
type NavigationHandler = (to: string | number, queryParams?: Record<string, unknown>) => unknown | Promise<unknown>;

export type RuntimeNavigationHandlers = {
  onWillNavigate?: NavigationHandler;
  onDidNavigate?: NavigationHandler;
};

export class RuntimeRoutingStore {
  private snapshot: RouteSnapshot;
  private listeners = new Set<RouteListener>();
  private navigationHandlers: RuntimeNavigationHandlers = {};

  constructor(
    readonly mode: RoutingMode = "hash",
    private readonly onChange?: () => void,
    initialUrl?: string,
    private readonly localOnly = false,
  ) {
    this.snapshot = initialUrl ? snapshotFromUrl(initialUrl, 0) : readBrowserSnapshot(mode, 0);
  }

  getSnapshot(): RouteSnapshot {
    return this.snapshot;
  }

  subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setNavigationHandlers(handlers: RuntimeNavigationHandlers): void {
    this.navigationHandlers = handlers;
  }

  attach(): () => void {
    if (this.localOnly) {
      return () => undefined;
    }
    if (typeof window === "undefined") {
      return () => undefined;
    }
    const listener = () => this.syncFromBrowser();
    window.addEventListener("hashchange", listener);
    window.addEventListener("popstate", listener);
    this.syncFromBrowser();
    return () => {
      window.removeEventListener("hashchange", listener);
      window.removeEventListener("popstate", listener);
    };
  }

  async navigate(target: unknown, queryParams?: Record<string, unknown>): Promise<boolean> {
    if (typeof window === "undefined" && !this.localOnly) {
      return false;
    }
    if (typeof target === "number") {
      if (this.localOnly) {
        return false;
      }
      window.history.go(target);
      return true;
    }
    const current = this.snapshot;
    const url = this.createUrl(String(target ?? "/"), queryParams);
    const willResult = await this.navigationHandlers.onWillNavigate?.(String(target ?? "/"), queryParams);
    if (willResult === false) {
      return false;
    }
    if (this.localOnly) {
      this.snapshot = snapshotFromUrl(url, this.snapshot.revision + 1);
      this.onChange?.();
      for (const listener of this.listeners) {
        listener();
      }
      void this.navigationHandlers.onDidNavigate?.(snapshotToUrl(this.snapshot), this.snapshot.queryParams);
      return true;
    }
    if (this.mode === "hash") {
      window.location.hash = url;
      this.syncFromBrowser();
      dispatchRuntimeRouteNavigationIfPageChanged(current, url, "PUSH");
      return true;
    }
    window.history.pushState({}, "", url);
    this.syncFromBrowser();
    dispatchRuntimeRouteNavigationIfPageChanged(current, url, "PUSH");
    return true;
  }

  href(target: string, queryParams?: Record<string, unknown>): string {
    const url = this.createUrl(target, queryParams);
    return this.mode === "hash" ? `#${url}` : url;
  }

  private syncFromBrowser(): void {
    const next = readBrowserSnapshot(this.mode, this.snapshot.revision + 1);
    if (
      next.pathname === this.snapshot.pathname &&
      next.search === this.snapshot.search &&
      next.hash === this.snapshot.hash
    ) {
      return;
    }
    this.snapshot = next;
    this.onChange?.();
    for (const listener of this.listeners) {
      listener();
    }
    void this.navigationHandlers.onDidNavigate?.(snapshotToUrl(next), next.queryParams);
  }

  private createUrl(target: string, queryParams?: Record<string, unknown>): string {
    const current = this.snapshot;
    let pathname = target.trim() || "/";
    let search = "";
    let hash = "";
    if (pathname.startsWith("?")) {
      search = pathname;
      pathname = current.pathname;
    } else {
      const parsed = parseUrl(pathname);
      pathname = resolvePathname(parsed.pathname, current.pathname);
      search = parsed.search;
      hash = parsed.hash;
    }
    if (queryParams) {
      const params = new URLSearchParams(search);
      for (const [key, value] of Object.entries(queryParams)) {
        if (value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      search = query ? `?${query}` : "";
    }
    return `${pathname}${search}${hash}`;
  }
}

function snapshotToUrl(snapshot: RouteSnapshot): string {
  return `${snapshot.pathname}${snapshot.search}${snapshot.hash}`;
}

function dispatchRuntimeRouteNavigationIfPageChanged(
  current: RouteSnapshot,
  url: string,
  navigationType: "PUSH" | "POP",
) {
  const next = snapshotFromUrl(url, current.revision);
  if (next.pathname === current.pathname && next.search === current.search) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("xmlui:routing:navigate", {
      detail: {
        url,
        navigationType,
      },
    }),
  );
}

export function compileRoutePattern(pattern: string): CompiledRoutePattern {
  const normalized = normalizePathname(pattern || "/");
  const segments = normalized.split("/").filter(Boolean).map((segment): RouteSegment => {
    if (segment.startsWith(":") && segment.length > 1) {
      return { kind: "param", name: segment.slice(1) };
    }
    return { kind: "static", value: decodeURIComponent(segment) };
  });
  const score = segments.reduce((sum, segment) => sum + (segment.kind === "static" ? 10 : 1), 0);
  return { pattern: normalized, segments, score };
}

export function matchRoutePattern(
  compiled: CompiledRoutePattern,
  pathname: string,
): Record<string, string> | undefined {
  const pathSegments = normalizePathname(pathname).split("/").filter(Boolean);
  if (compiled.segments.length !== pathSegments.length) {
    return undefined;
  }
  const params: Record<string, string> = {};
  for (let index = 0; index < compiled.segments.length; index++) {
    const expected = compiled.segments[index];
    const actual = decodeURIComponent(pathSegments[index] ?? "");
    if (expected.kind === "static") {
      if (expected.value !== actual) {
        return undefined;
      }
    } else {
      params[expected.name] = actual;
    }
  }
  return params;
}

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "#") {
    return "/";
  }
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  const path = withoutHash.split(/[?#]/)[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function readBrowserSnapshot(mode: RoutingMode, revision: number): RouteSnapshot {
  if (typeof window === "undefined") {
    return snapshotFromUrl("/", revision);
  }
  if (mode === "hash") {
    const hashValue = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    return snapshotFromUrl(hashValue || "/", revision);
  }
  return snapshotFromUrl(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    revision,
  );
}

function snapshotFromUrl(url: string, revision: number): RouteSnapshot {
  const parsed = parseUrl(url || "/");
  return {
    pathname: normalizePathname(parsed.pathname),
    search: parsed.search,
    hash: parsed.hash,
    queryParams: Object.fromEntries(new URLSearchParams(parsed.search).entries()),
    revision,
  };
}

function parseUrl(url: string): { pathname: string; search: string; hash: string } {
  const parsed = new URL(url || "/", "http://xmlui.local");
  return {
    pathname: parsed.pathname || "/",
    search: parsed.search,
    hash: parsed.hash,
  };
}

function resolvePathname(target: string, current: string): string {
  if (target.startsWith("/")) {
    return normalizePathname(target);
  }
  if (target === ".") {
    return normalizePathname(current);
  }
  const base = current.endsWith("/") ? current : `${current}/`;
  return normalizePathname(new URL(target, `http://xmlui.local${base}`).pathname);
}
