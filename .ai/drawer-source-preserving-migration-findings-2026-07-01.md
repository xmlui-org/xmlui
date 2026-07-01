# Drawer source-preserving migration findings - 2026-07-01

## Compatibility source

- Original implementation: `/Users/dotneteer/source/xmlui/xmlui/src/components/Drawer/Drawer.tsx`.
- Original React source: `/Users/dotneteer/source/xmlui/xmlui/src/components/Drawer/DrawerReact.tsx`.
- Original support files: `Drawer.defaults.ts`, `Drawer.module.scss`, `Drawer.md`, and the old Drawer spec.
- Current rewrite suite: `xmlui/src/components/Drawer/Drawer.spec.ts`.

## Behavior preserved

- Drawer now uses the original Radix Dialog based structure instead of the former simplified inline dialog. This restores Radix focus handling, dialog semantics, portal presence, `data-state` animation states, dismiss-on-outside behavior, Escape handling, and the accessible close button path.
- The stylesheet has been restored to the original slide/fade animation model, backdrop and panel z-index split, side-specific panel placement, header/body spacing, body scroll behavior, screen-reader-only title, and close-button clearance logic.
- The renderer preserves the rewrite boundary contracts: `rootAttrs()` still flow to the dialog panel, `backgroundColor` remains an explicit prop override, `headerTemplate` is rendered through the template bridge, and public `open`, `close`, and `isOpen` APIs are registered through the adapter.
- The rewrite runtime does not yet expose the original `theme.root` portal host. Drawer uses `theme.root` when it exists and falls back to `document.body`, while applying the XMLUI theme class and Drawer CSS custom properties to the generated portal host so portalled backdrop and panel inherit Drawer theme variables. This matters for the default `backgroundColor-backdrop-Drawer`; without copying the custom properties, the backdrop element exists but computes as transparent in the rewrite.
- The original implementation depends on `@radix-ui/react-dialog`; the rewrite package now declares that runtime dependency.
- The copied stylesheet keeps the original padding side variables and adds the rewrite-compatible broad `padding-Drawer` fallback cascade, so old source spacing and current theme-variable tests both work.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passes.
- `npm --workspace xmlui run test:e2e -- src/components/Drawer/Drawer.spec.ts -g "hasBackdrop=true shows backdrop overlay" --workers=1` passes and asserts the default backdrop color computes to `rgba(0, 0, 0, 0.4)`.
- `npm --workspace xmlui run test:e2e -- src/components/Drawer/Drawer.spec.ts --workers=1` passes 31/31.
- `npm --workspace xmlui run test:e2e -- src/components/Drawer/Drawer.foundation.spec.ts --workers=1` passes 3/3 after moving the fixture state variable to the fragment scope used by the testbed.
- `npm --prefix xmlui run check:metadata` passes.
- `npm --workspace xmlui run compatibility:css-module-import-audit` passes with Drawer in the direct-import group and no manual-review entries.

## Residual risk

- Child components portalled from inside Drawer currently use the rewrite's existing portal behavior rather than an overridden per-drawer theme root. The Drawer creates the old-style child portal stacking container, but the runtime lacks a public theme-root override hook equivalent to the original `ThemeContext.Provider` path.
