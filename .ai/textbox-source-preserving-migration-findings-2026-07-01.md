# TextBox Source-Preserving Migration Findings - 2026-07-01

## Source Of Truth

- Original component files checked:
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBoxReact.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBox.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBox.defaults.ts`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBox.module.scss`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/TextBox/TextBox.spec.ts`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/Input/InputAdornment.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/Input/InputAdornment.module.scss`
- Rewrite TextBox spec was already an unchanged transfer of the old 164-test suite, so the work focused on runtime/testbed compatibility exposed by that suite.

## Implementation Notes

- TextBox and PasswordInput now publish their public API through an old-style `registerComponentApi` effect instead of using the imperative ref callback as the adapter registration channel.
- `value` is registered separately when the local value changes, preserving `{myTextBox.value}` reactivity while avoiding repeated registration during React imperative-handle refreshes.
- Shared adapter API registration now invalidates reference subscribers only when the registered reference object changes or a non-function API value changes. This keeps method identity refreshes from causing reference-binding loops while still updating value-bound expressions.
- The component testbed now disables App content max-width, content padding, and scrollbar gutter reservation for implicit App tests. App-scoped CSS variables are injected on the generated App root so percentage width assertions measure against the viewport-sized content area without moving the Theme outside the App and breaking `var.testState` ownership.
- TextBox adornment icons now render through `ThemedIcon`, matching the old shared `InputAdornment` helper. The previous rewrite-only marker span intentionally drew a filled dot, which made `startIcon="hyperlink"` and `endIcon="email"` display as circles instead of actual icons.
- The rewrite TextBox stylesheet now gives adornments the old wrapper-like icon/text gap and inherits adornment color into embedded icon nodes.
- The rewrite TextBox stylesheet now restores the old padding mixin cascade: broad `padding-TextBox` is applied first, then `paddingLeft`/`paddingRight`/`paddingTop`/`paddingBottom` variables override it through the original horizontal/vertical fallback chain. This fixes the default `initialValue="Example text"` case where text started too far from the left border because `padding-TextBox` was winning over `paddingHorizontal-TextBox`.
- Empty start/end adornments now return `null`, matching the old shared `InputAdornment` helper. The earlier rewrite rendered hidden empty spans; because component-layer `.textBoxAdornment { display: inline-flex; }` can override base-layer `[hidden] { display: none; }`, those empty adornments still participated in flex layout and added an extra root gap before the input text.
- Readonly focus now keeps the default border color while still applying the root focus outline. The migrated metadata had defaulted `borderColor-TextBox--focus` to the hover border color, which added a darker inner border on focus; the original default focus treatment does not change the TextBox border unless `borderColor-TextBox--focus` is explicitly themed.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "Input Adornments|can render startIcon|can render endIcon" --workers=1` passed 9/9.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "Theme Vars" --workers=1` passed 8/8.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "default horizontal padding|startAdornment part is not present|endAdornment part is not present" --workers=1` passed 3/3.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "readOnly focus keeps|readOnly prevents editing|readOnly has proper ARIA|focus borderColor applies" --workers=1` passed 4/4.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "component value API returns current state" --workers=1` passed 1/1.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "Api" --workers=1` passed 8/8.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "didChange event|gotFocus event|lostFocus event|setValue API triggers events|input.*width in %" --workers=1` passed 8/8.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts --workers=1` passed 167/167.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed.
- `npm --prefix xmlui run check:metadata` passed.
- `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1` passed 222/222.

## Residual Risk

- The non-failing tooltip plus Animation ref warning still appears in behavior-composition tests. This is the existing Animation behavior warning already noted in the component plan, not a TextBox-specific failure.
