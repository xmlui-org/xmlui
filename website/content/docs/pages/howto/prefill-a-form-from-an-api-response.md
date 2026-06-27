# Prefill a form from an API response

Load existing data with DataSource and pass it to Form's data prop so fields open pre-populated for editing.

An edit-profile page should open with the user's current name, email, and job title already filled in. Load the record with `DataSource`, pass its `value` to the `Form` `data` prop, and the fields populate automatically — no manual field-by-field assignment needed.

```xmlui-pg copy display name="Edit profile form prefilled from API"
---app display
<App>
  <DataSource
    id="profile"
    url="https://jsonplaceholder.typicode.com/users/1"
  />
  <Form
    data="{{
      name: profile.value.name,
      email: profile.value.email,
      website: profile.value.website
    }}"
    onSubmit="(data) => toast('Saved: ' + data.name)"
    saveLabel="Save changes"
  >
    <TextBox label="Full Name" bindTo="name" required="true" />
    <TextBox label="Email" bindTo="email" pattern="email" required="true" />
    <TextBox label="Website" bindTo="website" />
  </Form>
</App>
```

## Key points

**`data` prop on `Form` sets initial field values**: The `data` object is a key-value map where each key matches the `bindTo` of each field. XMLUI populates each field from its corresponding key when the form first renders:

```xmlui
<DataSource id="user" url="/api/users/42" />
<Form data="{{ name: user.value.name, role: user.value.role }}">
  <TextBox label="Name" bindTo="name" />
  <TextBox label="Role" bindTo="role" />
</Form>
```

**`$update` triggers a form data refresh**: If the `DataSource` reloads (e.g. due to polling or manual refetch), passing a changing value via `$update` in the `data` object tells the form to re-apply the new data. Use the `DataSource`'s `value` itself as the update signal:

```xmlui
<Form data="{{ name: user.value.name, $update: user.value }}">
  <!-- form re-populates automatically on every DataSource refresh -->
</Form>
```

**`submitUrl` and `submitMethod` for direct form-to-API submission**: Instead of handling the HTTP call inside `onSubmit`, set `submitUrl` and `submitMethod` on the form. The framework posts the form data directly and fires `onSuccess` / `onError` when done:

```xmlui
<Form
  data="{{ name: user.value.name }}"
  submitUrl="/api/users/42"
  submitMethod="put"
  completedNotificationMessage="Profile updated."
>
  <TextBox label="Name" bindTo="name" />
</Form>
```

**`Form.update()` for partial programmatic updates**: Call `form.update({ city: 'Berlin' })` to change individual fields without replacing the whole `data` object — useful when a secondary API call or a dropdown selection should update related fields:

```xmlui
<Form id="profileForm" data="{{ name: user.value.name }}">
  <TextBox label="Name" bindTo="name" />
  <Button label="Set default city" onClick="profileForm.update({ city: 'Berlin' })" />
</Form>
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `data`, `submitUrl`, `submitMethod`, `update()`
- [DataSource component](/docs/reference/components/DataSource) — loading data and `value` access
- [Reset a form after submission](/docs/howto/reset-a-form-after-submission) — `dataAfterSubmit` options
