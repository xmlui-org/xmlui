# Use regex validation in FormItem

> [!NOTE]
> Prefer to use input components directly instead of `FormItem`. The `FormItem` component serves more as a fallback and for adding custom controls as children.

Write regex patterns with curly-brace quantifiers safely in XML attributes and control severity per validation type.

`FormItem` accepts a `regex` prop for custom pattern validation. The key challenge is that XMLUI treats `{` and `}` in attribute values as expression delimiters — so a regex quantifier like `\d{2,4}` must be escaped or moved into a script variable to avoid a parse error. Each validation type also has an independent `*InvalidSeverity` prop to control whether a rule blocks submission or just shows a warning.

```xmlui-pg copy display name="FormItem regex validation with severity"
---app display
<App
  var.phoneRegex="{'^[+]?[0-9]{7,15}$'}"
  var.zipRegex="{'^[0-9]{5}$'}"
>
  <Form
    data="{{ phone: '', zip: '' }}"
    onSubmit="() => toast.success('Submitted!')"
    saveLabel="Submit"
  >
    <FormItem
      label="Phone number"
      bindTo="phone"
      placeholder="e.g. +1234567890"
      regex="{phoneRegex}"
      regexInvalidMessage="Enter 7-15 digits, optional leading +"
      regexInvalidSeverity="error"
    />

    <FormItem
      label="ZIP code (warning only)"
      bindTo="zip"
      placeholder="e.g. 12345"
      regex="{zipRegex}"
      regexInvalidMessage="Expected a 5-digit ZIP code"
      regexInvalidSeverity="warning"
    />
  </Form>
</App>
```

## Key points

**Never write `{n}` quantifiers directly in XML attributes**: XMLUI parses `{` as an expression delimiter in all attribute values. A literal `regex="^\d{2,4}$"` is parsed as `^\d` followed by the expression `{2,4}`. Put the regex in a variable as a string expression, then bind to it: `var.myRegex="{'^[0-9]{2,4}$'}"` and `regex="{myRegex}"`.

**Avoid unnecessary backslash escaping**: In JavaScript string context, `\d` requires double-escaping as `\\d`. The example uses `[0-9]` and `[+]?` instead, so the regex strings stay readable while still matching an optional leading plus sign and digits.

**`regexInvalidSeverity` controls submission blocking**: `"error"` (default) blocks form submission. `"warning"` shows the message and lets the user proceed after confirming the warning dialog. `"info"` shows informational text; `"valid"` shows a success indicator. This applies to every validation type — `lengthInvalidSeverity`, `rangeInvalidSeverity`, and `patternInvalidSeverity` follow the same pattern.

**`regexInvalidMessage` customizes the error text**: Set a plain-language message explaining what the pattern expects. Without it, a generic "Invalid value" message is shown. Combine it with `regexInvalidSeverity="warning"` for non-blocking hints.

**Use `placeholder` to make the expected shape obvious**: `FormItem` forwards input props such as `placeholder` to its generated control. In the example above, enter `abc` in the phone field or `1234` in the ZIP field, then leave the field or submit the form to see the regex validation messages.

**Add children only for custom controls**: A `FormItem` with children enters custom-control mode. In that case the child component must read `$value` and call `$setValue(...)` so the form state and validators receive the edited value. For a normal text field, leave the `FormItem` self-closing and let it render the built-in text input.

**`regex` and `pattern` are independent props**: `regex` is for custom regular expression matching; `pattern` is for a separate predefined pattern system. Both can coexist on the same `FormItem` — a field fails validation if either check fails.

---

## See also

- [Do custom form validation](/docs/howto/do-custom-form-validation) — arbitrary async validation with `onValidate`
- [Handle Form willSubmit return values](/docs/howto/handle-form-willsubmit-return-values) — final payload transformation or cancellation
- [Use built-in form validation](/docs/howto/use-built-in-form-validation) — `required`, `minLength`, `min`/`max` built-ins
