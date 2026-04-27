# Plan: CSS @layer Order Regression — Root-Cause Fix

**Date:** 2026-04-27  
**Status:** Proposal (follow-up to the mitigation merged in [PR #3333](https://github.com/xmlui-org/xmlui/pull/3333))

---

## Problem

After the Vite 8 / Rolldown upgrade ([changeset `upgrade-vite-8.md`](../../../.changeset/upgrade-vite-8.md)), the CSS `@layer` cascade was inverted in some builds. The `components` layer ended up ranked **lower** than `base`, so the CSS reset (`background-color: transparent` on `<button>`) won over component styles like `Button` solid-primary. PR #3333 mitigated this by **forcing the canonical layer order** via a small Vite plugin in [`xmlui/src/nodejs/bin/viteConfig.ts`](../../src/nodejs/bin/viteConfig.ts):

- Inject `<style>@layer reset, base, components, themes, dynamic;</style>` as the first child of `<head>` in every generated `index.html`.
- Prepend the same declaration to every emitted `.css` asset.

This works, but only because we declare the order before any chunk is parsed. The **actual cause** — extra per-module CSS chunks getting auto-loaded in the wrong order — was not addressed and is still present. The mitigation also does not protect every consumer of the lib build (UMD/ES consumers who don't use our HTML).

---

## Root Cause Analysis

### Symptom

In an `xmlui build` output, `index.html` contained a `<link>` to `metadata-helpers.<hash>.css` **before** the main `index.<hash>.css`. The browser walks `<link>` tags in order to compute layer order, so the first stylesheet to mention `@layer components { ... }` defines its position in the cascade. When `metadata-helpers.<hash>.css` was first, `components` got the lowest precedence among declared layers.

### Why does `metadata-helpers.css` even exist?

Tracing the import graph:

1. `metadata-helpers.ts` imports `defaultProps` from `ItemWithLabel.tsx` ([`xmlui/src/components/metadata-helpers.ts:10`](../../src/components/metadata-helpers.ts)) — only to read the literal value `defaultProps.labelBreak` at line 137.
2. `ItemWithLabel.tsx` is a full React component that imports `./FormItem.module.scss` ([`xmlui/src/components/FormItem/ItemWithLabel.tsx:6`](../../src/components/FormItem/ItemWithLabel.tsx)).
3. `FormItem.module.scss` opens with `@layer components { ... }` ([`xmlui/src/components/FormItem/FormItem.module.scss:29`](../../src/components/FormItem/FormItem.module.scss)).

So the side-effect chain is:

```
metadata-helpers.ts
  └─ ItemWithLabel.tsx (React component, JSX, hooks, classnames, Slot…)
       └─ FormItem.module.scss      ← `@layer components { ... }`
```

`metadata-helpers.ts` is intended to be metadata-only (it's loaded by the metadata-build entry and by every component that calls `createMetadata`/`d`/etc.). Pulling a React component — and through it a SCSS module that declares a layer — into the metadata graph is the original sin.

### Why does the SCSS become its own auto-loaded chunk?

`vite-plugin-lib-inject-css` is enabled in both [`xmlui/vite.config.ts:9`](../../vite.config.ts) (lib build) and [`xmlui/src/nodejs/bin/build-lib.ts:8`](../../src/nodejs/bin/build-lib.ts) (extension `xmlui build`). The plugin's job is to convert imported `.css`/`.scss` into JS that injects the CSS at runtime, so library consumers don't need a separate CSS import. With Vite 8 / Rolldown's chunking, **each module that imports CSS** can produce its own per-module `.css` asset and the plugin emits an injection sidecar for it. The order in which those sidecars get included in `index.html` is determined by chunk graph traversal, which is **not** stable with respect to `@layer` semantics. A module like `metadata-helpers` ends up with its own CSS chunk that contains *only* the `FormItem.module.scss` content, and that chunk can be linked first.

### Why the mitigation is fragile

Forcing the layer order at the top of `<head>` works for **the xmlui dev/build pipeline that produces our `index.html`**. It does **not** help:

- Library consumers using xmlui as an npm dependency (UMD/ES bundles) where there's no xmlui-controlled HTML — the prepend-to-CSS-asset half of the plugin partially covers this, but only if the consumer loads our `.css` files directly.
- Future modules that grow new accidental CSS dependencies — the mitigation will silently swallow any layer-order pollution, hiding regressions until someone notices another visual bug.

---

## Goal

Eliminate the unintended CSS chunks at their source and tighten the import graph so that:

1. **`metadata-helpers.ts` has zero React/SCSS dependencies.** Metadata code paths import only data, not components.
2. **No accidental React component → SCSS chain leaks into metadata-only or non-rendering code paths.** Add a guard so future regressions are caught at build time.
3. **The `cssLayerOrderPlugin` mitigation is retained as defence-in-depth**, but is no longer the only thing standing between us and a visual regression.

---

## Implementation Steps

### Step 1: Sever the metadata → React leak

`metadata-helpers.ts` only reads the literal value `defaultProps.labelBreak`. Two options:

**Option A — Inline the literal (simplest, recommended).** Replace the import with a direct constant. The default lives in the metadata layer where it's documented, and `ItemWithLabel.tsx` continues to own its runtime defaults.

```ts
// metadata-helpers.ts
// before
import { defaultProps } from "./FormItem/ItemWithLabel";
// …
defaultValue: defaultProps.labelBreak,

// after
// (no import)
defaultValue: true, // matches ItemWithLabel defaultProps.labelBreak
```

**Option B — Extract `defaultProps` into a leaf module.** Move the `defaultProps` constant from `ItemWithLabel.tsx` into a new `ItemWithLabel.defaults.ts` (no JSX, no SCSS imports). Both `ItemWithLabel.tsx` and `metadata-helpers.ts` import from the leaf module. This is more refactor but keeps the single-source-of-truth.

**Recommendation:** Option B. Single source of truth is worth the small refactor, and the same pattern can be applied if other `defaultProps` exports get pulled into metadata helpers later.

Files touched:

| File | Change |
|------|--------|
| `xmlui/src/components/FormItem/ItemWithLabel.defaults.ts` (new) | Holds the `defaultProps` constant and its type |
| `xmlui/src/components/FormItem/ItemWithLabel.tsx` | Re-exports `defaultProps` from the new file (or imports + re-exports for backward compat) |
| `xmlui/src/components/metadata-helpers.ts` | Imports `defaultProps` from `./FormItem/ItemWithLabel.defaults` |

### Step 2: Audit all of `metadata-helpers.ts` and the metadata build entry for similar leaks

Run a transitive-import probe on:
- [`xmlui/src/components/metadata-helpers.ts`](../../src/components/metadata-helpers.ts)
- [`xmlui/src/components/collectedComponentMetadata.ts`](../../src/components/collectedComponentMetadata.ts) (the metadata build entry)

For each, verify no transitive import reaches a `.module.scss` or a `.tsx` React component. The check can be a small Node script using `madge` or `oxc-resolver` to walk the import graph and flag any `.scss`/`.tsx` reachable from these entry points.

### Step 3: Add a build-time guard

Add a regression guard so future leaks fail CI. Two complementary forms:

1. **Static graph check.** A small script (`xmlui/scripts/check-metadata-purity.ts`) that resolves the transitive import graph from `metadata-helpers.ts` and `collectedComponentMetadata.ts` and asserts no `.module.scss` or `.tsx` is reachable. Wire it into `xmlui`'s `prebuild` or into a Turbo task that runs in CI.

2. **CSS-asset assertion in the build.** Extend `cssLayerOrderPlugin` (or add a sibling plugin) with a `generateBundle` hook that **fails the build** if more than one CSS asset is emitted for the lib entry, or if a CSS asset is emitted whose name corresponds to a metadata-only chunk. This catches the pollution at the chunk level, not just at the source level.

### Step 4: Re-evaluate `cssLayerOrderPlugin`

After Steps 1–3 land, run a clean `xmlui build` of the docs site and a few extension packages. Inspect the produced `index.html`:

- If the only CSS link is the entry CSS, the inline `@layer reset, base, components, themes, dynamic;` `<style>` is no longer load-bearing for HTML output, but is harmless and still useful as documentation/insurance.
- The CSS-asset prepend half remains valuable for library consumers who load our CSS directly.

**Decision:** keep both halves of the plugin as defence-in-depth, but downgrade their wording in the comment from "Without this guard the cascade is wrong" to "Defence-in-depth: ensures correct layer order even if a future change reintroduces multi-chunk CSS". The static graph check from Step 3 becomes the primary defence.

### Step 5: Investigate `vite-plugin-lib-inject-css` chunking options

Read [`vite-plugin-lib-inject-css`](https://www.npmjs.com/package/vite-plugin-lib-inject-css) v2.2.x docs/source to determine whether it exposes any options to:

- Force a single combined CSS asset per entry (e.g. by disabling per-module CSS code splitting in the lib build).
- Control the order in which CSS sidecars are injected.

If a configuration switch exists that makes the plugin emit one CSS chunk per entry instead of per module, prefer that over the static graph check — it eliminates the *category* of bug rather than the specific instance. If no such switch exists, file an upstream issue documenting the layer-order interaction and stick with the source-graph guard from Step 3.

This step is research-only and may produce no code change; the source-graph guard stands on its own.

---

## Files Affected

| File | Change |
|------|--------|
| `xmlui/src/components/FormItem/ItemWithLabel.defaults.ts` | **New** — `defaultProps` constant |
| `xmlui/src/components/FormItem/ItemWithLabel.tsx` | Import `defaultProps` from `.defaults` (and re-export if desired) |
| `xmlui/src/components/metadata-helpers.ts` | Import `defaultProps` from `./FormItem/ItemWithLabel.defaults` |
| `xmlui/scripts/check-metadata-purity.ts` | **New** — graph guard |
| `xmlui/package.json` | Wire the guard into a script (`prebuild` or a dedicated `check:metadata-purity`) |
| `turbo.json` | Add the guard to the lib-build task's `dependsOn` if appropriate |
| `xmlui/src/nodejs/bin/viteConfig.ts` | Update the `cssLayerOrderPlugin` comment to reflect its defence-in-depth role; optionally add the chunk-count assertion from Step 3 |

---

## Tests / Verification

1. **Manual:** run `xmlui build` of the docs site, inspect the produced `dist/index.html`. There should be exactly one stylesheet link (`index.<hash>.css`). No `metadata-helpers.<hash>.css` or similar per-module sidecar.
2. **Automated:** the new `check-metadata-purity.ts` script returns non-zero if any `.module.scss` or `.tsx` is reachable from the metadata entries. Run it manually before merging and add it to the Turbo task graph.
3. **Visual regression sanity check:** spin up a Button (`variant="solid"`, `themeColor="primary"`) — it should render with the configured solid background, not transparent. This was the canary symptom of the inverted cascade.
4. **CI signal:** the Playwright suite includes Button rendering tests. Running them against a build that strips the `cssLayerOrderPlugin` (in a temporary branch) should still pass once Step 1 is in place — proving the leak is the actual cause and not an artefact of the mitigation.

---

## Open Questions

1. Are there other `metadata-helpers`-style modules in extension packages (`packages/xmlui-*`) that pull React components into metadata graphs? If yes, the same fix and the same guard should be replicated per package — possibly as a shared utility from the `xmlui` package.
2. Does Vite 9 (when it lands) change the per-module CSS chunking behaviour in a way that makes either the source-graph guard or the prepend mitigation obsolete? Track this when bumping Vite.
