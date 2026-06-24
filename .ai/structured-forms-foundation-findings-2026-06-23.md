# Structured Forms Foundation Findings - 2026-06-23

## Original XMLUI Contract

The old XMLUI project has component-local folders and E2E suites for:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/TabsForm`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/StepperForm`

Both components are experimental structured form wrappers. They accept direct
`FormSegment` children, forward most `Form` props/events/APIs, and render the
segments through a navigation component:

- `TabsForm` transforms to `Form` + `Tabs` + `TabItem`.
- `StepperForm` transforms to `Form` + `Stepper` + `Step`.

## Current Rewrite Slice

Phase 5 Wave E3A implemented a foundation slice:

- source-adjacent component folders for `TabsForm` and `StepperForm`;
- metadata, renderer, React implementation, docs, and component-local E2E specs;
- compiler contract registration and runtime registry registration;
- lowerer built-in classification for both component names;
- `Form` API forwarding for `reset`, `update`, `getData`, and `validate`;
- `Form` `submitFailed` event support;
- a runnable `structuredFormsFoundation` dev example.

`TabsForm` composes the migrated `Form`, `Tabs`, and `TabItem` components.
`StepperForm` uses a local step-header foundation because the standalone old
`Stepper` component is not migrated yet.

## Deferred Compatibility

The copied old suites contain behaviors that remain deferred as explicit
`test.fixme` entries:

- invalid-segment navigation gating for `StepperForm`;
- old Stepper visual markup, stacked labels, and completion/error indicators;
- `TabsForm` submit-failure jump to the first invalid tab;
- full old accordion-view parity for `TabsForm`.

These should be revisited after the full Form/FormItem validation lifecycle and
the standalone `Stepper` component are migrated.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/TabsForm/TabsForm.spec.ts src/components/StepperForm/StepperForm.spec.ts`

The targeted E2E result was 10 passed and 6 explicit fixme/skipped tests.
