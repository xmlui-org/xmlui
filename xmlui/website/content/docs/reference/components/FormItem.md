# FormItem [#formitem]

`FormItem` wraps individual input controls within a `Form`, providing data binding, validation, labeling, and layout functionality. It connects form controls to the parent form's data model and handles validation feedback automatically. **Note:** `FormItem` must be used inside a `Form` component.

**Context variables available during execution:**

- `$setValue`: Function to set the FormItem's value programmatically
- `$validationResult`: Current validation state and error messages for this field
- `$value`: Current value of the FormItem, accessible in expressions and code snippets

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `bindTo` [#bindto]

This property binds a particular input field to one of the attributes of the `Form` data. It names the property of the form's `data` data to get the input's initial value.When the field is saved, its value will be stored in the `data` property with this name. If the property is not set, the input will be bound to an internal data field but not submitted.

### `customValidationsDebounce` [#customvalidationsdebounce]

> [!DEF]  default: **0**

This optional number prop determines the time interval between two runs of a custom validation.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `gap` [#gap]

> [!DEF]  default: **"0"**

This property defines the gap between the adornments and the input area.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `inputTemplate` [#inputtemplate]

This property is used to define a custom input template.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` [#labelbreak]

> [!DEF]  default: **true**

This boolean value indicates if the label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` [#labelposition]

> [!DEF]  default: **"top"**

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `FormItem` component's label. If not defined, the label's width will be determined by its content and the available space.

### `lengthInvalidMessage` [#lengthinvalidmessage]

This optional string property is used to customize the message that is displayed on a failed length check: [minLength](#minlength) or [maxLength](#maxlength).

### `lengthInvalidSeverity` [#lengthinvalidseverity]

> [!DEF]  default: **"error"**

This property sets the severity level of the length validation.

Available values: `error` **(default)**, `warning`, `valid`

### `maxLength` [#maxlength]

This property sets the maximum length of the input value. If the value is not set, no maximum length check is done.

### `maxTextLength` [#maxtextlength]

The maximum length of the text in the input field. If this value is not set, no maximum length constraint is set for the input field.

### `maxValue` [#maxvalue]

The maximum value of the input. If this value is not specified, no maximum value check is done.

### `minLength` [#minlength]

This property sets the minimum length of the input value. If the value is not set, no minimum length check is done.

### `minValue` [#minvalue]

The minimum value of the input. If this value is not specified, no minimum value check is done.

### `noSubmit` [#nosubmit]

> [!DEF]  default: **false**

When set to `true`, the field will not be included in the form's submitted data. This is useful for fields that should be present in the form but not submitted, similar to hidden fields. If multiple FormItems reference the same `bindTo` value and any of them has `noSubmit` set to `true`, the field will NOT be submitted.

### `pattern` [#pattern]

This value specifies a predefined regular expression to test the input value. If this value is not set, no pattern check is done.

### `patternInvalidMessage` [#patterninvalidmessage]

This optional string property is used to customize the message that is displayed on a failed pattern test.

### `patternInvalidSeverity` [#patterninvalidseverity]

> [!DEF]  default: **"error"**

This property sets the severity level of the pattern validation.

Available values: `error` **(default)**, `warning`, `valid`

### `rangeInvalidMessage` [#rangeinvalidmessage]

This optional string property is used to customize the message that is displayed when a value is out of range.

### `rangeInvalidSeverity` [#rangeinvalidseverity]

> [!DEF]  default: **"error"**

This property sets the severity level of the value range validation.

Available values: `error` **(default)**, `warning`, `valid`

### `regex` [#regex]

This value specifies a custom regular expression to test the input value. If this value is not set, no regular expression pattern check is done.

### `regexInvalidMessage` [#regexinvalidmessage]

This optional string property is used to customize the message that is displayed on a failed regular expression test.

### `regexInvalidSeverity` [#regexinvalidseverity]

> [!DEF]  default: **"error"**

This property sets the severity level of regular expression validation.

Available values: `error` **(default)**, `warning`, `valid`

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `requiredInvalidMessage` [#requiredinvalidmessage]

This optional string property is used to customize the message that is displayed if the field is not filled in. If not defined, the default message is used.

### `requireLabelMode` [#requirelabelmode]

Controls how required/optional status is visually indicated in the label.

Available values:

| Value | Description |
| --- | --- |
| `markRequired` | Show "*" for required fields |
| `markOptional` | Show "(Optional)" for optional fields |
| `markBoth` | Show "*" for required AND "(Optional)" for optional fields |

### `type` [#type]

> [!DEF]  default: **"text"**

This property is used to determine the specific input control the FormItem will wrap around. Note that the control names start with a lowercase letter and map to input components found in XMLUI.

Available values:

| Value | Description |
| --- | --- |
| `text` | Renders TextBox **(default)** |
| `password` | Renders TextBox with `password` type |
| `textarea` | Renders Textarea |
| `checkbox` | Renders Checkbox |
| `number` | Renders NumberBox |
| `integer` | Renders NumberBox with `integersOnly` set to true |
| `file` | Renders FileInput |
| `datePicker` | Renders DatePicker |
| `radioGroup` | Renders RadioGroup |
| `switch` | Renders Switch |
| `select` | Renders Select |
| `autocomplete` | Renders AutoComplete |
| `slider` | Renders Slider |
| `colorpicker` | Renders ColorPicker |
| `items` | Renders Items |
| `custom` | A custom control specified in children. If `type` is not specified but the `FormItem` has children, it considers the control a custom one. |

### `validationMode` [#validationmode]

> [!DEF]  default: **"errorLate"**

This property sets what kind of validation mode or strategy to employ for a particular input field.

Available values:

| Value | Description |
| --- | --- |
| `errorLate` | Display the error when the field loses focus.If an error is already displayed, continue for every keystroke until input is accepted. **(default)** |
| `onChanged` | Display error (if present) for every keystroke. |
| `onLostFocus` | Show/hide error (if present) only if the field loses focus. |

## Events [#events]

### `validate` [#validate]

This event is used to define a custom validation function.

**Signature**: `validate(value: any): string | null | undefined | void`

- `value`: The current value of the FormItem to validate.

## Exposed Methods [#exposed-methods]

### `addItem` [#additem]

This method adds a new item to the list held by the FormItem. The function has a single parameter, the data to add to the FormItem. The new item is appended to the end of the list.

**Signature**: `addItem(data: any): void`

- `data`: The data to add to the FormItem's list.

### `removeItem` [#removeitem]

Removes the item specified by its index from the list held by the FormItem. The function has a single argument, the index to remove.

**Signature**: `removeItem(index: number): void`

- `index`: The index of the item to remove from the FormItem's list.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-FormItemLabel | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-FormItemLabel | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-FormItemLabel-required | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-FormItemLabel | normal | normal |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-FormItemLabel-required | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-FormItemLabel | $fontWeight-medium | $fontWeight-medium |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-FormItemLabel-required | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-FormItemLabel | $textColor | $textColor |
| [textColor](/docs/styles-and-themes/common-units/#color)-FormItemLabel-optionalTag | $textColor-secondary | $textColor-secondary |
| [textColor](/docs/styles-and-themes/common-units/#color)-FormItemLabel-required | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-FormItemLabel-requiredMark | $color-danger-400 | $color-danger-400 |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-FormItemLabel | none | none |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-FormItemLabel-required | *none* | *none* |
