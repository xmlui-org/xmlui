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

export class RuntimeRoutingStore {
  private snapshot: RouteSnapshot;
  private listeners = new Set<RouteListener>();

  constructor(
    readonly mode: RoutingMode = "hash",
    private readonly onChange?: () => void,
    initialUrl?: string,
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

  attach(): () => void {
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

  navigate(target: unknown, queryParams?: Record<string, unknown>): void {
    if (typeof window === "undefined") {
      return;
    }
    if (typeof target === "number") {
      window.history.go(target);
      return;
    }
    const url = this.createUrl(String(target ?? "/"), queryParams);
    if (this.mode === "hash") {
      window.location.hash = url;
      this.syncFromBrowser();
      return;
    }
    window.history.pushState({}, "", url);
    this.syncFromBrowser();
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
