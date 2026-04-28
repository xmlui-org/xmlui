# Validate dependent fields together

Use `onWillSubmit` to cross-validate fields at submit time, or `onValidate` on an input component when the user needs an inline field error.

A registration form has a Password field and a Confirm Password field. The form must not submit, and the user must see a clear error, when the two values disagree.

The submit-time pattern uses `onWillSubmit` because it receives both `data` and `allData`. `data` is the payload that will be submitted, with `noSubmit` fields removed. `allData` still includes every form field, so it is the right argument to read when a helper field such as Confirm Password has `noSubmit="true"`.

## Validate before submit

Use this pattern when the user can finish the form first and see the mismatch when they press Save.

```xmlui-pg copy display name="Cross-field password validation"
<App>
  <Form
    data="{{ username: '', password: '', confirmPassword: '' }}"
    onWillSubmit="(data, allData) => {
      if (allData.password !== allData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }"
    onSubmit="(data) => toast.success('Account created for ' + data.username)"
    saveLabel="Create account"
  >
    <TextBox label="Username" bindTo="username" required="true" />
    <PasswordInput label="Password" bindTo="password" required="true" />
    <PasswordInput
      label="Confirm Password"
      bindTo="confirmPassword"
      required="true"
      noSubmit="true"
    />
  </Form>
</App>
```

## Validate inline

Use this pattern when the Confirm Password field should show its own validation message during editing.

```xmlui-pg copy display name="Inline password match validation"
<App>
  <Form
    var.pwd="{''}"
    data="{{ username: '', password: '', confirmPassword: '' }}"
    onSubmit="(data) => toast.success('Account created for ' + data.username)"
    saveLabel="Create account"
  >
    <TextBox label="Username" bindTo="username" required="true" />
    <PasswordInput
      label="Password"
      bindTo="password"
      required="true"
      onDidChange="(v) => { pwd = v; }"
    />
    <PasswordInput
      label="Confirm Password"
      bindTo="confirmPassword"
      required="true"
      noSubmit="true"
      onValidate="(v) => v !== pwd ? 'Passwords do not match' : null"
    />
  </Form>
</App>
```

## Key points

**Choose the approach by where the user should see the error**: Use `onWillSubmit` when the rule only needs to run before saving, when the message can be a toast or form-level error, or when the check depends on fields that are excluded from the payload with `noSubmit`. Use `onValidate` when the dependent field itself should show the error while the user is filling out the form.

**`onWillSubmit` - gate submission with cross-field logic**: The handler receives two arguments: `data` (the form payload without `noSubmit` fields) and `allData` (all form fields including `noSubmit` ones). Return `false` to abort; return nothing to proceed with the original payload. This is the right place for multi-field checks that cannot be expressed per-field. Use `allData` when you need to inspect helper fields that should not be submitted.

**`noSubmit="true"` on the helper field**: The Confirm Password field is only for validation - it should not appear in the submitted data. Set `noSubmit="true"` so the framework strips it from the payload before calling `onSubmit`.

**`onValidate` for immediate inline feedback**: Use `onValidate` on the dependent field to show the mismatch error inline based on the chosen [validation mode](/docs/behaviors#validation). The handler receives only the current field value, so store the reference password in a shared variable with `onDidChange` and compare against that variable.

**`onValidate` return value**: Return a non-empty string to show as the error message; return `null`, `undefined`, or nothing to signal the field is valid. The string appears below the field using the same styling as built-in validation errors.

**Keep transformation separate from validation**: `onWillSubmit` can also return a modified payload, but that is a separate use case. See [Transform form data before submission](/docs/howto/transform-form-data-before-submission) for examples that reshape submitted data.

---

## See also

- [Form component](/docs/reference/components/Form) - `onWillSubmit`, `onSubmit`, and `data`
- [TextBox component](/docs/reference/components/TextBox) - `onValidate`, `noSubmit`, and built-in validators
- [PasswordInput component](/docs/reference/components/PasswordInput) - password field with the same validation API
- [Handle Form willSubmit return values](/docs/howto/handle-form-willsubmit-return-values) - full return-value reference
- [Transform form data before submission](/docs/howto/transform-form-data-before-submission) - reshaping submitted data with `onWillSubmit`
