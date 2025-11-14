# Form [#form]

`Form` provides a structured container for collecting and validating user input, with built-in data binding, validation, and submission handling. It automatically manages form state and provides context for nested form controls to work together.

**Key features:**
- **Automatic data binding**: Form controls automatically sync with form data using `bindTo` properties
- **Built-in validation**: Validates individual fields and overall form state before submission
- **Context sharing**: Provides `$data` and other context values accessible to all nested components
- **Submission handling**: Manages form submission workflow and prevents invalid submissions

See [this guide](/forms) for details.

**Context variables available during execution:**

- `$data`: This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances. `$data` also provides an `update` method as a shortcut to the Form's exposed `update` method.

## Properties [#properties]

### `buttonRowTemplate` [#buttonrowtemplate]

This property allows defining a custom component to display the buttons at the bottom of the form.

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

### `cancelLabel` (default: "Cancel") [#cancellabel-default-cancel]

This property defines the label of the Cancel button.

### `completedNotificationMessage` [#completednotificationmessage]

This property sets the message to display when the form is submitted successfully.

### `data` [#data]

This property sets the initial value of the form's data structure. The form infrastructure uses this value to set the initial state of form items within the form. If this property isnot set, the form does not have an initial value.

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `enableSubmit` (default: true) [#enablesubmit-default-true]

This property controls whether the submit button is enabled. When set to false, the submit button is disabled and the form cannot be submitted.

### `errorNotificationMessage` [#errornotificationmessage]

This property sets the message to display when the form submission fails.

### `hideButtonRow` (default: false) [#hidebuttonrow-default-false]

This property hides the button row entirely when set to true.

### `hideButtonRowUntilDirty` (default: false) [#hidebuttonrowuntildirty-default-false]

This property hides the button row until the form data is modified (dirty).

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

This property sets the message to display when the form is being submitted.

### `itemLabelBreak` (default: true) [#itemlabelbreak-default-true]

This boolean value indicates if form item labels can be split into multiple lines if it would overflow the available label width. Individual `FormItem` instances can override this property.

### `itemLabelPosition` (default: "top") [#itemlabelposition-default-top]

This property sets the position of the item labels within the form.Individual `FormItem` instances can override this property.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `itemLabelWidth` [#itemlabelwidth]

This property sets the width of the item labels within the form. Individual `FormItem` instances can override this property. If this property is not set, each form item nested in the form uses its calculated label width. These widths may be different for each item.

### `keepModalOpenOnSubmit` (default: false) [#keepmodalopenonsubmit-default-false]

This property prevents the modal from closing when the form is submitted.

### `saveInProgressLabel` (default: "Saving...") [#saveinprogresslabel-default-saving-]

This property defines the label of the Save button to display during the form data submit (save) operation.

### `saveLabel` (default: "Save") [#savelabel-default-save]

This property defines the label of the Save button.

### `submitMethod` [#submitmethod]

This property sets the HTTP method to use when submitting the form data. If not defined, `put` is used when the form has initial data; otherwise, `post`.

### `submitUrl` [#submiturl]

URL to submit the form data.

### `swapCancelAndSave` (default: false) [#swapcancelandsave-default-false]

By default, the Cancel button is to the left of the Save button. Set this property to `true` to swap them or `false` to keep their original location.

## Events [#events]

### `cancel` [#cancel]

The form infrastructure fires this event when the form is canceled.

### `reset` [#reset]

The form infrastructure fires this event when the form is reset.

### `submit` [#submit]

The form infrastructure fires this event when the form is submitted. The event argument is the current `data` value to save.

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

### `success` [#success]

The form infrastructure fires this event when the form is submitted successfully.

### `willSubmit` [#willsubmit]

The form infrastructure fires this event just before the form is submitted. The event argument is the current `data` value to be submitted. The return value controls submission behavior: returning `false` cancels the submission; returning a plain object submits that object instead; returning `null`, `undefined`, an empty string, or any non-object value proceeds with normal submission.

The following example allows saving customer data only when the age is an even number. The `willSubmit` event handler returns `false` if this condition is not met.

```xmlui-pg display copy {4-9} name="Example: willSubmit"
<App>
  <Form padding="0.5rem"
    data="{{ name: 'Joe', age: 43 }}"
    onWillSubmit="(toSubmit) => {
      if (toSubmit.age % 2) {
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

## Exposed Methods [#exposed-methods]

### `reset` [#reset]

This method resets the form to its initial state, clearing all user input.

**Signature**: `reset(): void`

### `update` [#update]

You can pass a data object to update the form data. The properties in the passed data object are updated to their values accordingly. Other form properties remain intact.

**Signature**: `update(data: Record<string, any>): void`

- `data`: An object containing the form data to update.

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

### `validate` [#validate]

This method triggers validation on all form fields without submitting the form. It displays validation errors and returns the validation result along with the cleaned form data. This is useful for implementing custom submit buttons or performing operations that require validated data without actually submitting the form.

**Signature**: `validate(): Promise<{ isValid: boolean, data: Record<string, any>, errors: ValidationResult[], warnings: ValidationResult[], validationResults: Record<string, ValidationResult> }>`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ValidationDisplay-error | $color-danger-100 | $color-danger-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-ValidationDisplay-info | $color-primary-100 | $color-primary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-ValidationDisplay-valid | $color-success-100 | $color-success-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-ValidationDisplay-warning | $color-warn-100 | $color-warn-100 |
| [color](../styles-and-themes/common-units/#color)-accent-ValidationDisplay-error | $color-error | $color-error |
| [color](../styles-and-themes/common-units/#color)-accent-ValidationDisplay-info | $color-info | $color-info |
| [color](../styles-and-themes/common-units/#color)-accent-ValidationDisplay-valid | $color-valid | $color-valid |
| [color](../styles-and-themes/common-units/#color)-accent-ValidationDisplay-warning | $color-warning | $color-warning |
| [gap](../styles-and-themes/common-units/#size)-buttonRow-Form | $space-4 | $space-4 |
| [gap](../styles-and-themes/common-units/#size)-Form | $space-4 | $space-4 |
| [marginTop](../styles-and-themes/common-units/#size)-buttonRow-Form | $space-4 | $space-4 |
| [textColor](../styles-and-themes/common-units/#color)-ValidationDisplay-error | $color-error | $color-error |
| [textColor](../styles-and-themes/common-units/#color)-ValidationDisplay-info | $color-info | $color-info |
| [textColor](../styles-and-themes/common-units/#color)-ValidationDisplay-valid | $color-valid | $color-valid |
| [textColor](../styles-and-themes/common-units/#color)-ValidationDisplay-warning | $color-warning | $color-warning |
