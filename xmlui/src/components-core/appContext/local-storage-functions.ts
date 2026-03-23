import { get as lodashGet, set as lodashSet, unset as lodashUnset } from "lodash-es";

// Module-level callback invoked after any mutating localStorage operation.
// Only one listener at a time — AppContent registers (and cleans up) this during its lifecycle.
let _storageChangeListener: (() => void) | null = null;

// Flag to track if storage was reset before the listener was set up.
// When the listener is finally registered, we check this flag and notify immediately if a reset occurred.
let _resetOccurredBeforeListenerSetup = false;

/** Register a callback that fires after any localStorage mutation (write, delete, clear). */
export function setStorageChangeListener(listener: (() => void) | null): void {
  if (listener === null) {
    _storageChangeListener = null;
    return;
  }
  _storageChangeListener = listener;
  // If a reset happened before the listener was set up, notify now so the app can react.
  if (_resetOccurredBeforeListenerSetup) {
    _resetOccurredBeforeListenerSetup = false;
    listener();
  }
}

/** Mark that a storage reset occurred before the listener was set up. Called by initStorageGlobals(). */
export function markStorageResetBeforeListenerSetup(): void {
  _resetOccurredBeforeListenerSetup = true;
}

function notifyStorageChange(): void {
  _storageChangeListener?.();
}

/**
 * Splits a dot-path key into [rootKey, subPath].
 * The root key is the first dot-segment (the actual localStorage entry name).
 * The sub-path is the rest (a lodash-style property path inside the parsed JSON).
 *
 * Examples:
 *   "count"          → ["count", undefined]
 *   "myApp.v1.tone"  → ["myApp", "v1.tone"]
 */
function splitStorageKey(key: string): [rootKey: string, subPath: string | undefined] {
  const dotIndex = key.indexOf(".");
  if (dotIndex === -1) return [key, undefined];
  return [key.substring(0, dotIndex), key.substring(dotIndex + 1)];
}

/** Read and parse the raw localStorage entry, returning `undefined` on any error. */
function safeRead(rootKey: string): any {
  try {
    const raw = localStorage.getItem(rootKey);
    if (raw === null) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/** Write a JSON-serialised value to localStorage, or remove the entry if value is undefined. */
function safeWrite(rootKey: string, value: any): void {
  try {
    if (value === undefined) {
      localStorage.removeItem(rootKey);
    } else {
      localStorage.setItem(rootKey, JSON.stringify(value));
    }
  } catch {
    // QuotaExceededError, SecurityError (private browsing) → degrade gracefully
  }
}

/**
 * Reads a value from localStorage.
 *
 * The `key` uses dot-path semantics: the first segment is the localStorage entry name,
 * the remaining segments are a property path inside the parsed JSON object.
 *
 * Returns `fallback` when the key is absent, the value cannot be parsed as JSON,
 * the requested sub-path does not exist, or any error occurs.
 *
 * @example
 *   readLocalStorage("prefs")           // full "prefs" entry
 *   readLocalStorage("prefs.theme.tone") // nested subpath
 */
export function readLocalStorage(key: string, fallback?: any): any {
  try {
    const [rootKey, subPath] = splitStorageKey(key);
    const root = safeRead(rootKey);
    if (root === undefined) return fallback;
    if (!subPath) return root;
    const result = lodashGet(root, subPath);
    return result === undefined ? fallback : result;
  } catch {
    return fallback;
  }
}

/**
 * Writes a value to localStorage.
 *
 * The `key` uses dot-path semantics (same as readLocalStorage).
 * - Simple key (no dots): JSON-serialises and stores `value` directly.
 *   Removes the entry if `value` is `undefined`.
 * - Dot-path key: reads the root entry, sets the sub-path via lodash `set`, and writes
 *   the updated root back. If `value` is `undefined`, the sub-path is deleted.
 *
 * All errors (QuotaExceededError, SecurityError, etc.) are silently swallowed.
 *
 * @example
 *   writeLocalStorage("tone", "dark")
 *   writeLocalStorage("prefs.name", "Jane")  // merges into existing "prefs" entry
 */
export function writeLocalStorage(key: string, value: any): void {
  try {
    const [rootKey, subPath] = splitStorageKey(key);
    if (!subPath) {
      safeWrite(rootKey, value);
    } else {
      const root = safeRead(rootKey) ?? {};
      if (value === undefined) {
        lodashUnset(root, subPath);
      } else {
        lodashSet(root, subPath, value);
      }
      safeWrite(rootKey, root);
    }
  } catch {
    // Degrade gracefully
  }
  notifyStorageChange();
}

/**
 * Deletes a value from localStorage.
 *
 * The `key` uses dot-path semantics (same as readLocalStorage).
 * - Simple key: removes the entire localStorage entry.
 * - Dot-path key: reads the root entry, removes the sub-path via lodash `unset`,
 *   and writes the updated root back.
 *
 * No-op if the key / sub-path is absent.
 *
 * @example
 *   deleteLocalStorage("tone")          // removes the "tone" entry entirely
 *   deleteLocalStorage("prefs.name")    // removes only prefs.name from "prefs" entry
 */
export function deleteLocalStorage(key: string): void {
  try {
    const [rootKey, subPath] = splitStorageKey(key);
    if (!subPath) {
      try {
        localStorage.removeItem(rootKey);
      } catch {
        // SecurityError → degrade gracefully
      }
    } else {
      const root = safeRead(rootKey);
      if (root !== undefined) {
        lodashUnset(root, subPath);
        safeWrite(rootKey, root);
      }
    }
  } catch {
    // Degrade gracefully
  }
  notifyStorageChange();
}

/**
 * Clears localStorage entries.
 *
 * - No argument: removes ALL entries (`localStorage.clear()`).
 * - With `prefix`: removes only entries whose **root key** starts with the prefix.
 *
 * All errors are silently swallowed.
 *
 * @example
 *   clearLocalStorage()           // wipes everything
 *   clearLocalStorage("myApp")    // removes "myApp", "myApp2", etc.
 */
export function clearLocalStorage(prefix?: string): void {
  try {
    if (!prefix) {
      localStorage.clear();
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // SecurityError → degrade gracefully
        }
      });
    }
  } catch {
    // Degrade gracefully
  }
  notifyStorageChange();
}

/**
 * Resets (removes) localStorage entries.
 *
 * This is the recommended programmatic escape hatch for app authors — call it
 * from a "Reset settings" button or from a script to clear persisted data so
 * the next page load starts from default values.
 *
 * - No argument: removes ALL entries (`localStorage.clear()`).
 * - With `prefix`: removes only entries whose **root key** starts with the prefix.
 *
 * All errors are silently swallowed.
 *
 * @example
 *   resetLocalStorage()           // wipes everything
 *   resetLocalStorage("count")    // removes the "count" entry
 *   resetLocalStorage("myApp.v1") // removes all entries prefixed "myApp.v1"
 */
export function resetLocalStorage(prefix?: string): void {
  clearLocalStorage(prefix);
}

/**
 * Returns all current localStorage entries as a plain object.
 *
 * Each key maps to its JSON-parsed value when the stored string is valid JSON,
 * or to the raw string otherwise. Entries that cannot be read at all are omitted.
 *
 * Silently returns an empty object when localStorage is unavailable
 * (e.g. private browsing, SecurityError).
 *
 * @example
 *   getAllLocalStorage()  // { count: 5, prefs: { theme: "dark" }, rawKey: "hello" }
 */
export function getAllLocalStorage(): Record<string, any> {
  try {
    const result: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === null) continue;
      const parsed = safeRead(k);
      // safeRead returns undefined when the value is absent or invalid JSON;
      // fall back to the raw string so non-JSON entries are still visible.
      result[k] = parsed !== undefined ? parsed : localStorage.getItem(k);
    }
    return result;
  } catch {
    return {};
  }
}

export const localStorageFunctions = {
  readLocalStorage,
  writeLocalStorage,
  deleteLocalStorage,
  clearLocalStorage,
  resetLocalStorage,
  getAllLocalStorage,
};
