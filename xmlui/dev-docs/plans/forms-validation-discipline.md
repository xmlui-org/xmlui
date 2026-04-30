# Forms Validation & Submission Discipline — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §9 "Form Infrastructure as a Safety Surface"](../managed-react.md) and the §17 scorecard row **"Forms validation — State strong, validators absent."**

---

## Goal

Close the §17 scorecard row:

> **Forms validation — State strong, validators absent.**
> Path to managed: *Built-in validators, server-error mapping, submit guard.*

The scorecard wording slightly understates today's state — XMLUI does
ship a useful validator surface on
[`FormItem`](../../src/components/FormItem/FormItem.tsx):
`required`, `minLength`, `maxLength`, `minValue`, `maxValue`,
`pattern` (with named patterns `email`, `phone`, `url` — see
[`Validations.ts`](../../src/components/FormItem/Validations.ts)),
`regex`, and a custom `validate` handler with sync/async support and
per-rule severity. What is missing is everything *around* the
field-level validator: a **validator registry** so apps can name
their own rules, **cross-field validation** at the form level, a
**server-error contract** that maps a 422 response to per-field
errors without bespoke code, a **submission guard** that prevents
double-submit and integrates with cooperative cancellation, and a
**CSRF/idempotency surface** on `<Form>` itself.

This plan delivers those five pieces in priority order:

1. **Named validator registry** — rename `pattern` → `validator`
   (deprecation alias kept), expose `App.registerValidator()`,
   ship a small standard library (`email`, `phone`, `url`,
   `creditCard`, `iban`, `isoDate`, `strongPassword`,
   `noLeadingTrailingWhitespace`).
2. **Cross-field validators on `<Form>`** — `<FormValidator>` child
   element with `bindTo` listing the participating fields and a
   `validate` function returning per-field errors.
3. **Server-error mapping contract** — `<Form>` understands
   RFC 7807 Problem Details with the
   [`invalid-params`](https://www.rfc-editor.org/rfc/rfc9457#name-members-of-a-problem-detail)
   member; per-field errors land on the matching `<FormItem>`
   automatically.
4. **Submission guard + cancellation integration** — Form-level
   `submitPolicy` (`single-flight | queue | drop-while-running`)
   built on the
   [cooperative-concurrency plan](./cooperative-concurrency.md)
   `handlerPolicy` primitive; `$cancel` propagates into the submit
   handler.
5. **CSRF / idempotency surface** — `<Form csrfToken="..."
   idempotencyKey="..." />` props piggybacking on the
   [`RestApiProxy`](../../src/components-core/RestApiProxy.ts)
   pipeline.

Each step lands behind a single
`App.appGlobals.strictForms: boolean` switch (see Step 0) so the
rollout can stage warn → opt-in → default-on.

---

## Conventions

- **Source of truth for form state:** the existing
  [`FormReact`](../../src/components/Form/FormReact.tsx) +
  [`FormItem`](../../src/components/FormItem/FormItem.tsx) pair —
  per-field flags (`isDirty`, `invalidToValid`,
  `afterFirstDirtyBlur`) and the late-error model are described in
  [`form-infrastructure.md`](../../../.ai/xmlui/form-infrastructure.md).
  Nothing in the existing state model changes.
- **Source of truth for the named-validator table:**
  [`Validations.ts`](../../src/components/FormItem/Validations.ts).
  This file gains an exported registry plus the new built-ins.
- **Source of truth for server-call execution:**
  [`APICall`](../../src/components/APICall/APICall.tsx) and the
  underlying [`RestApiProxy`](../../src/components-core/RestApiProxy.ts).
  The 422 → per-field error mapping happens in `<Form>` reading the
  `APICall` rejection payload — no `RestApiProxy` change required
  beyond a stable rejection shape (already present).
- **Existing infrastructure to reuse — do not reinvent:**
  - The cooperative-concurrency plan's `handlerPolicy` and `$cancel`
    primitives are the substrate for `submitPolicy`. Forms do not
    invent their own cancellation token.
  - The structured-exception-model plan's `AppError` is the type the
    server-error mapping unwraps; a 422 → `AppError` with
    `category: "validation"` and `data.invalidParams: …`.
  - The verified-type-contracts plan's coercion table provides
    `length` / `integer` / `number` / `email` / `url` rules — the
    validator registry's built-ins delegate to it where they
    overlap.
- **New module location:**
  `xmlui/src/components-core/forms/` (new directory) for the
  registry, server-mapping helpers, and submit-guard shim.
  Existing form code stays in `xmlui/src/components/Form/` and
  `xmlui/src/components/FormItem/`.
- **Diagnostic shape:** new `FormDiagnostic` carrying
  `{ code: FormDiagnosticCode, severity: "error" | "warn",
  formId?, fieldName?, validatorName?, message, data? }` where
  `FormDiagnosticCode ∈ { "unknown-validator", "duplicate-validator",
  "server-error-unmapped", "submit-while-busy",
  "csrf-token-missing", "validator-throw" }`.
- **Reporting mode:** `kind: "forms"` trace entries in non-strict
  mode (warn). In strict mode, `unknown-validator`,
  `duplicate-validator`, and `validator-throw` upgrade to errors at
  registration / parse time.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/forms/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/forms/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Forms Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictForms: boolean` (default `false`;
  flips to `true` in the next major).
- Create `xmlui/src/components-core/forms/` with stubs:

  ```ts
  // diagnostics.ts
  export type FormDiagnosticCode =
    | "unknown-validator"
    | "duplicate-validator"
    | "server-error-unmapped"
    | "submit-while-busy"
    | "csrf-token-missing"
    | "validator-throw";
  export interface FormDiagnostic {
    code: FormDiagnosticCode;
    severity: "error" | "warn";
    formId?: string;
    fieldName?: string;
    validatorName?: string;
    message: string;
    data?: unknown;
  }
  ```

  ```ts
  // validator-registry.ts
  export type ValidatorFn = (
    value: unknown,
    ctx: { fieldName: string; formData: Record<string, unknown> },
  ) => string | null | undefined | Promise<string | null | undefined>;
  export interface ValidatorEntry {
    name: string;
    fn: ValidatorFn;
    defaultMessage: string;
    severity?: "error" | "warning";
  }
  export function registerValidator(entry: ValidatorEntry): void;
  export function lookupValidator(name: string): ValidatorEntry | undefined;
  ```

  ```ts
  // server-error-mapping.ts
  export interface InvalidParam { name: string; reason: string; code?: string }
  export interface ServerValidationProblem {
    type?: string;       // RFC 7807
    title?: string;
    status?: number;     // expected 400 or 422
    detail?: string;
    invalidParams?: InvalidParam[];
  }
  export function extractServerValidationProblem(error: unknown):
    ServerValidationProblem | undefined;
  ```

  ```ts
  // submit-guard.ts
  export type SubmitPolicy = "single-flight" | "queue" | "drop-while-running";
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"forms"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/forms/diagnostics.ts` (new)
- `xmlui/src/components-core/forms/validator-registry.ts` (new)
- `xmlui/src/components-core/forms/server-error-mapping.ts` (new)
- `xmlui/src/components-core/forms/submit-guard.ts` (new)
- `xmlui/src/components-core/forms/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `forms/validator-registry.test.ts` — registering and looking up a
  validator round-trips the entry; duplicate registration warns.

### Acceptance

- `strictForms` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Named Validator Registry

### Step 1.1 — Move Built-in Patterns Into the Registry

**Priority:** 1

#### Scope

- Refactor
  [`Validations.ts`](../../src/components/FormItem/Validations.ts)
  to populate the registry instead of using a `switch` on names.
  Each existing case (`email`, `phone`, `url`) becomes a
  `registerValidator()` call at module load.
- Add the standard-library validators:
  - `creditCard` — Luhn check.
  - `iban` — mod-97 check.
  - `isoDate` — strict ISO 8601.
  - `strongPassword` — min length 12, has upper, lower, digit,
    symbol; configurable via the validator entry's `data` slot.
  - `noLeadingTrailingWhitespace`.
  - `length(min, max)` — built as a parameterised validator factory
    (see Step 1.3).
- Backward-compatible: the existing `pattern="email"` syntax keeps
  working because it now resolves through the registry.

#### Files

- `xmlui/src/components/FormItem/Validations.ts`
- `xmlui/src/components-core/forms/validator-registry.ts` (logic)
- `xmlui/src/components-core/forms/builtins/` (new — one file per
  validator to keep them discoverable and tree-shakable)

#### Tests

- `forms/builtins/*.test.ts`, one per validator:
  - Positive cases pass.
  - Boundary cases (empty string, just-too-short, just-too-long)
    behave per spec.
  - Async validators (none in this set, but the test scaffolding
    is the same one Step 1.4 uses) resolve / reject correctly.

#### Acceptance

- All existing `FormItem.spec.ts` tests pass unchanged.
- `App.fetch`-style test pattern: any new validator can be replaced
  in tests via `registerValidator()` overrides without monkey-patching.

#### Dependencies

Step 0; verified-type-contracts plan Step 1.2 (the registry's
`email` / `url` validators delegate to the same coercion rules).

---

### Step 1.2 — `App.registerValidator()` Public API

**Priority:** 2

#### Scope

- Expose `App.registerValidator({ name, fn, defaultMessage,
  severity })` to user markup. Typical use:

  ```xmlui
  <App
    onReady="
      App.registerValidator({
        name: 'employeeId',
        fn: (v) => /^E\\d{6}$/.test(v) ? null : 'Must be E followed by 6 digits',
        defaultMessage: 'Invalid employee id',
      })">
    <Form>
      <FormItem bindTo="empId" validator="employeeId" />
    </Form>
  </App>
  ```

- Rename `FormItem.pattern` → `FormItem.validator`. Keep `pattern`
  as a deprecation alias that maps to `validator` and emits a
  one-shot warn via the
  [versioning plan](./versioning-deprecation.md) channel (or a
  simple `kind: "forms"` warn if that plan has not landed yet).
  Same for `patternInvalidMessage` → `validatorInvalidMessage`,
  `patternInvalidSeverity` → `validatorInvalidSeverity`.
- Validator names are global to the app. Duplicate registration
  emits `duplicate-validator` (warn in non-strict, error in strict).
- Looking up an unknown name at FormItem render emits
  `unknown-validator` with the offending name in the diagnostic
  payload.
- A validator function that throws produces `validator-throw` and
  is treated as an `error`-severity invalid result with the
  exception message as the field error.

#### Files

- `xmlui/src/components-core/AppContext.tsx` (expose
  `registerValidator`)
- `xmlui/src/components/FormItem/FormItem.tsx` (rename + alias)
- `xmlui/src/components/FormItem/FormItem.md` (doc the new name)
- `xmlui/src/components-core/forms/validator-registry.ts`

#### Tests

- `forms/validator-registry.test.ts`
  - Custom validator registered via `App.registerValidator` and
    referenced by `<FormItem validator="…">` invalidates as
    expected.
  - `pattern="email"` continues to work and emits a one-shot
    deprecation warn.
  - Registering twice with the same name warns / errors per mode.
  - Unknown name produces `unknown-validator`.
- `tests-e2e/forms/custom-validator.spec.ts` end-to-end smoke.

#### Acceptance

- All FormItem specs continue to pass (with the deprecation alias
  active).
- Documentation lists every built-in validator + a how-to for
  custom ones.

#### Dependencies

Step 1.1.

---

### Step 1.3 — Parameterised Validators

**Priority:** 3

#### Scope

- Allow validator references with parameters:

  ```xmlui
  <FormItem validator="length" validatorParams="{{ min: 5, max: 10 }}" />
  <FormItem validator="strongPassword" validatorParams="{{ minLength: 16 }}" />
  ```

- Parameters are passed to the validator `fn` via a third argument
  (extending `ValidatorFn` with an optional `params: unknown`).
- Multiple validators on one field via array:
  `validator="{['noLeadingTrailingWhitespace', 'email']}"`.

#### Files

- `xmlui/src/components-core/forms/validator-registry.ts`
- `xmlui/src/components/FormItem/FormItem.tsx`

#### Tests

- `forms/parameterised.test.ts` — `length` with `min: 5`
  invalidates `"abcd"` and accepts `"abcde"`.
- Multi-validator order: first failure wins; empty array is a
  no-op.

#### Acceptance

- `length` (and the existing `minLength` / `maxLength` props)
  produce identical behaviour for the same inputs.

#### Dependencies

Step 1.2.

---

### Step 1.4 — Async Validators with `$cancel`

**Priority:** 4

#### Scope

- Async validators (already supported via the `validate` handler
  prop) integrate with the
  [cooperative-concurrency plan](./cooperative-concurrency.md)
  `$cancel` token. When a field is re-edited before the previous
  async validation resolves, the in-flight one is cancelled.
- The validator entry's `fn` receives `ctx.signal: AbortSignal`
  via the third / context argument; rejecting the signal short-
  circuits the validation.

#### Files

- `xmlui/src/components-core/forms/validator-registry.ts`
- `xmlui/src/components/FormItem/FormItem.tsx` (effect that runs
  the async validator)

#### Tests

- `forms/async-validator.test.ts` — typing fast cancels the
  previous validation; the form does not display a stale error.
- `tests-e2e/forms/async-validator.spec.ts` — uniqueness check
  against a mock endpoint.

#### Acceptance

- No "stale error" flicker observable on any in-repo example.

#### Dependencies

Step 1.2; cooperative-concurrency plan Step 1.

---

## Phase 2 — Cross-Field Validation

### Step 2.1 — `<FormValidator>` Element

**Priority:** 5

#### Scope

- New `<FormValidator>` child of `<Form>`:

  ```xmlui
  <Form>
    <FormItem bindTo="password" type="password" />
    <FormItem bindTo="confirm" type="password" />
    <FormValidator
      bindTo="{['password', 'confirm']}"
      validate="
        (data) => data.password === data.confirm
          ? null
          : { confirm: 'Passwords do not match' }">
    </FormValidator>
  </Form>
  ```

- The validator function receives the full `formData` and returns
  either `null` (all listed fields valid) or a record mapping field
  name → error message.
- Errors produced by `<FormValidator>` are merged into per-field
  errors with the same severity model as field-level validators
  (`error` / `warning`).
- Multiple `<FormValidator>` elements compose; later ones see the
  errors from earlier ones (read-only).
- Async cross-field validation is supported (returns a `Promise`).

#### Files

- `xmlui/src/components/Form/FormValidator.tsx` (new component)
- `xmlui/src/components/Form/Form.tsx` (collect children, run
  validators on every form-data change)
- `xmlui/src/components/Form/FormReact.tsx` (merge cross-field
  errors into the per-field error map)

#### Tests

- `tests-e2e/forms/cross-field.spec.ts` — confirm-password worked
  example end-to-end.
- Unit: composing two FormValidators where the second depends on
  the first's output.

#### Acceptance

- Cross-field error appears on the named field with correct
  severity.
- Cross-field validation re-runs only when one of its `bindTo`
  fields changes (cheap dependency tracking).

#### Dependencies

Step 1.2.

---

## Phase 3 — Server-Error Mapping

### Step 3.1 — RFC 7807 Problem Details Integration

**Priority:** 6

#### Scope

- When `<Form>`'s submit handler (whether `<APICall>`-driven via
  `submitUrl`/`submitMethod` or a user-written handler) rejects
  with an
  [`AppError`](./structured-exception-model.md) whose
  `category === "validation"` and whose `data` carries an
  `invalidParams` array (RFC 7807), the form maps each entry to
  the matching `<FormItem>` automatically.
- `extractServerValidationProblem(error)` walks the rejection
  payload looking for any of:
  - RFC 7807 `invalid-params` member (preferred — RFC 9457).
  - Spring-style `errors: [{ field, defaultMessage }]`.
  - Laravel-style `errors: { fieldName: ["message"] }`.
  Each is normalised to `InvalidParam[]`.
- Unmapped fields (server reports a field that is not in the form)
  surface as a form-level error and emit
  `server-error-unmapped` (warn in non-strict, error in strict).
- A new `<Form onSubmitError>` event fires after the mapping so
  apps can post-process.

#### Files

- `xmlui/src/components-core/forms/server-error-mapping.ts`
- `xmlui/src/components/Form/Form.tsx`
- `xmlui/src/components/Form/FormReact.tsx`

#### Tests

- `forms/server-error-mapping.test.ts` — three fixtures (RFC 7807,
  Spring, Laravel) round-trip through `extractServerValidationProblem`.
- `tests-e2e/forms/server-422.spec.ts` — POST returns 422; per-
  field errors land on the right inputs without user code.

#### Acceptance

- Migration: an existing app catching the 422 and calling
  `setFieldError` by hand can delete that code.
- Unmapped fields produce a single visible toast plus a diagnostic.

#### Dependencies

Step 1.1; structured-exception-model plan (the `AppError` carrier).

---

## Phase 4 — Submission Guard

### Step 4.1 — Form `submitPolicy` and `busyOnSubmit`

**Priority:** 7

#### Scope

- New `<Form submitPolicy>` prop with values:
  - `single-flight` (default) — submit while in flight is dropped
    silently and emits `submit-while-busy` (warn).
  - `queue` — second submit waits for the first (same semantics
    as the cooperative-concurrency `handlerPolicy="queue"`).
  - `drop-while-running` — explicit alias of `single-flight` with
    an `onSubmitDropped` event.
- The default submit `<Button>` (rendered by `<Form>` when
  `<FormItem>`s do not provide their own) reads `Form.isBusy` and
  applies the cooperative-concurrency
  [`busyOnClick`](./cooperative-concurrency.md) behaviour
  automatically.
- `Form.cancel()` API and `$cancel` token threaded into the submit
  handler — same shape as the cooperative-concurrency primitive.

#### Files

- `xmlui/src/components/Form/Form.tsx`
- `xmlui/src/components/Form/FormReact.tsx`
- `xmlui/src/components-core/forms/submit-guard.ts`

#### Tests

- `forms/submit-policy.test.ts` — three policies, three test cases
  each (rapid double-click, slow server, cancellation).
- `tests-e2e/forms/double-submit.spec.ts` — clicking submit twice
  in 50 ms produces exactly one POST.

#### Acceptance

- All in-repo Form examples remain visually unchanged in the
  default `single-flight` mode.
- The double-submit-spam pattern called out in §9 is structurally
  prevented.

#### Dependencies

Step 0; cooperative-concurrency plan Steps 1 + 2 (`$cancel` and
`handlerPolicy`).

---

## Phase 5 — CSRF / Idempotency Surface

### Step 5.1 — `<Form csrfToken>` and `<Form idempotencyKey>`

**Priority:** 8

#### Scope

- New `<Form>` props:
  - `csrfToken` (string or `{$expr}`) — when set, the
    framework attaches the value as `X-CSRF-Token` (configurable
    header name via `App.appGlobals.csrfHeaderName`) to the
    underlying submit request, whether the submit goes through
    the built-in `<APICall>` path or a user-written handler that
    calls `App.fetch`.
  - `idempotencyKey` (string or `{$expr}`) — attached as
    `Idempotency-Key`; auto-generated UUIDv4 if the prop is
    `true`. Same idempotency key is reused for retries within one
    submit attempt (so retry policies do not duplicate orders).
- When `strictForms === true` and a `<Form>` posts to a non-`GET`
  endpoint without a `csrfToken`, emit `csrf-token-missing` (warn
  by default; configurable per-app via
  `App.appGlobals.requireFormCsrf: boolean`).
- Both headers are added at the
  [`RestApiProxy`](../../src/components-core/RestApiProxy.ts) seam
  for any request originating inside the submit handler — already
  the choke-point for `App.fetch`.

#### Files

- `xmlui/src/components/Form/Form.tsx`
- `xmlui/src/components-core/RestApiProxy.ts` (a per-request
  context-tagging hook; the value comes from the submitting
  `<Form>`)
- `xmlui/src/components-core/abstractions/standalone.ts`
  (document `csrfHeaderName`, `requireFormCsrf`)

#### Tests

- `tests-e2e/forms/csrf.spec.ts` — header is present on submit
  request; absent on a `GET` form; missing-token diagnostic fires
  when expected.
- `tests-e2e/forms/idempotency.spec.ts` — retry of one submit
  attempt reuses the same key; new attempt generates a new one.

#### Acceptance

- Migration: an app that adds the CSRF header in a custom
  `RestApiProxy` interceptor can delete it.
- The `<Form>` is the *only* place CSRF needs to be configured for
  form submissions — no per-`<APICall>` plumbing.

#### Dependencies

Step 0.

---

## Phase 6 — Documentation & Strict Default

### Step 6.1 — Forms Sandbox Chapter

**Priority:** 9

#### Scope

- New `xmlui/dev-docs/guide/32-forms-validation.md` chapter.
- Updates
  [`form-infrastructure.md`](../../../.ai/xmlui/form-infrastructure.md)
  with the registry, cross-field validators, server-error
  mapping, submit policy, and CSRF surface.
- Updates [`managed-react.md` §9](../managed-react.md):
  - Mark "No built-in validators" as outdated; cite the registry.
  - Mark "No server-validation contract" as resolved; cite the
    `invalid-params` mapping.
  - Mark "No automatic submission guard" as resolved; cite
    `submitPolicy`.
  - Mark "No CSRF binding to forms" as resolved; cite
    `<Form csrfToken>`.
- Updates the §17 scorecard row from
  *"State strong, validators absent"* to
  *"Sealed — registry, cross-field validators, RFC 7807 mapping,
  single-flight submit, CSRF/idempotency."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/32-forms-validation.md` (new)
- `.ai/xmlui/form-infrastructure.md`
- `xmlui/dev-docs/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter covers each of the five mechanisms with at least one
  worked example, plus a migration section for the four §9 gaps.
- A "rule reference" table lists every `FormDiagnosticCode` with
  cause, severity in non-strict / strict, example fix.

#### Dependencies

Steps 1–5.

---

### Step 6.2 — Default `strictForms: true` in Next Major

**Priority:** 10 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default in the next major release: `strictForms: true`.
- Effects under strict mode:
  - `unknown-validator` → error at parse time.
  - `duplicate-validator` → error at registration.
  - `validator-throw` → error.
  - `pattern` deprecation alias → error (use `validator`).
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-forms-default.md`
- `xmlui/dev-docs/guide/32-forms-validation.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/forms/strict-mode.spec.ts` covers each
  diagnostic code under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  forms.

#### Dependencies

Step 6.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0, 1.1 | Validator registry; built-ins moved over; behaviour identical | Next minor |
| **Public registry API** | 1.2, 1.3 | `App.registerValidator`, parameterised + multi-validator; `pattern` → `validator` rename with alias | Next minor + 1 |
| **Async cancellation** | 1.4 | Async validators cancel on re-edit | Next minor + 1 |
| **Cross-field** | 2.1 | `<FormValidator>` ships | Next minor + 2 |
| **Server-error mapping** | 3.1 | 422 → per-field errors automatic | Next minor + 2 |
| **Submit guard** | 4.1 | `submitPolicy` + busy submit button | Next minor + 3 |
| **CSRF / idempotency** | 5.1 | `csrfToken` + `idempotencyKey` props | Next minor + 3 |
| **Docs + strict default** | 6.1, 6.2 | Guide chapter; strict default in next major | Next major |

Each step is independently revertible by removing its component or
the corresponding registration, with no data loss in the form
state model (which is unchanged throughout).

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (move built-ins to registry)
   │      │
   │      ├─> Step 1.2 (App.registerValidator + rename)
   │      │      │
   │      │      ├─> Step 1.3 (parameterised + multi)
   │      │      │
   │      │      ├─> Step 1.4 (async + $cancel)        ← cooperative-concurrency Step 1
   │      │      │
   │      │      └─> Step 2.1 (<FormValidator>)
   │      │
   │      └─> Step 3.1 (server-error mapping)          ← structured-exception-model
   │
   ├─> Step 4.1 (submitPolicy + busy)                  ← cooperative-concurrency Steps 1 + 2
   │
   └─> Step 5.1 (csrfToken + idempotencyKey)
                        │
                        ▼
                  Step 6.1 (docs)
                        │
                        └─> Step 6.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Rename `pattern` → `validator`, keep `pattern` as a one-shot-warn
   deprecation alias.** Today `pattern` accepts named patterns and
   would imply "regex" to most readers; `validator` matches the
   broader registry vocabulary. Alternative considered: keep
   `pattern` and add `validator` as a parallel prop — rejected
   because two props doing the same thing is exactly the kind of
   surface XMLUI tries to avoid, and the deprecation channel
   established by the [versioning plan](./versioning-deprecation.md)
   makes the rename safe.

2. **Validator registry is global, not per-form.** Forms are usually
   composed across pages and reusing a named validator across them
   is the common case. Alternative considered: per-form scope —
   rejected because it forces re-registration boilerplate at every
   `<Form>` site for the common case, and the strict-mode
   `duplicate-validator` diagnostic catches accidental name
   collisions.

3. **Validator parameters are passed via `validatorParams`, not
   stringly-typed in the validator name.** `length(5,10)` would
   require a parser inside the registry; `validatorParams="{{ min:
   5, max: 10 }}"` is plain markup with a typed object. Same
   pattern the [structured-exception-model](./structured-exception-model.md)
   plan uses for `<RetryPolicy maxAttempts>`.

4. **Cross-field validators are a separate `<FormValidator>` child,
   not a prop on `<Form>`.** Allows multiple cross-field rules to
   compose declaratively (each with its own `bindTo`), and avoids
   stuffing a function-returning-record-of-errors into a prop.
   Alternative considered: `<Form crossValidate>` prop — rejected
   for poor composability when more than one rule exists.

5. **Server-error mapping reads RFC 7807 first; falls back to two
   common framework shapes.** Walking the rejection payload through
   a small set of shape detectors covers the realistic majority
   without making the user adopt a new server convention.
   Alternative considered: require RFC 7807 strictly — rejected
   because it would force a server-side change for adoption.

6. **`submitPolicy` reuses the cooperative-concurrency
   `handlerPolicy` machinery.** Avoids two parallel cancellation
   models. Alternative considered: a forms-only mutex — rejected
   because it would not propagate `$cancel` consistently with the
   rest of the framework.

7. **CSRF binding lives on `<Form>`, not on `<APICall>`.** Forms are
   the natural unit of "one user-initiated mutation"; `<APICall>`
   may be used for many non-form purposes. Apps that want CSRF on
   non-form `<APICall>`s wire it through `App.fetch` directly.
   Alternative considered: a global `App.appGlobals.csrfToken` —
   rejected because it leaks the token to every request, including
   ones to third-party origins (the
   [DOM-API hardening plan](./dom-api-hardening.md) `allowedOrigins`
   list mitigates but does not eliminate the leak).

8. **`idempotencyKey` is per-submit-attempt, not per-retry.** Retry
   of a failed submit reuses the key (so the server can dedupe);
   a fresh user-initiated submit gets a new key. Standard
   idempotency-key pattern (Stripe, GitHub). Alternative
   considered: per-request — rejected because it defeats the
   point.

9. **Async validators use the cooperative-concurrency `$cancel`
   token.** Same cancellation contract as event handlers, no new
   primitive. Alternative considered: validator-specific
   `AbortController` — rejected to keep the framework's
   cancellation surface uniform.

10. **`strictForms` default flip waits for a major.** Same rationale
    as the other plans — the warn-mode telemetry window is needed
    before failing on `pattern` usage and on missing CSRF tokens.

---

## Out of Scope

- **Form-level schema validation (Zod / Yup / JSON Schema).**
  Composing the validator registry with a schema is a future
  feature; this plan keeps the registry aligned with the existing
  per-field model. A future plan can add `<Form schema={…}>` once
  the registry is stable.
- **Conditional / dependent fields (show field B only if A === X).**
  Already expressible with `when` props on `<FormItem>`; not a
  validation concern.
- **Multi-step / wizard forms.** Composition primitive, not a
  validation primitive; future plan if demand surfaces.
- **File-upload validation (size, mime type).** Belongs to the
  existing `<FileInput>` / `<FileUploadDropZone>` components, not
  to the generic validator registry.
- **Server-side rendering of validation errors.** XMLUI is a
  client-rendered framework; SSR is a separate effort.
- **Localised default messages.** Owned by the i18n plan
  (`String externalisation, ICU plurals, RTL guarantees` row in
  §17). The validator registry's `defaultMessage` accepts a
  translation key in the future without API change.
- **Theming of validation feedback.** Owned by the
  [sealed-theming-sandbox plan](./sealed-theming-sandbox.md).
