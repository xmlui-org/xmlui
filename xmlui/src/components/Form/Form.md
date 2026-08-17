%-DESC-START

**Key features:**
- **Automatic data binding**: Form controls automatically sync with form data using `bindTo` properties
- **Built-in validation**: Validates individual fields and overall form state before submission
- **Dirty-state tracking**: Tracks edits automatically and exposes `isDirty()` and `setDirty()`
- **Context sharing**: Provides `$data` and other context values accessible to all nested components
- **Submission handling**: Manages form submission workflow and prevents invalid submissions

See [this guide](/docs/guides/forms) for details.

## Tracking Dirty State

`Form` automatically becomes dirty when a nested `FormItem` or direct `bindTo` control changes. Use `isDirty()` to read that state, `setDirty()` when your own logic needs to mark the form clean or dirty, and `dirtyChanged` to react whenever the dirty state changes.

When a `Form` is hosted in a `ModalDialog`, the dialog uses the form dirty state as part of its own close guard.

```xmlui-pg copy display name="Example: dirty state" height="400px"
<App var.status="clean">
  <Form
    id="profileForm"
    data="{{ name: 'Ada', age: 36 }}"
    onDirtyChanged="(dirty) => status = dirty ? 'dirty' : 'clean'">
    <FormItem label="Name" bindTo="name" />
    <NumberBox label="Age" bindTo="age" />
  </Form>

  <Text>Form state: {status}</Text>

  <HStack gap="$space-2">
    <Button
      label="Mark Clean"
      onClick="profileForm.setDirty(false)" />
  </HStack>

</App>
```

The next example places the same dirty-tracked Form inside a `ModalDialog`. Editing a bound field marks the Form dirty, the dialog treats that dirty state as its own close guard, and closing the dialog prompts for confirmation until the Form is marked clean.

```xmlui-pg copy display name="Example: dirty form in a modal dialog" height="520px"
<App var.formStatus="clean" var.dialogStatus="clean">
  <Button label="Edit Profile" onClick="profileDialog.open()" />

  <ModalDialog
    id="profileDialog"
    title="Edit Profile"
    confirmCloseTitle="Unsaved Profile"
    canCloseMessage="Discard your profile changes?"
    confirmCloseLabel="Discard"
    cancelCloseLabel="Keep Editing">
    <Form
      id="profileForm"
      hideButtonRow="true"
      data="{{ name: 'Ada Lovelace', role: 'Architect', weeklyHours: 32 }}"
      onDirtyChanged="(dirty) => {
        formStatus = dirty ? 'dirty' : 'clean';
        dialogStatus = profileDialog.getDirty() ? 'dirty' : 'clean';
      }">
      <FormItem label="Name" bindTo="name" />
      <TextBox label="Role" bindTo="role" />
      <NumberBox label="Weekly Hours" bindTo="weeklyHours" />
    </Form>

    <Text>
      Form: {formStatus}; Dialog: {dialogStatus}
    </Text>

    <HStack gap="$space-2">
      <Button
        label="Mark Form Clean"
        onClick="profileForm.setDirty(false)" />
      <Button
        label="Mark Dialog Dirty"
        onClick="
          profileDialog.setDirty(true);
          dialogStatus = profileDialog.getDirty() ? 'dirty' : 'clean'"
      />
      <Button label="Close" onClick="profileDialog.close()" />
    </HStack>
  </ModalDialog>
</App>
```

%-DESC-END

%-CONTEXT_VAR-START $data

The following sample demonstrates enabling a field based on another field's current value.

`$data` is also available in these event handlers: `willSubmit`, `submit`, `cancel`, `reset`, and `success`.

```xmlui-pg copy {5} display name="Example: referencing field values"
<App>
  <Form
    data="{{ isEnabled: true, name: 'Joe' }}" paddingHorizontal="1rem">
    <FormItem label="Enable name" bindTo="isEnabled" type="switch" />
    <FormItem enabled="{$data.isEnabled}" label="Name" bindTo="name" />
  </Form>
</App>
```

%-CONTEXT_VAR-END

%-PROP-START buttonRowTemplate

The following example demonstrates using it:

```xmlui-pg copy display name="Example: buttonRowTemplate"
---app copy display {10-19}
<App>
  <Form id="searchForm" padding="0.5rem"
    data="{{ search: 'Seattle', caseSensitive: false }}"
    onSubmit="() => {isSearching = true; delay(1000); isSearching = false; }"
    saveLabel="Search"
    var.isSearching="{false}">
      <Text>Please specify the name to include in the search:</Text>
      <FormItem bindTo="search" width="280px" />
      <FormItem type="checkbox" label="Case sensitive?" bindTo="caseSensitive" />
      <property name="buttonRowTemplate">
        <HStack gap="0.5rem" borderTop="1px solid #ddd" paddingVertical="1rem">
          <Button label="Test Search Server" type="button"
            themeColor="secondary" variant="outlined"
            onClick="toast('Search server is ok.')"/>
          <SpaceFiller/>
          <Button type="submit" enabled="{!isSearching}" icon="search"
            label="{isSearching ? 'Searching...' : 'Search'}"/>
        </HStack>
      </property>
  </Form>
</App>  
---desc
This example mimics a one-second search and turns off the submit button during the operation. Also, it adds a Test Search Server button:
```

%-PROP-END

%-PROP-START itemRequireLabelMode

```xmlui-pg copy display name="Example: label indicators for required and optional fields" /itemRequireLabelMode/
<App>
  <Form itemRequireLabelMode="markRequired">
    <H2>Emphasize Required Fields</H2>
    <FormItem label="Name" bindTo="name" required="true" />
    <FormItem label="Occupation" bindTo="occupation" required="false" />
  </Form>

  <Form itemRequireLabelMode="markOptional">
    <H2>Emphasize Optional Fields</H2>
    <FormItem label="Name" bindTo="name" required="true" />
    <FormItem label="Occupation" bindTo="occupation" required="false" />
  </Form>

  <Form itemRequireLabelMode="markBoth">
    <H2>Emphasize All Fields</H2>
    <FormItem label="Name" bindTo="name" required="true" />
    <FormItem label="Occupation" bindTo="occupation" required="false" />
  </Form>
</App>
```

Fields can override `itemRequireLabelMode` with `requireLabelMode`:

```xmlui-pg copy display name="Example: fields overriding label mode" /requireLabelMode="markOptional"/
<App>
  <Form itemRequireLabelMode="markRequired">
    <FormItem label="Name" bindTo="name" required="true" />
    <FormItem
      label="Occupation"
      bindTo="occupation"
      required="false"
      requireLabelMode="markOptional"
    />
  </Form>
</App>
```

%-PROP-END

%-EVENT-START submit

```xmlui-pg copy {4} display name="Example: submit"
<App>
  <Form padding="0.5rem"
    data="{{ name: 'Joe', age: 43 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FlowLayout columnGap="12px" paddingBottom="6px">
      <FormItem bindTo="name" label="Customer name" width="50%" />
      <FormItem bindTo="age" label="Age" type="integer" width="50%"
        zeroOrPositive="true" />
    </FlowLayout>
  </Form>
</App>  
```

%-EVENT-END

%-EVENT-START dirtyChanged

The `dirtyChanged` event fires whenever the Form's dirty state changes. The event argument is the new dirty state.

See [Tracking Dirty State](#tracking-dirty-state) for an example.

%-EVENT-END

%-EVENT-START willSubmit

The `onWillSubmit` handler receives **two arguments**:

- **`data`** — the form data that will be passed to `onSubmit` (fields marked `noSubmit="true"` are already excluded).
- **`allData`** — the complete form data including `noSubmit` fields, useful for cross-field validation.

Fields marked with `noSubmit` are excluded from `onSubmit` regardless of what `willSubmit` does.

The following example validates that a password and its confirmation match. The confirmation field is marked `noSubmit="true"` so it is not sent to the server, but it is available via `allData` for validation:

```xmlui-pg display copy {4-11} name="Example: willSubmit with cross-field validation"
<App>
  <Form padding="0.5rem"
    data="{{ username: '', password: '', confirmPassword: '' }}"
    onWillSubmit="(data, allData) => {
      if (allData.password !== allData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }"
    onSubmit="(data) => toast('Account created for ' + data.username)"
    saveLabel="Create account">
    <FormItem label="Username" bindTo="username" required="true" />
    <FormItem label="Password" bindTo="password" type="password" required="true" />
    <FormItem label="Confirm Password" bindTo="confirmPassword" type="password" required="true" noSubmit="true" />
  </Form>
</App>
```

The following example uses the first argument to inspect what will be submitted, and returns `false` to block submission when an age value is invalid:

```xmlui-pg display copy {4-8} name="Example: willSubmit allowing data only when age is even"
<App>
  <Form padding="0.5rem"
    data="{{ name: 'Joe', age: 43 }}"
    onWillSubmit="(data) => {
      if (data.age % 2) {
        toast.error('Age must be an even number');
        return false;
      }
    }"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FlowLayout columnGap="12px" paddingBottom="6px">
      <FormItem bindTo="name" label="Customer name" width="50%" />
      <FormItem bindTo="age" label="Age" type="integer" width="50%"
        zeroOrPositive="true" />
    </FlowLayout>
  </Form>
</App>
```

%-EVENT-END

%-API-START reset

Pass data to `reset` to replace the current values and establish a new clean initial baseline.
Later parameterless resets return to that baseline.

```xmlui-pg copy display name="Example: reset with new initial data"
<App>
  <Form id="profileForm"
    data="{{ name: 'Original name' }}"
    padding="0.5rem"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem bindTo="name" label="Name" />
  </Form>
  <Button
    label="Adopt canonical data"
    onClick="profileForm.reset({ name: 'Canonical name' })" />
</App>
```

%-API-END

%-API-START isDirty

See [Tracking Dirty State](#tracking-dirty-state) for an example.

%-API-END

%-API-START setDirty

See [Tracking Dirty State](#tracking-dirty-state) for an example.

%-API-END

%-API-START update

This method updates the form data with the change passed in its parameter. The parameter is a hash object, and this method updates the Form's properties accordingly. 

```xmlui-pg copy display name="Example: update"
<App>
  <Form id="myForm" padding="0.5rem"
    data="{{ name: 'Joe', age: 43, $update: 123 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FlowLayout columnGap="12px" paddingBottom="6px">
      <FormItem bindTo="name" label="Customer name" width="50%" />
      <FormItem bindTo="age" label="Age" type="integer" width="50%"
        zeroOrPositive="true" />
    </FlowLayout>
    <Button onClick="() => $data.update({age: $data.age + 1})" >
      Increment age (1)
    </Button>
    <Button onClick="() => myForm.update({age: $data.age + 1})" >
      Increment age (2)
    </Button>
    <Button onClick="() => myForm.update({name: $data.name + '!', age: $data.age + 1})" >
      Update name and age
    </Button>
  </Form>
</App>  
```

%-API-END
