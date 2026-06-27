# Website First Display Findings

Date: 2026-06-27

## Source Baseline

- Old website source: `/Users/dotneteer/source/xmlui/website`
- Rewrite website workspace: `/Users/dotneteer/source/xmlui-rs/website`
- Migrated display packages:
  - `packages/xmlui-docs-blocks`
  - `packages/xmlui-website-blocks`
  - `packages/xmlui-search`

## Implemented Slice

- Copied durable website assets/content into the rewrite workspace:
  - `website/icons`
  - `website/navSections`
  - `website/public`
  - `website/content`
  - `website/src/themes`
  - `website/src/config.ts`
  - `website/utils/index.ts`
  - `website/xmlui.config.json`
  - `website/tsconfig.json`
- Updated `website/package.json` so the local website depends on `xmlui`,
  `xmlui-docs-blocks`, `xmlui-website-blocks`, and `xmlui-search`.
- Registered the three migrated extensions in `website/index.ts`.
- Limited the eager runtime glob to `/src/**/*.xmlui` for the first display
  slice. This avoids pulling the copied full docs utility pipeline into the
  app before its remaining compatibility dependencies are ready.
- Replaced `website/src/Main.xmlui` with a focused display shell that renders:
  - a top header and search field from `xmlui-search`;
  - a home route using `HeroSection` from `xmlui-website-blocks`;
  - a docs route using `Breadcrumbs` and `ReadingTime` from
    `xmlui-docs-blocks`;
  - a visible state update path that increments `Docs state updates`.

## XMLUI Compatibility Work Needed for Display

- Added raw `.xmlui` extension package source handling for Vite and XMLUI
  compile-time validation.
- Added extension component metadata loading from generated
  `dist-metadata/*-metadata.json` files for `xmlui build`, `xmlui start`, and
  `xmlui preview`.
- Added old extension-authoring compatibility exports for the migrated packages,
  including component renderer helpers, metadata helper exports, theme hooks,
  search constants/types, and simple fallback components.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`: passed.
- `npm --workspace xmlui-website run build`: passed.
- `npm --workspace xmlui-website run start`: running at
  `http://localhost:5173/`.
- Browser smoke:
  - home route renders `Visual regression shell`;
  - header links and search field render;
  - docs route renders `Documentation quick check`;
  - clicking `Update docs state` changes the rendered counter from `0` to `1`.

## Known Gaps

- The focused shell is not yet the full old `website/src/Main.xmlui`.
- The copied website docs/content utility pipeline is present but not active in
  the initial runtime glob.
- Old package E2E specs for the three migrated packages are still pending.
- The focused website smoke is manual; add an automated Playwright smoke next.
- Remaining website extension packages are not migrated yet:
  `xmlui-masonry`, `xmlui-gauge`, `xmlui-echart`, `xmlui-calendar`,
  `xmlui-grid-layout`, and `xmlui-tiptap-editor`.
- Sass emits deprecation warnings from the copied old `_themes.scss` helper.
  This does not block display but should be tracked during hardening.
