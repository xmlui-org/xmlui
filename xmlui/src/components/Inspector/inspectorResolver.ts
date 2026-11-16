/**
 * Resolves the Inspector's viewer files (`xs-diff.html` and the
 * `xmlui-parser.es.js` it imports) for the `fetchMissing` opt-in (#3946).
 *
 * Each file is resolved independently: the local copy next to the app wins,
 * and only a missing local copy falls back to the npm package on jsDelivr,
 * pinned to the version of the running runtime so the viewer and the trace
 * format cannot drift apart.
 */

export const VIEWER_FILE = "xs-diff.html";
export const PARSER_FILE = "xmlui-parser.es.js";

/** Where the npm package ships both viewer files (see `vite.config.ts`, standalone mode). */
export const CDN_PACKAGE_DIR = "dist/standalone/";

export type ResolvedSource = "local" | "cdn";

export type FileResolution = {
  file: string;
  source: ResolvedSource;
  url: string;
};

export type ResolveFailure = {
  file: string;
  tried: string[];
};

// A string discriminant: boolean-literal narrowing does not work with `strictNullChecks: false`.
export type ViewerResolution =
  | { status: "ok"; srcDoc: string; resolutions: FileResolution[] }
  | { status: "failed"; failure: ResolveFailure; resolutions: FileResolution[] };

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

const defaultFetcher: Fetcher = (url, init) => fetch(url, init);

/**
 * Extracts a semver from `VITE_XMLUI_VERSION` (`"0.14.28 (built 11/2/2026)"`).
 * Returns `undefined` for `"dev"`, an empty value, or anything without a version,
 * which disables the CDN fallback.
 */
export function parseRuntimeVersion(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const match = /^\s*(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/.exec(raw);
  return match?.[1];
}

export function cdnBaseUrl(version: string): string {
  return `https://cdn.jsdelivr.net/npm/xmlui@${version}/${CDN_PACKAGE_DIR}`;
}

/**
 * Points the viewer's `./xmlui-parser.es.js` import at `parserUrl`. A `srcDoc`
 * iframe has no base URL of its own, so relative imports must become absolute.
 */
export function rewriteParserImport(html: string, parserUrl: string): string {
  return html.replace(
    /(from\s+)(["'])\.\/xmlui-parser\.es\.js\2/g,
    (_m, from: string, quote: string) => `${from}${quote}${parserUrl}${quote}`,
  );
}

// Many hosts (SPA fallbacks, the XMLUI dev server) answer a missing file with the
// app's `index.html` and status 200, so `resp.ok` alone cannot tell "present" from
// "missing". Each file is therefore checked for what it must look like.

/** True when `url` serves the parser: a 2xx response that is not an HTML page. */
async function isParserAvailable(fetcher: Fetcher, url: string): Promise<boolean> {
  try {
    const resp = await fetcher(url, { method: "HEAD" });
    if (!resp.ok) return false;
    const type = resp.headers.get("content-type") ?? "";
    return !type.includes("text/html");
  } catch {
    return false;
  }
}

/** The viewer HTML at `url`, or `undefined` when missing or not the viewer (no parser import). */
async function fetchViewer(fetcher: Fetcher, url: string): Promise<string | undefined> {
  try {
    const resp = await fetcher(url);
    if (!resp.ok) return undefined;
    const text = await resp.text();
    return text.includes(PARSER_FILE) ? text : undefined;
  } catch {
    return undefined;
  }
}

export type ResolveViewerOptions = {
  /** Absolute URL of the local viewer (the Inspector's `src`, resolved against the page). */
  localViewerUrl: string;
  /** Runtime version, already parsed; `undefined` disables the CDN fallback. */
  version: string | undefined;
  fetcher?: Fetcher;
};

/**
 * Loads the viewer HTML and resolves the parser it imports, local first, CDN second.
 * On success, returns the viewer HTML with its parser import rewritten, ready for `srcDoc`.
 */
export async function resolveViewer({
  localViewerUrl,
  version,
  fetcher = defaultFetcher,
}: ResolveViewerOptions): Promise<ViewerResolution> {
  const resolutions: FileResolution[] = [];
  const cdnBase = version ? cdnBaseUrl(version) : undefined;

  // --- The viewer page itself
  const viewerTried: string[] = [localViewerUrl];
  let html = await fetchViewer(fetcher, localViewerUrl);
  if (html !== undefined) {
    resolutions.push({ file: VIEWER_FILE, source: "local", url: localViewerUrl });
  } else if (cdnBase) {
    const cdnViewerUrl = cdnBase + VIEWER_FILE;
    viewerTried.push(cdnViewerUrl);
    html = await fetchViewer(fetcher, cdnViewerUrl);
    if (html !== undefined) {
      resolutions.push({ file: VIEWER_FILE, source: "cdn", url: cdnViewerUrl });
    }
  }
  if (html === undefined) {
    return { status: "failed", failure: { file: VIEWER_FILE, tried: viewerTried }, resolutions };
  }

  // --- The parser the viewer imports (looked for beside the local viewer location)
  const localParserUrl = new URL(PARSER_FILE, localViewerUrl).href;
  const parserTried: string[] = [localParserUrl];
  let parserUrl: string | undefined;
  if (await isParserAvailable(fetcher, localParserUrl)) {
    parserUrl = localParserUrl;
    resolutions.push({ file: PARSER_FILE, source: "local", url: localParserUrl });
  } else if (cdnBase) {
    const cdnParserUrl = cdnBase + PARSER_FILE;
    parserTried.push(cdnParserUrl);
    if (await isParserAvailable(fetcher, cdnParserUrl)) {
      parserUrl = cdnParserUrl;
      resolutions.push({ file: PARSER_FILE, source: "cdn", url: cdnParserUrl });
    }
  }
  if (!parserUrl) {
    return { status: "failed", failure: { file: PARSER_FILE, tried: parserTried }, resolutions };
  }

  return { status: "ok", srcDoc: rewriteParserImport(html, parserUrl), resolutions };
}

/**
 * Checks that both local viewer files exist, without the opt-in. Used only to
 * replace an empty frame with an error message; never fetches from the network
 * beyond the app's own origin.
 */
export async function checkLocalViewer(
  localViewerUrl: string,
  fetcher: Fetcher = defaultFetcher,
): Promise<ResolveFailure | undefined> {
  // A GET rather than a HEAD: only the body tells the viewer from an SPA fallback page.
  // The iframe requests the same URL right after, so the browser cache usually serves it.
  if ((await fetchViewer(fetcher, localViewerUrl)) === undefined) {
    return { file: VIEWER_FILE, tried: [localViewerUrl] };
  }
  const localParserUrl = new URL(PARSER_FILE, localViewerUrl).href;
  if (!(await isParserAvailable(fetcher, localParserUrl))) {
    return { file: PARSER_FILE, tried: [localParserUrl] };
  }
  return undefined;
}
