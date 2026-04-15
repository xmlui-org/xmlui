# CSS Styles Lost When Using xmlui v0.12.17 from npm Package

## Summary

When consuming xmlui v0.12.17 via `npx create-xmlui-app@latest` (i.e., from the published npm package), CSS styles are missing. Using `npm link xmlui` to the same v0.12.17 source code works correctly. v0.12.15 works correctly in both modes.

## Root Cause

Two issues combine to cause this:

### 1. `vite-plugin-lib-inject-css` v1.3.0 has a known bug with multi-entry builds

**This is the primary cause.**

In v0.12.17, a second entry point (`compiled-runtime`) was added to the lib build in `vite.config.ts` (commit `ee3e7e15`, PR #3217):

```js
// vite.config.ts — lib mode entries
entry: {
  xmlui: path.resolve("src", "index.ts"),
  "compiled-runtime": path.resolve("src", "index-compiled-runtime.ts"),  // ← new
  ...
}
```

This causes Rollup to create a **shared chunk** (`AppRoot-CkAW1HHI.js`) for code used by both entries. CSS is split across multiple files:

| Version | Entry file | Shared chunk | CSS files |
|---------|-----------|--------------|-----------|
| v0.12.15 | `xmlui.js` (2.6 KB, no CSS import) | `index-*.js` (2.9 MB) → `import "./index.css"` | `index.css` (507 KB) — single file |
| v0.12.17 | `xmlui.js` (76 KB) → `import "./xmlui.css"` | `AppRoot-*.js` (2.8 MB) → `import "./AppRoot.css"` | `xmlui.css` (2.4 KB) + `AppRoot.css` (508 KB) — split across two files |

The installed `vite-plugin-lib-inject-css@1.3.0` uses the `renderChunk` Rollup hook to inject CSS `import` statements. However, Vite's internal `cssPostPlugin` reorganizes CSS metadata in the later `generateBundle` hook. When multiple entries share CSS, this causes CSS injection to occur **before** Vite has finalized which CSS belongs to which chunk.

This is a **known bug** documented in [emosheeep/vite-plugin-lib-inject-css#18](https://github.com/emosheeep/vite-plugin-lib-inject-css/issues/18), fixed in **v2.0.1** by moving CSS injection from `renderChunk` to `generateBundle` ([PR #19](https://github.com/emosheeep/vite-plugin-lib-inject-css/pull/19)).

**Current version**: `1.3.0` (released before the fix)
**Fixed in**: `2.0.1`
**Latest**: `2.2.2`

### 2. `"sideEffects": false` is incorrect for a package with CSS

The `package.json` declares `"sideEffects": false`, which tells bundlers that all modules in the package can be tree-shaken if their exports aren't consumed. CSS `import` statements are side-effect-only imports (no named exports) — bundlers will drop them.

This was always a latent issue but was not triggered in v0.12.15 because the single-entry build structure kept CSS bundled with the main chunk. With the multi-entry split, the interaction between `sideEffects: false` and how the consumer's Vite/Rollup resolves CSS imports becomes problematic.

The `vite-plugin-lib-inject-css` documentation [explicitly recommends](https://www.npmjs.com/package/vite-plugin-lib-inject-css#recipes-of-creating-component-library) setting:

```json
"sideEffects": ["**/*.css"]
```

This preserves JS tree-shaking while protecting CSS from being removed.

## Why `npm link` Works

When using `npm link xmlui`, the consumer app resolves `xmlui` via the **development** `exports` field:
```json
"exports": { ".": "./src/index.ts" }
```

Vite processes the **source TypeScript and SCSS modules directly** — the pre-built `dist/lib/` files are never used. SCSS modules are compiled by Vite's pipeline, CSS is injected via HMR, and everything works.

When using the **published npm package**, `clean-package` replaces the exports for publishing:
```json
"exports": { ".": { "import": "./dist/lib/xmlui.js" } }
```

The consumer gets **pre-built JS with pre-extracted CSS** from `dist/lib/`. The CSS is loaded via `import "./file.css"` statements injected by `vite-plugin-lib-inject-css`. This is where the bug manifests.

## Version Timeline

| Version | `compiled-runtime` entry | `vite-plugin-lib-inject-css` | CSS behavior |
|---------|--------------------------|------------------------------|-------------|
| v0.12.15 (commit `05d15e8`) | No (single entry) | v1.3.0 | ✅ Works — single chunk, single CSS file |
| v0.12.16 (commit `6ad7d69`) | No (single entry) | v1.3.0 | ✅ Should work — same structure as v0.12.15 |
| v0.12.17 (commit `ed3d782`) | **Yes** (multi-entry) | v1.3.0 | ❌ Broken — CSS split across files, plugin bug triggered |

The triggering commit is `ee3e7e15` ("Prepare xmlui for a better compiler", PR #3217), which added the `compiled-runtime` entry point between v0.12.16 and v0.12.17.

## Recommended Fixes

### Fix 1 (Primary): Upgrade `vite-plugin-lib-inject-css` to v2.x

In `xmlui/package.json`, change:
```diff
-    "vite-plugin-lib-inject-css": "1.3.0",
+    "vite-plugin-lib-inject-css": "2.2.2",
```

The v2.x API is backward-compatible (`libInjectCss` named export, same usage). The key change is that CSS injection now happens in `generateBundle` after Vite has finalized CSS metadata for shared chunks.

### Fix 2 (Secondary): Fix `sideEffects` to preserve CSS

In `xmlui/package.json`, change:
```diff
-  "sideEffects": false,
+  "sideEffects": ["**/*.css"],
```

This tells bundlers that CSS files have side effects and must not be tree-shaken, while still allowing JS modules to be tree-shaken. This is the standard practice for packages that ship CSS and is recommended by the `vite-plugin-lib-inject-css` documentation.

**Important**: The `clean-package` configuration does NOT modify `sideEffects`, so this change will be preserved in the published package.

### Fix 3 (Alternative): Build `compiled-runtime` separately

If the above fixes aren't sufficient, the `compiled-runtime` entry can be built as a separate Vite invocation to avoid triggering multi-entry code splitting in the main lib build:

1. Remove `"compiled-runtime"` from the `lib.entry` object in lib mode
2. Add a separate `build:compiled-runtime` script that builds only that entry
3. This preserves the single-entry, single-chunk, single-CSS structure for the main build

This is a fallback approach; Fixes 1 and 2 should resolve the issue without needing to change the build architecture.

## How to Verify the Fix

1. Apply Fix 1 (and optionally Fix 2) 
2. Run `npm run build:xmlui` from the xmlui workspace
3. Inspect `dist/lib/` — verify CSS imports are present in all chunks:
   - `xmlui.js` should contain `import "./xmlui.css"`
   - The shared chunk should contain `import "./AppRoot.css"` (or equivalent)
4. Create a test app with `npx create-xmlui-app` using the fixed package
5. Run both `xmlui start` (dev) and `xmlui build` (prod) and verify styles load correctly
