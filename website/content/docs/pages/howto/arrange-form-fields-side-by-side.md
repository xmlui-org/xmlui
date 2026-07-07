# Arrange form fields side by side

Use HStack inside a Form to place two or more fields on the same row, or use itemLabelPosition="start" for a label-left layout.

A checkout form keeps First Name and Last Name on the same row to save vertical space. Wrapping those two fields in an `HStack` and giving each `width="*"` splits the available width equally between them. More complex layouts mix HStack rows, full-width fields, and `FormSegment` groupings.

```xmlui-pg copy display name="Checkout form with side-by-side fields"
---app display
<App>
  <Form
    data="{{ firstName: '', lastName: '', address: '', city: '', postcode: '' }}"
    onSubmit="(data) => 
      toast('Order placed for ' + data.firstName + ' ' + data.lastName)"
    saveLabel="Place order"
  >
    <HStack>
      <TextBox label="First Name" bindTo="firstName" required="true" width="*" />
      <TextBox label="Last Name" bindTo="lastName" required="true" width="*" />
    </HStack>
    <TextBox label="Address" bindTo="address" required="true" />
    <HStack>
      <TextBox label="City" bindTo="city" required="true" width="*" />
      <TextBox label="Postcode" bindTo="postcode" required="true" width="160px" />
    </HStack>
  </Form>
</App>
```

## Key points

**`HStack` + `width="*"` for equal-width sibling fields**: Wrap the fields in `<HStack>` and set `width="*"` on each input field to divide the row equally. Mix fixed widths and star widths to give one field more space:

```xmlui
<HStack>
  <TextBox bindTo="city" label="City" width="*" />
  <TextBox bindTo="postcode" label="Postcode" width="160px" />
</HStack>
```

**Full-width fields don't need wrapping**: A field that should span the full form width is placed outside any `HStack` as a direct child of `Form`. It naturally fills the form's width:

```xmlui
<Form>
  <TextBox bindTo="address" label="Address" />  <!-- full width -->
  <HStack>
    <TextBox bindTo="city" label="City" width="*" />
    <TextBox bindTo="postcode" label="Postcode" width="120px" />
  </HStack>
</Form>
```

**`itemLabelPosition="start"` for a label-left layout**: Set `itemLabelPosition="start"` on the `Form` to place every label to the left of its input (horizontal Aline). Use `itemLabelWidth` to control how wide the label column is:

```xmlui
<Form itemLabelPosition="start" itemLabelWidth="140px">
  <TextBox bindTo="firstName" label="First Name" />
  <TextBox bindTo="email" label="Email" />
</Form>
```

**`FormSegment` groups related fields under a heading**: Add `FormSegment` containers to create visually separated sections. `FormSegment` supports its own `columnGap` and `rowGap`:

```xmlui
<Form>
  <FormSegment heading="Personal Details">
    <HStack>
      <TextBox bindTo="firstName" label="First Name" width="*" />
      <TextBox bindTo="lastName" label="Last Name" width="*" />
    </HStack>
  </FormSegment>
  <FormSegment heading="Billing Address">
    <TextBox bindTo="address" label="Address" />
    <HStack>
      <TextBox bindTo="city" label="City" width="*" />
      <TextBox bindTo="postcode" label="Postcode" width="140px" />
    </HStack>
  </FormSegment>
</Form>
```

**Per-field `labelPosition` overrides the form-level setting**: If most fields use the default top label but one specific field needs a different arrangement, set `labelPosition` on that field's input component directly:

```xmlui
<Form itemLabelPosition="top">
  <TextArea bindTo="bio" label="Bio" labelPosition="start" />
</Form>
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `itemLabelPosition`, `itemLabelWidth`
- [TextBox component](/docs/reference/components/TextBox) — `labelPosition`, `labelWidth`, `width`
- [FormSegment component](/docs/reference/components/FormSegment) — `heading`, `columnGap`, `rowGap`
