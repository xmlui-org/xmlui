# Local Storage Persistence — Implementation Plan

## Goal

Provide XMLUI apps with safe, declarative local-storage persistence for settings (theme tone, sidebar state, user preferences, etc.).

---

## 1 · Global Functions

Add a new utility module `appContext/local-storage-functions.ts` exporting a `localStorageFunctions` object.  
Spread it into `appContextValue` in `AppContent.tsx` (same pattern as `dateFunctions`, `mathFunctions`).

### Key semantics — dot-path subkey access

The `key` parameter in all functions follows **lodash get/set semantics**: a dot-separated path where the first segment is the `localStorage` entry and the rest is a property path inside the parsed JSON value.

Examples:

| Call | Effect |
|---|---|
| `readLocalStorage("prefs")` | read & parse the whole `"prefs"` JSON blob |
| `readLocalStorage("prefs.theme.tone")` | parse `"prefs"`, return `value.theme.tone` |
| `writeLocalStorage("prefs.name", "Jane")` | parse `"prefs"`, set `prefs.name = "Jane"`, re-serialise & store |
| `deleteLocalStorage("prefs.name")` | parse `"prefs"`, delete `prefs.name`, re-serialise & store |
| `deleteLocalStorage("prefs")` | remove the entire `"prefs"` entry |

The top-level localStorage entry is always the **first dot-segment**. If the stored value is not a JSON object and a subpath is requested, the operation is silently ignored (read returns `fallback`; write/delete are no-ops).

### Function table

| Function | Signature | Behaviour |
|---|---|---|
| `readLocalStorage` | `(key: string, fallback?: any) → any` | Read & JSON-parse the root entry, then optionally traverse a subpath. Return `fallback` on missing key, missing subpath, or any error. |
| `writeLocalStorage` | `(key: string, value: any) → void` | For a simple key: JSON-stringify & store whole value (remove if `undefined`). For a dot-path: read root, set subpath with lodash `set`, re-serialise & store. |
| `deleteLocalStorage` | `(key: string) → void` | For a simple key: remove entry. For a dot-path: read root, delete subpath with lodash `unset`, re-serialise & store. |
| `clearLocalStorage` | `(prefix?: string) → void` | No args → remove all entries. With prefix → remove only entries whose **root key** starts with `prefix`. |
| `resetLocalStorage` | `(prefix?: string) → void` | Alias for `clearLocalStorage`. Preferred name for app-level "Reset settings" actions. |
| `getAllLocalStorage` | `() → Record<string, any>` | Returns all current localStorage entries as a plain object. Values are JSON-parsed where possible; raw strings otherwise. Returns `{}` on any error. |

All functions silently catch any `QuotaExceededError` / `SecurityError` (private browsing, disabled storage) and degrade gracefully (reads return `fallback`; writes/deletes become no-ops).

### Implementation note

Use lodash `get` / `set` / `unset` for subpath traversal; these are already a transitive dependency of the repo. A helper `splitStorageKey(key): [rootKey: string, subPath: string | undefined]` splits on the first dot.

---

## 2 · Reactive Storage Binding via the `<global>` Tag

The `<global>` tag already accepts `name` and `value`. Add two optional persistence attributes:

| Attribute | Type | Default | Description |
|---|---|---|---|
| `storageKey` | `string` | — | Explicit localStorage key (dot-path). Implies persistence when present. |
| `persist` | `boolean` | `false` | When `true`, persists under the variable's own `name` if no `storageKey` is given. |

The name `storageKey` (rather than `localStorageKey`) is intentionally provider-agnostic — future providers (sessionStorage, IndexedDB, remote KV) can plug in without renaming the attribute.

```xmlui
<!-- Persist with an explicit key -->
<global name="tone" value="light" storageKey="myApp.v1.tone" />

<!-- Persist using the variable name itself as the storage key -->
<global name="count" value="{0}" persist="true" />

<!-- persist="true" + storageKey: the explicit key wins -->
<global name="count" value="{0}" persist="true" storageKey="myApp.v1.count" />

<!-- Persist only a subfield of an existing entry -->
<global name="userName" value="" storageKey="myApp.v1.prefs.userName" />
```

### Effective storage key resolution (parse time)

1. `storageKey="foo"` present → effective key = `"foo"` (explicit always wins).
2. `persist="true"` + no `storageKey` → effective key = the variable's `name`.
3. Neither `storageKey` nor `persist="true"` → no persistence.

The parser stores the effective key as `__storageKey_<name>` metadata; the runtime logic is unchanged.

Behaviour when `storageKey` is present:

1. **On init — storage wins over `value`; read must be synchronous.**  
   Call `readLocalStorage(storageKey, /*fallback=*/value)` **synchronously during state initialisation** (e.g. as the `initialState` argument to `useState`/`useReducer`, never inside a `useEffect`).  
   This guarantees the variable holds its correct persisted value on the very **first render** — no two-phase init, no UI flash.

   - Stored value **present and parseable** → variable starts with the stored value. The `value` attribute is ignored.  
   - Stored value **absent, unparseable, or any error** → variable starts with the declared `value` attribute.  
   The variable always starts with a valid value; `value` acts as the **default / reset value**, not as a forced initial value.

   ```xmlui
   <!-- First run: count starts at 0  (nothing in localStorage yet)   -->
   <!-- After count reaches 5 and reloads: count starts at 5          -->
   <!-- After corrupt storage or explicit clear: count starts at 0    -->
   <global name="count" value="{0}" storageKey="count" />
   ```

   > [!IMPORTANT] `localStorage.getItem` is a synchronous browser API, so reading it during state initialisation is safe and has negligible overhead.

2. **On every change** — call `writeLocalStorage(storageKey, newValue)`.  
   Subpath writes merge into the existing root object rather than replacing it.

3. **Manual reset** — call `deleteLocalStorage(storageKey)` from a script (e.g. a "Reset settings" button); on next reload the variable starts from `value` again.

The `global.tone="light"` attribute-prefix shorthand stays unchanged for variables that do **not** need persistence. The `<global>` tag form is required only when `storageKey` is needed.

### Cross-tab sync (optional, deferred)

Listen for the `storage` event on `window` to pick up changes made in other tabs. Mark as a follow-up; not required for MVP.

---

## 3 · Corruption / Schema Safety

Primary risk: app reads stale or structurally incompatible data after an update and breaks.

### 3a — Versioned key namespace

Encourage (document) a convention: prefix keys with an app version or schema version, e.g. `myApp.v2.tone`.  
The global functions themselves stay version-agnostic; the convention is enforced by the app author.

### 3b — `readLocalStorage` always returns fallback on error

`JSON.parse` failures, `null`, and `SecurityError` all produce the fallback value. The app never receives an unparseable blob.

### 3c — `clearLocalStorage` global function

Add one more utility:

| Function | Signature | Behaviour |
|---|---|---|
| `clearLocalStorage` | `(prefix?: string) → void` | No args → clear all. With prefix → remove only keys starting with `prefix`. |

This gives apps a "factory reset" escape hatch — useful on version upgrade or from a settings screen.

---

## 5 · Escape Hatch — Emergency Storage Reset

### Problem

A catch-22 can occur if persisted values drive the app into a broken state at startup (e.g. a count value that triggers invalid logic, a corrupt theme ID that throws inside `ThemeProvider`, etc.). The user cannot reach a "Reset settings" button because the app never finishes loading.

### Recommended mechanism: URL query parameter `?xmlui-reset`

Check for a special URL query parameter **before** any localStorage values are read (i.e. at the very top of the standalone app's startup flow). When present:

1. Clear the relevant entries (or all entries with a prefix, or the entire storage).
2. Remove the parameter from the URL via `history.replaceState` so the reset does not re-trigger on the next navigation.
3. Continue with a clean state.

#### Usage

| URL | Effect |
|---|---|
| `?xmlui-reset` | Clear **all** `localStorage` entries for this app |
| `?xmlui-reset=count` | Clear only the entry with root key `count` |
| `?xmlui-reset=myApp.v1` | Clear all entries whose root key starts with `myApp.v1` |

This approach is the most robust escape hatch because:
- Works even when the app fails to render at all (only needs a URL change, not DevTools).
- The URL can be shared with support teams or end-users without requiring console access.
- Self-removing (`history.replaceState`) — the reset fires exactly once and the clean URL is bookmarkable.
- No server-side changes needed; purely client-side.

#### Secondary mechanism: `window.XMLUI_RESET_STORAGE(key?)`

A callable function registered on `window` for developer use from the browser console. It combines the clear and reload into one step — no need to set a variable and call `reload()` separately.

```js
// Clear all storage and reload
window.XMLUI_RESET_STORAGE();

// Clear only entries whose root key starts with "count", then reload
window.XMLUI_RESET_STORAGE("count");

// Clear all entries under a version-namespaced prefix, then reload
window.XMLUI_RESET_STORAGE("myApp.v1");
```

The function calls `clearLocalStorage(key)` then `window.location.reload()`. It is registered at module-init time alongside the URL parameter check.

#### Diagnostic: `window.XMLUI_GET_STORAGE()`

Returns the current localStorage contents as a plain JavaScript object (same as the `getAllLocalStorage()` global function). Useful for inspecting what is persisted without opening the Application tab in DevTools.

```js
window.XMLUI_GET_STORAGE();
// → { count: 5, appTheme: "dark", appTone: "dark", "myApp.v1": { prefs: { ... } } }
```

Also available inside XMLUI markup / scripts as `getAllLocalStorage()`.

### Implementation

1. In `StandaloneApp.tsx`, add a module-level block (outside any component, runs at import time) that:
   - Reads `new URLSearchParams(window.location.search).get("xmlui-reset")`.
   - If the value is `null` / absent — do nothing.
   - If the value is `""`, `"true"`, or any other string — call `clearLocalStorage(value || undefined)` (prefix-based clear already implemented).
   - Clean up: `history.replaceState(null, "", url_without_param)` — router never sees the parameter.
   - Register `window.XMLUI_RESET_STORAGE = (key?) => { clearLocalStorage(key); location.reload(); }`.
   - The entire block is guarded by `typeof window !== "undefined"` for SSR safety.
2. Document the mechanism with a note in the `storageKey` attribute guide.

---

## 6 · Implementation Steps (updated)

1. **Create `appContext/local-storage-functions.ts`** — implement the five functions (`readLocalStorage`, `writeLocalStorage`, `deleteLocalStorage`, `clearLocalStorage`, `resetLocalStorage`) + `getAllLocalStorage` + helper for safe JSON round-trip. ✅
2. **Wire into AppContent** — import and spread `localStorageFunctions` into `appContextValue`. ✅
3. **Extend the `<global>` tag** — add `storageKey` and `persist` optional attributes; hook up init-read and change-write logic in the global-variable implementation (in `components-core/state/`). ✅
4. **App-level `persistTheme` / `toneStorageKey` / `themeStorageKey` props** — synchronously resolve stored theme/tone in `AppWrapper` before `ThemeProvider` mounts. ✅
5. **Fix `filterGlobalVars`** — preserve `__storageKey_*` metadata keys that were incorrectly stripped. ✅
6. **Escape hatch** — `?xmlui-reset[=prefix]` URL parameter + `window.XMLUI_RESET_STORAGE` global + `window.XMLUI_GET_STORAGE` diagnostic + `getAllLocalStorage()` XMLUI global function. ✅
7. **Unit tests** — mock `localStorage` via `vi.stubGlobal`; cover: normal round-trip, parse error fallback, quota exceeded, security error, missing key, prefix clear. ✅ (22 tests)
8. **E2E smoke test** — standalone app that persists and restores values across page reloads. ✅ (file created)
9. **Documentation** — `website/content/docs/pages/local-persistence.md` guide page covering global functions, `storageKey`/`persist` attributes, `persistTheme` prop, schema versioning, and escape hatch. NavLink added between Refactoring and Build a HelloWorld Component. ✅
10. **Changeset** — `"xmlui": patch`. ⏳
