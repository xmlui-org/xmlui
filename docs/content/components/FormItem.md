# FormItem [#formitem]

`FormItem` wraps individual input controls within a `Form`, providing data binding, validation, labeling, and layout functionality. It connects form controls to the parent form's data model and handles validation feedback automatically. **Note:** `FormItem` must be used inside a `Form` component.

**Key features:**
- **Data binding**: Automatically syncs control values with form data using the `bindTo` property
- **Validation**: Displays validation states and error messages for the associated input
- **Flexible labeling**: Supports labels, helper text, and various label positioning options
- **Layout management**: Handles consistent spacing and alignment of form elements

See [this guide](/forms) for details.

**Context variables available during execution:**

- `$setValue`: Function to set the FormItem's value programmatically
- `$validationResult`: Current validation state and error messages for this field
- `$value`: Current value of the FormItem, accessible in expressions and code snippets
- `$item`: When inside a `type="items"` FormItem, represents the current array element
- `$itemIndex`: When inside a `type="items"` FormItem, the zero-based index of the current element

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `bindTo` [#bindto]

This property binds a particular input field to one of the attributes of the `Form` data. It names the property of the form's `data` data to get the input's initial value.When the field is saved, its value will be stored in the `data` property with this name. If the property is not set, the input will be bound to an internal data field but not submitted.

Try to enter some kind of text in the input field labelled `Lastname` and submit the form. Note how the submitted data looks like compared to the one set in `data`.

```xmlui-pg copy display name="Example: bindTo"
<App>
  <Form
    data="{{ firstname: 'James', lastname: 'Clewell' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem label="Firstname" bindTo="firstname" />
    <FormItem label="Lastname" />
  </Form>
</App>
```

### `customValidationsDebounce` (default: 0) [#customvalidationsdebounce-default-0]

This optional number prop determines the time interval between two runs of a custom validation.

Note how changing the input in the demo below will result in a slight delay of input checks noted by the appearance of a new "I" character.

```xmlui-pg copy display name="Example: customValidationsDebounce"
<App>
  <Form
    var.validations="Validations: "
    data="{{ name: 'Joe' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem
      customValidationsDebounce="3000"
      onValidate="(value) => { 
        validations += '| '; 
        return value === value.toUpperCase(); 
      }"
      bindTo="name" />
    <Text value="{validations}" />
  </Form>
</App>
```

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <Form>
    <FormItem label="Firstname" enabled="true" />
    <FormItem label="Lastname" enabled="false" />
  </Form>
</App>
```

### `gap` (default: "0") [#gap-default-0]

This property defines the gap between the adornments and the input area.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <Form data="{{ firstname: 'Michael', lastname: undefined }}">
    <FormItem label="Firstname" bindTo="firstname" initialValue="James" />
    <FormItem label="Lastname" bindTo="lastname" initialValue="Jordan" />
  </Form>
</App>
```

### `inputTemplate` [#inputtemplate]

This property is used to define a custom input template.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

```xmlui-pg copy display name="Example: label"
<App>
  <Form>
    <FormItem label="Firstname" />
  </Form>
</App>
```

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates if the label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` (default: "top") [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

Different input components have different layout methods
(i.e. `TextBox` labels are positioned at the top, `Checkbox` labels are on the right side).

```xmlui-pg copy display name="Example: labelPosition"
<App>
  <Form>
    <FormItem label="Start Label" labelPosition="start" />
    <FormItem label="Top Label" labelPosition="top" />
    <FormItem label="End Label" labelPosition="end" />
    <FormItem label="Bottom Label" labelPosition="bottom" />
  </Form>
</App>
```

### `labelWidth` [#labelwidth]

This property sets the width of the `FormItem` component's label. If not defined, the label's width will be determined by its content and the available space.

### `lengthInvalidMessage` [#lengthinvalidmessage]

This optional string property is used to customize the message that is displayed on a failed length check: [minLength](#minlength) or [maxLength](#maxlength).

In the app, type a name longer than four characters in both fields, then leave the edited field. The two fields will display different error messages; the second uses the customized one.

```xmlui-pg copy display name="Example: lengthInvalidMessage"
<App>
  <Form
    data="{{ firstname: 'James', lastname: 'Clewell' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxLength="4" bindTo="firstname" />
    <FormItem lengthInvalidMessage="Name is too long!" maxLength="4" bindTo="lastname" />
  </Form>
</App>
```

### `lengthInvalidSeverity` (default: "error") [#lengthinvalidseverity-default-error]

This property sets the severity level of the length validation.

Available values: `error` **(default)**, `warning`, `valid`

In the app, type a name longer than four characters in both fields, then leave the edited field. The two fields will display different error messages; the second uses a warning instead of an error.

```xmlui-pg copy display name="Example: lengthInvalidSeverity"
<App>
  <Form
    data="{{ firstname: 'James', lastname: 'Clewell' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxLength="4" bindTo="firstname" />
    <FormItem lengthInvalidSeverity="warning" maxLength="4" bindTo="lastname" />
  </Form>
</App>
```

### `maxLength` [#maxlength]

This property sets the maximum length of the input value. If the value is not set, no maximum length check is done.

Note that it is not possible for the user to enter a string larger than the value of the `maxLength`,
but setting such a value programmatically still results in a validation check.

In the demo below, try to enter an input longer than 4 characters or submit the form as is.

```xmlui-pg copy display name="Example: maxLength"
<App>
  <Form
    data="{{ firstname: 'James' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxLength="4" bindTo="firstname" />
  </Form>
</App>
```

### `maxTextLength` [#maxtextlength]

The maximum length of the text in the input field. If this value is not set, no maximum length constraint is set for the input field.

### `maxValue` [#maxvalue]

The maximum value of the input. If this value is not specified, no maximum value check is done.

Note that it is not possible for the user to enter a number larger than the value of the `maxValue`,
but setting such a value programmatically still results in a validation check.

In the demo below, enter an input greater than 99 or just submit the form as is.

```xmlui-pg copy display name="Example: maxValue"
<App>
  <Form
    data="{{ age: 100 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem maxValue="99" bindTo="age" type="integer" />
  </Form>
</App>
```

### `minLength` [#minlength]

This property sets the minimum length of the input value. If the value is not set, no minimum length check is done.

In the demo below, enter an input shorter than 4 characters or just submit the form as is.

```xmlui-pg copy display name="Example: minLength"
<App>
  <Form
    data="{{ firstname: '' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minLength="4" bindTo="firstname" />
  </Form>
</App>
```

### `minValue` [#minvalue]

The minimum value of the input. If this value is not specified, no minimum value check is done.

Note that it is not possible for the user to enter a number smaller than the value of the `minValue`,
but setting such a value programmatically still results in a validation check.

In the demo below, enter an input smaller than 18 or just submit the form as is.

```xmlui-pg copy display name="Example: minValue"
<App>
  <Form
    data="{{ age: 0 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minValue="18" bindTo="age" type="integer" />
  </Form>
</App>
```

### `noSubmit` (default: false) [#nosubmit-default-false]

When set to `true`, the field will not be included in the form's submitted data. This is useful for fields that should be present in the form but not submitted, similar to hidden fields. If multiple FormItems reference the same `bindTo` value and any of them has `noSubmit` set to `true`, the field will NOT be submitted.

### `pattern` [#pattern]

This value specifies a predefined regular expression to test the input value. If this value is not set, no pattern check is done.

| Value   | Description                                                                                                                                                |
| :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `email` | Accepts the `[username]@[second level domain].[top level domain]` format                                                                                     |
| `phone` | Requires at least one digit and accepts: numbers, upper- and lowercase letters and the following symbols: `#`, `*`, `)`, `(`, `+`, `.`, `\`, `-`, `_`, `&`, `'` |
| `url`   | Accepts URLs and URIs starting with either `http` or `https`                                                                                               |

> **Note:** To define custom patterns and regular expressions, see the [regex section](#regex).

In the demo below, enter an input that is not solely one lowercase string or just submit the form as is.

```xmlui-pg copy display name="Example: pattern"
<App>
  <Form
    data="{{ userEmail: 'mailto' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem pattern="email" bindTo="userEmail" />
  </Form>
</App>
```

### `patternInvalidMessage` [#patterninvalidmessage]

This optional string property is used to customize the message that is displayed on a failed pattern test.

In the demo below, enter anything that does not look like an email and click outside to see the regular and custom message.

```xmlui-pg copy display name="Example: patternInvalidMessage"
<App>
  <Form
    data="{{ oldEmail: 'mailto', newEmail: 'mailto' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem pattern="email" bindTo="oldEmail" />
    <FormItem
      patternInvalidMessage="This does not look like an email"
      pattern="email" bindTo="newEmail" />
  </Form>
</App>
```

### `patternInvalidSeverity` (default: "error") [#patterninvalidseverity-default-error]

This property sets the severity level of the pattern validation.

Available values: `error` **(default)**, `warning`, `valid`

In the demo below, enter a string of characters that does not look like an email to see the difference in feedback.

```xmlui-pg copy display name="Example: patternInvalidSeverity"
<App>
  <Form
    data="{{ oldEmail: 'mailto', newEmail: 'mailto' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem pattern="email" bindTo="oldEmail" />
    <FormItem patternInvalidSeverity="warning" pattern="email" bindTo="newEmail" />
  </Form>
</App>
```

### `rangeInvalidMessage` [#rangeinvalidmessage]

This optional string property is used to customize the message that is displayed when a value is out of range.

In the demo below, enter any value that is out of range in the input fields and click outside to see the regular and custom message.
Just submitting the form as is also produces the same error.

```xmlui-pg copy display name="Example: rangeInvalidMessage"
<App>
  <Form
    data="{{ age: 100, customAge: 100 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minValue="0" maxValue="99" bindTo="age" type="integer" />
    <FormItem
      minValue="0"
      maxValue="99"
      rangeInvalidMessage="Out of range!"
      bindTo="customAge"
      type="integer" />
  </Form>
</App>
```

### `rangeInvalidSeverity` (default: "error") [#rangeinvalidseverity-default-error]

This property sets the severity level of the value range validation.

Available values: `error` **(default)**, `warning`, `valid`

In the demo below, enter any value that is out of range in the input fields and click outside to see the regular and custom message.
Just submitting the form as is also produces the same error.

```xmlui-pg copy display name="Example: rangeInvalidSeverity"
<App>
  <Form
    data="{{ age: 100, customAge: 100 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem minValue="0" maxValue="99" bindTo="age" type="integer" />
    <FormItem
      minValue="0" maxValue="99"
      rangeInvalidSeverity="warning"
      bindTo="customAge"
      type="integer" />
  </Form>
</App>
```

### `regex` [#regex]

This value specifies a custom regular expression to test the input value. If this value is not set, no regular expression pattern check is done.

In the demo below, enter an input that is not solely one lowercase string or just submit the form as is.

```xmlui-pg copy display name="Example: regex"
<App>
  <Form
    data="{{ password: 'PASSWORD123' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem regex="^[a-z]+$" bindTo="password" />
  </Form>
</App>
```

### `regexInvalidMessage` [#regexinvalidmessage]

This optional string property is used to customize the message that is displayed on a failed regular expression test.

In the demo below, enter a password that is not a lowercase string and click outside to see the regular and custom message.

```xmlui-pg copy display name="Example: regexInvalidMessage"
<App>
  <Form
    data="{{ oldPassword: 'PASSWORD123', newPassword: 'PASSWORD123' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem regex="^[a-z]+$" bindTo="oldPassword" />
    <FormItem
      regexInvalidMessage="Password must be all lowercase"
      regex="^[a-z]+$" bindTo="newPassword" />
  </Form>
</App>
```

### `regexInvalidSeverity` (default: "error") [#regexinvalidseverity-default-error]

This property sets the severity level of regular expression validation.

Available values: `error` **(default)**, `warning`, `valid`

In the demo below, enter a password that is not a lowercase string and click outside to see the regular and custom message.
Just submitting the form as is also produces the same error.

```xmlui-pg copy display name="Example: regexInvalidSeverity"
<App>
  <Form
    data="{{ oldPassword: 'PASSWORD123', newPassword: 'PASSWORD123' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem regex="^[a-z]+$" bindTo="oldPassword" />
    <FormItem regexInvalidSeverity="warning" regex="^[a-z]+$" bindTo="newPassword" />
  </Form>
</App>
```

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

```xmlui-pg copy display name="Example: required"
<App>
  <Form
    data="{{ name: undefined }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem required="true" label="Name" bindTo="name" />
  </Form>
</App>
```

### `requiredInvalidMessage` [#requiredinvalidmessage]

This optional string property is used to customize the message that is displayed if the field is not filled in. If not defined, the default message is used.

In the demo below, leave the field empty and click outside to see the regular and custom message.

```xmlui-pg copy display name="Example: requiredInvalidMessage"
<App>
  <Form
    data="{{ firstname: undefined, lastname: undefined }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem required="true" label="First Name" bindTo="firstname" />
    <FormItem
      requiredInvalidMessage="Last Name is required!"
      required="true"
      label="Last Name"
      bindTo="lastname" />
  </Form>
</App>
```

### `type` (default: "text") [#type-default-text]

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

>[!INFO]
> For custom controls, there is no need to explicitly set the `type` to `custom`.
> Omitting the type and providing child components implicitly sets it to custom.

#### Working with `type="items"` for Array Iteration [#working-with-type-items]

When `type` is set to `"items"`, the FormItem creates an iteration context over an array, allowing you to nest FormItem components inside to bind to properties of individual array elements. This pattern is useful for dynamic form sections like invoice line items, order details, or any repeating data structure.

**Key concepts:**

1. **Array binding**: The outer FormItem with `type="items"` binds to an array property in the form data
2. **Nested FormItems**: Child FormItem components bind to properties of each array element using `bindTo`
3. **Context variables**: Inside the nested FormItems, you have access to:
   - `$item`: The current array element being iterated
   - `$itemIndex`: The zero-based index of the current element
4. **Dynamic manipulation**: Use the exposed methods to add/remove items:
   - `addItem(data)`: Adds a new item to the array
   - `removeItem(index)`: Removes an item at the specified index

**Example: Invoice Line Items**

```xmlui
<Form id="invoiceForm">
  <!-- Outer FormItem creates the array iteration context -->
  <FormItem
    bindTo="lineItems"
    type="items"
    id="lineItemsForm"
    required="true"
    requiredInvalidMessage="At least one line item is required."
  >
    <!-- Layout for each line item row -->
    <FlowLayout width="100%" gap="$space-2">
      <!-- Nested FormItems bind to properties of each array element -->
      <FormItem
        bindTo="product"
        type="select"
        placeholder="select product"
        width="30%"
      >
        <Items data="{products}">
          <Option value="{$item.name}" label="{$item.name}" />
        </Items>
      </FormItem>
      
      <FormItem
        bindTo="quantity"
        type="number"
        initialValue="1"
        minValue="1"
        width="20%"
      />
      
      <FormItem
        bindTo="price"
        startText="$"
        width="20%"
      />
      
      <FormItem
        bindTo="amount"
        startText="$"
        enabled="false"
        initialValue="{$item.quantity * $item.price}"
        width="20%"
      />
      
      <!-- Use $itemIndex to remove specific items -->
      <Button onClick="lineItemsForm.removeItem($itemIndex)">
        Remove
      </Button>
    </FlowLayout>
  </FormItem>
  
  <!-- Add new items to the array -->
  <Button onClick="lineItemsForm.addItem()">
    Add Line Item
  </Button>
</Form>
```

**Resulting data structure:**

```json
{
  "lineItems": [
    {
      "product": "Widget A",
      "quantity": 2,
      "price": 10.50,
      "amount": 21.00
    },
    {
      "product": "Widget B",
      "quantity": 1,
      "price": 25.00,
      "amount": 25.00
    }
  ]
}
```

See the [Invoice Tutorial](/tutorial-08) for a complete working example.

### `validationMode` (default: "errorLate") [#validationmode-default-errorlate]

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

In the demo below, leave the field as is and submit the form or enter an input that is not all capital letters.

```xmlui-pg copy {7} display name="Example: validate"
<App>
  <Form
    data="{{ name: 'James' }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FormItem
      bindTo="name"
      onValidate="(value) => value === value.toUpperCase()" />
  </Form>
</App>
```

## Exposed Methods [#exposed-methods]

### `addItem` [#additem]

This method adds a new item to the array managed by a FormItem with `type="items"`. The new item is appended to the end of the array. If no data is provided, an empty object is added.

**Signature**: `addItem(data?: any): void`

- `data`: (Optional) The data to add to the FormItem's array. If omitted, adds an empty object `{}`

**Example:**
```xmlui
<FormItem bindTo="lineItems" type="items" id="itemsList">
  <!-- nested FormItems here -->
</FormItem>

<!-- Add an empty item -->
<Button onClick="itemsList.addItem()">Add Empty Item</Button>

<!-- Add a pre-populated item -->
<Button onClick="itemsList.addItem({ product: 'Default', quantity: 1 })">
  Add Default Item
</Button>
```

### `removeItem` [#removeitem]

Removes the item at the specified index from the array managed by a FormItem with `type="items"`.

**Signature**: `removeItem(index: number): void`

- `index`: The zero-based index of the item to remove from the array

**Example:**
```xmlui
<FormItem bindTo="lineItems" type="items" id="itemsList">
  <FlowLayout>
    <!-- nested FormItems here -->
    
    <!-- Use $itemIndex to remove the current item -->
    <Button onClick="itemsList.removeItem($itemIndex)">
      Remove
    </Button>
  </FlowLayout>
</FormItem>
```

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-FormItemLabel | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-FormItemLabel | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-FormItemLabel-required | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-FormItemLabel | normal | normal |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-FormItemLabel-required | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-FormItemLabel | $fontWeight-medium | $fontWeight-medium |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-FormItemLabel-required | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-FormItemLabel | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-FormItemLabel-required | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-FormItemLabel-requiredMark | $color-danger-400 | $color-danger-400 |
| [textTransform](../styles-and-themes/common-units/#textTransform)-FormItemLabel | none | none |
| [textTransform](../styles-and-themes/common-units/#textTransform)-FormItemLabel-required | *none* | *none* |
