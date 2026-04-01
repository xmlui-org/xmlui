# Validate dependent fields together

Use onWillSubmit to cross-validate two fields before submission, or onValidate on the input component to show an inline error.

A registration form has a Password field and a Confirm Password field. The form must not submit, and the user must see a clear error, when the two values disagree. `onWillSubmit` intercepts the data just before submission — returning `false` cancels it. For instant feedback as the user types, `onValidate` on the dependent field achieves the same check at the field level.

```xmlui-pg copy display name="Cross-field password validation"
---app display
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

## Key points

**`onWillSubmit` — gate submission with cross-field logic**: The handler receives two arguments: `data` (the form payload without noSubmit fields) and `allData` (all form fields including noSubmit ones). Return `false` to abort; return nothing (or the same object) to proceed. This is the right place for multi-field checks that cannot be expressed per-field. Use `allData` when you need to inspect noSubmit fields for validation:

```xmlui
<Form
  onWillSubmit="(data, allData) => {
    if (allData.password !== allData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
  }"
  onSubmit="(data) => saveUser(data)"
>
  <PasswordInput bindTo="password" />
  <PasswordInput bindTo="confirmPassword" noSubmit="true" />
</Form>
```

**`noSubmit="true"` on the helper field**: The Confirm Password field is only for validation — it should not appear in the submitted data. Set `noSubmit="true"` so the framework strips it from the payload before calling `onSubmit`.

**`onValidate` for immediate inline feedback**: Use `onValidate` on the dependent field to show the mismatch error inline as soon as the field loses focus. Store the reference password in a variable and compare in the handler:

```xmlui
<Form var.pwd="{''}" data="{{ password: '', confirmPassword: '' }}">
  <PasswordInput
    label="Password"
    bindTo="password"
    onValidate="(v) => { pwd = v; }"
  />
  <PasswordInput
    label="Confirm Password"
    bindTo="confirmPassword"
    noSubmit="true"
    onValidate="(v) => v !== pwd ? 'Passwords do not match' : null"
  />
</Form>
```

**`onValidate` return value**: Return a non-empty string to show as the error message; return `null`, `undefined`, or nothing to signal the field is valid. The string appears below the field using the same styling as built-in validation errors.

**`onWillSubmit` can transform the data**: Instead of returning `false`, return a modified object to submit different data than what the user filled in — useful for computing derived values or stripping helper fields before the server call:

```xmlui
<Form onWillSubmit="(data) => 
  ({ ...data, fullName: data.firstName + ' ' + data.lastName })">
  <TextBox bindTo="firstName" label="First name" />
  <TextBox bindTo="lastName" label="Last name" />
</Form>
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `onWillSubmit`, `onSubmit`, and `data`
- [TextBox component](/docs/reference/components/TextBox) — `onValidate`, `noSubmit`, and built-in validators
- [PasswordInput component](/docs/reference/components/PasswordInput) — password field with the same validation API
- [Handle Form willSubmit return values](/docs/howto/handle-form-willsubmit-return-values) — full return-value reference
