# Component Remigration Wave Findings - 2026-07-02

## Scope

This note summarizes the ProgressBar, Button, Icon, and shared host-runtime
findings that should make the next strict component migrations faster.

## Durable Patterns

- Keep protected component files byte-identical to the original wherever
  possible. Append rewrite adapter code in the component entry file only when
  needed, and keep host/runtime fixes outside copied React, SCSS, docs,
  defaults, and copied `.spec.ts` files.
- Run `node xmlui/scripts/verify-protected-component-copy.mjs <Component>` for
  migrated components before treating copied files as trustworthy.
- Component metadata should stay in the component entry file. Do not recreate
  sidecar `<Component>.metadata.ts` or `<Component>.renderer.tsx` files for
  strict migrations.
- When copied old E2E tests need new coverage, add a separate compat spec such
  as `<Component>.compat.spec.ts`; do not edit copied test cases except import
  and export adaptation.

## Host Compatibility Lessons

- Theme variables should flow through generated CSS classes, not broad inline
  style maps. `XmluiThemeRoot` applies the implicit root class to `html`, and
  scoped `ThemeScope` emits generated CSS rules.
- Scoped `Theme` wrappers must be layout-transparent. The original
  `.themeWrapper` uses `display: contents`; the rewrite now emits the same
  behavior through the generated Theme class so parent stacks still lay out
  themed children directly.
- Original component SCSS often relies on theme variable aliases and fallback
  resolution. Prefer fixing the theme resolver and default variable map over
  changing copied component styles.
- Text exposed two important theme-runtime compatibility rules:
  - Original XMLUI generates Text-specific font-size aliases such as
    `fontSize-Text-subheading`, `fontSize-Text-tableheading`, `fontSize-Text-small`,
    and related variants from `fontSize-Text`. Without these generated aliases,
    copied Text SCSS falls back through unrelated metadata defaults and variants
    such as `subheading` and `tableheading` render too large.
  - Variant theme aliasing must not replace a base variable with a value that
    references that same base variable. For example,
    `--xmlui-fontSize-Text: calc(var(--xmlui-fontSize-Text) * 0.625)` is
    self-referential, so browsers drop the custom property and Text falls back
    to `16px`. Keep the base `--xmlui-fontSize-Text` stable and let
    `--xmlui-fontSize-Text-subheading` derive from it.
- Text's `value` prop preserves original multiline indentation semantics by
  converting indentation after newlines to a normal leading space plus NBSPs.
  This matters when `preserveLinebreaks="false"`: the DOM text is not simply
  collapsed plain spaces in the original runtime.
- Custom Text variants rely on the old `useComponentStyle` contract. The rewrite
  shim must inject a generated CSS class for arbitrary style objects; a no-op
  shim makes `<Text variant="brandTitle">` ignore Theme-supplied
  `*-Text-brandTitle` variables even when built-in variants work.
- App-level global functions should be recognized through
  `xmlui/src/abstractions/AppContextDefs.ts` and
  `isAppContextObjectProperty`, so adding a future global requires one contract
  update instead of compiler one-off exceptions.

## Icon and Asset Lessons

- Use the original Icon provider and registry pattern. The temporary icon map
  was not compatible enough for Button and other components.
- The original icon set includes helper TSX files, module SCSS, SVG assets, and
  `*.svg?react` imports. The rewrite uses `svgReactPlugin` across dev,
  production, standalone, SSG, CLI, build-lib, and sample Vite paths so those
  imports work without editing copied icon files.
- Legacy shims currently bridge old imports for `ThemeContext`,
  `useIsomorphicLayoutEffect`, and `toCssVar`. Future components may reveal
  more old-core import surfaces; add shims carefully rather than modifying
  copied component source.

## E2E Lessons

- Use focused commands with `XMLUI_REUSE_EXISTING_SERVER=0` when a manual
  sample server might occupy `127.0.0.1:5173`.
- The shared E2E fixture now parks the mouse away from the top-left origin and
  resets root font size between tests. Both changes protect copied old suites
  from hover leakage and shared-page state leakage.
- Manual sample markup is useful for user-visible repros, but component
  migration status should be based on protected-file audit, metadata check, and
  focused copied E2E suites.

## Current Completed Components

- ProgressBar: Complete.
- Button: Complete.
- Icon: Complete.
- Text: Complete.
