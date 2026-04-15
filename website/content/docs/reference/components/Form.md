# Form [#form]

`Form` provides a structured container for collecting and validating user input, with built-in data binding, validation, and submission handling. It automatically manages form state and provides context for nested form controls to work together.

**Key features:**
- **Automatic data binding**: Form controls automatically sync with form data using `bindTo` properties
- **Built-in validation**: Validates individual fields and overall form state before submission
- **Context sharing**: Provides `$data` and other context values accessible to all nested components
- **Submission handling**: Manages form submission workflow and prevents invalid submissions

See [this guide](/docs/guides/forms) for details.

**Context variables available during execution:**

- `$data`: This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances. `$data` also provides an `update` method as a shortcut to the Form's exposed `update` method.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Display When | `displayWhen` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

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

### `cancelLabel` [#cancellabel]

> [!DEF]  default: **"Cancel"**

This property defines the label of the Cancel button.

### `completedNotificationMessage` [#completednotificationmessage]

This property sets the message to display when the form is submitted successfully.

### `data` [#data]

This property sets the initial value of the form's data structure. The form infrastructure uses this value to set the initial state of form items within the form. If this property isnot set, the form does not have an initial value.

### `dataAfterSubmit` [#dataaftersubmit]

> [!DEF]  default: **"keep"**

Controls what happens to the form data after a successful submit. `"keep"` (default) leaves the submitted data in the form. `"reset"` restores the form to its initial data (the value of the `data` property). `"clear"` empties the form as if no `data` property were set.

Available values: `keep` **(default)**, `reset`, `clear`

### `doNotPersistFields` [#donotpersistfields]

An optional list of field names (matching the `bindTo` values of nested `FormItem` components) that should be excluded from the temporary localStorage save. The fields are still submitted normally; they are only excluded from the persisted snapshot.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `enableSubmit` [#enablesubmit]

> [!DEF]  default: **true**

This property controls whether the submit button is enabled. When set to false, the submit button is disabled and the form cannot be submitted.

### `errorNotificationMessage` [#errornotificationmessage]

This property sets the message to display when the form submission fails.

### `hideButtonRow` [#hidebuttonrow]

> [!DEF]  default: **false**

This property hides the button row entirely when set to true.

### `hideButtonRowUntilDirty` [#hidebuttonrowuntildirty]

> [!DEF]  default: **false**

This property hides the button row until the form data is modified (dirty).

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

This property sets the message to display when the form is being submitted.

### `itemLabelBreak` [#itemlabelbreak]

> [!DEF]  default: **true**

This boolean value indicates if form item labels can be split into multiple lines if it would overflow the available label width. Individual `FormItem` instances can override this property.

### `itemLabelPosition` [#itemlabelposition]

> [!DEF]  default: **"top"**

This property sets the position of the item labels within the form.Individual `FormItem` instances can override this property.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |
| `before` | The label is placed directly before the input with fit-content width. Similar to 'start' but the label does not stretch. |
| `after` | The label is placed directly after the input with fit-content width. Similar to 'end' but the label does not stretch. |

### `itemLabelWidth` [#itemlabelwidth]

This property sets the width of the item labels within the form. Individual `FormItem` instances can override this property. If this property is not set, each form item nested in the form uses its calculated label width. These widths may be different for each item.

### `itemRequireLabelMode` [#itemrequirelabelmode]

> [!DEF]  default: **"markRequired"**

This property controls how required indicators are displayed for required form items. Individual `FormItem` instances can override this property.

Available values:

| Value | Description |
| --- | --- |
| `markRequired` | Show "*" for required fields **(default)** |
| `markOptional` | Show "(Optional)" for optional fields |
| `markBoth` | Show "*" for required AND "(Optional)" for optional fields |

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

### `keepModalOpenOnSubmit` [#keepmodalopenonsubmit]

> [!DEF]  default: **false**

This property prevents the modal from closing when the form is submitted.

### `keepOnCancel` [#keeponcancel]

> [!DEF]  default: **false**

When `persist` is enabled and the user cancels the form, this property controls whether the temporarily saved data is kept (`true`) or cleared (`false`, the default).

### `persist` [#persist]

When set to `true` (or a non-empty string), the form temporarily saves its data to localStorage as the user types, so that unsaved changes survive a page reload or crash. On a successful submit the saved data is automatically cleared.

### `saveInProgressLabel` [#saveinprogresslabel]

> [!DEF]  default: **"Saving..."**

This property defines the label of the Save button to display during the form data submit (save) operation.

### `saveLabel` [#savelabel]

> [!DEF]  default: **"Save"**

This property defines the label of the Save button.

### `savePendingLabel` [#savependinglabel]

> [!DEF]  default: **"Validating..."**

This property defines the label of the Save button to display while async field validation is still in-flight. During async validation, the Submit button is disabled to prevent submission before validation completes.

### `stickyButtonRow` [#stickybuttonrow]

> [!DEF]  default: **false**

When set to true, the button row sticks to the bottom of the scrollable content area. Useful when the form is displayed inside a scrollable container such as a ModalDialog.

### `storageKey` [#storagekey]

The key used to save the form's temporary data in localStorage when `persist` is enabled. If omitted, the form's `id` attribute is used. If the form has no `id`, the key defaults to `"form-data"`.

### `submitFeedbackDelay` [#submitfeedbackdelay]

> [!DEF]  default: **100**

The number of milliseconds to wait before switching the Save button label to `saveInProgressLabel` or `savePendingLabel`. This prevents a distracting label flash when submit or validation completes quickly.

### `submitMethod` [#submitmethod]

This property sets the HTTP method to use when submitting the form data. If not defined, `put` is used when the form has initial data; otherwise, `post`.

### `submitUrl` [#submiturl]

URL to submit the form data.

### `swapCancelAndSave` [#swapcancelandsave]

> [!DEF]  default: **false**

By default, the Cancel button is to the left of the Save button. Set this property to `true` to swap them or `false` to keep their original location.

### `validationIconError` [#validationiconerror]

Icon to display for error state when concise validation summary is enabled.

### `validationIconSuccess` [#validationiconsuccess]

Icon to display for valid state when concise validation summary is enabled.

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

## Events [#events]

### `cancel` [#cancel]

The form infrastructure fires this event when the form is canceled.

**Signature**: `cancel(): void`

### `reset` [#reset]

The form infrastructure fires this event when the form is reset.

**Signature**: `reset(): void`

### `submit` [#submit]

The form infrastructure fires this event when the form is submitted. The event argument is the current `data` value to save.

**Signature**: `submit(data: Record<string, any>): void`

- `data`: The current form data being submitted.

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

**Signature**: `success(response: any): void`

- `response`: The response from the successful form submission.

### `willSubmit` [#willsubmit]

The form infrastructure fires this event just before the form is submitted. The event receives two arguments: the cleaned form data (fields marked `noSubmit` excluded) and the complete form data (including all fields). The return value controls submission behavior: returning `false` cancels the submission; returning a plain object submits that object instead; returning `null`, `undefined`, an empty string, or any non-object value proceeds with normal submission.

**Signature**: `willSubmit(data: Record<string, any>, allData: Record<string, any>): false | Record<string, any> | null | undefined | void`

- `data`: The form data to be submitted (fields marked with noSubmit="true" are excluded).
- `allData`: The complete form data including all fields, useful for cross-field validation.

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

## Exposed Methods [#exposed-methods]

### `getData` [#getdata]

This method returns a deep clone of the current form data object. Changes to the returned object do not affect the form's internal state.

**Signature**: `getData(): Record<string, any>`

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

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`buttonRow`**: The container for the form action buttons (e.g., Save, Cancel).
- **`validationSummary`**: The area displaying validation summary messages for the form.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-buttonRow-Form | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Form | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-error | $color-danger-100 | $color-danger-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-info | $color-primary-100 | $color-primary-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-valid | $color-success-100 | $color-success-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-warning | $color-warn-100 | $color-warn-100 |
| [color](/docs/styles-and-themes/common-units/#color)-accent-ValidationDisplay-error | $color-error | $color-error |
| [color](/docs/styles-and-themes/common-units/#color)-accent-ValidationDisplay-info | $color-info | $color-info |
| [color](/docs/styles-and-themes/common-units/#color)-accent-ValidationDisplay-valid | $color-valid | $color-valid |
| [color](/docs/styles-and-themes/common-units/#color)-accent-ValidationDisplay-warning | $color-warning | $color-warning |
| [gap](/docs/styles-and-themes/common-units/#size)-buttonRow-Form | $space-4 | $space-4 |
| [gap](/docs/styles-and-themes/common-units/#size)-Form | $space-4 | $space-4 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-buttonRow-Form | $space-4 | $space-4 |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-buttonRow-Form | 0 | 0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-error | $color-error | $color-error |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-info | $color-info | $color-info |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-valid | $color-valid | $color-valid |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-warning | $color-warning | $color-warning |
