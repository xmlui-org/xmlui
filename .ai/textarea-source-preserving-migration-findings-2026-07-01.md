# TextArea source-preserving migration findings - 2026-07-01

## Compatibility source

- Original implementation: `/Users/dotneteer/source/xmlui/xmlui/src/components/TextArea/TextArea.tsx`.
- Original React source: `/Users/dotneteer/source/xmlui/xmlui/src/components/TextArea/TextAreaReact.tsx`.
- Original support files: `TextAreaResizable.tsx`, `TextArea.defaults.ts`, and `TextArea.module.scss`.
- Current rewrite suite: `xmlui/src/components/TextArea/TextArea.spec.ts`.

## Behavior preserved

- TextArea keeps its existing runtime implementation for labels, form integration, autosize, resize, validation feedback, layout props, and current transferred tests.
- The renderer preserves the old optional `rows` boundary from `/Users/dotneteer/source/xmlui/xmlui/src/components/TextArea/TextArea.tsx`, where `rows={extractValue.asOptionalNumber(node.props.rows)}` is passed to the React layer. In the rewrite, normal TextArea still defaults to two rows, but `autoSize`, `minRows`, or `maxRows` switches to an autosizing baseline instead of using the normal default row count.
- The autosize implementation uses a one-row measurement baseline and writes border-box-corrected height (`scrollHeight` plus vertical border widths for `box-sizing: border-box`). A local DOM probe against the original `http://localhost:5174` and rewrite `http://localhost:5173` showed `<TextArea autoSize="true" />` at `42px` in both implementations.
- Default focus border color now matches the TextBox migration pattern by resolving `borderColor-TextArea--focus` to the base `borderColor-TextArea` token. Explicit `borderColor-TextArea--focus` theme overrides remain supported.
- API exposure now follows the stable source-preserving pattern already used by TextBox and AppState:
  - `TextAreaNative` accepts `registerComponentApi`.
  - `focus`, `insert`, and escaped `setValue` are registered through effects.
  - reactive `value` is registered separately as `localValue` changes.
- This avoids relying on a ref callback to publish the public API, reducing API object churn while preserving `{myTextArea.value}` reactivity.
- The registered `setValue` path uses `stringifyTextAreaApiValue`, so expressions such as `notes.setValue('alpha\\nbeta\\ngamma')` continue to produce multiline values.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/TextArea/TextArea.spec.ts -g "autoSize without rows|default focus keeps" --workers=1` passes 2/2.
- `npm --workspace xmlui run test:e2e -- src/components/TextArea/TextArea.spec.ts --workers=1` passes 161/161.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passes.
- `npm --prefix xmlui run check:metadata` passes.

## Residual risk

- TextArea is still rewrite-native rather than a full copy of the old React/SCSS source. Current approval unit tightened the API publication boundary because it was the concrete source-preserving gap discovered before user screenshot review.
- The TextArea suite still emits the existing non-failing tooltip-plus-animation React ref warning from the shared Animation/Tooltip behavior composition path.
