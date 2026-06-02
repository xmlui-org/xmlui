# Forms Validation & Submission Discipline

XMLUI forms ship with the per-field state model (`isDirty`, late-error
display, validation results) you already use plus a discipline layer
that closes the gaps a hand-rolled form usually leaves open: a named
validator registry you can extend, cross-field validators, an
automatic mapping from a server's 422 response to per-field errors,
and a submission guard that prevents double-submit. You write
`<FormItem validator="email">` or `<FormValidator>` and the framework
takes care of running, cancelling, and surfacing errors uniformly.

## What problems this prevents

- A custom regex copy-pasted into every email field can drift between
  forms; `<FormItem validator="email">` (and the other built-ins
  `phone`, `url`, `creditCard`, `iban`, `isoDate`, `strongPassword`,
  `noLeadingTrailingWhitespace`, `length`) gives every form the same
  rule with the same message.
- "Passwords must match" / "end date must be after start date" rules
  no longer require a hand-written `useEffect` outside the form's
  state model. A `<FormValidator>` child names the participating
  fields and returns the per-field errors; they merge into the same
  validation surface as field-level rules.
- A server that returns `422 Unprocessable Entity` with an RFC 7807
  `invalid-params` payload (or the Spring / Laravel equivalents) is
  unpacked automatically: the per-field errors land on the matching
  `<FormItem>` without bespoke `try`/`catch` boilerplate around the
  submit handler.
- Double-clicking the submit button no longer produces two POSTs.
  `<Form>`'s default `submitPolicy="single-flight"` drops the second
  click and emits a diagnostic; `drop-while-running` lets the app
  react via `submitDropped`.
- A slow submit is no longer un-cancellable. `Form.cancel()` aborts
  the in-flight submit and the framework's cooperative-concurrency
  `$cancel` token short-circuits async validators when the user
  re-edits a field before the previous validation resolves — no
  stale-error flicker.
- Typos like `<FormItem validator="emial">` no longer fail silently;
  the framework emits `unknown-validator` with the offending name in
  the trace. A custom validator that throws produces
  `validator-throw` instead of a silent green check.

## How it works

`<FormItem>` looks up its `validator` (a name or array of names) in
the global registry that the framework primes with the built-ins on
first use. `App.registerValidator()` adds your own. When a field
changes the registered function runs with the field value and the
full `formData`; async validators receive a `ctx.signal` that aborts
on re-edit. `<FormValidator>` is a non-visual child of `<Form>` that
runs after the per-field pass and returns a `{ fieldName: message }`
record merged into the same validation results. On submit, `<Form>`'s
guard consults `submitPolicy` before invoking the handler; if the
handler rejects, the catch path walks the rejection payload through
`extractServerValidationProblem` (RFC 7807 → Spring → Laravel → the
XMLUI legacy shape) and routes each entry back to its `<FormItem>`.

## Built-in validators

| Name | Validates | Parameters |
|---|---|---|
| `required` | Value is not empty / null / undefined | — |
| `email` | RFC 5322-style email address | — |
| `phone` | Permissive international phone format | — |
| `url` | Absolute HTTP/HTTPS URL | — |
| `creditCard` | Passes the Luhn checksum | — |
| `iban` | Passes the mod-97 IBAN check | — |
| `isoDate` | Strict ISO 8601 date | — |
| `length` | String length within bounds | `{ min?, max? }` |
| `strongPassword` | Length + upper/lower/digit/symbol | `{ minLength? }` |
| `noLeadingTrailingWhitespace` | No leading/trailing whitespace | — |

```xmlui
<Form>
    <FormItem bindTo="email" validator="email" />
    <FormItem bindTo="password" type="password" validator="strongPassword" />
    <FormItem
        bindTo="username"
        validator="length"
        validatorParams="{{ min: 3, max: 20 }}"
    />
    <FormItem
        bindTo="bio"
        validator="{['noLeadingTrailingWhitespace', 'length']}"
        validatorParams="{{ max: 280 }}"
    />
</Form>
```

The legacy `pattern` / `patternInvalidMessage` /
`patternInvalidSeverity` props still work as aliases for `validator` /
`validatorInvalidMessage` / `validatorInvalidSeverity` and emit a
one-shot `deprecated-alias` warn. Migrate at your convenience.

## Registering custom validators

```xmlui
<App
    onReady="
        App.registerValidator({
            name: 'employeeId',
            fn: (v) => /^E\d{6}$/.test(v) ? null : 'Must be E followed by 6 digits',
            defaultMessage: 'Invalid employee id',
        });
    "
>
    <Form>
        <FormItem bindTo="empId" validator="employeeId" />
    </Form>
</App>
```

Validator names are global to the app. Registering the same name
twice emits `duplicate-validator` (the new entry wins so hot reload
and test overrides behave predictably). The validator's `fn` may
return a `Promise`; if a fresh keystroke arrives before it resolves
the framework aborts the previous run via `ctx.signal`.

## Cross-field validation

```xmlui
<Form>
    <FormItem bindTo="password" type="password" validator="strongPassword" />
    <FormItem bindTo="confirm" type="password" />
    <FormValidator
        bindTo="{['password', 'confirm']}"
        validate="
            (data) => data.password === data.confirm
                ? null
                : { confirm: 'Passwords do not match' }
        "
    />
</Form>
```

`<FormValidator>` runs whenever any of its `bindTo` fields change.
Return `null` (or an empty object) for "all valid"; return a
`{ fieldName: message }` record to mark fields invalid with the same
late-error display rules as per-field validators. Multiple
`<FormValidator>` children compose; return a Promise for async cross-
field rules.

## Server-error mapping

When the submit handler rejects (whether the form posts through a
built-in `<APICall>` or a user-written `onSubmit`), the framework
inspects the rejection payload for any of:

- RFC 7807 `invalid-params: [{ name, reason }]`
- Spring's `errors: [{ field, defaultMessage }]`
- Laravel's `errors: { fieldName: ["message"] }`
- The XMLUI legacy `GenericBackendError.details.issues` shape

Each entry routes to the matching `<FormItem>` automatically. Fields
the server names that the form does not contain emit
`server-error-unmapped`. The new `submitError(error, problem)` event
fires after the mapping, so apps can post-process or surface a
general-purpose message.

```xmlui
<Form
    submitUrl="/api/users"
    submitMethod="POST"
    onSubmitError="(error, problem) => problem ? null : toast(error.message)"
>
    <FormItem bindTo="email" validator="email" />
    <FormItem bindTo="displayName" validator="length" validatorParams="{{ max: 64 }}" />
</Form>
```

A server response like
`{ "type": "...", "title": "Validation failed", "invalid-params": [{ "name": "email", "reason": "Already registered" }] }`
makes "Already registered" appear under the `email` field without
any handler code.

## Submission guard

`<Form submitPolicy>` controls what happens when a second submit
arrives while the first is still running:

| Value | Behaviour |
|---|---|
| `single-flight` (default) | Drop the extra submit silently and emit `submit-while-busy` |
| `drop-while-running` | Same as `single-flight` plus fires the `submitDropped(reason)` event |
| `queue` | Reserved for a future cooperative scheduler — currently behaves like `single-flight` |

`Form.cancel()` aborts the in-flight submit; handlers that observe
the cooperative `$cancel` token (see
[Cooperative Concurrency](/docs/managed-react/cooperative-concurrency))
short-circuit immediately, otherwise the cancellation is best-effort.

## CSRF and idempotency

`<Form>` carries two reactive props that the built-in submit handler
forwards as HTTP headers — no handler code required:

| Prop | Default header | Override |
|---|---|---|
| `csrfToken` | `X-CSRF-Token` | `appGlobals.csrfHeaderName` |
| `idempotencyKey` | `Idempotency-Key` | `appGlobals.idempotencyHeaderName` |

```xmlui
<Form
    submitUrl="/api/orders"
    submitMethod="POST"
    csrfToken="{appState.csrfToken}"
    idempotencyKey="{$id}-attempt-1">
    <FormItem bindTo="quantity" />
</Form>
```

Setting either prop adds the corresponding header to the generated
`Actions.callApi` request. Both values are evaluated reactively, so
rotating the CSRF token in app state re-renders without losing form
data.

Custom `onSubmit` handlers read the same values through three
context variables:

- `$formCsrfToken` — the literal `csrfToken` prop value (or `null`)
- `$formIdempotencyKey` — the literal `idempotencyKey` prop value
- `$formHeaders` — the assembled `{ "X-CSRF-Token": "…", … }` map,
  or `undefined` when both are empty
- `$formCancel.signal` — the per-attempt `AbortSignal` (same one
  `Form.cancel()` aborts), so a custom handler can pass it to `fetch`
  or `Actions.callApi`

```xmlui
<Form onSubmit="(data) => Actions.callApi({
    url: '/api/orders',
    method: 'POST',
    body: data,
    headers: $formHeaders,
    signal: $formCancel.signal })">
    <FormItem bindTo="quantity" />
</Form>
```

### Enforcing CSRF policy

Set `appGlobals.requireFormCsrf = true` to require every mutating
form (anything other than GET / HEAD) to supply a `csrfToken`.
Forms that don't emit `csrf-token-missing` at `warn` severity, or
`error` when `strictForms` is also on.

## Diagnostic codes

All diagnostics emit on the `kind: "forms"` trace channel.

| Code | When it fires | Default | Strict |
|---|---|---|---|
| `unknown-validator` | `<FormItem validator="…">` names a validator that is not registered. | warn | error |
| `duplicate-validator` | Two registrations share a name; the new entry overwrites the old. | warn | error |
| `validator-throw` | A validator `fn` (field-level or cross-field) threw. The field is marked invalid with the exception message. | warn | error |
| `server-error-unmapped` | The server reported an error against a field the form does not contain. | warn | error |
| `submit-while-busy` | The `submitPolicy` rejected a second submit attempt. | warn | warn |
| `csrf-token-missing` | A mutating form (non-GET/HEAD) submits without a `csrfToken` prop while `appGlobals.requireFormCsrf` or `strictForms` is set. | warn | error |
| `deprecated-alias` | Markup uses `pattern` / `patternInvalidMessage` / `patternInvalidSeverity`; use `validator` / `validatorInvalidMessage` / `validatorInvalidSeverity` instead. | warn | warn |

## Enabling strict mode

```json
{
    "appGlobals": {
        "strictForms": true
    }
}
```

When `strictForms === true`:

- `unknown-validator`, `duplicate-validator`, `validator-throw`, and
  `server-error-unmapped` escalate from `warn` to `error`. They emit
  `console.error` and route through `App.signError` so they surface on
  the global error channel alongside other framework errors.
- The validator registry refuses to overwrite an existing name — the
  registration throws instead of warning.

`submit-while-busy` and the `deprecated-alias` notices stay at `warn`
in strict mode: the first is the expected outcome of
`single-flight`, the second is a migration nudge that should not
break running apps.

The default for `strictForms` is `false` during the rollout window so
that you can audit the diagnostics before failing on them. The
default flips to `true` in the next major release.

## Related

- [`Form`](/docs/components/Form) — the underlying component reference
  with every prop, event, and method.
- [`FormItem`](/docs/components/FormItem) — the field wrapper with the
  `validator`, `validatorParams`, and severity props.
- [Cooperative Concurrency](/docs/managed-react/cooperative-concurrency)
  — the `$cancel` token + `handlerPolicy` machinery that
  `submitPolicy` and async validators ride on.
- [Structured Exception Model](/docs/managed-react/structured-exception-model)
  — the `AppError` carrier whose `category: "validation"` payload the
  server-error mapping unwraps.
