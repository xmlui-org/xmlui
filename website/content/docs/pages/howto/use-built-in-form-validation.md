# Use built-in form validation

Use `required`, `minLength`, `maxLength`, `pattern`, `regex`, and range props directly on form fields to enforce common rules without writing validation logic.

XMLUI input components ship with declarative validators that activate when the field is bound to a `Form`. The form checks each bound field before submission, shows validation feedback, and blocks submission while any error-level validator fails. Use custom `*InvalidMessage` props when the default text is too generic for your form.

```xmlui-pg copy display name="Registration form with built-in validation"
<App>
  <Form
    data="{{ username: '', email: '', password: '', age: null, bio: '' }}"
    onSubmit="(data) => toast.success('Account created for ' + data.username)"
    saveLabel="Create account"
  >
    <TextBox
      label="Username"
      bindTo="username"
      required="true"
      minLength="3"
      maxLength="20"
      regex="^[a-z][a-z0-9_]+$"
      requiredInvalidMessage="Choose a username"
      lengthInvalidMessage="Use 3-20 characters"
      regexInvalidMessage="Start with a lowercase letter; use lowercase letters, numbers, and underscores"
    />

    <TextBox
      label="Email"
      bindTo="email"
      required="true"
      pattern="email"
      requiredInvalidMessage="Enter your email address"
      patternInvalidMessage="Enter a valid email address"
    />

    <PasswordInput
      label="Password"
      bindTo="password"
      required="true"
      minLength="8"
      maxLength="64"
      lengthInvalidMessage="Use 8-64 characters"
    />

    <NumberBox
      label="Age"
      bindTo="age"
      required="true"
      minValue="13"
      maxValue="120"
      requiredInvalidMessage="Enter your age"
      rangeInvalidMessage="Age must be between 13 and 120"
    />

    <TextArea
      label="Bio"
      bindTo="bio"
      maxLength="160"
      lengthInvalidMessage="Keep the bio under 160 characters"
    />
  </Form>
</App>
```

## Key points

**Attach validators directly to the field**: Put constraint props on the input component with `bindTo`; the parent `Form` discovers and evaluates them automatically.

```xmlui
<TextBox bindTo="email" required="true" pattern="email" />
```

**Use `required` for missing values**: Empty strings, unchecked booleans, and empty selections fail `required`. When `required` fails, the other validators for that field do not need to run yet.

```xmlui
<TextBox
  label="Email"
  bindTo="email"
  required="true"
  requiredInvalidMessage="Enter your email address"
/>
```

**Use `minLength` and `maxLength` for string length**: These validators apply to string values such as `TextBox`, `PasswordInput`, and `TextArea`. One `lengthInvalidMessage` covers the length rule.

```xmlui
<PasswordInput
  bindTo="password"
  minLength="8"
  maxLength="64"
  lengthInvalidMessage="Use 8-64 characters"
/>
```

**Use `pattern` for predefined formats**: `pattern` accepts built-in names: `email`, `phone`, and `url`. Use `patternInvalidMessage` to explain the expected format.

```xmlui
<TextBox
  bindTo="website"
  pattern="url"
  patternInvalidMessage="Enter a URL that starts with http or https"
/>
```

**Use `regex` for custom string rules**: Store regex strings in a `<script>` variable when they contain characters that are awkward in XML attributes, then bind that variable to `regex`.

```xmlui
<script>
  var codeRegex = '^[A-Z][0-9][A-Z]$';
</script>

<TextBox
  bindTo="inviteCode"
  regex="{codeRegex}"
  regexInvalidMessage="Use the format A1B"
/>
```

**Use range props for numbers**: `minValue` and `maxValue` validate numeric fields such as `NumberBox`. The matching custom text prop is `rangeInvalidMessage`.

```xmlui
<NumberBox
  bindTo="quantity"
  minValue="1"
  maxValue="99"
  rangeInvalidMessage="Choose a quantity from 1 to 99"
/>
```

**The form blocks submission on error-level validation**: Built-in validators run when the user leaves a field and again when the form is submitted. If any error-level rule fails, `onSubmit` is not called and the field feedback is shown.

---

## See also

- [Do custom form validation](/docs/howto/do-custom-form-validation) - `onValidate` for rules that cannot be expressed as built-in constraints
- [Validate a field inline with onValidate](/docs/howto/validate-a-field-inline-with-onvalidate) - writing synchronous custom validators
- [Use regex validation in FormItem](/docs/howto/use-regex-validation-in-formitem) - regex escaping and severity details
