# Use regex validation in FormItem

Write regex patterns with curly-brace quantifiers safely in XML attributes and control severity per validation type.

`FormItem` accepts a `regex` prop for custom pattern validation. The key challenge is that XMLUI treats `{` and `}` in attribute values as expression delimiters — so a regex quantifier like `\d{2,4}` must be escaped or moved into a script variable to avoid a parse error. Each validation type also has an independent `*InvalidSeverity` prop to control whether a rule blocks submission or just shows a warning.

```xmlui-pg copy display name="FormItem regex validation with severity"
---app display
<App>
  <script>
    var phoneRegex = '^\\+?[0-9]{7,15}$';
    var zipRegex = '^[0-9]{5}$';
  </script>

  <Form onSubmit="() => toast.success('Submitted!')">
    <FormItem
      label="Phone number"
      bindTo="phone"
      regex="{phoneRegex}"
      regexInvalidMessage="Enter 7-15 digits, optional leading +"
      regexInvalidSeverity="error"
    >
      <TextBox />
    </FormItem>

    <FormItem
      label="ZIP code (warning only)"
      bindTo="zip"
      regex="{zipRegex}"
      regexInvalidMessage="Expected a 5-digit ZIP code"
      regexInvalidSeverity="warning"
    >
      <TextBox />
    </FormItem>

    <Button type="submit" label="Submit" variant="solid" />
  </Form>
</App>
```

## Key points

**Never write `{n}` quantifiers directly in XML attributes**: XMLUI parses `{` as an expression delimiter in all attribute values. A literal `regex="^\d{2,4}$"` is parsed as `^\d` followed by the expression `{2,4}`. Always define the regex string in a `<script>` variable and bind to it: `regex="{myRegex}"`.

**Escape backslashes inside `<script>` string literals**: In JavaScript string context, `\d` requires double-escaping as `\\d`. The variable `'^\\+?[0-9]{7,15}$'` renders as the regex string `^\+?[0-9]{7,15}$`. Using the bracket form `[0-9]` instead of `\d` avoids backslash issues.

**`regexInvalidSeverity` controls submission blocking**: `"error"` (default) blocks form submission. `"warning"` shows the message but still allows submission. `"info"` shows informational text; `"valid"` shows a success indicator. This applies to every validation type — `lengthInvalidSeverity`, `rangeInvalidSeverity`, and `patternInvalidSeverity` follow the same pattern.

**`regexInvalidMessage` customizes the error text**: Set a plain-language message explaining what the pattern expects. Without it, a generic "Invalid value" message is shown. Combine it with `regexInvalidSeverity="warning"` for non-blocking hints.

**`regex` and `pattern` are independent props**: `regex` is for custom regular expression matching; `pattern` is for a separate predefined pattern system. Both can coexist on the same `FormItem` — a field fails validation if either check fails.

---

## See also

- [Do custom form validation](/docs/howto/do-custom-form-validation) — arbitrary async validation with `onValidate`
- [Handle Form willSubmit return values](/docs/howto/handle-form-willsubmit-return-values) — final payload transformation or cancellation
- [Use built-in form validation](/docs/howto/use-built-in-form-validation) — `required`, `minLength`, `min`/`max` built-ins
