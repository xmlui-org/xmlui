# Select [#select]

`Select` provides a dropdown interface for choosing from a list of options, supporting both single and multiple selection modes. It offers extensive customization capabilities including search functionality, custom templates, and comprehensive form integration.

**Key features:**
- **Flexible selection modes**: Single selection by default, with optional multi-select capability
- **Option containers**: Uses Option components to define selectable items with separate values and labels
- **Search functionality**: Optional filtering to quickly find options in large lists
- **Custom templates**: Configurable option display, value presentation, and empty state templates
- **Dynamic options**: Supports both static [Option](/docs/reference/components/Option) children and dynamic lists via [Items](/docs/reference/components/Items).
- **Data-driven options**: Populates the option list directly from a data array using `data`, `valueField`, and `labelField` — the most efficient approach for large lists.

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

For large or externally-loaded datasets, use the `data` prop to supply the option list directly. This is more efficient than using `Option` children or `Items` because the option list is derived in JavaScript and only re-evaluated when the data reference changes, not on every unrelated state update in the same form:

```xmlui-pg copy display name="Example: using Select with data prop" height="200px"
<App>
  <variable name="options" value="{[
    { value: 'opt1', label: 'first' },
    { value: 'opt2', label: 'second' },
    { value: 'opt3', label: 'third' }
  ]}" />
  <Select data="{options}" />
</App>
```

If your data uses different field names, set `valueField` and `labelField` accordingly:

```xmlui-pg copy display name="Example: custom valueField and labelField" height="200px"
<App>
  <variable name="countries" value="{[
    { code: 'us', name: 'United States' },
    { code: 'ca', name: 'Canada' },
    { code: 'gb', name: 'United Kingdom' }
  ]}" />
  <Select data="{countries}" valueField="code" labelField="name" />
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
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Validation | `bindTo`, `required`, `requiredInvalidMessage`, `minLength`, `maxLength`, `lengthInvalidMessage`, `lengthInvalidSeverity`, `minValue`, `maxValue`, `rangeInvalidMessage`, `rangeInvalidSeverity`, `pattern`, `patternInvalidMessage`, `patternInvalidSeverity`, `regex`, `regexInvalidMessage`, `regexInvalidSeverity`, `matchValue`, `matchInvalidMessage`, `validationMode`, `customValidationsDebounce`, `validationDisplayDelay`, `verboseValidationFeedback`, `validate` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `clearable` [#clearable]

> [!DEF]  default: **false**

This property enables a clear button that allows the user to clear the selected value(s).

### `data` [#data]

The data array to populate the option list from. When provided, `Option` children are not needed — the component builds options from this array using `valueField` and `labelField`. This is the most efficient approach for large lists because the options are derived in JavaScript and re-evaluated only when the data reference changes, not on every unrelated state update.

Provide an array of objects to populate the option list. When `data` is set, `Option` children are not required. Each item in the array is mapped to an option using `valueField` (default: `"value"`) and `labelField` (default: `"label"`).

```xmlui-pg copy display name="Example: data" height="200px"
<App>
  <variable name="options" value="{[
    { value: 'opt1', label: 'first' },
    { value: 'opt2', label: 'second' },
    { value: 'opt3', label: 'third' }
  ]}" />
  <Select data="{options}" />
</App>
```

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

### `labelField` [#labelfield]

> [!DEF]  default: **"label"**

The property name of each data item to use as the option label when `data` is provided. Defaults to `"label"`.

Specifies which property of each data item to use as the option's display label. Only relevant when `data` is provided. Defaults to `"label"`.

See the `valueField` example above for usage.

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

### `scrollIndicators` [#scrollindicators]

> [!DEF]  default: **true**

This property controls whether scroll indicator arrows are displayed at the top and bottom of the dropdown list when the content overflows.

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
| `none` | No validation indicator (default state) **(default)** |
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

### `valueField` [#valuefield]

> [!DEF]  default: **"value"**

The property name of each data item to use as the option value when `data` is provided. Defaults to `"value"`.

Specifies which property of each data item to use as the option's value. Only relevant when `data` is provided. Defaults to `"value"`.

```xmlui-pg copy display name="Example: valueField and labelField" height="200px"
<App>
  <variable name="countries" value="{[
    { code: 'us', name: 'United States' },
    { code: 'ca', name: 'Canada' },
    { code: 'gb', name: 'United Kingdom' }
  ]}" />
  <Select data="{countries}" valueField="code" labelField="name" />
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

### `variant` [#variant]

> [!DEF]  default: **"default"**

Controls the visual border treatment. `outlined` matches the border color of an outlined Button, so that a Select can be visually composed next to one. Only the border color (and its hover/focus states) is affected; padding, background, and typography are unchanged.

Available values:

| Value | Description |
| --- | --- |
| `default` | Standard input border using the surface color. **(default)** |
| `outlined` | Accent border using the shared `borderColor-outlined` token, matching outlined Buttons. |

Use `variant="outlined"` when you want the `Select` to share its border color with an outlined `Button` placed alongside. Both components resolve to the same `borderColor-outlined` theme token, so the borders stay in sync even when the theme changes.

```xmlui-pg copy display name="Example: matched border with outlined Button" height="120px"
<App>
  <HStack>
    <Select variant="outlined">
      <Option value="all" label="All customers"/>
      <Option value="active" label="Active"/>
    </Select>
    <Button icon="plus" label="New Customer" variant="outlined" />
  </HStack>
</App>
```

The `outlined` variant only rebinds the border color (and its hover/focus states); padding, background, and typography are unchanged. Validation states (`error` / `warning` / `valid`) take precedence over the variant.

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
| [backgroundColor-item-Select](/docs/styles-and-themes/common-units/#color) | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor-item-Select--active](/docs/styles-and-themes/common-units/#color) | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor-item-Select--hover](/docs/styles-and-themes/common-units/#color) | $backgroundColor-dropdown-item--hover | $backgroundColor-dropdown-item--hover |
| [backgroundColor-menu-Select](/docs/styles-and-themes/common-units/#color) | $color-surface-raised | $color-surface-raised |
| [backgroundColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Select-badge](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-Select-badge--active](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-Select-badge--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-400 |
| [border-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-menu-Select](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--disabled](/docs/styles-and-themes/common-units/#color) | $borderColor--disabled | $borderColor--disabled |
| [borderColor-Select--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--outlined](/docs/styles-and-themes/common-units/#color) | $borderColor-outlined | $borderColor-outlined |
| [borderColor-Select--outlined--focus](/docs/styles-and-themes/common-units/#color) | $borderColor-outlined--focus | $borderColor-outlined--focus |
| [borderColor-Select--outlined--hover](/docs/styles-and-themes/common-units/#color) | $borderColor-outlined--hover | $borderColor-outlined--hover |
| [borderColor-Select--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Select--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-Select](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Select](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-menu-Select](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-Select](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Select--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Select--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Select--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Select-badge](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-Select](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Select](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Select--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Select--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Select--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-Select](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-Select](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-menu-Select](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [borderWidth-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Select--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Select--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Select--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-menu-Select](/docs/styles-and-themes/common-units/#boxShadow) | $boxShadow-md | $boxShadow-md |
| [boxShadow-Select](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Select--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [fontSize-placeholder-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-Select--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-Select--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-Select--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Select--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Select--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Select--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Select-badge](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [minHeight-item-Select](/docs/styles-and-themes/common-units/#size-values) | $space-7 | $space-7 |
| [minHeight-Select](/docs/styles-and-themes/common-units/#size-values) | 2.5rem | 2.5rem |
| [minWidth-Select](/docs/styles-and-themes/common-units/#size-values) | $space-16 | $space-16 |
| [opacity-text-item-Select--disabled](/docs/styles-and-themes/common-units/#opacity) | *none* | *none* |
| [outlineColor-Select--error--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Select--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Select--success--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Select--warning--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-Select--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Select--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Select--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Select--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-Select--error--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Select--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Select--success--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Select--warning--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-Select--error--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Select--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Select--success--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Select--warning--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-item-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-item-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-item-Select](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingHorizontal-Select](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingHorizontal-Select-badge](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [paddingLeft-item-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-item-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-item-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Select](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-item-Select](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-Select](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-Select-badge](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [textColor-indicator-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-item-Select--disabled](/docs/styles-and-themes/common-units/#color) | $color-surface-300 | $color-surface-300 |
| [textColor-placeholder-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-Select--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-Select--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-Select--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--disabled](/docs/styles-and-themes/common-units/#color) | $textColor--disabled | $textColor--disabled |
| [textColor-Select--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select-badge](/docs/styles-and-themes/common-units/#color) | $const-color-surface-50 | $const-color-surface-50 |
| [textColor-Select-badge--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Select-badge--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
