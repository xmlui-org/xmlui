# Protect a modal Form from accidental close

Put a `Form` inside a `ModalDialog` and let the dialog use the Form's dirty state to confirm before closing.

When a `ModalDialog` hosts a `Form`, XMLUI connects the Form's dirty flag to the dialog automatically. Editing any Form-bound field marks the Form dirty, and the dialog treats that as its own dirty state. If the user clicks the dialog close button, clicks outside the dialog, or calls `dialog.close()`, the dialog asks for confirmation before discarding the draft.

```xmlui-pg copy display name="Protect a dirty modal Form" id="protect-a-dirty-modal-form" height="500px"
<App
  var.status="clean"
  var.profile="{{ name: 'Ada Lovelace', email: 'ada@example.com', capacity: 32 }}">

  <Button label="Edit profile" onClick="profileDialog.open()" />

  <ModalDialog
    id="profileDialog"
    title="Edit profile"
    confirmCloseTitle="Unsaved Profile"
    canCloseMessage="Discard your profile changes?"
    confirmCloseLabel="Discard"
    cancelCloseLabel="Keep Editing"
    onDirtyChanged="(dirty) => status = dirty ? 'dirty' : 'clean'">
    <Form
      id="profileForm"
      data="{profile}"
      hideButtonRow="true"
      onSubmit="(data) => {
        profile = data;
        profileForm.setDirty(false);
        profileDialog.close();
      }">
      <TextBox label="Name" bindTo="name" />
      <TextBox label="Email" bindTo="email" />
      <NumberBox label="Weekly capacity" bindTo="capacity" />

      <HStack verticalAlignment="center">
        <Badge value="{status}" />
        <SpaceFiller />
        <Button
          label="Discard draft"
          variant="outlined"
          onClick="profileForm.reset(); profileDialog.close()" />
        <Button label="Save" type="submit" />
      </HStack>
    </Form>
  </ModalDialog>

  <Text>Name: {profile.name}</Text>
  <Text>Email: {profile.email}</Text>
  <Text>Weekly capacity: {profile.capacity}</Text>
</App>
```

## Key points

**Nested Forms feed the dialog dirty state automatically**: You do not need to call `profileDialog.setDirty(true)` from every field. A `TextBox`, `NumberBox`, `FormItem`, or other Form-bound control marks the parent Form dirty when its value changes, and the hosting `ModalDialog` sees that dirty state.

**`onDirtyChanged` is the right place to update surrounding UI**: The dialog emits `dirtyChanged` with the new combined dirty state. Use it for badges, labels, disabled states, or analytics without polling `getDirty()`.

**The confirmation belongs to the ModalDialog**: Set `confirmCloseTitle`, `canCloseMessage`, `confirmCloseLabel`, and `cancelCloseLabel` on the dialog. These values appear in the confirmation dialog used when a dirty modal is about to close.

**Mark the Form clean when the draft is accepted or discarded**: A successful save can call `form.setDirty(false)` before closing. A discard action usually calls `form.reset()` so visible field values return to the pristine baseline before the dialog closes.

**Use `willClose` only for custom close policy**: If you define `willClose`, it takes over the close decision. Return an explicit `false` to block the close; otherwise leave `willClose` unset so the built-in dirty confirmation flow can run.

---

## See also

- [ModalDialog reference](/docs/reference/components/ModalDialog) — dirty close confirmation properties, events, and APIs
- [Form reference](/docs/reference/components/Form) — `isDirty()`, `setDirty()`, and `dirtyChanged`
- [Use the same ModalDialog to add or edit](/docs/howto/use-the-same-modaldialog-to-add-or-edit) — drive an edit form from `open(data)`
