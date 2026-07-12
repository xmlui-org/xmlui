# Old Website Migration Findings - 2026-07-12

Source: `/Users/dotneteer/source/xmlui/website`
Target: `/Users/dotneteer/source/xmlui-rs/website`

## What Changed

- Replaced the target `website/` tree with a copy of the old website.
- Added extension names to `website/xmlui.config.json` so the rewrite compiler
  knows old-site extension components:
  `xmlui-search`, `xmlui-website-blocks`, `xmlui-docs-blocks`,
  `xmlui-echart`, `xmlui-calendar`, `xmlui-gauge`, `xmlui-grid-layout`,
  `xmlui-masonry`, and `xmlui-tiptap-editor`.
- Regenerated website extension metadata with
  `npm run build:website-extensions:metadata`.
- Kept `xmlui-blog` and `xmlui-web` in
  `xmlui/src/components-core/theming/themes/xmlui.ts`; the file matched the
  old source. The old website also needs website-local themes from
  `website/src/themes/*.ts`, including `xmlui-hero-theme`.

## Compatibility Fixes

- `xmlui/src/runtime/startApp.tsx` now forwards old `src/config.ts` fields into
  `XmluiRoot`: `themes`, `defaultTheme`, `resources`, `icons`, and
  `appGlobals`.
- `xmlui/src/runtime/index.tsx` now accepts and passes custom icons to
  `IconProvider`.
- `xmlui/src/vite-plugin/xmluiPlugin.ts` now resolves the compiler module with
  a file URL and treats package `.xmlui` files as raw source, avoiding double
  parsing of extension package component source.
- `xmlui/src/compiler/parseXmlui.ts` now recognizes semicolonless `var`, `let`,
  and `const` declarations in `<script>` tags, as used by old `Main.xmlui`.
- `IncludeNavSection` was added as a built-in prop-holder component in
  contracts, IR lowering, and runtime registry.
- Runtime document codegen no longer serializes full expression AST/IR when
  generated `evaluate`/`execute` functions are emitted; this avoids huge
  generated modules for old `Main.xmlui`.
- Runtime event execution can invoke callback functions returned by generated
  event handlers with emitted event payloads.
- `website/src/Main.xmlui` contains one migration shim:
  `<Tag when="false" />`. It forces app-level import of
  `src/components/blog/Tag.xmlui`, which old docs-block layout components
  reference from extension-rendered XMLUI.

## Verification

- Dev server:
  `npm --workspace xmlui-website run start`
- Playwright smoke checked `/`, `/docs`, `/blog`, `/get-started`, and `/news`.
  All returned HTTP 200, rendered representative old-site text, and had no
  unfiltered console/page errors.
- Focused tests passed:
  `npm --workspace xmlui exec -- vitest run tests/compiler/parseXmlui.test.ts tests/compiler/codegen.test.ts tests/compiler/renderingPipeline.test.ts`

## Remaining Blocker

Direct production build was attempted with:

```sh
npm --workspace xmlui-website exec -- xmlui build --buildMode=INLINE_ALL --withMock
```

It currently fails after Vite transforms because the production XMLUI plugin
imports the compiler directly under Node. Compiler contract imports reach
component metadata files that import `.module.scss` files, causing
`ERR_UNKNOWN_FILE_EXTENSION`, first observed at
`xmlui/src/components/Accordion/Accordion.module.scss`. Dev mode avoids this
path because `xmluiPlugin` uses Vite's `ssrLoadModule`.
