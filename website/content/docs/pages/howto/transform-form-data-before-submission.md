# Transform form data before submission

Return a modified object from onWillSubmit to reshape the form payload (computing derived fields, normalizing values, or stripping helper fields) before the data reaches onSubmit or the server.

When `onWillSubmit` returns a plain object, that object is what `onSubmit` receives and what is sent to `submitUrl`. This lets you keep the form data model simple for the user while sending a different, cleaner shape to the API.

```xmlui-pg copy display name="Form data transformation on submit"
<App>
  <Form
    data="{{ firstName: '', lastName: '', rawPhone: '', isMember: false }}"
    onWillSubmit="(data, allData) => ({
      fullName: (data.firstName + ' ' + data.lastName).trim(),
      phone: data.rawPhone.split('').filter(ch => ch >= '0' && ch <= '9').join(''),
      tier: data.isMember ? 'member' : 'guest'
    })"
    onSubmit="(data) => toast.success(JSON.stringify(data))"
    saveLabel="Register"
  >
    <HStack>
      <TextBox label="First Name" bindTo="firstName" required="true" width="*" />
      <TextBox label="Last Name" bindTo="lastName" required="true" width="*" />
    </HStack>
    <TextBox label="Phone" bindTo="rawPhone" placeholder="e.g. (555) 123-4567" />
    <Checkbox label="Loyalty member" bindTo="isMember" labelPosition="start" />
  </Form>
</App>
```

## Key points

**Return an object to replace the payload entirely**: When `onWillSubmit` returns a plain object it completely replaces the form data that goes to `onSubmit` and `submitUrl`. The returned object can have completely different keys:

```xmlui
<Form
  onWillSubmit="(data) => ({
    fullName: data.firstName + ' ' + data.lastName,
    phone: data.rawPhone.split('').filter(ch => ch >= '0' && ch <= '9').join('')
  })"
  onSubmit="(data) => api.register(data)"
>
  <TextBox bindTo="firstName" />
  <TextBox bindTo="lastName" />
  <TextBox bindTo="rawPhone" />
</Form>
```

**Use spread to keep most fields and change a few**: If you only need to add or rename a couple of fields, spread the original data and override just the target keys. If you need to access a `noSubmit` field, use the second argument (`allData`):

```xmlui
<Form
  onWillSubmit="(data, allData) => ({
    ...data,
    email: data.email.toLowerCase(),
    tags: allData.rawTags.split(',').map(t => t.trim())
  })"
>
  <TextBox bindTo="email" label="Email" />
  <TextBox bindTo="rawTags" label="Tags (comma-separated)" noSubmit="true" />
</Form>
```

**Use `noSubmit="true"` for helper fields**: Mark any field that the user fills in but that should not appear in the API payload. `noSubmit="true"` strips the field from the first argument (`data`) of `onWillSubmit` and from `onSubmit`. The field is still available via the second argument (`allData`) for cross-field logic:

```xmlui
<Form
  onWillSubmit="(data, allData) => ({
    ...data,
    displayName: allData.firstName + ' ' + allData.lastName
  })"
>
  <TextBox bindTo="firstName" label="First name" noSubmit="true" />
  <TextBox bindTo="lastName" label="Last name" noSubmit="true" />
  <!-- displayName is in the payload; firstName/lastName are not -->
</Form>
```

**Returning nothing or `null` proceeds with unmodified data**: If your handler conditionally transforms data, simply return nothing (or `null`) in the branches where the original data is fine:

```xmlui
<Form
  onWillSubmit="(data) => {
    if (data.type === 'business') {
      return { ...data, vatNumber: data.vatNumber.toUpperCase() };
    }
    // no return → original data is submitted as-is
  }"
>
```

**Returning `false` cancels submission**: If a local check shows that the form should not be submitted yet, return `false` to abort. The form stays open with its current values:

```xmlui
<Form
  onWillSubmit="(data) => {
    if (data.accountType === 'business' && !data.vatNumber) {
      toast.error('Enter a VAT number for business accounts.');
      return false;
    }
    return {
      ...data,
      vatNumber: data.vatNumber?.toUpperCase()
    };
  }"
>
  <Select bindTo="accountType" label="Account type">
    <Option value="personal" label="Personal" />
    <Option value="business" label="Business" />
  </Select>
  <TextBox bindTo="vatNumber" label="VAT number" />
</Form>
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `onWillSubmit` full return-value reference, `onSubmit`, `submitUrl`
- [Validate dependent fields together](/docs/howto/validate-dependent-fields-together) — using `onWillSubmit` to cancel submission
- [Submit a form with file uploads](/docs/howto/submit-a-form-with-file-uploads) — combining `noSubmit` with upload handling in `onWillSubmit`
