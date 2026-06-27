# Validate a field inline with onValidate

Attach an onValidate handler to an input component to show a custom error message below the field when the value does not pass your rule.

Built-in validators (`required`, `minLength`, `pattern`, etc.) cover most constraints, but sometimes a rule is hard to express declaratively — for example "must not start with a number", "must be all uppercase", or "must be a valid IBAN". `onValidate` lets you write that check as a function. Returning a non-empty string displays it as an error; returning `null` clears any existing error.

```xmlui-pg copy display name="Inline custom field validation"
<App>
  <Form
    data="{{ username: '', promoCode: '' }}"
    onSubmit="(data) => toast.success('Submitted: ' + JSON.stringify(data))"
    saveLabel="Submit"
  >
    <TextBox
      label="Username"
      bindTo="username"
      required="true"
      onValidate="(value) => {
        if (!value) return null;
        if (/[^a-z0-9_]/.test(value)) 
          return 'Only lowercase letters, digits, and underscores are allowed.';
        if (/^[0-9]/.test(value)) 
          return 'Username must not start with a digit.';
        return null;
      }"
      placeholder="e.g. alice_99"
    />
    <TextBox
      label="Promo code (optional)"
      bindTo="promoCode"
      onValidate="(value) => {
        if (!value) return null;
        return value === value.toUpperCase() 
          ? null : 'Promo codes must be entered in uppercase.';
      }"
      placeholder="e.g. SUMMER25"
    />
  </Form>
</App>
```

## Key points

**Return a string to show an error, `null` to clear it**: The return value of `onValidate` is the error message. Return a non-empty string to block submission and display the text below the field. Return `null`, `undefined`, or nothing to indicate the value is valid:

```xmlui
<TextBox
  bindTo="username"
  onValidate="(value) => {
    if (/^[0-9]/.test(value)) return 'Cannot start with a digit.';
    return null;
  }"
/>
```

**Guard against empty values**: When the field is optional the value may be empty. Check for emptiness first and return `null` early so your rule does not run against a blank string — built-in `required` handles the empty case separately:

```xmlui
<TextBox
  bindTo="promoCode"
  onValidate="(value) => {
    if (!value) return null;          // let 'required' handle this if needed
    return value === value.toUpperCase() ? null : 'Must be uppercase.';
  }"
/>
```

**`onValidate` runs alongside built-in validators**: Built-in validators (`required`, `minLength`, `maxLength`, `pattern`, `regex`) always run in addition to `onValidate`. If a built-in validator fails first the form shows that error; once that passes, `onValidate` is checked:

```xmlui
<TextBox
  bindTo="code"
  required="true"
  minLength="6"
  onValidate="(v) => v?.startsWith('PRO') ? null : 'Code must begin with PRO.'"
/>
```

**Validation timing is controlled by `validationMode`**: By default errors appear only after the field loses focus or the user tries to submit (`errorLate` mode). Set `validationMode="onChanged"` to show the error live as the user types:

```xmlui
<TextBox
  bindTo="username"
  validationMode="onChanged"
  onValidate="(v) => /[^a-z0-9_]/.test(v) ? 'Invalid character.' : null"
/>
```

---

**See also**
- [TextBox component](/docs/reference/components/TextBox) — `onValidate`, `validationMode`, and built-in validators
- [Show validation on blur, not on type](/docs/howto/show-validation-on-blur-not-on-type) — controlling when errors appear
- [Validate dependent fields together](/docs/howto/validate-dependent-fields-together) — cross-field validation with `onWillSubmit`
