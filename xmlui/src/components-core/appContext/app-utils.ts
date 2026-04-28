import { pushXsLog } from "../inspector/inspectorUtils";
import { readCookie } from "../utils/misc";

// =============================================================================
// App.randomBytes(n)
// =============================================================================

/**
 * Returns `n` cryptographically random bytes as a `Uint8Array`.
 *
 * `n` must be an integer in the range [1, 1024]. The length of the request
 * (but never the bytes themselves) is pushed to the Inspector trace so
 * entropy consumption is observable.
 *
 * This is the sanctioned replacement for the banned `crypto.getRandomValues`.
 */
export function randomBytes(n: number): Uint8Array {
  if (!Number.isInteger(n) || n < 1 || n > 1024) {
    throw new RangeError(`App.randomBytes: n must be an integer in [1, 1024], got ${n}.`);
  }
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  pushXsLog({ kind: "app:randomBytes", ts: Date.now(), n });
  return buf;
}

// =============================================================================
// App.now() / App.mark() / App.measure()
// =============================================================================

/**
 * Returns a high-resolution timestamp (milliseconds, fractional) relative to
 * the navigation start — equivalent to `performance.now()`.
 *
 * This is the sanctioned replacement for the banned `performance` global.
 */
export function now(): number {
  return performance.now();
}

const _marks = new Map<string, number>();

/**
 * Records a named timing mark. The mark and its timestamp are pushed to the
 * Inspector trace so they appear in the DevTools timeline without polluting
 * the browser's own Performance buffer.
 */
export function mark(label: string): void {
  const ts = performance.now();
  _marks.set(label, ts);
  pushXsLog({ kind: "app:mark", ts: Date.now(), label, perfTs: ts });
}

/**
 * Measures the elapsed time between `fromMark` and the current instant (or
 * between `fromMark` and `toMark`). Pushes the result to the Inspector trace.
 *
 * @returns Elapsed milliseconds, or `NaN` if `fromMark` was never set.
 */
export function measure(label: string, fromMark: string, toMark?: string): number {
  const start = _marks.get(fromMark);
  if (start === undefined) return NaN;
  const end = toMark !== undefined ? (_marks.get(toMark) ?? performance.now()) : performance.now();
  const duration = end - start;
  pushXsLog({ kind: "app:measure", ts: Date.now(), label, fromMark, toMark, duration });
  return duration;
}

// =============================================================================
// Clipboard.copy(text)
// =============================================================================

/**
 * Writes `text` to the system clipboard.
 *
 * This is the sanctioned replacement for the banned `navigator.clipboard.writeText`.
 * The call is logged to the Inspector trace on every invocation.
 *
 * @throws {Error} If the clipboard API is unavailable (non-HTTPS context, denied
 *   permission, or SSR environment).
 */
export async function clipboardCopy(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard.copy: the Clipboard API is not available in this context.");
  }
  await navigator.clipboard.writeText(text);
  pushXsLog({ kind: "clipboard:copy", ts: Date.now(), length: text.length });
}

export const AppUtilsNamespace = {
  randomBytes,
  now,
  mark,
  measure,
};

export const ClipboardNamespace = {
  copy: clipboardCopy,
};

// =============================================================================
// App.fetch — managed fetch (Step 3.2)
// =============================================================================

/**
 * Determines whether `url` is same-origin relative to the current page.
 * Uses `window.location.href` as the base; falls back to `http://localhost`
 * in non-browser environments.
 */
function isAppFetchSameOrigin(url: string): boolean {
  const base =
    typeof window !== "undefined" ? window.location?.href || "http://localhost" : "http://localhost";
  try {
    const target = new URL(url, base);
    const origin = new URL(base);
    return target.protocol === origin.protocol && target.host === origin.host;
  } catch {
    return false;
  }
}

/**
 * Factory — returns a managed `App.fetch(input, init?)` bound to the
 * provided `appGlobals`.
 *
 * The returned function:
 * 1. Rejects cross-origin requests when `appGlobals.allowedOrigins` is set
 *    and the request URL's origin is not in the list.
 * 2. Injects the XSRF token (`X-XSRF-TOKEN`) for same-origin requests
 *    (controlled by `appGlobals.withXSRFToken !== false`).
 * 3. Pushes an `"app:fetch"` Inspector trace entry for every call.
 *
 * This is the sanctioned replacement for the banned global `fetch`.
 */
export function createAppFetch(
  appGlobals?: Record<string, any>,
): (input: string | URL, init?: RequestInit) => Promise<Response> {
  return async function appFetch(input: string | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input.toString();
    const method = ((init?.method ?? "GET") as string).toUpperCase();

    // --- Origin allowlist check ---
    const allowedOrigins: string[] | undefined = appGlobals?.allowedOrigins;
    if (Array.isArray(allowedOrigins) && allowedOrigins.length > 0) {
      const base =
        typeof window !== "undefined"
          ? window.location?.href || "http://localhost"
          : "http://localhost";
      let targetOrigin: string;
      try {
        targetOrigin = new URL(url, base).origin;
      } catch {
        throw new Error(`App.fetch: invalid URL: ${url}`);
      }
      if (!allowedOrigins.includes(targetOrigin)) {
        throw new Error(
          `App.fetch: origin '${targetOrigin}' is not in the allowedOrigins list. ` +
            `Allowed: ${allowedOrigins.join(", ")}`,
        );
      }
    }

    // --- XSRF injection for same-origin requests ---
    const headers = new Headers(init?.headers);
    if (appGlobals?.withXSRFToken !== false && isAppFetchSameOrigin(url)) {
      const xsrfToken = readCookie("XSRF-TOKEN");
      if (xsrfToken) {
        headers.set("X-XSRF-TOKEN", xsrfToken);
      }
    }

    // --- Inspector trace ---
    pushXsLog({ kind: "app:fetch", ts: Date.now(), url, method });

    return fetch(url, { ...init, headers });
  };
}

// =============================================================================
// App.environment — curated environment snapshot (Step 3.4)
// =============================================================================

export type AppEnvironment = {
  /** `true` when a narrow-screen media query matches (≤ 768 px wide). */
  isMobile: boolean;
  /** `true` when the OS/browser color scheme preference is dark. */
  prefersDark: boolean;
  /** `true` when the OS/browser requests reduced motion. */
  prefersReducedMotion: boolean;
  /** BCP-47 locale string from `navigator.language`, e.g. `"en-US"`. */
  locale: string;
  /** Ordered list of preferred languages from `navigator.languages`. */
  languages: readonly string[];
};

/**
 * Returns a snapshot of curated environment values.
 *
 * This is the sanctioned replacement for the banned raw properties
 * `navigator.userAgent`, `navigator.userAgentData`, `navigator.platform`,
 * `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and
 * `navigator.connection`.
 */
export function getAppEnvironment(): AppEnvironment {
  const mq = (q: string) =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(q).matches
      : false;
  return {
    isMobile: mq("(max-width: 768px)"),
    prefersDark: mq("(prefers-color-scheme: dark)"),
    prefersReducedMotion: mq("(prefers-reduced-motion: reduce)"),
    locale: typeof navigator !== "undefined" ? navigator.language : "en",
    languages:
      typeof navigator !== "undefined" && Array.isArray(navigator.languages)
        ? [...navigator.languages]
        : ["en"],
  };
}
