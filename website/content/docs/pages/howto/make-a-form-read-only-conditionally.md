# Make a form read-only conditionally

Toggle the readOnly prop on Form to switch between view mode and edit mode without rebuilding the layout.

A profile page shows the user's details as read-only text by default. An Edit button activates edit mode; Cancel returns to view mode. Because the same `Form` and input components are used in both modes, the layout stays consistent and no duplication is needed.

```xmlui-pg copy display name="Profile with view/edit toggle"
---app display
<App>
  <Form
    var.editing="{false}"
    data="{{ name: 'Alice Johnson', email: 'alice@example.com', bio: 'Engineer at ACME.' }}"
    readOnly="{!editing}"
    hideButtonRow="{!editing}"
    onSubmit="(data) => { editing = false; toast('Profile saved.'); }"
    saveLabel="Save changes"
  >
    <TextBox label="Full Name" bindTo="name" required="true" />
    <TextBox label="Email" bindTo="email" pattern="email" required="true" />
    <TextArea label="Bio" bindTo="bio" />
    <HStack when="{!editing}">
      <Button label="Edit" onClick="editing = true" />
    </HStack>
  </Form>
</App>
```

## Key points

**`readOnly` on `Form` applies globally**: Setting `readOnly` on the `Form` makes every child input non-editable at once. You do not need to set `readOnly` on individual fields:

```xmlui
<Form readOnly="{!editing}">
  <TextBox bindTo="name" />   <!-- read-only when editing is false -->
  <TextBox bindTo="email" />  <!-- read-only when editing is false -->
</Form>
```

**Hide the button row when not editing**: The default Save/Cancel buttons are meaningless in view mode. `hideButtonRow="{!editing}"` hides them reactively:

```xmlui
<Form readOnly="{!editing}" hideButtonRow="{!editing}">
  …
</Form>
```

**Per-field `readOnly` overrides the form-level setting**: `readOnly` on an individual input component overrides the parent `Form`'s `readOnly`. This lets you lock specific fields (like a primary key) even when the rest of the form is editable:

```xmlui
<Form readOnly="{!editing}">
  <TextBox bindTo="userId" label="User ID" readOnly="true" />  <!-- always read-only -->
  <TextBox bindTo="name" label="Name" />                       <!-- follows form state -->
</Form>
```

**`onSubmit` can flip editing back to `false`**: After a successful save, set the mode variable to `false` inside `onSubmit` to return to view mode automatically:

```xmlui
<Form
  var.editing="{false}"
  onSubmit="(data) => { editing = false; }"
  readOnly="{!editing}"
  hideButtonRow="{!editing}"
>
```

**Showing an Edit button only in view mode**: Use `when="{!editing}"` on any extra control you want visible only during view mode. The pattern keeps your markup clean by co-locating the toggle button inside the form:

```xmlui
<Button when="{!editing}" label="Edit" onClick="editing = true" />
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `readOnly`, `hideButtonRow`, `onSubmit`
- [TextBox component](/docs/reference/components/TextBox) — per-field `readOnly` and other input components
