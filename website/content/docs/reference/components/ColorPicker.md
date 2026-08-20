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
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `requiredInvalidMessage`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `matchValue`, `matchInvalidMessage`, `validationMode`, `customValidationsDebounce`, `validationDisplayDelay`, `verboseValidationFeedback`, `validate` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initialValue` [#initialvalue]

> [!DEF]  default: **"#000000"**

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
| `none` | No validation indicator (default state) **(default)** |
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

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`input`**: The color picker input element.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-ColorPicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ColorPicker--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRadius-ColorPicker](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-ColorPicker--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-ColorPicker--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-ColorPicker--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-ColorPicker](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-ColorPicker--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-ColorPicker--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-ColorPicker--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-ColorPicker](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-ColorPicker--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-ColorPicker--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-ColorPicker--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-ColorPicker](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--error--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--success--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--warning--focus](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-ColorPicker--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [height-ColorPicker](/docs/styles-and-themes/common-units/#size-values) | 1.5em | 1.5em |
| [width-ColorPicker](/docs/styles-and-themes/common-units/#size-values) | 3em | 3em |
