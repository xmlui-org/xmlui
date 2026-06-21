# TimeInput Migration Findings - 2026-06-21

## Sources Checked

- Original component metadata and renderer:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/TimeInput/TimeInput.tsx`
  and `TimeInputReact.tsx`.
- Original defaults, SCSS, docs, utilities, and E2E suite:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/TimeInput/TimeInput.defaults.ts`,
  `TimeInput.module.scss`, `TimeInput.md`, `utils.ts`, and `TimeInput.spec.ts`.

## Compatibility Notes

- `TimeInput` is a segmented text input, not a native browser time input. The
  migrated implementation must preserve separate `hour`, `minute`, optional
  `second`, and optional `ampm` parts.
- 24-hour mode is the default. 12-hour mode derives AM/PM from the source value
  and exposes the AM/PM part as an interactive button-like control.
- ArrowRight/ArrowLeft navigate between visible parts. In 12-hour mode the
  navigation sequence includes AM/PM after the last numeric part.
- The AM/PM part supports click toggling and explicit `a`/`p` key selection.
- Whitespace-only string initial values are treated as invalid time text and
  display `00:00`; null/undefined/empty values display empty fields.
- Validation-state theme variables need the same base and hover fallback
  coverage as DateInput: border radius, border color, border width, border
  style, font size, background color, box shadow, and text color.

## Test Infrastructure Learnings

- The copied old suite contains one event handler with a block body and
  `console.log`. The current handler parser does not support that shape yet, so
  the testbed normalizes it to an equivalent assignment-only handler.
- Form/FormItem-dependent `bindTo` and label integration tests should stay
  `test.fixme` until the shared form infrastructure is migrated.
- The original non-time initial-value edge-case test includes a zero-argument
  arrow prop expression. That remains deferred until expression parsing supports
  that syntax.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/TimeInput/TimeInput.spec.ts`
  passed with 166 passed and 3 skipped deferred tests.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test`
