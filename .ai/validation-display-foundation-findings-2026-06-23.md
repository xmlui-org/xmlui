# Validation Display Foundation Findings - 2026-06-23

Phase 5 Wave E2A migrated foundation implementations for
`ValidationSummary` and `ConciseValidationFeedback`.

## Implemented Foundation

- `ValidationSummary` migrated shape:
  - `ValidationSummary.tsx` for metadata;
  - `ValidationSummaryReact.tsx` for implementation and direct SCSS module
    import;
  - `ValidationSummary.renderer.tsx` for adapter wiring;
  - `ValidationSummary.module.scss` for styling.
- `ConciseValidationFeedback` migrated shape:
  - `ConciseValidationFeedback.tsx` for metadata;
  - `ConciseValidationFeedbackReact.tsx` for implementation and direct SCSS
    module import;
  - `ConciseValidationFeedback.renderer.tsx` for adapter wiring;
  - `ConciseValidationFeedback.module.scss` for styling.
- `ValidationSummary` reads current `FormContext.errors` and can also render
  explicit `fieldValidationResults` / `generalValidationResults` props in a
  simplified old-result-shape direction.
- `ConciseValidationFeedback` renders compact valid/error indicators with
  accessible text.
- Visual sample:
  - `xmlui/src/examples/validation-display-foundation/Main.xmlui`
  - available through `?example=validationDisplayFoundation` with `npm run dev`
    from `xmlui/`.

## Original-Project Coverage Note

The original project has implementation files for these components, but no
component-local E2E suites were found under:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ValidationSummary`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ConciseValidationFeedback`

Compatibility coverage appears through `Form` and input component suites
instead. Future full compatibility work should enable those old tests rather
than expecting copied component-local validation display suites.

## Remaining Compatibility Debt

- Exact old `ValidationSummary` severity grouping, animation, close button,
  icon rendering, and full theme-variable coverage.
- Exact old `ConciseValidationFeedback` themed `Icon` + `Tooltip` behavior.
- Integration into input components (`TextBox`, `NumberBox`, `DateInput`,
  `Select`, `AutoComplete`, etc.) once full validation modes are migrated.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/ValidationSummary/ValidationSummary.foundation.spec.ts src/components/ConciseValidationFeedback/ConciseValidationFeedback.foundation.spec.ts`

