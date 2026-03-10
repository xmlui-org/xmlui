# Form [#form]

`Form` provides a structured container for collecting and validating user input, with built-in data binding, validation, and submission handling. It automatically manages form state and provides context for nested form controls to work together.

**Context variables available during execution:**

- `$data`: This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances. `$data` also provides an `update` method as a shortcut to the Form's exposed `update` method.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `buttonRowTemplate` [#buttonrowtemplate]

This property allows defining a custom component to display the buttons at the bottom of the form.

### `cancelLabel` [#cancellabel]

> [!DEF]  default: **"Cancel"**

This property defines the label of the Cancel button.

### `completedNotificationMessage` [#completednotificationmessage]

This property sets the message to display when the form is submitted successfully.

### `data` [#data]

This property sets the initial value of the form's data structure. The form infrastructure uses this value to set the initial state of form items within the form. If this property isnot set, the form does not have an initial value.

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

### `keepModalOpenOnSubmit` [#keepmodalopenonsubmit]

> [!DEF]  default: **false**

This property prevents the modal from closing when the form is submitted.

### `saveInProgressLabel` [#saveinprogresslabel]

> [!DEF]  default: **"Saving..."**

This property defines the label of the Save button to display during the form data submit (save) operation.

### `saveLabel` [#savelabel]

> [!DEF]  default: **"Save"**

This property defines the label of the Save button.

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

### `success` [#success]

The form infrastructure fires this event when the form is submitted successfully.

**Signature**: `success(response: any): void`

- `response`: The response from the successful form submission.

### `willSubmit` [#willsubmit]

The form infrastructure fires this event just before the form is submitted. The event argument is the current `data` value to be submitted. The return value controls submission behavior: returning `false` cancels the submission; returning a plain object submits that object instead; returning `null`, `undefined`, an empty string, or any non-object value proceeds with normal submission.

**Signature**: `willSubmit(data: Record<string, any>): false | Record<string, any> | null | undefined | void`

- `data`: The current form data to be submitted.

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
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-error | $color-error | $color-error |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-info | $color-info | $color-info |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-valid | $color-valid | $color-valid |
| [textColor](/docs/styles-and-themes/common-units/#color)-ValidationDisplay-warning | $color-warning | $color-warning |
