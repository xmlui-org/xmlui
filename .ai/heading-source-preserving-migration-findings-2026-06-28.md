# Heading Source-Preserving Migration Findings - 2026-06-28

## Source Preserved

- Copied old `/Users/dotneteer/source/xmlui/xmlui/src/components/Heading/HeadingReact.tsx`.
- Copied old `/Users/dotneteer/source/xmlui/xmlui/src/components/Heading/Heading.module.scss`.
- `Heading.defaults.ts` and `abstractions.ts` already matched the old source shape.

## Adapter And Shim Work

- Replaced old external `@radix-ui/react-compose-refs` and `classnames` imports in
  the copied React file with local compatibility helpers.
- Added `components-core/AppContext` shim so old `useAppContext()` resolves to
  the rewrite app context and can expose app globals.
- Added minimal `components-core/TableOfContentsContext` compatibility surface so
  copied Heading can register with the old TOC contract when a compatible provider
  exists. Future `TableOfContents` migration should complete this surface.
- Updated `Heading.tsx` renderer bridge:
  - normalizes fixed and dynamic heading levels at the renderer boundary;
  - passes XMLUI `id` as old `uid`;
  - passes theme/root class through `classes[COMPONENT_PART_KEY]`;
  - passes API registration through `registerComponentApi`;
  - preserves old `asDisplayText` whitespace behavior for `value`;
  - leaves `showAnchor` undefined when omitted so old app/global default lookup can run.

## Layout Finding

The copied Heading CSS was active, but `hasOverflow()` initially returned false
for constrained headings in a start-aligned vertical `Stack`. Diagnostics showed
the heading had `white-space: nowrap` and `overflow: hidden`, but its width had
expanded to max-content inside the flex parent, making `scrollWidth === clientWidth`.

The bridge now adds `minWidth: 0` and default `maxWidth: 100%` only when the
author did not set explicit `width` or `maxWidth`. This preserves old overflow
API tests while keeping explicit `width="400px"` overflow behavior intact.

## Default Theme Finding

Generic `<Heading level="h1">` through `<Heading level="h6">` initially rendered
with flattened font sizes because the rewrite only attached per-level
`fontSize-H1` ... `fontSize-H6` defaults to shortcut metadata. The old runtime
made those defaults available to generic `Heading` too. `HeadingMd` now includes
the old per-level default map, and shortcut metadata reuses the same helper.

A temporary computed-style probe for the reported markup returned:
`24px`, `20px`, `18px`, `16px`, `14px`, `12px` for H1-H6.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Heading/Heading.spec.ts src/components/Heading/HeadingShortcuts.spec.ts src/components/Heading/Heading-style.spec.ts --workers=1`: 136 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
- `npm --prefix xmlui run check:metadata`: passed.
- Temporary visual-regression probe for generic Heading font sizes: passed and
  then deleted.
- Side-by-side migrated component batch including ProgressBar, Avatar, Badge, Br,
  Icon, Button, Checkbox, Switch, Text, and Heading: 841 passed, 6 skipped.

## Residual Risk

- `anchorTemplate` is rendered through the current `adapter.renderTemplate`
  bridge, but the current template API does not yet inject `$anchorId` and
  `$anchorHref` context variables the way the old renderer did. This should be
  revisited when template context support or `TableOfContents` is migrated.
