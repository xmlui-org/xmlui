# Show validation progress in the Save button

Use `savePendingLabel` and `submitFeedbackDelay` on `Form` to keep users informed while slow async field validators are running.

When a field's `async onValidate` handler makes a network call, the form automatically disables the Submit button until every pending check has resolved. Two additional props let you sharpen the experience:

- **`savePendingLabel`** — the text shown on the Submit button while validation is still in-flight (default: `"Validating..."`).
- **`submitFeedbackDelay`** — how many milliseconds to wait before switching the button label, so checks that finish quickly don't cause a distracting flash (default: `100`).

The example below asks a server whether a chosen domain name is already registered. While the async `onValidate` promise is pending, the Save button shows "Checking domain…" and stays disabled. Once the promise resolves, `validationDisplayDelay` ensures the result is shown immediately — without requiring the user to click away from the field.

```xmlui-pg copy display name="Save button feedback during async validation"
---app display
<App>
  <Form
    data="{{ companyName: '', domain: '' }}"
    savePendingLabel="Checking domain…"
    submitFeedbackDelay="150"
    saveLabel="Register"
    onSubmit="(data) => toast('Registered: ' + data.domain)"
  >
    <TextBox label="Company name" bindTo="companyName" required="true" />
    <TextBox
      label="Company domain"
      bindTo="domain"
      required="true"
      customValidationsDebounce="500"
      validationDisplayDelay="600"
      onValidate="(value) => {
        if (!value) return null;
        delay(1000);
        return value.startsWith('Q')
          ? '\u201c' + value + '\u201d is already registered. Please choose another.'
          : null;
      }"
      placeholder="e.g. acme.com (domain starting with Q is taken)"
    />
  </Form>
</App>
```

## Key points

**The Save button is disabled automatically while any async validator is in-flight**: XMLUI tracks each field's validation state. As soon as an `async onValidate` handler starts, the field enters a *pending* state. The Submit button stays disabled until every pending promise has settled. This prevents submitting data that is currently being verified.

**`savePendingLabel` tells users why the button is disabled**: Without it the button is simply greyed out — with it, users see an actionable message. Pick a label that matches what your check does:

```xmlui
<Form
  savePendingLabel="Verifying email…"
  saveLabel="Create account"
  ...
>
```

**`submitFeedbackDelay` prevents a distracting label flash**: If an async check resolves in 60 ms, switching the button label and then back again would be jarring. The delay threshold (default `100` ms) means the `savePendingLabel` only appears when the check actually takes a noticeable amount of time:

```xmlui
<Form
  savePendingLabel="Checking…"
  submitFeedbackDelay="200"
  ...
>
```

**`savePendingLabel` and `saveInProgressLabel` cover different phases**: The Save button has three distinct states. The same `submitFeedbackDelay` applies to both in-flight labels:

| Phase | Button label shown |
|---|---|
| Idle / ready | `saveLabel` (default: `"Save"`) |
| Async field validation running | `savePendingLabel` (default: `"Validating..."`) |
| Form submission in progress | `saveInProgressLabel` (default: `"Saving..."`) |

**`validationDisplayDelay` shows the result without requiring a blur**: By default, the `errorLate` validation mode waits for the field to lose focus before revealing an error. This is fine for instant validators, but for an async check that takes a full second, the user has no feedback after the check completes — they must click away first.

Setting `validationDisplayDelay` (in milliseconds) on the field starts a timer the moment a slow async check begins. If the check takes longer than that threshold, XMLUI reveals the result immediately once the promise settles — even if the field is still focused. The domain field above uses `validationDisplayDelay="600"` with a 1 s check, so the error appears roughly 600 ms into the wait, right after the check resolves:

```xmlui
<TextBox
  bindTo="domain"
  customValidationsDebounce="500"
  validationDisplayDelay="600"
  onValidate="(value) => {
    delay(1000);
    return isTaken(value) ? value + ' is already registered' : null;
  }"
/>
```

Set `validationDisplayDelay="0"` to disable the early-reveal behaviour and rely solely on blur.

**`customValidationsDebounce` keeps server traffic low**: Without a debounce, `onValidate` fires on every keystroke. A value of 300–500 ms ensures the API is called only after the user pauses:

```xmlui
<TextBox
  bindTo="domain"
  customValidationsDebounce="400"
  onValidate="async (value) => { /* API call */ }"
/>
```

Built-in validators (`required`, `minLength`, `pattern`, etc.) are not affected — they always run immediately.

**Programmatically trigger validation with `Form.validate()`**: The `validate()` method runs all field validators without submitting the form. It returns a promise that resolves once every async check has settled:

```xmlui
<Form id="myForm" ...>
  <TextBox bindTo="email" onValidate="async (v) => checkEmail(v)" />
  <Button
    label="Check fields"
    onClick="async () => {
      const result = await myForm.validate();
      if (result.isValid) {
        toast('All fields are valid');
      } else {
        toast(result.errors.length + ' error(s) found');
      }
    }"
  />
</Form>
```

The returned object contains `isValid`, `data` (cleaned, ready-to-submit values), `errors`, `warnings`, and the full `validationResults` map. This is useful for multi-step forms that must validate one section before advancing.

---

## See also

- [Add an async uniqueness check](/docs/howto/add-an-async-uniqueness-check) — full async `onValidate` example with an API mock
- [Show validation on blur, not on type](/docs/howto/show-validation-on-blur-not-on-type) — `customValidationsDebounce` in depth
- [Validate a field inline with onValidate](/docs/howto/validate-a-field-inline-with-onvalidate) — writing synchronous custom validators
