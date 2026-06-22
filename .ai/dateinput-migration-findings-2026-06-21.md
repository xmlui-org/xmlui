# DateInput Migration Findings - 2026-06-21

## Sources Checked

- Original component metadata and renderer:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/DateInput/DateInput.tsx`
  and `DateInputReact.tsx`.
- Original defaults, SCSS, docs, and E2E suite:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/DateInput/DateInput.defaults.ts`,
  `DateInput.module.scss`, `DateInput.md`, and `DateInput.spec.ts`.

## Compatibility Notes

- `DateInput` is a segmented text input in the original implementation, not a
  native `<input type="date">`. The migration should preserve separate
  month/day/year fields, field placeholders, per-field focus, and keyboard
  navigation.
- The copied old suite expects supported formats including `MM/dd/yyyy`,
  `MM-dd-yyyy`, `yyyy/MM/dd`, `yyyy-MM-dd`, `dd/MM/yyyy`, `dd-MM-yyyy`,
  `yyyyMMdd`, and `MMddyyyy`.
- Invalid complete dates must preserve the typed field values instead of
  clearing the component. The invalid field is marked while the rendered text
  remains inspectable.
- Ctrl+A enters a component-wide select-all state. Backspace/Delete clears all
  fields, and Ctrl+C copies the full formatted date to the browser clipboard.
- Label width handling must avoid applying percentage widths twice: the outer
  label wrapper owns the requested width, and the labeled item fills that
  wrapper.

## Test Infrastructure Learnings

- Copied keyboard clipboard tests need a browser-level clipboard mock. A local
  helper-only clipboard is insufficient because components call
  `navigator.clipboard.writeText`.
- Inline style strings may contain CSS custom properties such as
  `--color-divider`. The shared style-string parser must preserve names
  starting with `--`; camel-casing them creates invalid React style properties.
- Component theme variable names can look like layout props. Shared layout
  parsing must avoid treating component theme variables as responsive part
  layout props.
- Validation state selectors must be component-qualified in the current raw
  stylesheet loader. Generic `.warning`, `.error`, `.valid`, and `.disabled`
  selectors collide with sibling input components such as TimeInput because the
  migrated SCSS class names are currently global in browser tests. Use selectors
  such as `.dateInputWrapper.warning` so DateInput state rules keep their own
  theme variables and specificity.
- Validation hover theme variables need explicit default fallback entries for
  `--error--hover`, `--warning--hover`, and `--success--hover`; otherwise old
  tests that override only a state hover token may not have a stable fallback
  chain for the remaining state hover properties.

## Deferred Coverage

- Form/FormItem-dependent `bindTo` and validation feedback tests remain
  `test.fixme` until shared form infrastructure is migrated.
- The original test using a zero-argument arrow callback as a prop value is
  deferred until the expression parser supports that shape.
- The original `all behaviors combined with parts` test was already fixme in
  the copied source and remains deferred.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/DateInput/DateInput.spec.ts`
  passed with 153 passed and 9 skipped deferred tests.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test`
