# RadioGroup [#radiogroup]

`RadioGroup` creates a mutually exclusive selection interface where users can choose only one option from a group of radio buttons. It manages the selection state and ensures that selecting one option automatically deselects all others in the group.Radio options store their values as strings. Numbers and booleans are converted to strings when assigned, while objects, functions and arrays default to an empty string unless resolved via binding expressions.

**Key features:**
- **Exclusive selection**: Only one option can be selected at a time within the group
- **Form integration**: Built-in validation states and seamless form compatibility
- **Flexible layout**: Contains [Option](/components/Option) that can be arranged in any layout structure
- **State management**: Automatically handles selection state and change events
- **Accessibility support**: Proper keyboard navigation and screen reader compatibility
- **Validation indicators**: Visual feedback for error, warning, and valid states

`RadioGroup` is often used in forms. See [this guide](/forms) for details.

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

This property indicates whether the input accepts user actions (`true`) or not (`false`). The default value is `true`.

```xmlui-pg copy display name="Example: enabled"
<App>
  <RadioGroup initialValue="first" enabled="false">
    <HStack padding="$space-normal">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
      <Option label="Third Item" value="third"/>
    </HStack>
  </RadioGroup>
</App>
```

### `initialValue` (default: "") [#initialvalue-default-]

This property sets the component's initial value.

This property defines the initial value of the selected option within the group.

```xmlui-pg copy display name="Example: initialValue"
<App>
  <RadioGroup initialValue="first">
    <HStack padding="$space-normal">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
      <Option label="Third Item" value="third"/>
    </HStack>
  </RadioGroup>
</App>
```

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

This prop is used to visually indicate status changes reacting to form field validation.

| Value     | Description                                           |
| :-------- | :---------------------------------------------------- |
| `valid`   | Visual indicator for an input that is accepted        |
| `warning` | Visual indicator for an input that produced a warning |
| `error`   | Visual indicator for an input that produced an error  |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <HStack>
    <RadioGroup initialValue="first" validationStatus="error">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
    </RadioGroup>
    <RadioGroup initialValue="first" validationStatus="warning">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
    </RadioGroup>
    <RadioGroup initialValue="first" validationStatus="valid">
      <Option label="First Item" value="first"/>
      <Option label="Second Item" value="second"/>
    </RadioGroup>
  </HStack>
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of RadioGroup has changed.

This event is triggered after the user has changed the field value. The following example uses this event to display the selected option's value:

```xmlui-pg
---app copy display name="Example: didChange"
<App var.field="">
  <RadioGroup initialValue="{field}" onDidChange="(val) => field = val">
    <Option label="First Item" value="first"/>
    <Option label="Second Item" value="second"/>
  </RadioGroup>
  <Text value="{field}" />
</App>
---desc
Select one of the available options and see how the `Text` underneath it is updated in parallel:
```

### `gotFocus` [#gotfocus]

This event is triggered when the RadioGroup has received the focus.

### `lostFocus` [#lostfocus]

This event is triggered when the RadioGroup has lost the focus.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`label`**: The label displayed for the radio group.

## Styling [#styling]

`RadioGroup` is a component that governs its children and stores the selected value. It does not support styling; however, you can style the options within the group. When you set the theme variables for the group's options, use the `RadioGroupOption` name.

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [backgroundColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-RadioGroupOption--disabled | $backgroundColor--disabled | $backgroundColor--disabled |
| [borderColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default | $color-surface-500 | $color-surface-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default | $color-surface-500 | $color-surface-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default--active | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default--active | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default--hover | $color-surface-700 | $color-surface-700 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default--hover | $color-surface-700 | $color-surface-700 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--error | $borderColor-Input--error | $borderColor-Input--error |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--error | $borderColor-Input--error | $borderColor-Input--error |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--success | $borderColor-Input--success | $borderColor-Input--success |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--success | $borderColor-Input--success | $borderColor-Input--success |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--warning | $borderColor-Input--warning | $borderColor-Input--warning |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--warning | $borderColor-Input--warning | $borderColor-Input--warning |
| [borderWidth](../styles-and-themes/common-units/#size)-RadioGroupOption | 1px | 1px |
| [borderWidth](../styles-and-themes/common-units/#size)-RadioGroupOption-validation | 2px | 2px |
| [fontSize](../styles-and-themes/common-units/#size)-RadioGroupOption | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-RadioGroupOption | $fontSize-sm | $fontSize-sm |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-RadioGroupOption | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-RadioGroupOption | $fontWeight-bold | $fontWeight-bold |
| [gap](../styles-and-themes/common-units/#size)-RadioGroupOption | $space-1_5 | $space-1_5 |
| [outlineColor](../styles-and-themes/common-units/#color)-RadioGroupOption--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-RadioGroupOption--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-RadioGroupOption--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-RadioGroupOption--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption--default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption--error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption--success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption--warning | *none* | *none* |
