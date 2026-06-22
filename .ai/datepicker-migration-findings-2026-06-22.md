# DatePicker Migration Findings - 2026-06-22

Scope:

- Implemented Wave B5.4 DatePicker foundation with source-adjacent metadata,
  defaults, stylesheet, docs, renderer, tests, and visual sample.
- Old source anchors came from the XMLUI MCP mirror:
  `xmlui/src/components/DatePicker/DatePicker.tsx`,
  `DatePickerReact.tsx`, `DatePicker.module.scss`, and `DatePicker.md`.

Implemented behavior:

- `DatePicker` is registered as a compiler builtin and runtime renderer.
- Supports single and range modes, initial/controlled values, date formatting,
  inline and popup calendar rendering, clear button, labels/adornments,
  min/max date bounds, disabled-date matchers, simple range presets,
  confirm-range footer, focus/change/blur events, and `focus`, `setValue`,
  `getValue`, and `value` APIs.
- Added `datePickerFoundation` visual sample at
  `http://127.0.0.1:5173/?example=datePickerFoundation`.

Deferred gaps:

- The old Ark UI renderer's segmented text editing, day/month/year view
  switching, desktop floating-position details, mobile bottom sheet, and full
  copied old E2E coverage are not closed by this foundation slice.
- Form/FormItem binding and validation feedback parity remain blocked on the
  shared form migration.
- Recorded as `COMP-0029` in `.ai/compatibility-debt.md`.

Verification:

- `npm.cmd install` completed to restore workspace dependencies.
- `npm.cmd --workspace xmlui run check:metadata` passed.
- `npm.cmd --workspace xmlui run compatibility:component-transfer` passed.
- `npm.cmd --workspace xmlui run compatibility:component-e2e-audit` passed
  after creating the ignored `xmlui/.compatibility-report` output directory.
- `npm.cmd --workspace xmlui run test:e2e -- src/components/DatePicker/DatePicker.spec.ts`
  executed all DatePicker tests with 6 passing and 1 planned skip, but the
  Playwright process did not exit before the shell timeout.

Verification caveats:

- `npm.cmd --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  initially passed before dependency installation. After `npm.cmd install`, the
  full TypeScript check fails in existing extension-call sites because
  workspace extension types resolve through both the real path and the sandbox
  mirror path, producing duplicate private `RuntimeStateStore` declarations.
