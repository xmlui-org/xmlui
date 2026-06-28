# Icon Source-Preserving Migration Findings

Date: 2026-06-28

## Source of Truth

- Old source: `/Users/dotneteer/source/xmlui/xmlui/src/components/Icon`
- Old support files copied: `IconProvider.tsx`, `IconRegistryContext.tsx`,
  `icons-abstractions.ts`
- Protected files restored with import/type shims: `IconReact.tsx`,
  `Icon.module.scss`, icon helper TSX files, icon helper SCSS modules, and SVG
  assets.

## Adapter and Infrastructure Changes

- `Icon.tsx` remains the rewrite metadata/renderer boundary and exports
  `ThemedIcon` for dependent components such as Button.
- Added shared compatibility shims for old imports:
  `components-core/theming/ThemeContext`,
  `parsers/style-parser/StyleParser`, and `components-core/utils/hooks`.
- Added `svgReactPlugin` to support old `*.svg?react` imports. The plugin is
  wired into app Vite configs and CLI build/start/preview/SSG/build-lib paths.
- `XmluiRoot` now wraps apps in `IconProvider` and derives icon resources from
  injected `appGlobals.resources`.
- The testbed now passes `options.resources` through session storage and resets
  root font-size between payloads.
- `IconDriver.svgIcon` supports both source-preserved root-SVG icons and
  wrapper-with-SVG icon shapes.

## Findings

- Icon is a shared prerequisite, not a simple visual leaf. Button migration can
  now depend on the old Icon provider/registry behavior instead of introducing
  Button-local icon logic.
- The old source assumes the bundler can turn SVG assets into React components
  with `?react`; without that shared contract, React tries to render data URLs
  as tag names.
- Testbed state can leak browser-level mutations between reused payloads. Icon
  exposed this through a root `font-size` mutation that affected later `rem`
  sizing assertions.
- The rewrite App content layout blockifies direct flex children. A neutral
  renderer-boundary span keeps the preserved IconReact inline-block wrapper
  behavior observable to the unchanged E2E suite.
- The renderer-boundary span must not render for unresolved icons. A visual
  check with an unresolved icon before a fallback icon exposed an extra HStack
  gap. The boundary now checks the old icon registry/resource/fallback path
  first and returns `null` when the preserved `IconReact` would not render.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Icon/Icon.spec.ts`
  passed 44/44 unchanged.
- Manual regression probe for the reported HStack markup rendered five icons
  (`message`, `note`, `cog`, `start`, `trash`) with no placeholder child for the
  unresolved icon.
- `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts --workers=1`
  passed 162/162, verifying the three migrated components side by side.

## Residual Risk

- Full global `npm --workspace xmlui run test:e2e` was not rerun for Icon; the
  global baseline was already known-red from broader theme/variant/border
  infrastructure failures observed during ProgressBar closure.
