# AutoComplete Regression Fix Plan

Status: active

## Scope

Fix regressions found by the copied AutoComplete E2E suite without changing the
protected copied AutoComplete React implementation, stylesheet, docs, defaults,
or test cases.

## Source Of Truth

- Original component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete`
- Original form defaults:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Form/Form.defaults.ts`
- Rewrite tests:
  `xmlui/src/components/AutoComplete/AutoComplete.spec.ts`
  `xmlui/src/components/AutoComplete/AutoComplete.foundation.spec.ts`

## Findings

- The rewrite AutoComplete runtime adapter converted percentage widths to
  viewport widths, so percentage sizing did not match the original component.
- The testable AutoComplete root was an adapter wrapper that did not receive the
  copied AutoComplete input styling, so root theme-variable assertions observed
  default browser CSS instead of the component CSS.
- The rewrite Form runtime did not pass `validationIconSuccess` and
  `validationIconError` into form context. The original Form defaults provide
  `checkmark` and `error`, and copied AutoComplete validation tests rely on
  that context.

## Strategy

- Keep protected AutoComplete implementation files unchanged.
- Fix percent width handling in the AutoComplete runtime adapter.
- Mirror the copied AutoComplete root input style class onto the runtime wrapper
  so the adapter root remains testable while using the original stylesheet.
- Add the missing Form validation icon props to rewrite metadata/runtime/context
  with original-compatible defaults.

## Verification

- Run focused AutoComplete E2E tests for width, theme variables, label focus,
  validation feedback, variants, and nested overlays.
- Run the full copied AutoComplete E2E suite and foundation suite.
