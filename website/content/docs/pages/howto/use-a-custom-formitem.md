# Use a custom FormItem control

Bind any interactive element to a form field using `$value` and `$setValue`.

`FormItem` supports a custom rendering mode that lets you place any element inside it as the form control. Set `type="custom"` and add children — the framework injects two context variables: `$value` (the current field value) and `$setValue` (a function to update it). All standard `FormItem` features — labels, `required`, validation rules, `noSubmit` — still work exactly as they do for built-in input types.

```xmlui-pg copy display name="Custom FormItem control"
---app display
<App>
  <Form
    data="{{ myCustomProp: true }}"
    onSubmit="data => toast.success(JSON.stringify(data))"
  >
    <FormItem
      type="custom"
      bindTo="myCustomProp"
      label="Toggle (click to change)"
    >
      <Stack
        backgroundColor="{$value ? 'green' : 'red'}"
        width="60px"
        height="60px"
        borderRadius="$borderRadius"
        cursor="pointer"
        onClick="{() => $setValue(!$value)}"
      />
    </FormItem>
  </Form>
</App>
```

## Key points

**Set `type="custom"` and use children as the control**: When `type="custom"` is set and children are present, `FormItem` switches to custom mode. The children subtree becomes the entire input area. If children are present and `type` is omitted, XMLUI also activates custom mode automatically.

**`$value` reads the current field value**: Inside the children, `$value` always reflects the live value of the bound field as held by the form state. Bind it to visual properties — background color, checked state, displayed text, or any reactive expression.

**`$setValue(newValue)` writes back to form state**: Call `$setValue` in response to user interactions (click, change, etc.) to update the bound field. The form immediately re-evaluates validation and marks the field as touched.

**Standard `FormItem` props still apply**: `label`, `labelPosition`, `required`, `requiredInvalidMessage`, `regex`, `onValidate`, and all other `FormItem` validation props work in custom mode. The label and validation messages are rendered by `FormItem`'s outer wrapper — your custom children only need to handle the interactive input area.

**`$validationResult` exposes validation state inside the control**: If you want to reflect validation feedback directly inside your custom UI (e.g., a red border or an icon), read `$validationResult`. It contains a `validations` array of `{ message, severity }` objects when validation fails, and is `null` or empty when the field is valid.

---

## See also

- [Do custom form validation](/docs/howto/do-custom-form-validation) — run arbitrary logic in `onValidate`
- [Use regex validation in FormItem](/docs/howto/use-regex-validation-in-formitem) — pattern-based validation for custom and built-in fields
- [Copy billing data to shipping](/docs/howto/copy-billing-to-shipping) — reactive interactions between form fields
