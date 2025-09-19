# AutoComplete [#autocomplete]

`AutoComplete` is a searchable dropdown input that allows users to type and filter through options, with support for single or multiple selections. Unlike a basic [`Select`](/components/Select), it provides type-ahead functionality and can allow users to create new options.

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

- `$item`: This context value represents an item when you define an option item template. Use `$item.value` and `$item.label` to refer to the value and label of the particular option.

## Properties [#properties]

### `autoFocus` (default: false) [#autofocus-default-false]

If this property is set to `true`, the component gets the focus automatically when displayed.

### `creatable` (default: false) [#creatable-default-false]

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

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `initiallyOpen` (default: false) [#initiallyopen-default-false]

This property determines whether the dropdown list is open when the component is first rendered.

### `initialValue` [#initialvalue]

This property sets the component's initial value.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `labelBreak` (default: true) [#labelbreak-default-true]

This boolean value indicates whether the `AutoComplete` label can be split into multiple lines if it would overflow the available label width.

### `labelPosition` [#labelposition]

Places the label at the given position of the component.

Available values:

| Value | Description |
| --- | --- |
| `start` | The left side of the input (left-to-right) or the right side of the input (right-to-left) |
| `end` | The right side of the input (left-to-right) or the left side of the input (right-to-left) |
| `top` | The top of the input |
| `bottom` | The bottom of the input |

### `labelWidth` [#labelwidth]

This property sets the width of the `AutoComplete` component's label. If not defined, the label's width will be determined by its content and the available space.

### `maxLength` [#maxlength]

This property sets the maximum length of the input it accepts.

### `multi` (default: false) [#multi-default-false]

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

## Events [#events]

### `didChange` [#didchange]

This event is triggered when value of AutoComplete has changed.

### `gotFocus` [#gotfocus]

This event is triggered when the AutoComplete has received the focus.

### `itemCreated` [#itemcreated]

This event is triggered when a new item is created by the user (if `creatable` is enabled).

Add a few new items not in the options list. The following markup will display them:

```xmlui-pg copy display height="300px" name="Example: optionTemplate"
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
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete--disabled | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-badge | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-badge | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-badge--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-badge--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-badge--hover | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-badge--hover | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-default | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-default--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-error | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-error--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-success | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-success--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-warning | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AutoComplete-warning--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-AutoComplete | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-AutoComplete--active | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor](../styles-and-themes/common-units/#color)-item-AutoComplete--hover | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-AutoComplete | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-menu-AutoComplete | $backgroundColor-primary | $backgroundColor-primary |
| [border](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete--disabled | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-default | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-default--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-error | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-error--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-success | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-success--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-warning | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AutoComplete-warning--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-menu-AutoComplete | $borderColor | $borderColor |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete-badge | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete-default | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete-error | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete-success | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete-warning | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-AutoComplete | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-menu-AutoComplete | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-AutoComplete | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-AutoComplete-default | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-AutoComplete-error | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-AutoComplete-success | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-AutoComplete-warning | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-AutoComplete | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-AutoComplete | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-AutoComplete | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-AutoComplete-default | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-AutoComplete-error | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-AutoComplete-success | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-AutoComplete-warning | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-menu-AutoComplete | 1px | 1px |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-default | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-default--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-error | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-error--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-success | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-success--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-warning | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-AutoComplete-warning--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-AutoComplete | $boxShadow-md | $boxShadow-md |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-menu-AutoComplete | $boxShadow-md | $boxShadow-md |
| [fontSize](../styles-and-themes/common-units/#size)-AutoComplete-badge | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-AutoComplete-badge | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-AutoComplete-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-AutoComplete-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-AutoComplete-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-AutoComplete-warning | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-AutoComplete-default | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-AutoComplete-error | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-AutoComplete-success | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-placeholder-AutoComplete-warning | *none* | *none* |
| [minHeight](../styles-and-themes/common-units/#size)-Input | 39px | 39px |
| [outlineColor](../styles-and-themes/common-units/#color)-AutoComplete--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-AutoComplete--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-AutoComplete--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-AutoComplete--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-AutoComplete | $space-1 | $space-1 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-AutoComplete-badge | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-AutoComplete | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-AutoComplete | $space-2 | $space-2 |
| [paddingVertical](../styles-and-themes/common-units/#size)-AutoComplete-badge | $space-1 | $space-1 |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete--disabled | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-badge | $const-color-surface-50 | $const-color-surface-50 |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-badge | $const-color-surface-50 | $const-color-surface-50 |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-badge--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-badge--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-default--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-error--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-success--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-warning | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-AutoComplete-warning--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-item-AutoComplete--disabled | $color-surface-200 | $color-surface-200 |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-AutoComplete | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-AutoComplete-default | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-AutoComplete-error | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-AutoComplete-success | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-placeholder-AutoComplete-warning | *none* | *none* |
