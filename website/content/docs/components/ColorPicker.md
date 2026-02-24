# ColorPicker [#colorpicker]

`ColorPicker` enables users to choose colors by specifying RGB, HSL, or HEX values.

## Using `ColorPicker` [#using-colorpicker]

This component allows you to edit or select a color using RGB, HSL, or CSS HEX notation. It displays a popup over the UI and lets you use the mouse or keyboard to edit or select a color.

```xmlui-pg copy display name="Example: using ColorPicker"
<App>
  <ColorPicker id="colorPicker" label="Select your favorite color" />
  <Text>Selected color: {colorPicker.value}</Text>
</App>
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Form Binding | `bindTo`, `initialValue`, `noSubmit` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `validationMode`, `verboseValidationFeedback` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: using ColorPicker"
<App>
  <ColorPicker 
    id="colorPicker" 
    label="Select your favorite color" 
    initialValue="#ff0080"
    />
  <Text>Selected color: {colorPicker.value}</Text>
</App>
```

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

```xmlui-pg copy display name="Example: readOnly"
<App>
  <ColorPicker initialValue="#ffff00" label="Cannot be edited" readOnly />
</App>
```

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `validationStatus` [#validationstatus]

> [!DEF]  default: **"none"**

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

```xmlui-pg copy display name="Example: validationStatus"
<App>
  <ColorPicker initialValue="#c0c0ff" label="Valid" validationStatus="valid" />
  <ColorPicker initialValue="#c0c0ff" label="Warning" validationStatus="warning" />
  <ColorPicker initialValue="#c0c0ff" label="Error" validationStatus="error" />
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of ColorPicker has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the ColorPicker has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus` [#lostfocus]

This event is triggered when the ColorPicker has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

Focus the ColorPicker component.

**Signature**: `focus(): void`

### `setValue` [#setvalue]

This method sets the current value of the ColorPicker.

**Signature**: `set value(value: string): void`

- `value`: The new value to set for the color picker.

```xmlui-pg copy display name="Example: setValue"
<App>
  <App>
    <ColorPicker 
      id="colorPicker" 
      label="Select your favorite color" 
      initialValue="#808080" />
    <HStack>
      <Button
        label="Set to red"
        onClick="colorPicker.setValue('#ff0000')" />
      <Button
        label="Set to green"
        onClick="colorPicker.setValue('#00c000')" />
      <Button
        label="Set to blue"
        onClick="colorPicker.setValue('#0000ff')" />
    </HStack>
  </App>
</App>
```

### `value` [#value]

This method returns the current value of the ColorPicker.

**Signature**: `get value(): string`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ColorPicker | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--default--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--error--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--success--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--warning--focus | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-ColorPicker--warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ColorPicker--default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ColorPicker--error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ColorPicker--success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ColorPicker--warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-ColorPicker--default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-ColorPicker--error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-ColorPicker--success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-ColorPicker--warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-ColorPicker--default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-ColorPicker--error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-ColorPicker--success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-ColorPicker--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--default--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--error--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--success--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--warning--focus | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ColorPicker--warning--hover | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-ColorPicker | 1.5em | 1.5em |
| [height](../styles-and-themes/common-units/#size)-ColorPicker | 1.5em | 1.5em |
| [width](../styles-and-themes/common-units/#size)-ColorPicker | 3em | 3em |
| [width](../styles-and-themes/common-units/#size)-ColorPicker | 3em | 3em |
