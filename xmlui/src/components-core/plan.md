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

All functions silently catch any `QuotaExceededError` / `SecurityError` (private browsing, disabled storage) and degrade gracefully (reads return `fallback`; writes/deletes become no-ops).

### Implementation note

Use lodash `get` / `set` / `unset` for subpath traversal; these are already a transitive dependency of the repo. A helper `splitStorageKey(key): [rootKey: string, subPath: string | undefined]` splits on the first dot.

---

## 2 · Reactive Storage Binding via the `<global>` Tag

The `<global>` tag already accepts `name` and `value`. Add an optional **`storageKey`** attribute to it.  
The name `storageKey` (rather than `localStorageKey`) is intentionally provider-agnostic — future providers (sessionStorage, IndexedDB, remote KV) can plug in without renaming the attribute.

```xmlui
<!-- Persist the whole variable -->
<global name="tone" value="light" storageKey="myApp.v1.tone" />

<!-- Persist only a subfield — variable holds just the name string,
     but it is stored/loaded as prefs.userName inside the "prefs" entry -->
<global name="userName" value="" storageKey="myApp.v1.prefs.userName" />
```

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

## 4 · Implementation Steps

1. **Create `appContext/local-storage-functions.ts`** — implement the four functions + helper for safe JSON round-trip.
2. **Wire into AppContent** — import and spread `localStorageFunctions` into `appContextValue`.
3. **Extend the `<global>` tag** — add `storageKey` as an optional attribute; hook up init-read and change-write logic in the global-variable implementation (in `components-core/state/`).
4. **Unit tests** — mock `localStorage` via `vi.stubGlobal`; cover: normal round-trip, parse error fallback, quota exceeded, security error, missing key, prefix clear.
5. **E2E smoke test** — standalone app that persists and restores a theme-tone toggle across page reloads.
6. **Documentation** — add a guide page and reference entries for the four global functions and the `storageKey` attribute.
7. **Changeset** — `"xmlui": patch`, description: "Add local storage persistence (global functions + reactive binding)".
