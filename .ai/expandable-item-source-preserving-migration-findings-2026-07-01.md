# ExpandableItem Source-Preserving Migration Findings - 2026-07-01

## Scope

Migrated `ExpandableItem` after the user completed Drawer and asked to continue component remigration.

## Original Sources

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ExpandableItem/ExpandableItemReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ExpandableItem/ExpandableItem.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ExpandableItem/ExpandableItem.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ExpandableItem/ExpandableItem.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/ComponentDrivers.ts`

## Compatibility Notes

- The rewrite had a foundation implementation with placeholder icon text and a placeholder switch. The original component renders themed icons through the XMLUI icon pipeline and uses the real `Toggle` component for `withSwitch`.
- The original component wraps summary and content with `Part`, preserving `summary` and `content` part markers.
- The old test driver intentionally locates CSS-module generated classes with substring selectors such as `[class*="_summaryContent_"]`, rather than source class names like `.summaryContent`.
- The old driver returns all summary/content part locators, which allows nested `ExpandableItem` scenarios to address child summaries with `.nth(1)`.
- Calling `onExpandedChange` from inside a React state updater can warn when the event updates XMLUI-rendered state. The rewrite keeps the old observable callback timing by setting state and then firing the event outside the updater.
- Local DOM comparison against the original dev server showed that the original runtime resolves the root bottom border to `0px` for the default theme. The old metadata contains `borderBottomWidth-ExpandableItem: "1px"`, but the generated runtime theme class still emits `--xmlui-borderBottomWidth-ExpandableItem: 0`, so the visible compatibility contract is no separator.
- The rewrite initially emitted `--xmlui-borderBottomWidth-ExpandableItem: 1px`, producing a visible horizontal rule and shifting expanded item heights by one pixel.
- The later apparent gap mismatch in `<VStack gap="space-4">` was not an `ExpandableItem` styling issue. Old XMLUI's `extractValue.asSize(...)` only accepts theme references with a `$` prefix, so bare values such as `space-4` and `space-3` are invalid sizes. For Stack `gap`, the old renderer falls back to `$gap-Stack` when `asSize(node.props?.gap)` fails; for child `padding="space-3"`, the invalid value is not applied. The rewrite must preserve that narrow Stack fallback rather than globally treating bare theme variable names as valid theme references.
- The rich summary template exposed a shared behavior mismatch. In the original framework, `Badge` does not declare a `label` prop, so `label="New"` is handled by the generic `LabelBehavior` in `/Users/dotneteer/source/xmlui/xmlui/src/components-core/behaviors/LabelBehavior.tsx`, which wraps the component with `ItemWithLabel` and defaults to `labelPosition="top"`. The old `Badge` renderer also forwards unsupported variant strings unchanged, so `variant="success"` does not receive the default `.badge` styling. The visible result is a `New` label above an empty badge marker inside the custom summary.

## Implementation Summary

- Replaced the foundation React shell with a source-preserving `memo(forwardRef(...))` implementation using `Part`, `ThemedIcon`, and `Toggle`.
- Restored source-style SCSS for root, summary, icon/switch, content, open/disabled/full-width states, animation, and theme variable export.
- Re-enabled the transferred old ExpandableItem suite by removing the temporary skip gate.
- Updated the shared ExpandableItem test driver to match the original CSS-module-aware selectors and nested locator behavior.
- Aligned metadata status and key descriptions with the original stable component metadata.
- Expanded the component theme-var declaration set to include the composed border and padding side variables used by the source SCSS, and normalized the default bottom border width to the original runtime-computed `0px` value. Added regression coverage for both the default no-separator case and explicit `borderBottomWidth-ExpandableItem` overrides.

## Verification

- Original localhost DOM query: root `border-bottom-width` was `0px`, item height was `86.390625px`, summary padding was `8px 16px`, and content padding was `8px 12px`.
- Rewrite localhost DOM query before the fix: root `border-bottom-width` was `1px`, item height was `87.390625px`, while summary/content padding already matched the original.
- Rewrite localhost DOM query for the gap issue before the scoped Stack fallback: containing `VStack` computed `gap: normal`, and the second item started exactly at the first item bottom.
- An attempted global bare-token theme resolution made `gap="space-4"` compute to `16px`, but it also incorrectly applied `padding="space-3"` to child Stacks and made the content blocks too tall. That approach was reverted.
- The corrected Stack behavior filters the `gap` prop before assigning `--xmlui-gap-Stack`; invalid bare theme-looking values leave the stylesheet default in place. Focused Stack regression now asserts `gap="space-4"` falls back to the default 16px Stack gap while `padding="space-3"` remains unapplied. ExpandableItem now also has a direct regression for the user's two-expanded-item example that asserts the same 16px inter-item gap and zero applied child padding.
- The generic label behavior now emits stable runtime CSS classes instead of importing a CSS module from behavior definitions, because behavior metadata is loaded through the Vite/config path. `xmlui/src/runtime/index.tsx` imports `LabelBehavior.scss` for the browser runtime. Badge renderer now passes the raw variant string through to protected `BadgeReact`, matching old invalid-variant behavior.
- `npm --workspace xmlui run test:e2e -- src/components/ExpandableItem/ExpandableItem.spec.ts --workers=1` passed 61/61 before the Stack fallback correction.
- `XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/Stack/Stack.spec.ts src/components/ExpandableItem/ExpandableItem.spec.ts` passed 64 active tests with 83 skipped pending Stack tests before the Stack fallback correction.
- `npm --workspace xmlui run test:e2e -- src/components/ExpandableItem/ExpandableItem.spec.ts --grep "Stack fallback gap and invalid child padding preserve migrated spacing" --workers=1` passed 1/1 after the correction.
- `npm --workspace xmlui run test:e2e -- src/components/Stack/Stack.spec.ts src/components/ExpandableItem/ExpandableItem.spec.ts --workers=1` passed 65 active tests with 83 skipped pending Stack tests after the correction.
- `npm --workspace xmlui run test:e2e -- src/components/ExpandableItem/ExpandableItem.spec.ts --grep "component summary preserves generic label behavior" --workers=1` passed 1/1 after the generic label and Badge invalid-variant correction.
- `npm --workspace xmlui run test:e2e -- src/components/ExpandableItem/ExpandableItem.spec.ts --workers=1` passed 63/63 after the rich summary correction.
- `npm --workspace xmlui run build -- --mode development` passed after the Stack runtime change and again after the generic label behavior correction.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed.
- `npm --prefix xmlui run check:metadata` passed.

## Follow-up Correction - Rich Summary Geometry

The first regression for the rich summary checked only that `Badge label="New"` used generic label behavior. It missed the real visual contract: the surrounding `CHStack` must keep `Custom Summary with Icon`, the label wrapper, and the chevron in a single horizontal summary row. The full-width generic label wrapper compressed the sibling text and caused it to wrap into multiple lines.

The wrapper CSS now uses intrinsic sizing (`fit-content` and `flex: 0 0 auto`) for the generic label behavior. That matches the old visible behavior in this inline summary template, where the labeled `Badge` does not claim the row width. The focused regression now asserts that `Custom Summary with Icon` remains one line and that the `New` label is positioned to the right of that text while still sitting above the badge body.

The same example also exposed that generic label behavior can be used outside a `FormItem`, so the CSS variables for label typography may not already be present on a FormItem wrapper. Old XMLUI still resolves the label through FormItem defaults (`$fontSize-sm`, `$fontWeight-medium`). The behavior stylesheet now uses the FormItem fallback chain for color, family, size, weight, style, and transform, and the regression asserts the `New` label computes to `14px` and `500`.

The final screenshot delta was the small horizontal gap between the `New` label and the chevron. The old and new `gap-ExpandableItem` defaults both resolve from `$space-2`, so the source of truth was not the component default. DOM measurement of the original showed that `ItemWithLabel` reserves a hidden required-marker span when label behavior is used inside a horizontal layout, even when the component is not required. The rewrite now passes layout context into behavior attachment and mirrors that hidden marker, including the original `0.2em` marker margin. No `ExpandableItem`-local spacing workaround remains; the shared label behavior now produces the same wrapper geometry. The regression measures the `New` text-node-to-chevron bounding-box distance directly and expects the original `17.3125px` gap.

Verification after the correction:

- `npx playwright test --config xmlui/playwright.config.ts xmlui/src/components/ExpandableItem/ExpandableItem.spec.ts -g "component summary preserves generic label behavior"` passed 1/1.
- `npx playwright test --config xmlui/playwright.config.ts xmlui/src/components/ExpandableItem/ExpandableItem.spec.ts` passed 63/63.
