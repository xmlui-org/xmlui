/**
 * Property-access guard for the DOM API sandbox.
 *
 * Companion to bannedFunctions.ts — covers member reads, writes, and method
 * calls on host objects that bypass the managed XMLUI surface.
 *
 * All denylist sets start **empty** in Step 0. Each subsequent hardening step
 * (1.1 – 1.9 in dom-api-hardening.md) populates them without touching this
 * function.
 *
 * Usage: call `isBannedMember(receiver, key)` at member-access (read/write)
 * and identifier-resolution sites in the eval-tree. The caller decides whether
 * to throw `BannedApiError` (strict mode) or emit a `sandbox:warn` trace entry
 * (warn mode) based on `evalContext.options?.strictDomSandbox`.
 */

// =============================================================================
// DENYLIST SETS  (populated by Steps 1.3 – 1.9 in dom-api-hardening.md)
// =============================================================================

/** Banned property keys on `globalThis` / `window`. */
export const BANNED_GLOBAL_KEYS = new Set<string>([
  // Step 1.3 — DOM mutation: observers and Range/Selection constructors
  "MutationObserver",
  "ResizeObserver",
  "IntersectionObserver",
  "PerformanceObserver",
  "Range",
  "Selection",
  "getSelection",
  // Step 1.4 — background execution and concurrency
  "Worker",
  "SharedWorker",
  "MessageChannel",
  "MessagePort",
  "BroadcastChannel",
  "SharedArrayBuffer",
  "Atomics",
  // Step 1.5 — storage and persistence (raw path)
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "caches",
  "cookieStore",
  "PushManager",
  "PeriodicSyncManager",
  "BackgroundFetchManager",
  // Step 1.6 — sensors and user-environment
  "Notification",
  // Step 1.7 — navigation and window management
  "open",
  "close",
  "stop",
  "print",
  "focus",
  "blur",
  "history",
  "location",
  // Step 1.8 — direct network constructors
  "XMLHttpRequest",
  "EventSource",
  "WebSocket",
  // Step 1.9 — crypto, performance, and devtools surface
  "crypto",
  "performance",
  "console",
]);

/** Migration hints for banned global keys. */
export const BANNED_GLOBAL_HELP = new Map<string, string>([
  ["localStorage", "Use AppState.get/set() for persistent key-value storage."],
  ["sessionStorage", "Use AppState.get/set() for session-scoped storage."],
  ["location", "Use navigate() instead of window.location."],
  ["history", "Use navigate() to control the browser history."],
  ["open", "Use App.openExternal() to open URLs in a new tab."],
  ["console", "Use Log.*() functions for tracing."],
  ["crypto", "Use App.randomBytes() for random data (available in Phase 2.4)."],
  ["performance", "Use App.now() / App.mark() (available in Phase 2.5)."],
  ["XMLHttpRequest", "Use DataSource or APICall for network requests."],
  ["WebSocket", "Use the WebSocket component for real-time connections."],
  ["EventSource", "Use the EventSource component for server-sent events."],
]);

/** Banned property keys on `document`. */
export const BANNED_DOCUMENT_KEYS = new Set<string>([
  // Step 1.3 — document roots
  "body",
  "documentElement",
  "head",
  // Step 1.3 — document queries
  "querySelector",
  "querySelectorAll",
  "getElementById",
  "getElementsByClassName",
  "getElementsByTagName",
  "getElementsByName",
  // Step 1.3 — document factories
  "createElement",
  "createElementNS",
  "createTextNode",
  "createDocumentFragment",
  "createRange",
  // Step 1.3 — document side effects
  "write",
  "writeln",
  "execCommand",
  "domain",
  "cookie",
  // Step 1.7 — page-identity setters
  "title",
]);

/** Migration hints for banned document keys. */
export const BANNED_DOCUMENT_HELP = new Map<string, string>([
  ["cookie", "Use AppState.get/set() for persistent storage."],
  ["title", "Set the page title via the Page component's title prop."],
  [
    "body",
    "Use XMLUI component props to modify the DOM through React instead of direct access.",
  ],
]);

/** Banned property keys on `navigator`. */
export const BANNED_NAVIGATOR_KEYS = new Set<string>([
  // Step 1.4 — background execution
  "serviceWorker",
  // Step 1.5 — storage
  "storage",
  // Step 1.6 — sensors and user-environment
  "geolocation",
  "mediaDevices",
  "clipboard",
  "permissions",
  "bluetooth",
  "usb",
  "serial",
  "hid",
  "credentials",
  "locks",
  // Step 1.8 — network
  "sendBeacon",
]);

/** Migration hints for banned navigator keys. */
export const BANNED_NAVIGATOR_HELP = new Map<string, string>([
  ["clipboard", "Use Clipboard.copy() for writing to the clipboard (available in Phase 2.2)."],
  ["geolocation", "Use the Geolocation component (planned)."],
  ["sendBeacon", "Use APICall for fire-and-forget HTTP requests."],
]);

/**
 * Banned setter/method keys on `Element` instances (DOM mutation outside React).
 * Checked on both read and write paths to prevent constructing a mutation
 * pipeline through a captured element reference.
 */
export const BANNED_ELEMENT_SETTER_KEYS = new Set<string>([
  // Step 1.3 — element setters
  "innerHTML",
  "outerHTML",
  // Step 1.3 — element methods that mutate via raw HTML
  "insertAdjacentHTML",
  "insertAdjacentElement",
  "insertAdjacentText",
  "setAttribute",
  "removeAttribute",
  "setAttributeNS",
  // Step 1.3 — node mutation methods
  "appendChild",
  "insertBefore",
  "replaceChild",
  "removeChild",
  "replaceWith",
  "before",
  "after",
  "prepend",
  "append",
]);

// =============================================================================
// RESULT TYPE
// =============================================================================

export type BannedMemberResult = {
  banned: boolean;
  /** Human-readable API label, e.g. `"window.location"`. */
  api?: string;
  /** Migration hint, e.g. `"Use navigate() instead of window.location.assign"`. */
  help?: string;
};

// =============================================================================
// GUARD FUNCTION
// =============================================================================

/**
 * Checks whether a property access (read, write, or method call) on `receiver`
 * for `key` is on the banned list.
 *
 * Returns `{ banned: false }` for any key not in a denylist, and always returns
 * `{ banned: false }` when all sets are empty (Step 0).
 *
 * @param receiver - The object being accessed (e.g. `document`, `window`, a
 *   DOM `Element`, or any other value).
 * @param key - The property name being accessed. Symbol keys are never banned.
 */
export function isBannedMember(receiver: unknown, key: string | symbol): BannedMemberResult {
  // Symbol keys are not subject to banning.
  if (receiver == null || typeof key !== "string") return { banned: false };

  // --- globalThis / window surface -------------------------------------------
  if (
    (typeof globalThis !== "undefined" && receiver === globalThis) ||
    (typeof window !== "undefined" && receiver === (window as any))
  ) {
    if (BANNED_GLOBAL_KEYS.has(key)) {
      return {
        banned: true,
        api: `window.${key}`,
        help: BANNED_GLOBAL_HELP.get(key),
      };
    }
  }

  // --- document surface -------------------------------------------------------
  if (typeof document !== "undefined" && receiver === (document as any)) {
    if (BANNED_DOCUMENT_KEYS.has(key)) {
      return {
        banned: true,
        api: `document.${key}`,
        help: BANNED_DOCUMENT_HELP.get(key),
      };
    }
  }

  // --- navigator surface ------------------------------------------------------
  if (typeof navigator !== "undefined" && receiver === (navigator as any)) {
    if (BANNED_NAVIGATOR_KEYS.has(key)) {
      return {
        banned: true,
        api: `navigator.${key}`,
        help: BANNED_NAVIGATOR_HELP.get(key),
      };
    }
  }

  // --- Element setter / mutation surface --------------------------------------
  // Only the write path matters here; reading innerHTML is safe.
  if (typeof Element !== "undefined" && receiver instanceof Element) {
    if (BANNED_ELEMENT_SETTER_KEYS.has(key)) {
      return {
        banned: true,
        api: `Element.${key}`,
        help: "Use component props to update the DOM instead of direct mutation.",
      };
    }
  }

  return { banned: false };
}
