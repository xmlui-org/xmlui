# Select [#select]

`Select` provides a dropdown interface for choosing from a list of options, supporting both single and multiple selection modes. It offers extensive customization capabilities including search functionality, custom templates, and comprehensive form integration.

**Key features:**
- **Flexible selection modes**: Single selection by default, with optional multi-select capability
- **Option containers**: Uses Option components to define selectable items with separate values and labels
- **Search functionality**: Optional filtering to quickly find options in large lists
- **Custom templates**: Configurable option display, value presentation, and empty state templates
- **Dynamic options**: Supports both static [Option](/docs/reference/components/Option) children and dynamic lists via [Items](/docs/reference/components/Items).

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

- `$group`: Group name when using `groupBy` (available in group header templates)
- `$item`: Represents the current option's data (label and value properties)
- `$itemContext`: Provides the `removeItem()` method for multi-select scenarios

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

### `clearable` [#clearable]

> [!DEF]  default: **false**

This property enables a clear button that allows the user to clear the selected value(s).

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

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <Select enabled="false" />
</App>
```

### `groupBy` [#groupby]

This property sets which attribute should be used to group the available options. No grouping is done if omitted. Use it with the `category` attribute on `Options` to define groups. If no options belong to a group, that group will not be shown.

```xmlui-pg copy display name="Example: groupBy" height="400px" /groupBy="category"/
<App>
  <Select groupBy="category" placeholder="Select a product">
    <Option value="1" label="Apple" category="Fruit" />
    <Option value="2" label="Banana" category="Fruit" />
    <Option value="3" label="Other" />
    <Option value="4" label="Misc" />
    <Option value="5" label="Carrot" category="Vegetable" />
  </Select>
</App>
```

### `groupHeaderTemplate` [#groupheadertemplate]

Enables the customization of how option groups are displayed in the dropdown. You can use the `$group` context variable to access the group name.

```xmlui-pg copy display name="Example: groupHeaderTemplate" height="400px" {3-5}
<App>
  <Select groupBy="type" placeholder="Select a product">
    <property name="groupHeaderTemplate">
      <H3>{$group}</H3>
    </property>
    <Items items="{[
      { id: 1, name: 'MacBook Pro', type: 'Apple' },
      { id: 2, name: 'iPad Air', type: 'Apple' },
      { id: 3, name: 'XPS', type: 'Dell' },
      { id: 4, name: 'Tab', type: 'Samsung' }
    ]}">
      <Option value="{$item.id}" label="{$item.name}" type="{$item.type}" />
    </Items>
  </Select>
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

### `inProgress` [#inprogress]

> [!DEF]  default: **false**

This property indicates whether the component is in progress. It can be used to show a loading message.

### `inProgressNotificationMessage` [#inprogressnotificationmessage]

> [!DEF]  default: **""**

This property indicates the message to display when the component is in progress.

### `multiSelect` [#multiselect]

> [!DEF]  default: **false**

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

### `placeholder` [#placeholder]

> [!DEF]  default: **""**

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

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `searchable` [#searchable]

> [!DEF]  default: **false**

This property enables the search functionality in the dropdown list.

### `ungroupedHeaderTemplate` [#ungroupedheadertemplate]

Enables the customization of how the ungrouped options header is displayed in the dropdown. If not provided, ungrouped options will not have a header.

```xmlui-pg copy display name="Example: ungroupedHeaderTemplate" height="400px" {3-5}
<App>
  <Select groupBy="category" placeholder="Select a product">
    <property name="ungroupedHeaderTemplate">
      <H3>Other Items</H3>
    </property>
    <Option value="1" label="Apple" category="Fruit" />
    <Option value="2" label="Banana" category="Fruit" />
    <Option value="3" label="Other" />
    <Option value="4" label="Misc" />
    <Option value="5" label="Carrot" category="Vegetable" />
  </Select>
</App>
```

### `validationIconError` [#validationiconerror]

Icon to display for error state when concise validation summary is enabled.

### `validationIconSuccess` [#validationiconsuccess]

Icon to display for valid state when concise validation summary is enabled.

### `validationStatus` [#validationstatus]

> [!DEF]  default: **"none"**

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

This property allows replacing the default template to display a selected value. It works in both single-select and multi-select modes (`multiSelect` is `true`).

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

### `verboseValidationFeedback` [#verbosevalidationfeedback]

Enables a concise validation summary (icon) in input components.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of Select has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

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

**Signature**: `gotFocus(): void`

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

**Signature**: `lostFocus(): void`

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

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`clearButton`**: The button to clear the selected value(s).
- **`item`**: Each option item within the Select component.
- **`menu`**: The dropdown menu within the Select component.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-Select | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-Select--active | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-item-Select--hover | $backgroundColor-dropdown-item--hover | $backgroundColor-dropdown-item--hover |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-Select | $color-surface-raised | $color-surface-raised |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-menu-Select | $color-surface-raised | $color-surface-raised |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--default | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--default--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--disabled | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--error | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--error--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--success | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--success--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--warning | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select--warning--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select-badge | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select-badge | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select-badge--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select-badge--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select-badge--hover | $color-primary-400 | $color-primary-400 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Select-badge--hover | $color-primary-400 | $color-primary-400 |
| [border](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-menu-Select | $borderColor | $borderColor |
| [borderColor](/docs/styles-and-themes/common-units/#color)-menu-Select | $borderColor | $borderColor |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--default | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--default--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--disabled | $borderColor--disabled | $borderColor--disabled |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--disabled | $borderColor--disabled | $borderColor--disabled |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--error | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--error--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--success | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--success--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--warning | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Select--warning--hover | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-Select | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-menu-Select | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select--default | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select--error | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select--success | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select--warning | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select-badge | $borderRadius | $borderRadius |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Select | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Select--default | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Select--error | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Select--success | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Select--warning | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Select | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Select | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Select | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-menu-Select | 1px | 1px |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-menu-Select | 1px | 1px |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Select--default | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Select--error | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Select--success | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Select--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-Select | $boxShadow-md | $boxShadow-md |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-menu-Select | $boxShadow-md | $boxShadow-md |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--default | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--default--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--error | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--error--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--success | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--success--hover | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--warning | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Select--warning--hover | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-Select--default | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-Select--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-Select--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-placeholder-Select--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Select--default | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Select--error | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Select--success | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Select--warning | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Select-badge | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Select-badge | $fontSize-sm | $fontSize-sm |
| [minHeight](/docs/styles-and-themes/common-units/#size-values)-item-Select | $space-7 | $space-7 |
| [minHeight](/docs/styles-and-themes/common-units/#size-values)-Select | $space-7 | $space-7 |
| [opacity](/docs/styles-and-themes/common-units/#opacity)-text-item-Select--disabled | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Select--default--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Select--error--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Select--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Select--success--focus | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Select--warning--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Select--default--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Select--error--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Select--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Select--success--focus | *none* | *none* |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Select--warning--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Select--default--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Select--error--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Select--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Select--success--focus | *none* | *none* |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Select--warning--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Select--default--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Select--error--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Select--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Select--success--focus | *none* | *none* |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Select--warning--focus | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-item-Select | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-item-Select | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-item-Select | $space-2 | $space-2 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Select | $space-2 | $space-2 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Select-badge | $space-2_5 | $space-2_5 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-item-Select | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-item-Select | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-item-Select | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Select | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-item-Select | $space-2 | $space-2 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Select | $space-2 | $space-2 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Select-badge | $space-0_5 | $space-0_5 |
| [textColor](/docs/styles-and-themes/common-units/#color)-indicator-Select | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-item-Select--disabled | $color-surface-300 | $color-surface-300 |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-Select | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-Select--default | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-Select--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-Select--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-placeholder-Select--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--default | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--default--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--error | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--error--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--success | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--success--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--warning | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select--warning--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select-badge | $const-color-surface-50 | $const-color-surface-50 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select-badge | $const-color-surface-50 | $const-color-surface-50 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select-badge--active | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Select-badge--hover | *none* | *none* |
