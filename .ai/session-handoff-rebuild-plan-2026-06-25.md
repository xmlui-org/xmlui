# Rebuild Plan Session Handoff, 2026-06-25

## Trigger Phrase

If the user starts a new AI session and says:

> Go on with the next step of the rebuild-plan.md document.

resume from the current `Next explicit step` marker in
`.plans/rebuild-plan.md`.

## Current Next Step

Phase 5 Wave P2A - continue Form Core with the copied-old
`Form.spec.ts` **onValidate Integration** deferred timing/order subgroup.

Start by inspecting the old XMLUI validation flow and the copied-old tests:

- old source/tests:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Form/Form.spec.ts`
  `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem`
- rewrite source/tests:
  `xmlui/src/components/Form/Form.spec.ts`
  `xmlui/src/components/FormItem/FormItem.spec.ts`
  `xmlui/src/components/Form/FormReact.tsx`
  `xmlui/src/components/FormItem/FormItemReact.tsx`

Start with `onValidate validation messages appear in correct timing order`,
then continue through built-in/custom validation ordering cases. Do not leave
knowingly failing E2E tests.

## Plans To Read First

1. `.plans/rebuild-plan.md`
2. `.plans/missing-component-migration-plan.md`
3. `.ai/form-core-p2a-findings-2026-06-24.md`
4. This handoff note.

## Current Form P2A State

The following copied-old groups are active and passing:

- `FormItem.spec.ts` Basic Functionality
- `FormSegment.spec.ts` Basic Rendering
- `Form.spec.ts`
  - initial render/button-label/order tests
  - `hideButtonRow property`
  - core `hideButtonRowUntilDirty property`
  - `enableSubmit property`
  - `data property`
  - inherited item label settings
  - `enabled property`
  - `buttonRowTemplate property`
  - local `Events` subset
  - local `APIs` subset
  - `Context Variables`
  - first submit-time `onValidate Integration` case
  - first real-time `validationMode="onChanged"` `onValidate Integration` case
  - `customValidationsDebounce` `onValidate Integration` case
  - first async submit-time `onValidate Integration` case
  - async pending-state `onValidate Integration` case
  - async failure `onValidate Integration` case

Recent compatibility additions:

- `Form` exposes `$data` metadata and renders children in a child runtime scope
  carrying live form data plus `$data.update(...)`.
- Native `FormItem type="checkbox"` binds through `checked` and writes boolean
  values to form state.
- `FormItemDriver.checkbox` returns a Locator like the original driver.
- Submit-time `FormItem onValidate` handlers are registered with `Form`,
  awaited by `Form.validate()`, normalized for boolean/string/object/array
  returns, and surfaced as field validation messages.
- `Form` accepts `onSaved` through a `saved` event alias and fires it after
  successful submit alongside `success`.
- `Form.validateField(...)` is exposed through form context and fallback
  FormItems call it for `validationMode="onChanged"` after value changes.
- `Form` tracks in-flight field validation via `validatingFields`, disables the
  built-in Save button during pending validation, shows `savePendingLabel`
  after `submitFeedbackDelay`, and reuses unchanged field validation results on
  submit.
- `FormItem` starts change-time custom validation whenever `onValidate` is
  present, even when visible validation feedback is not set to `onChanged`.
- `FormItem customValidationsDebounce` delays onChanged custom validation with
  a cancellable timer and clears pending validation on unmount.
- The script parser accepts copied-old `value => { return ... }` and
  `value => { delay(...); return ... }` validator arrows, and both script
  emitters support object-returning expression arrows plus async block-bodied
  validator arrows.
- `FormDriver.submitForm()` matches the copied-old driver shape.

## Known Deferred Form Work

The remaining copied-old Form/FormItem/FormSegment groups are intentionally
skipped by feature area. Do not unskip them wholesale. In particular:

- The remaining `onValidate Integration` subgroup depends on timing/order
  behavior and built-in/custom validation ordering.
- Submit URL/method depends on managed fetching and form submission plumbing.
- `noSubmit` filtering, nested modal form boundaries, and concise object-literal
  arrow returns are separate prerequisites for some event tests.
- FormItem type matrix, validation properties, async validation, accessibility,
  theme variables, regex/phone validation, and FormSegment scoped APIs are later
  slices.

## Last Verification

The following passed after the async failure slice:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "Context Variables"`
  - 2 passed
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  - 124 passed
  - 255 skipped
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "multiple fields with onValidate"`
  - 1 passed
  - 1 skipped
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "onValidate runs with validationMode=onChanged"`
  - 1 passed
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "async onValidate with customValidationsDebounce"`
  - 1 passed
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "form submission waits for all async onValidate before submitting"`
  - 1 passed
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "form blocks submission while async onValidate is still in-flight"`
  - 1 passed
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "form does not submit after async validation fails"`
  - 1 passed
- `npm --workspace xmlui test`
  - 267 passed
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui run compatibility:css-module-import-audit`

Playwright commands usually need escalated execution in Codex because they
start web server/browser processes.

## Worktree Notes

At handoff time the worktree is intentionally dirty with ongoing P2A work and
dependency fixes. Do not revert these changes.

Important modified source/plan files include:

- `.plans/rebuild-plan.md`
- `.plans/missing-component-migration-plan.md`
- `.ai/form-core-p2a-findings-2026-06-24.md`
- `xmlui/src/components/Form/*`
- `xmlui/src/components/FormItem/*`
- `xmlui/src/components/TextBox/*`
- `xmlui/src/testing/ComponentDrivers.ts`
- `package.json`, `package-lock.json`, `xmlui/package.json`

The standalone sample bundles under `xmlui/standalone-samples/*/xmlui/xmlui-latest.js`
were regenerated by verification commands. Do not delete or revert them unless
the user explicitly asks.

## Conventions To Preserve

- Existing XMLUI is the compatibility contract.
- Component migrations must copy old E2E tests literally where possible.
- Use source-adjacent component organization and direct SCSS module imports.
- Do not implement component visuals with React-computed inline style objects
  except for narrow dynamic/layout/theme variable exceptions.
- Never leave knowingly failing E2E tests; skip/fixme unsupported tests with
  explicit reasons.
