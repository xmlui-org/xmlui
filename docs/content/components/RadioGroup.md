# RadioGroup [#radiogroup]

The `RadioGroup` input component is a group of radio buttons ([`RadioGroupOption`](./RadioGroupOption.mdx) components) that allow users to select only one option from the group at a time.

`RadioGroup` is often used in forms. See the [Using Forms](/learning/using-components/forms.mdx) guide for details.

## Properties [#properties]

### `autoFocus (default: false)` [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled (default: true)` [#enabled-default-true]

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

### `initialValue (default: "")` [#initialvalue-default-]

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

### `label` [#label]

This property sets the label of the component.

### `labelBreak (default: false)` [#labelbreak-default-false]

This boolean value indicates if the `RadioGroup` labels can be split into multiple lines if it would overflow the available label width.

### `labelPosition (default: "top")` [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `RadioGroup`.

### `orientation` [#orientation]

(*** NOT IMPLEMENTED YET ***) This property sets the orientation of the options within the radio group.

### `readOnly (default: false)` [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required (default: false)` [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus (default: "none")` [#validationstatus-default-none]

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

## Styling [#styling]

`RadioGroup` is a component that governs its children and stores the selected value. It does not support styling; however, you can style the options within the group. When you set the theme variables for the group's options, use the `RadioGroupOption` name.

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption--disabled] | $borderColor-RadioGroupOption--disabled | $borderColor-RadioGroupOption--disabled |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption-default | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption-error | $borderColor-RadioGroupOption-error | $borderColor-RadioGroupOption-error |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption-indicator | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption-indicator | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption-success | $borderColor-RadioGroupOption-success | $borderColor-RadioGroupOption-success |
| [backgroundColor](../styles-and-themes/common-units/#color)-checked-RadioGroupOption-warning | $borderColor-RadioGroupOption-warning | $borderColor-RadioGroupOption-warning |
| [backgroundColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default | $color-surface-500 | $color-surface-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default | $color-surface-500 | $color-surface-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default--active | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default--active | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default--hover | $color-surface-700 | $color-surface-700 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-default--hover | $color-surface-700 | $color-surface-700 |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-RadioGroupOption-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-RadioGroupOption | 1px | 1px |
| [color](../styles-and-themes/common-units/#color)-RadioGroupOption--disabled | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-RadioGroupOption-default | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-RadioGroupOption-error | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-RadioGroupOption-success | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-RadioGroupOption-warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-RadioGroupOption | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-RadioGroupOption | $fontSize-small | $fontSize-small |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-RadioGroupOption | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-RadioGroupOption | $fontWeight-bold | $fontWeight-bold |
| [gap](../styles-and-themes/common-units/#size)-RadioGroupOption | $space-1_5 | $space-1_5 |
| [outlineColor](../styles-and-themes/common-units/#color)-RadioGroupOption--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-RadioGroupOption--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-RadioGroupOption--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-RadioGroupOption--focus | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption-error | $borderColor-RadioGroupOption-error | $borderColor-RadioGroupOption-error |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption-success | $borderColor-RadioGroupOption-success | $borderColor-RadioGroupOption-success |
| [textColor](../styles-and-themes/common-units/#color)-RadioGroupOption-warning | $borderColor-RadioGroupOption-warning | $borderColor-RadioGroupOption-warning |
