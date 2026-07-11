# xmlui-tiptap-editor Migration Findings

Date: 2026-06-27

Updated: 2026-07-11

## Source Baseline

Old package: `/Users/dotneteer/source/xmlui/packages/xmlui-tiptap-editor`

Relevant old files inspected:

- `package.json`
- `src/index.tsx`
- `src/TiptapEditorWrapped.tsx`
- `src/TiptapEditorReact.tsx`
- `src/TiptapEditor.spec.ts`
- `meta/componentsMetadata.ts`

Old website references inspected:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/wrap-component/tiptap.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/configure-a-tiptapeditor-toolbar.md`

The old package registers `TiptapEditor` with `wrapCompound`, captures native
events, and exposes the props `initialValue`, `placeholder`, `editable`,
`toolbar`, `toolbarItems`, and `height`. Its public API includes `focus`,
`setValue`, `getMarkdown`, and `getHTML`, and it emits `didChange`.

## Migrated Workspace Files

- `packages/xmlui-tiptap-editor/package.json`
- `packages/xmlui-tiptap-editor/tsconfig.json`
- `packages/xmlui-tiptap-editor/src/index.tsx`
- `packages/xmlui-tiptap-editor/src/TiptapEditorWrapped.tsx`
- `packages/xmlui-tiptap-editor/src/TiptapEditorReact.tsx`
- `packages/xmlui-tiptap-editor/src/xmlui-public.d.ts`
- `packages/xmlui-tiptap-editor/src/vite-env.d.ts`
- `packages/xmlui-tiptap-editor/meta/componentsMetadata.ts`
- `packages/xmlui-tiptap-editor/CHANGELOG.md`
- `packages/xmlui-tiptap-editor/src/TiptapEditor.spec.ts`
- `packages/xmlui-tiptap-editor/tests/TiptapEditor.test.ts`

Website wiring:

- `website/package.json`
- `website/index.ts`
- `website/xmlui.config.json`
- `website/src/Main.xmlui`

## Compatibility Notes

- The focused website smoke uses `toolbar="false"` to keep the route compact
  while proving the editor display path and old `id`/`setValue`/`value` API
  path.
- The copied old package spec is active in the rewrite extension E2E runner.
  It covers placeholder rendering, initial value, toolbar toggling, toolbar
  item configuration, `setValue`, `getMarkdown`, `didChange`, and
  `editable={false}`.
- The current `wrapCompound` compatibility layer supplies enough value,
  `onChange`, and `registerApi` behavior for the display smoke and `setValue`
  API path. Full native-event capture remains a broader extension-authoring
  compatibility target.
- The package carries the old Tiptap dependency set into the workspace. The
  combined website build now emits a large chunk warning, which is expected
  until website chunking or lazy route loading is revisited.

## Verification

Passing commands:

- `npm --workspace xmlui-tiptap-editor run build`
- `npm --workspace xmlui-tiptap-editor run build:extension`
- `npm --workspace xmlui-tiptap-editor run build:metadata`
- `node xmlui/scripts/verify-protected-component-copy.mjs --package xmlui-tiptap-editor`
- `npm --workspace xmlui-tiptap-editor run test:e2e` (9 passed)
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui-website run build`

Manual browser smoke at `http://localhost:5173/#/docs`:

- `TiptapEditor extension check` renders.
- One `.ProseMirror` editor mounts.
- `Initial rich text` and `Editor value: Initial rich text` render initially.
- Clicking `Update editor content` changes visible text to `Updated rich text`
  and `Editor value: Updated rich text`.
- Browser console error log is empty after the smoke.

Known verification noise:

- Sass deprecation warnings from copied old theme helpers used by other
  migrated packages in the website build.
- Smart UI direct-eval and large bundle warnings from the combined website
  build.

## Follow-Up

- Add focused coverage for `getHTML` if future package work needs it; the copied
  original E2E suite is now active and covers toolbar interactions, editable
  mode, and `didChange`.
- Implement native-event capture in the extension authoring compatibility layer
  and verify editor event propagation against the old package behavior.
