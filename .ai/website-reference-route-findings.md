# Website Reference Route Findings

Date: 2026-06-27

## Scope

This note records the first focused component and extension reference routes
for Step 8 of the website migration. The goal was to expose copied navigation
metadata as visible website pages before restoring the full generated docs
reference renderer.

## Source of Truth

- Old website app/routes: `/Users/dotneteer/source/xmlui/website/src/Main.xmlui`
- Copied component nav metadata: `website/navSections/components.json`
- Copied extension nav metadata: `website/navSections/extensions.json`
- Current config bridge: `website/src/config.ts`
- Current routes: `website/src/Main.xmlui`

## Implemented Slice

- Added top-level shell navigation links for component and extension reference
  routes.
- Added `/docs/reference/components` to render copied component nav metadata
  from `$appGlobals.navSections.components`.
- Added `/docs/reference/components/Button` as a focused component detail route
  with a visible counter update.
- Added `/docs/reference/extensions` to render copied extension nav metadata
  from `$appGlobals.navSections.extensions`.
- Added `/docs/reference/extensions/xmlui-gauge/Gauge` as a focused extension
  detail route with a real Gauge component and `id`/`setValue`/`value` update.

## Verification

- `npm --workspace xmlui-website run test:e2e`: passing with 5 tests.
- The reference E2E verifies:
  - component index renders copied entries including `Button` and `Text`;
  - component detail route increments `Reference counter`;
  - extension index renders copied packages including `Xmlui Gauge` and
    `Xmlui Website Blocks`;
  - Gauge detail route mounts `smart-gauge` and updates visible text from
    `Reference gauge value: 25` to `Reference gauge value: 55`.

## Compatibility Gaps

- These routes are focused display routes, not the full old generated
  reference pages.
- Component and extension detail pages still need generated metadata/doc
  content rendering.
- The old docs reference route shape should eventually route arbitrary
  component and extension entries, rather than only the focused Button and
  Gauge smoke pages.
