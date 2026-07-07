# Show validation progress in the Save button

Use `savePendingLabel` and `submitFeedbackDelay` on `Form` to keep users informed while slow field validators are running.

When a field's `onValidate` handler performs a slow check, the form automatically disables the Submit button until every field is ready. Two additional props let you sharpen the experience:

- **`savePendingLabel`** - the text shown on the Submit button while validation is still running (default: `"Validating..."`).
- **`submitFeedbackDelay`** - how many milliseconds to wait before switching the button label, so checks that finish quickly do not cause a distracting flash (default: `100`).

The example below asks a server whether a chosen domain name is already registered. While that check is running, the Save button shows "Checking domain..." and stays disabled. Once the check finishes, `validationDisplayDelay` ensures the result is shown immediately, without requiring the user to click away from the field.

```xmlui-pg copy display name="Save button feedback during slow validation"
<App>
  <Form
    data="{{ companyName: '', domain: '' }}"
    savePendingLabel="Checking domain..."
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
          ? value + ' is already registered. Please choose another.'
          : null;
      }"
      placeholder="e.g. acme.com (domain starting with Q is taken)"
    />
  </Form>
</App>
```

## Key points

**The Save button is disabled automatically while a slow validator is running**: XMLUI tracks each field's validation state. As soon as a field check starts, the field enters a checking state. The Submit button stays disabled until every field has finished validation. This prevents submitting data that is still being verified.

**`savePendingLabel` tells users why the button is disabled**: Without it the button is simply greyed out. With it, users see an actionable message. Pick a label that matches what your check does:

```xmlui
<Form
  savePendingLabel="Verifying email..."
  saveLabel="Create account"
  ...
>
```

**`submitFeedbackDelay` prevents a distracting label flash**: If a check finishes almost immediately, switching the button label and then back again would be jarring. The delay threshold (default `100` ms) means the `savePendingLabel` only appears when the check takes a noticeable amount of time:

```xmlui
<Form
  savePendingLabel="Checking..."
  submitFeedbackDelay="200"
  ...
>
```

**`savePendingLabel` and `saveInProgressLabel` cover different phases**: The Save button has three distinct states. The same `submitFeedbackDelay` applies to both progress labels:

| Phase | Button label shown |
|---|---|
| Idle / ready | `saveLabel` (default: `"Save"`) |
| Field validation running | `savePendingLabel` (default: `"Validating..."`) |
| Form submission in progress | `saveInProgressLabel` (default: `"Saving..."`) |

**`validationDisplayDelay` shows the result without requiring a blur**: By default, the `errorLate` validation mode waits for the field to lose focus before revealing an error. This is fine for instant validators, but for a check that takes a full second, the user has no feedback after the check completes unless they click away first.

Setting `validationDisplayDelay` (in milliseconds) on the field starts a timer when a slow check begins. If the check takes longer than that threshold, XMLUI reveals the result as soon as it is available, even if the field is still focused. The domain field above uses `validationDisplayDelay="600"` with a 1s check, so the error appears during the same interaction rather than waiting for blur:

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

**`customValidationsDebounce` keeps server traffic low**: Without a debounce, `onValidate` fires on every keystroke. A value of 300-500 ms ensures the API is called only after the user pauses:

```xmlui
<TextBox
  bindTo="domain"
  customValidationsDebounce="400"
  onValidate="(value) => {
    delay(800);
    return isTaken(value) ? value + ' is already registered' : null;
  }"
/>
```

Built-in validators (`required`, `minLength`, `pattern`, etc.) are not affected; they always run immediately.

**Programmatically trigger validation with `Form.validate()`**: The `validate()` method runs all field validators without submitting the form. Use it when a workflow needs to check the current section before moving forward:

```xmlui
<Form id="myForm" ...>
  <TextBox bindTo="email" onValidate="(value) => checkEmail(value)" />
  <Button
    label="Check fields"
    onClick="myForm.validate()"
  />
</Form>
```

This is useful for multi-step forms that must show field feedback before advancing to the next section.

---

## See also

- [Show validation on blur, not on type](/docs/howto/show-validation-on-blur-not-on-type) - `customValidationsDebounce` in depth
- [Validate a field inline with onValidate](/docs/howto/validate-a-field-inline-with-onvalidate) - writing custom field validators
- [Use built-in form validation](/docs/howto/use-built-in-form-validation) - declarative validation props such as `required`, `minLength`, and `pattern`
