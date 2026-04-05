# Use built-in form validation

Use `required`, `minLength`, `maxLength`, `pattern`, and `regex` directly on input components to enforce field rules without writing any validation logic.

XMLUI input components ship with a set of declarative validators that activate when the field is bound to a `Form`. The form automatically blocks submission until every validator passes. Custom error text can be provided for each rule, replacing the default message.

```xmlui-pg copy name="Use built-in form validation"
---app display
<App>
  <Form
    data="{{ password: '' }}"
    onSubmit="(data) => console.log('Submitted:', data)"
  >
    <PasswordInput
      label="Password"
      bindTo="password"
      minLength="8"
      lengthInvalidMessage="Password must be at least 8 characters"
    />
  </Form>
</App>
```

## Key points

**Attach validators directly to the input component**: Place built-in constraint props (`required`, `minLength`, `maxLength`, `pattern`, `regex`) on the input field itself — no wrapper component is needed. The `Form` detects them automatically.

**`minLength` / `maxLength` enforce length limits**: Set a number; the form shows an error if the value is shorter or longer. The example requires at least 8 characters for the password field.

**Custom error text replaces the default message**: Each validator has a matching `*InvalidMessage` prop (e.g., `lengthInvalidMessage`, `requiredInvalidMessage`, `patternInvalidMessage`). Use it to show a user-friendly message instead of the generic default.

**The form blocks submission until all validators pass**: XMLUI evaluates every declared rule on every bound field when the user tries to submit. If any field is invalid the submit is cancelled and errors are revealed.

**`required` works on all input types**: `TextBox`, `PasswordInput`, `Select`, `NumberBox`, `TextArea`, and other form-capable components all respect the `required` prop the same way.

---

## See also

- [Do custom form validation](/docs/howto/do-custom-form-validation) — `onValidate` for rules that can't be expressed as built-in constraints
- [Validate a field inline with onValidate](/docs/howto/validate-a-field-inline-with-onvalidate) — writing synchronous custom validators
- [Add an async uniqueness check](/docs/howto/add-an-async-uniqueness-check) — API-backed validation
