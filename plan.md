# Islands POC — Review & Test Fix Plan

## Executive Summary

The islands branch introduces XMLUI "islands" — the ability to inject standalone XMLUI
apps into arbitrary web pages using `<div data-xmlui-src="...">` markers. The approach
uses Shadow DOM isolation (via `NestedApp`) to prevent host/guest style conflicts.

Two hypotheses need validation:
1. **Injecting XMLUI will not break host page styling.**
2. **Injecting XMLUI will not break the XMLUI app's own styling.**

Eight E2E tests related to inline styles and layout properties are failing.

---

## Root Cause of the Failing Tests

All 8 failing tests share a single root cause: **the addition of
`"textColor": "$textColor-primary"` in `root.ts`** (line 160).

### Mechanism

| Step | Detail |
|------|--------|
| 1 | `root.ts` now defines `"textColor": "$textColor-primary"` in `RootThemeDefinition.themeVars` |
| 2 | The theme engine resolves the inheritance chain: `textColor → textColor-Heading → textColor-H3` |
| 3 | This causes `--xmlui-textColor-H3` (and similar vars) to resolve to `hsl(204, 30.3%, 13%)` |
| 4 | Previously `--xmlui-textColor-H3` was **undefined** (var chain dead-ended), so headings inherited `color` from parent elements |
| 5 | Now the H3's explicit `color: var(--xmlui-textColor-H3)` resolves to a valid color, overriding the inherited `color: white` from Stack's `color` prop |

### Evidence

Verified by comparing CSS variable state between branches:

- **main**: `getComputedStyle(html).getPropertyValue("--xmlui-textColor-H3")` → `""` (empty)
- **branch**: same query → `"hsl(204, 30.3%, 13%)"`

The `root.ts` change also makes the root Theme's compiled CSS class contain all theme
variables (hash changes from `css-7edes` to `css-305uk7`).

### The test failures are NOT caused by:

- The `baseStyles` injection in `RootClasses` (the `<style id="xmlui-base-styles">` tag)
- The removal of `import "../index.scss"` from `StandaloneApp.tsx`
- The `cssInjectedByJsPlugin` or `window.__XMLUI_STYLES__` mechanism
- The Shadow DOM changes in `NestedAppReact.tsx`

---

## Review of the Branch Changes

### 1. `root.ts` — `"textColor": "$textColor-primary"` (BREAKING)

**Impact**: High — changes theme variable resolution globally.

**Issue**: This is a **semantic change** to the theme system. Before this line,
`textColor` was intentionally undefined at the root level, making heading components
inherit `color` from parent layout when no explicit theme override existed. After this
change, all headings explicitly resolve to the theme's text color, ignoring parent
layout `color` props.

**Recommendation**: **Revert this line.** If the islands POC needs explicit text color
for some reason, scope it to the island context only (e.g., via a theme override
inside `NestedApp`).

### 2. `ThemeReact.tsx` — `baseStyles` injection in `RootClasses` (LOW RISK)

**Changes**:
- `import baseStyles from "../../index.scss?inline"` — loads base CSS as a string
- `RootClasses` prepends `<style id="xmlui-base-styles">` to the injection target
- Shadow DOM branch: syncs Vite dev styles via MutationObserver
- Production: injects `window.__XMLUI_STYLES__` via event listener

**Assessment for Hypothesis 1** (host page safety):
- In island mode, `target` is `domRoot.getRootNode()` (the shadow root's host element).
  **Bug**: `getRootNode()` on a ShadowRoot returns the ShadowRoot itself, not the host.
  The cast to `HTMLElement` is wrong — it should be the ShadowRoot. The `prepend`,
  `querySelector`, and `appendChild` calls work on ShadowRoot but the type is incorrect.
  This is only a TypeScript issue; runtime behavior is correct because ShadowRoot
  supports these methods.
- **Risk**: The base styles (`index.scss`) include selectors like `html, body { height: 100% }`,
  `* { box-sizing: border-box }`, `*:focus-visible { outline: ... }`. When injected into
  `document.head` (non-island path), these **will** affect the host page. For the island
  path (shadow root), styles are scoped and won't leak. **However, in the test environment
  (non-island), the base styles are injected into `document.head`, which is also the Vite
  test page's head — this is harmless because the test page is xmlui-owned.**
- For a real-world host page injection, `startIslands` renders `StandaloneApp` directly
  into the host DOM element, which then creates a `NestedApp` with Shadow DOM. The
  `RootClasses` component inside the shadow DOM targets the shadow root, not `document.head`.
  **This is correct for style isolation.**

**Assessment for Hypothesis 2** (XMLUI app safety):
- The `baseStyles` prepend ensures the `@layer` declaration is always first. This is
  correct and necessary. Without it, component styles loaded before the layer declaration
  would end up in an implicit layer with different precedence.
- The `window.__XMLUI_STYLES__` mechanism collects CSS from `cssInjectedByJsPlugin` and
  injects it into the correct target (shadow root for islands, document.head for normal).
  **This is the correct approach for production builds where CSS modules are bundled
  into JS.**

**Remaining risk**: The `applyRegistryStyles` event listener (`xmlui-styles-loaded`) is
never removed if the `insideShadowRoot` early-return branch is taken (in dev mode). The
cleanup function only runs for the non-shadow-root path. Minor leak.

### 3. `StandaloneApp.tsx` — Removed `import "../index.scss"` (MODERATE RISK)

**Impact**: The Vite side-effect CSS injection of base styles no longer happens from
`StandaloneApp.tsx`. This is replaced by the `RootClasses` prepend mechanism.

**Risk**: In the normal (non-island) standalone mode, if `RootClasses` doesn't mount
(e.g., an error prevents the Theme component from rendering), there will be **no base
styles at all**. Previously, the side-effect import guaranteed base styles were always
present. In the Vite-built mode, the styles are now in `window.__XMLUI_STYLES__`
(from `cssInjectedByJsPlugin`), which `RootClasses` also handles.

**Risk for test environment**: `TestBed.tsx` still has `import "xmlui/index.scss"`,
so tests still get base styles via Vite. No test impact from this removal.

**Recommendation**: Consider keeping the side-effect import as a fallback for
non-island deployments. It's harmless redundancy.

### 4. `AppRoot.tsx` — Conditional Theme wrapping (LOW RISK)

The change handles two new cases:
- `asIsland=true` → wraps in `NestedApp` instead of `Theme`
- Entry node is already a `Theme` → sets `root: true` on it instead of double-wrapping

**Risk**: The `if (node.type !== "Theme")` check is fragile — it relies on the
parsed component type string. If a custom component happens to be named "Theme",
it would incorrectly skip wrapping. Low probability.

### 5. `NestedAppReact.tsx` — Shadow DOM style adoption removed (HIGH RISK)

**Changes**:
- The `adoptedStyleSheets` logic is entirely commented out
- The `@layer` style tag injection is commented out
- `asIsland` mode bypasses the normal NestedApp UI and returns a bare `<div ref={rootRef}>`

**Impact for islands**: The Shadow DOM now relies entirely on `RootClasses` to inject
styles. The old `adoptedStyleSheets` approach cloned all document stylesheets into the
shadow root. The new approach uses `RootClasses` to inject base styles + module styles.

**Risk**: If any component's CSS module styles are NOT captured by `window.__XMLUI_STYLES__`
(e.g., they're loaded after the event fires), those styles will be missing inside the
shadow root.

### 6. `NestedApp.module.scss` — `transform: scale(1)` commented out

**Purpose**: The `transform: scale(1)` hack created a new stacking context so `position: fixed`
elements inside the shadow root would be relative to the shadow root, not the viewport.

**Risk**: With this removed, modals and other `position: fixed` elements inside an island
will position relative to the viewport, which may be desirable for some use cases but
breaks the "self-contained island" concept.

### 7. `ModalDialog.module.scss` — `position: absolute` → `position: fixed` for nested

**Risk**: This changes modal positioning inside nested apps. Combined with the
`transform: scale(1)` removal, nested modals will now be viewport-relative.

### 8. Vite config — `cssInjectedByJsPlugin` replaces `libInjectCss`

**Purpose**: Collects all CSS into `window.__XMLUI_STYLES__` instead of injecting
`<style>` tags directly. This allows `RootClasses` to inject them into the correct
target (shadow root or document.head).

**Risk**: This is a **global change** affecting the lib build, not just islands.
The `libInjectCss()` plugin was responsible for injecting CSS in the library build mode.
Replacing it with `cssInjectedByJsPlugin` changes how CSS is delivered for ALL consumers
of the xmlui package, not just islands.

---

## Fix Plan

### Phase 1: Revert the theme change (fixes all 8 tests)

1. **Revert the `root.ts` change**: Remove `"textColor": "$textColor-primary"` from
   `RootThemeDefinition.themeVars`. This is the single change that causes all test failures.
   If text color definition is needed for islands, add it in a scoped way.

2. **Run all 8 failing tests** to confirm they pass.

### Phase 2: Fix code issues in the RISK section

3. **Fix the `getRootNode()` type cast**: Change
   `domRoot.getRootNode() as HTMLElement` to `domRoot` directly when `insideShadowRoot`
   is true. The `target` variable should be typed as `HTMLElement | ShadowRoot`.

4. **Fix the cleanup leak**: When the `insideShadowRoot && import.meta.env.DEV` branch
   returns early, the `xmlui-styles-loaded` event listener is never cleaned up because
   it's registered AFTER the early return. Move the event listener registration and
   cleanup to run regardless of branch.

5. **Scope the `cssInjectedByJsPlugin` change**: The replacement of `libInjectCss` with
   `cssInjectedByJsPlugin` in `vite.config.ts` should ONLY apply when building for
   `standalone` or `islands` mode, not for the `lib` build. Currently it affects all
   build modes.

### Phase 3: Validate hypotheses — COMPLETED

6. **Hypothesis 1** (host page safety): **VALID.** The Shadow DOM isolation in
   `NestedApp` correctly prevents XMLUI styles from leaking to the host. The
   `RootClasses` component correctly targets the shadow root when `insideShadowRoot`
   is true.

   **Caveat RESOLVED**: `startIslands` now creates the shadow DOM eagerly on the host
   element *before* creating the React root. The React tree renders directly inside
   the shadow root, and a `StyleInjectionTargetContext.Provider` wraps `StandaloneApp`
   with the shadow root as the injection target. This guarantees that ALL styles — even
   from the outer provider tree — target the shadow root from the very first render.

   Verified: the outer tree (`AppRoot → StyleProvider → AppWrapper → ThemeProvider →
   rendering pipeline → NestedApp`) contains zero `useStyles` calls today.
   `ComponentWrapper`, `AppWrapper`, `ThemeProvider`, `DebugViewProvider`, and
   `ComponentProvider` are all style-free. The eager shadow DOM is defense-in-depth
   against future changes.

   NestedApp still creates a nested shadow DOM inside the outer one for its inner
   React root. Nested shadow DOM is valid and the inner tree is fully self-contained
   with its own `StyleProvider` and `StyleInjectionTargetContext`.

7. **Hypothesis 2** (XMLUI app safety): **VALID.** The base styles and module styles
   are correctly injected into the shadow root via `RootClasses`. The `@layer` ordering
   is preserved by the prepend.

   **Caveat RESOLVED**: The deduplication concern was unfounded — `applyRegistryStyles`
   uses `textContent =` (full replacement), not append. Each invocation sets the style
   tag's content to the complete accumulated `window.__XMLUI_STYLES__` string, so no
   CSS is ever lost or duplicated.

   For the lazy-loading timing concern: a defensive second `applyRegistryStyles()` call
   was added immediately after `addEventListener` registration in `RootClasses`. This
   closes the theoretical micro-gap where a chunk could dispatch `xmlui-styles-loaded`
   between the initial apply and the listener registration.

   In practice, the standalone/islands UMD is a single bundle — all CSS is accumulated
   in `window.__XMLUI_STYLES__` during synchronous script evaluation, before React
   renders. The `applyRegistryStyles()` call on mount always finds the complete CSS.
   The event listener + defensive re-apply handle any future code-splitting scenario.

### Phase 4: Clean up

8. Remove commented-out code in `NestedAppReact.tsx` (the old `adoptedStyleSheets` logic).

9. Add a comment explaining why `import "../index.scss"` was removed from
   `StandaloneApp.tsx` and how the replacement works.

10. Ensure `startIslands` cleans up properly when unmounting (currently no cleanup
    is returned from `startIslands`).

---

## Test Matrix After Fixes

After Phase 1 (reverting `root.ts`), all 8 tests should pass:

| Test | Expected outcome |
|------|-----------------|
| applies dimension and non-dimension properties with 'all' | Pass |
| Stack applies background and text colors when inline styles are enabled | Pass |
| Stack with appGlobals.disableInlineStyle=false preserves inline styles | Pass |
| multiple Stack components with different colors respect disableInlineStyle | Pass |
| Theme with disableInlineStyle=false preserves inline styles within its scope | Pass |
| Theme disableInlineStyle property overrides appGlobals setting | Pass |
| nested Themes with different disableInlineStyle settings | Pass |
| multiple Themes with different settings affect their respective scopes | Pass |

Run with `--workers=10` to verify no race conditions.
