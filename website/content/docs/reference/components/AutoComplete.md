# AutoComplete [#autocomplete]

`AutoComplete` is a searchable dropdown input that allows users to type and filter through options, with support for single or multiple selections. Unlike a basic [`Select`](/docs/reference/components/Select), it provides type-ahead functionality and can allow users to create new options.

**Key features:**
- **Type-ahead filtering**: Users can type to narrow down options in real-time
- **Multi-select support**: Set `multi="true"` to allow selecting multiple items
- **Custom option creation**: Enable `creatable="true"` to let users add new options
- **Rich customization**: Use `optionTemplate` to create complex option layouts

## Using AutoComplete [#using-autocomplete]

```xmlui-pg copy display height="200px" name="Example: Using AutoComplete"
<App>
  <AutoComplete>
    <Option value="1" label="Bruce Wayne" />
    <Option value="2" label="Clark Kent" enabled="false" />
    <Option value="3" label="Diana Prince" />
  </AutoComplete>
</App>
```

**Context variables available during execution:**

- `$group`: Group name available inside `groupHeaderTemplate` when `groupBy` is set.
- `$item`: This context value represents an item when you define an option item template. Use `$item.value` and `$item.label` to refer to the value and label of the particular option.

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

### `creatable` [#creatable]

> [!DEF]  default: **false**

This property allows the user to create new items that are not present in the list of options.

### `dropdownHeight` [#dropdownheight]

This property sets the height of the dropdown list.

### `emptyListTemplate` [#emptylisttemplate]

This property defines the template to display when the list of options is empty.

```xmlui-pg copy display height="200px" name="Example: emptyListTemplate"
<App>
  <AutoComplete>
    <property name="emptyListTemplate">
      <Text>No options found</Text>
    </property>
  </AutoComplete>
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `groupBy` [#groupby]

Field name on each Option to group by. When set, the dropdown shows a section header above each group of options sharing the same value of `option[groupBy]`. Headers are computed against the currently visible (filtered) options, so searching automatically updates which option carries its group's header. Use it together with an extra attribute on `<Option>` (e.g. `clientName="{$item.clientName}"`). Mirrors `Select`'s `groupBy`.

### `groupHeaderTemplate` [#groupheadertemplate]

Customizes the section header rendered above each group when `groupBy` is set. Use the `$group` context variable to access the group name. When omitted, the group name is rendered as plain text.

### `initiallyOpen` [#initiallyopen]

> [!DEF]  default: **false**

This property determines whether the dropdown list is open when the component is first rendered.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `multi` [#multi]

> [!DEF]  default: **false**

The `true` value of the property indicates if the user can select multiple items.

```xmlui-pg copy display height="300px" name="Example: multi"
    <App>
      <AutoComplete multi="true">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
        <Option value="4" label="Barry Allen" />
        <Option value="5" label="Hal Jordan" />
      </AutoComplete>
    </App>
```

### `optionTemplate` [#optiontemplate]

This property enables the customization of list items. To access the attributes of a list item use the `$item` context variable.

```xmlui-pg copy display height="300px" name="Example: optionTemplate"
<App>
  <AutoComplete multi="true">
    <property name="optionTemplate">
      <Text textAlign="center" color="red">{$item.label}</Text>
    </property>
    <Option value="1" label="Bruce Wayne" />
    <Option value="2" label="Clark Kent" />
    <Option value="3" label="Diana Prince" />
  </AutoComplete>
</App>
```

### `placeholder` [#placeholder]

An optional placeholder text that is visible in the input field when its empty.

### `readOnly` [#readonly]

> [!DEF]  default: **false**

Set this property to `true` to disallow changing the component value.

### `required` [#required]

> [!DEF]  default: **false**

Set this property to `true` to indicate it must have a value before submitting the containing form.

### `ungroupedHeaderTemplate` [#ungroupedheadertemplate]

Customizes the section header for the "Ungrouped" bucket (options that do not declare a value for the `groupBy` field). When omitted, the Ungrouped bucket has no header.

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

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of AutoComplete has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

### `gotFocus` [#gotfocus]

This event is triggered when the AutoComplete has received the focus.

**Signature**: `gotFocus(): void`

### `itemCreated` [#itemcreated]

This event is triggered when a new item is created by the user (if `creatable` is enabled).

**Signature**: `(item: string) => void`

- `item`: The newly created item value.

Add a few new items not in the options list. The following markup will display them:

```xmlui-pg copy display height="300px" name="Example: itemCreated"
<App var.newItems="{[]}">
  <AutoComplete
    id="autoComplete"
    creatable="true"
    onItemCreated="item => newItems.push(item)">
    <Option value="1" label="Bruce Wayne" />
    <Option value="2" label="Clark Kent" />
  </AutoComplete>
  <Text testId="text">
    New items: {newItems.join(", ")}
  </Text>
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the AutoComplete has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods [#exposed-methods]

### `focus` [#focus]

This method focuses the AutoComplete component.

**Signature**: `focus()`

### `setValue` [#setvalue]

This API allows you to set the value of the component. If the value is not valid, the component will not update its internal state.

**Signature**: `setValue(value: any)`

- `value`: The value to set.

### `value` [#value]

This API allows you to get or set the value of the component. If no value is set, it will retrieve `undefined`.

**Signature**: `get value(): any`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-AutoComplete--disabled](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-AutoComplete-badge](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-AutoComplete-badge--active](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-AutoComplete-badge--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-400 |
| [backgroundColor-item-AutoComplete](/docs/styles-and-themes/common-units/#color) | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor-item-AutoComplete--active](/docs/styles-and-themes/common-units/#color) | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor-item-AutoComplete--hover](/docs/styles-and-themes/common-units/#color) | $backgroundColor-dropdown-item--hover | $backgroundColor-dropdown-item--hover |
| [backgroundColor-menu-AutoComplete](/docs/styles-and-themes/common-units/#color) | $color-surface-raised | $color-surface-raised |
| [border-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--disabled](/docs/styles-and-themes/common-units/#color) | $borderColor--disabled | $borderColor--disabled |
| [borderColor-AutoComplete--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-AutoComplete--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-menu-AutoComplete](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderEndEndRadius-AutoComplete](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-AutoComplete](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-AutoComplete](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-AutoComplete--error](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-AutoComplete--success](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-AutoComplete--warning](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-AutoComplete-badge](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-menu-AutoComplete](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-AutoComplete](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-AutoComplete](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-AutoComplete--error](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-AutoComplete--success](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-AutoComplete--warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-AutoComplete](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-AutoComplete](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-AutoComplete--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-AutoComplete--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-AutoComplete--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-menu-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [boxShadow-AutoComplete](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--error](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--error--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--success](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--success--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--warning](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-AutoComplete--warning--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-menu-AutoComplete](/docs/styles-and-themes/common-units/#boxShadow) | $boxShadow-md | $boxShadow-md |
| [fontSize-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-AutoComplete--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-AutoComplete--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-AutoComplete--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-AutoComplete-badge](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $fontSize-tiny | $fontSize-tiny |
| [fontSize-placeholder-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-AutoComplete--error](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-AutoComplete--success](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-placeholder-AutoComplete--warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontWeight-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#fontWeight) | 700 | 700 |
| [gap-adornment-AutoComplete](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| [letterSpacing-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | 0.05em | 0.05em |
| [minHeight-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineColor-AutoComplete--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineOffset-AutoComplete--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-AutoComplete--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-AutoComplete--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingBottom-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingHorizontal-AutoComplete-badge](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [paddingHorizontal-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingHorizontal-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingLeft-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingTop-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-AutoComplete-badge](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [paddingVertical-item-AutoComplete](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [textColor-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--disabled](/docs/styles-and-themes/common-units/#color) | $textColor--disabled | $textColor--disabled |
| [textColor-AutoComplete--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--error--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--success--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete--warning--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete-badge](/docs/styles-and-themes/common-units/#color) | $const-color-surface-50 | $const-color-surface-50 |
| [textColor-AutoComplete-badge--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-AutoComplete-badge--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#color) | $textColor-subtitle | $textColor-subtitle |
| [textColor-item-AutoComplete--disabled](/docs/styles-and-themes/common-units/#color) | $color-surface-300 | $color-surface-300 |
| [textColor-placeholder-AutoComplete](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-AutoComplete--error](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-AutoComplete--success](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-placeholder-AutoComplete--warning](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textTransform-groupHeader-AutoComplete](/docs/styles-and-themes/common-units/#textTransform) | uppercase | uppercase |
