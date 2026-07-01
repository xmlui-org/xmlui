# ColorPicker source-preserving migration findings - 2026-07-01

## Compatibility source

- Original implementation: `/Users/dotneteer/source/xmlui/xmlui/src/components/ColorPicker/ColorPicker.tsx`.
- Original React source: `/Users/dotneteer/source/xmlui/xmlui/src/components/ColorPicker/ColorPickerReact.tsx`.
- Original support files: `ColorPicker.defaults.ts`, `ColorPicker.module.scss`, and the old ColorPicker spec.
- Original docs use name-only boolean attributes for ColorPicker, including `<ColorPicker initialValue="#ffff00" label="Cannot be edited" readOnly />` in `/Users/dotneteer/source/xmlui/xmlui/src/components/ColorPicker/ColorPicker.md`.
- Current rewrite suite: `xmlui/src/components/ColorPicker/ColorPicker.spec.ts`.

## Behavior preserved

- The rewrite keeps the native `<input type="color">` runtime implementation for value changes, validation classes, form binding, labeling, readonly/disabled behavior, and layout props.
- The original ColorPicker source renders only the native color input; the author-facing `label` behavior is supplied by the original `wrapComponent`/FormItem label wrapper and defaults to a top label. The rewrite keeps its local label bridge, but it now mirrors that top-label geometry with FormItem label tokens instead of laying label and swatch out inline.
- Original FormItem label typography defaults are `$fontSize-sm` and `$fontWeight-medium` from `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem/FormItem.tsx`. The rewrite FormItem defaults now match those values, and the ColorPicker label bridge has concrete small/medium fallbacks for isolated rendering where FormItem theme variables are not present.
- Public API exposure now follows the stable source-preserving pattern already used by TextBox and TextArea:
  - `ColorPickerNative` accepts `registerComponentApi`.
  - `focus` and `setValue` are registered through effects.
  - reactive `value` is registered separately as the normalized current value changes.
- This avoids relying on a ref callback to publish the public API and keeps expressions such as `{colorPicker.value}` reactive after both user-driven changes and `colorPicker.setValue(...)`.
- XMLUI markup accepts name-only boolean attributes. The parser now accepts attributes without `=`, and the normal/raw compiler paths materialize them as `"true"` so the existing boolean prop conversion handles `<ColorPicker readOnly />` the same way as `<ColorPicker readOnly="true" />`.

## Verification

- `npm --workspace xmlui exec -- vitest run tests/compiler/parser/markupParser.test.ts tests/compiler/parser/compatibility.test.ts tests/compiler/parser/lsp.test.ts tests/compiler/rawXmlui.test.ts tests/compiler/compileXmluiModule.test.ts -t "name-only|surfaces parser diagnostics|maps diagnostics|preserves name-only|treats name-only|recovers from missing"` passes 8/8.
- `npm --prefix tools/vscode test -- tests/semanticTokens.test.ts -t "returns parser diagnostics"` passes 1/1.
- `npm --workspace xmlui run test:e2e -- src/components/ColorPicker/ColorPicker.spec.ts -g "component handles readOnly mode correctly" --workers=1` passes 1/1 with `<ColorPicker readOnly />`.
- `npm --workspace xmlui run test:e2e -- src/components/ColorPicker/ColorPicker.spec.ts -g "value API|setValue API|bindTo syncs|focus API|no lag" --workers=1` passes 6/6.
- `npm --workspace xmlui run test:e2e -- src/components/ColorPicker/ColorPicker.spec.ts -g "label" --workers=1` passes 14/14, including regressions for top label geometry and 14px/500 label typography.
- `npm --workspace xmlui run test:e2e -- src/components/ColorPicker/ColorPicker.spec.ts --workers=1` passes 73/73.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passes.
- `npm --prefix xmlui run check:metadata` passes.

## Residual risk

- ColorPicker is still rewrite-native rather than a full copy of the old React/SCSS source. The current approval unit tightened the runtime API publication boundary because this was the concrete source-preserving gap visible in the implementation.
