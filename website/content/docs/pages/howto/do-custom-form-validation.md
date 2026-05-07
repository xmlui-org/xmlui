# Do custom form validation

Use the `onValidate` event on an input component to enforce any rule that cannot be expressed with built-in validators.

`onValidate` receives the current field value and must return a non-empty string (the error message) when the value is invalid, or `null` to signal that the field is valid. The form blocks submission until the handler returns `null`.

```xmlui-pg display copy name="Do custom form validation"
---app
<App var.limit="{1000}">
  <Form
    data="{{ total: 0 }}"
    onSubmit="(data) => toast.success('Submitted: ' + JSON.stringify(data))"
  >
    <NumberBox
      label="Requested Amount (limit {limit})"
      bindTo="total"
      integersOnly="true"
      onValidate="(value) => value > 0 && value <= limit
        ? null
        : `Value should be in the 0-${limit} range`;"
    />
  </Form>
</App>
```

## Key points

**Return a string for invalid, `null` for valid**: The `onValidate` handler must return a non-empty string containing the error message when the value fails the check. Returning `null` (or `undefined`) clears any error and marks the field as valid.

**`onValidate` runs alongside built-in validators**: Built-in constraints (`required`, `minLength`, etc.) and `onValidate` are all evaluated. The field is only considered valid when every check passes.

**Context variables are accessible inside the handler**: Expressions in XMLUI share the same scope, so `onValidate` can reference variables defined on the page or form (such as `limit` in the example) without passing them as arguments.

**The form prevents submission while any field is invalid**: If `onValidate` returns an error string when the user presses Save, the form cancels the submission and reveals the error below the field.

---

## See also

- [Use built-in form validation](/docs/howto/use-built-in-form-validation) — declarative validators that need no custom logic
- [Validate a field inline with onValidate](/docs/howto/validate-a-field-inline-with-onvalidate) — more `onValidate` patterns
- [Add an async uniqueness check](/docs/howto/add-an-async-uniqueness-check) — calling an API inside `onValidate`
