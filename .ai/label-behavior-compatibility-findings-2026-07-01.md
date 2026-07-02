# Label Behavior Compatibility Findings - 2026-07-01

## Compatibility Sources

- Original shared wrapper:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem/ItemWithLabel.tsx`
- Original FormItem styling:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem/FormItem.module.scss`
- Original defaults:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem/ItemWithLabel.defaults.ts`
- Rewrite shared behavior:
  `/Users/dotneteer/source/xmlui-rs/xmlui/src/component-core/behaviors/LabelBehavior.scss`
- Rewrite TextBox local bridge:
  `/Users/dotneteer/source/xmlui-rs/xmlui/src/components/TextBox/TextBox.module.scss`

## Findings

- Old XMLUI label behavior is centered on `ItemWithLabel`, not on each input
  component. The default `labelPosition` is `top`, and the old top label gap is
  `0.5em`.
- The visible label contract comes from FormItem label tokens:
  `textColor-label-formItem`, `fontFamily-label-formItem`,
  `fontSize-label-formItem`, `fontWeight-label-formItem`,
  `fontStyle-label-formItem`, and `textTransform-label-formItem`.
- Some components consume `label` locally and therefore never reach the generic
  rewrite `LabelBehavior` wrapper. TextBox is one of these cases. Local label
  bridges must still use the same FormItem/`ItemWithLabel` token cascade and
  spacing instead of inherited typography or broad layout gaps.
- Required and optional markers are part of the wrapper geometry. The old
  required marker uses a small `0.2em` inline gap, and horizontal layouts reserve
  marker space even when the marker is hidden.
- Keep these visual contracts in CSS classes and component stylesheets. Inline
  styles should be limited to truly dynamic values such as authored label width.

## Verification Pattern

- Compare against the original by inspecting computed styles and bounding boxes,
  not only by checking screenshots or label existence.
- For labeled inputs, assert:
  - computed label font size and weight;
  - wrapper row/column gap;
  - actual visible label-to-control distance with bounding boxes.
- The TextBox follow-up regression covers `<TextBox label="Quick note" />` and
  verifies the FormItem-compatible label font and `8px` top-label gap.

## Verified

- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "label uses ItemWithLabel typography" --workers=1`
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts --workers=1`
