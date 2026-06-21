# Slider Migration Findings - 2026-06-21

## Source Anchors

- Old component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Slider`
- Migrated component folder:
  `xmlui/src/components/Slider`

## Findings

- The old `Slider` test suite is broad but can be supported without importing
  Radix for this rewrite slice. A custom renderer now covers numeric coercion,
  min/max/step, range thumbs, mouse and keyboard updates, event firing, APIs,
  labels, theme variables, validation variants, and responsive layout.
- The rewrite's `?xmlui-css-module` loader is intentionally lightweight: it
  injects stylesheet text after stripping theme-variable declarations, but it
  does not compile Sass mixins or `$variable` usages in rule bodies. Migrated
  component styles must keep CSS rule bodies browser-valid, using
  `var(--xmlui-...)` directly while preserving top-level declaration lines for
  metadata extraction.
- The old copied Slider tests expect the labeled wrapper hook
  `[data-part-id="labeledItem"]` beneath the test-id root. Preserve that DOM
  shape for labeled input-style components.
- Deferred Slider tests are limited to known old bug/Form infrastructure:
  the old autofocus fixme, `bindTo` with `Form`, and `requireLabelMode` cases
  that require migrated Form/FormItem behavior.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/Slider/Slider.spec.ts`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run test`
