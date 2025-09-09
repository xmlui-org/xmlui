# Select [#select]

`Select` provides a dropdown interface for choosing from a list of options, supporting both single and multiple selection modes. It offers extensive customization capabilities including search functionality, custom templates, and comprehensive form integration.

**Key features:**
- **Flexible selection modes**: Single selection by default, with optional multi-select capability
- **Option containers**: Uses Option components to define selectable items with separate values and labels
- **Search functionality**: Optional filtering to quickly find options in large lists
- **Custom templates**: Configurable option display, value presentation, and empty state templates
- **Dynamic options**: Supports both static [Option](/components/Option) children and dynamic lists via [Items](/components/Items).

## Using `Select` [#using-select]

The component accepts `Option` components as children defining a particular option's label-value pair.
`Option` requires a `value` property and while also having a `label` that is displayed in the list.
If the `label` is not specified `value` is shown.

```xmlui-pg copy display name="Example: using Select" height="200px"
<App>
  <Select>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

You can use `Select` with dynamic options:

```xmlui-pg copy display name="Example: using Select with dynamic options" height="200px"
<App>
  <Select>
    <Items data="{['one', 'two', 'three']}" >
      <Option value="{$itemIndex}" label="{$item}" />
    </Items>
  </Select>
</App>
```

**Context variables available during execution:**

- `$item`: Represents the current option's data (label and value properties)
- `$itemContext`: Provides utility methods like `removeItem()` for multi-select scenarios

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `dropdownHeight` [#dropdownheight]

This property sets the height of the dropdown list. If not set, the height is determined automatically.

```xmlui-pg copy display name="Example: dropdownHeight" height="300px"
<App>
  <Select dropdownHeight="180px">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
    <Option value="opt4" label="fourth"/>
    <Option value="opt5" label="fifth"/>
    <Option value="opt6" label="sixth"/>
    <Option value="opt7" label="seventh"/>
    <Option value="opt8" label="eighth"/>
    <Option value="opt9" label="ninth"/>
    <Option value="opt10" label="tenth"/>
    <Option value="opt11" label="eleventh"/>
    <Option value="opt12" label="twelfth"/>
  </Select>
</App>
```

### `emptyListTemplate` [#emptylisttemplate]

This optional property provides the ability to customize what is displayed when the list of options is empty.

Click on the second field to see the custom empty list indicator.

```xmlui-pg copy {9-11} display name="Example: emptyListTemplate" height="260px"
<App>
  <VStack>
    <Text value="Default:" />
    <Select />
  </VStack>
  <VStack>
    <Text value="Custom:" />
    <Select>
      <property name="emptyListTemplate">
        <Text variant="strong" value="Nothing to see here!" />
      </property>
    </Select>
  </VStack>
</App>
```

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <Select enabled="false" />
</App>
```

### `initialValue` [#initialvalue]

This property sets the component's initial value.

```xmlui-pg copy display name="Example: initialValue" height="200px"
<App>
  <Select initialValue="opt3">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `inProgress` (default: false) [#inprogress-default-false]

This property indicates whether the component is in progress. It can be used to show a loading message.

### `inProgressNotificationMessage` (default: "") [#inprogressnotificationmessage-default-]

This property indicates the message to display when the component is in progress.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: false) [#labelbreak-default-false]

This boolean value indicates whether the `Select` label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` (default: "top") [#labelposition-default-top]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input **(default)** |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `Select` component's label. If not defined, the label's width will be determined by its content and the available space.

### `multiSelect` (default: false) [#multiselect-default-false]

The `true` value of the property indicates if the user can select multiple items.

```xmlui-pg copy display name="Example: multiSelect" height="300px"
<App>
  <Select multiSelect="true" dropdownHeight="180px" >
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
    <Option value="opt4" label="fourth"/>
    <Option value="opt5" label="fifth"/>
    <Option value="opt6" label="sixth"/>
    <Option value="opt7" label="seventh"/>
    <Option value="opt8" label="eighth"/>
    <Option value="opt9" label="ninth"/>
    <Option value="opt10" label="tenth"/>
    <Option value="opt11" label="eleventh"/>
    <Option value="opt12" label="twelfth"/>
  </Select>
</App>
```

### `optionLabelTemplate` [#optionlabeltemplate]

This property allows replacing the default template to display an option in the dropdown list.

In the template definition, you can use the `$item` context property to access the particular item's `label` and `value`.

```xmlui-pg copy {3-9} display name="Example: optionLabelTemplate" height="300px"
<App>
  <Select initialValue="{0}" placeholder="Select..." searchable>
    <property name="optionLabelTemplate">
      <HStack
        paddingHorizontal="$padding-tight"
        border="2px dotted $color-primary-500">
        <Text>{$item.label}</Text>
      </HStack>
    </property>
    <Option value="{0}" label="zero"/>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `optionTemplate` [#optiontemplate]

This property allows replacing the default template to display an option in the dropdown list.

```xmlui-pg copy display name="Example: optionTemplate" height="200px"
<App>
  <Select>
    <property name="optionTemplate">
      <HStack verticalAlignment="center" gap="$space-0_5">
        <Icon name="info" />
        <Text value="{$item.label}" variant="strong" />
      </HStack>
    </property>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `placeholder` (default: "") [#placeholder-default-]

An optional placeholder text that is visible in the input field when its empty.

```xmlui-pg copy display name="Example: placeholder" height="200px"
<App>
  <Select placeholder="Please select an item">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `readOnly` (default: false) [#readonly-default-false]

Set this property to `true` to disallow changing the component value.

### `required` (default: false) [#required-default-false]

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `searchable` (default: false) [#searchable-default-false]

This property enables the search functionality in the dropdown list.

### `validationStatus` (default: "none") [#validationstatus-default-none]

This property allows you to set the validation status of the input component.

Available values:

| Value | Description |
| --- | --- |
| `valid` | Visual indicator for an input that is accepted |
| `warning` | Visual indicator for an input that produced a warning |
| `error` | Visual indicator for an input that produced an error |

```xmlui-pg copy display name="Example: validationStatus" height="280px"
<App>
  <Select />
  <Select validationStatus="valid" />
  <Select validationStatus="warning" />
  <Select validationStatus="error" />
</App>
```

### `valueTemplate` [#valuetemplate]

This property allows replacing the default template to display a selected value when multiple selections (`multiSelect` is `true`) are enabled.

In the template definition, you can use the `$item` context property to access the particular item's `label` and `value`.  The `$itemContext` property provides a `removeItem` method to delete a value from the current selection.

```xmlui-pg copy {3-15} display name="Example: valueTemplate" height="300px"
<App>
  <Select initialValue="{0}" placeholder="Select..." multiSelect>
    <property name="valueTemplate">
      <HStack
        paddingLeft="$padding-tight"
        border="2px dotted $color-primary-500"
        verticalAlignment="center">
        <Text>{$item.label}</Text>
        <Button
          variant="ghost"
          icon="close"
          size="xs"
          onClick="$itemContext.removeItem()"/>
      </HStack>
    </property>
    <Option value="{0}" label="zero"/>
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of Select has changed.

```xmlui-pg copy display name="Example: didChange" height="260px"
<App>
  <variable name="newValue" value="(none)" />
  <Text value="{newValue}" />
  <Select onDidChange="(newItem) => newValue = newItem">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `gotFocus` [#gotfocus]

This event is triggered when the Select has received the focus.

```xmlui-pg copy {5-6} display name="Example: gotFocus/lostFocus" height="260px"
<App>
  <variable name="isFocused" value="{false}" />
  <Text value="Input control is focused: {isFocused}" />
  <Select
    onGotFocus="isFocused = true"
    onLostFocus="isFocused = false">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the Select has lost the focus.

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method focuses the `Select` component. You can use it to programmatically focus the component.

**Signature**: `focus(): void`

```xmlui-pg copy display name="Example: focus()" height="260px"
<App>
  <Button label="Focus Input" onClick="inputControl.focus()" />
  <Select id="inputControl">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
</App>
```

### `reset` [#reset]

This method resets the component to its initial value, or clears the selection if no initial value was provided.

**Signature**: `reset(): void`

### `setValue` [#setvalue]

This API sets the value of the `Select`. You can use it to programmatically change the value.

**Signature**: `setValue(value: string | string[] | undefined): void`

- `value`: The new value to set. Can be a single value or an array of values for multi-select.

```xmlui-pg copy display name="Example: setValue()" height="260px"
<App>
  <Select id="inputControl">
    <Option value="opt1" label="first"/>
    <Option value="opt2" label="second"/>
    <Option value="opt3" label="third"/>
  </Select>
  <HStack>
    <Button
      label="Select 2nd Item"
      onClick="inputControl.setValue('opt2')" />
    <Button
      label="Remove Selection"
      onClick="inputControl.setValue('')" />
  </HStack>
</App>
```

### `value` [#value]

This API retrieves the current value of the `Select`. You can use it to get the value programmatically.

**Signature**: `get value(): string | string[] | undefined`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-Select | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-Select--active | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-Select--hover | $backgroundColor-dropdown-item--hover | $backgroundColor-dropdown-item--hover |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-Select | $color-surface-raised | $color-surface-raised |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-Select | $color-surface-raised | $color-surface-raised |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-badge | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-badge | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-badge--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-badge--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-badge--hover | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-badge--hover | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Select-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-menu-Select | $borderColor | $borderColor |
| [borderColor](../styles-and-themes/common-units/#color)-menu-Select | $borderColor | $borderColor |
| [borderColor](../styles-and-themes/common-units/#color)-Select--disabled | initial | initial |
| [borderColor](../styles-and-themes/common-units/#color)-Select--disabled | initial | initial |
| [borderColor](../styles-and-themes/common-units/#color)-Select-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Select-warning--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-Select | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-Select | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Select-badge | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Select-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Select-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Select-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Select-warning | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Select-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Select-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Select-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Select-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-menu-Select | 1px | 1px |
| [borderWidth](../styles-and-themes/common-units/#size)-menu-Select | 1px | 1px |
| [borderWidth](../styles-and-themes/common-units/#size)-Select-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Select-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Select-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Select-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-Select | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-Select | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Select-warning--hover | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-Select-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-Select-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-Select-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-Select-warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Select | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Select-badge | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Select-badge | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Select-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Select-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Select-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Select-warning | *none* | *none* |
| [opacity](../styles-and-themes/common-units/#opacity)-Select--disabled | 0.5 | 0.5 |
| [opacity](../styles-and-themes/common-units/#opacity)-text-item-Select--disabled | 0.5 | 0.5 |
| [outlineColor](../styles-and-themes/common-units/#color)-Select-default--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Select-error--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Select-success--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Select-warning--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Select-default--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Select-error--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Select-success--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Select-warning--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Select-default--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Select-error--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Select-success--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Select-warning--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Select-default--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Select-error--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Select-success--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Select-warning--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-item-Select | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Select | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-item-Select | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Select | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-item-Select | $space-2 | $space-2 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Select | $space-2 | $space-2 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Select-badge | $space-2_5 | $space-2_5 |
| [paddingLeft](../styles-and-themes/common-units/#size)-item-Select | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Select | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-item-Select | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Select | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-item-Select | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Select | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-item-Select | $space-2 | $space-2 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Select | $space-2 | $space-2 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Select-badge | $space-0_5 | $space-0_5 |
| [textColor](../styles-and-themes/common-units/#color)-indicator-Select | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-item-Select--disabled | $color-surface-200 | $color-surface-200 |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-Select | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-Select-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-Select-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-Select-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-Select-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-badge | $color-surface-50 | $color-surface-50 |
| [textColor](../styles-and-themes/common-units/#color)-Select-badge | $color-surface-50 | $color-surface-50 |
| [textColor](../styles-and-themes/common-units/#color)-Select-badge--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-badge--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Select-warning--hover | *none* | *none* |
