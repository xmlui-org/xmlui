# ColorPicker Migration Findings - 2026-06-21

## Source Anchors

- Original metadata and renderer:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/ColorPicker/ColorPicker.tsx`
  and `ColorPickerReact.tsx`.
- Original styling:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/ColorPicker/ColorPicker.module.scss`.
- Original documentation and E2E coverage:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/ColorPicker/ColorPicker.md`
  and `ColorPicker.spec.ts`.

## Compatibility Decisions

- Keep `ColorPicker` as a native `<input type="color">`, matching the old
  component's browser-backed behavior.
- Preserve `initialValue`, `enabled`, `readOnly`, `required`,
  `validationStatus`, `didChange`, `gotFocus`, `lostFocus`, and the `focus`,
  `value`, and `setValue` APIs.
- Generate an input id when no explicit `id` is supplied so the label can be
  associated with the color input. The old copied accessibility test expects
  this relationship.
- Treat invalid color strings as the native default `#000000`.
- Keep executable copied old E2E tests in the component folder. Mark only
  Form/FormItem-dependent tests as `test.fixme` until `Form`, `FormItem`,
  `bindTo`, and require-label-mode infrastructure are migrated.

## Styling Notes

- Component visuals live in `ColorPicker.module.scss` and are applied through
  CSS classes.
- Theme variable declarations stay at the top of the stylesheet so the metadata
  extractor can discover them.
- Rule bodies must remain browser-valid CSS for the current experimental CSS
  loader. Do not use Sass variables or mixins inside runtime rule bodies.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/ColorPicker/ColorPicker.spec.ts`
  passed with 59 passed and 11 skipped Form/FormItem-dependent tests.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test`

## Visual Check

Run the dev server and open:

`http://127.0.0.1:5173/?example=colorPickerFoundation`
