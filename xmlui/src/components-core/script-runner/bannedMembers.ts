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
// DENYLIST SETS  (empty in Step 0 — populated by Steps 1.x)
// =============================================================================

/** Banned property keys on `globalThis` / `window`. */
export const BANNED_GLOBAL_KEYS = new Set<string>([]);

/** Migration hints for banned global keys. */
export const BANNED_GLOBAL_HELP = new Map<string, string>();

/** Banned property keys on `document`. */
export const BANNED_DOCUMENT_KEYS = new Set<string>([]);

/** Migration hints for banned document keys. */
export const BANNED_DOCUMENT_HELP = new Map<string, string>();

/** Banned property keys on `navigator`. */
export const BANNED_NAVIGATOR_KEYS = new Set<string>([]);

/** Migration hints for banned navigator keys. */
export const BANNED_NAVIGATOR_HELP = new Map<string, string>();

/**
 * Banned setter/method keys on `Element` instances (DOM mutation outside React).
 * Checked only on the write path and on method calls — not on reads, because
 * reading e.g. `el.innerHTML` is safe; it is the assignment that is dangerous.
 */
export const BANNED_ELEMENT_SETTER_KEYS = new Set<string>([]);

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
