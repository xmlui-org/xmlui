# Context Variables Summary

This page provides a comprehensive overview of all context variables exposed by XMLUI components. Context variables are values that components make available to their children, accessible using the `$variableName` syntax.

## Available Context Variables

Jump to:

- [`$attempts`](#attempts)
- [`$cell`](#cell)
- [`$colIndex`](#colindex)
- [`$completedItems`](#completeditems)
- [`$context`](#context)
- [`$data`](#data)
- [`$elapsed`](#elapsed)
- [`$error`](#error)
- [`$group`](#group)
- [`$header`](#header)
- [`$isFirst`](#isfirst)
- [`$isLast`](#islast)
- [`$item`](#item)
- [`$itemContext`](#itemcontext)
- [`$itemIndex`](#itemindex)
- [`$overflow`](#overflow)
- [`$param`](#param)
- [`$params`](#params)
- [`$polling`](#polling)
- [`$progress`](#progress)
- [`$queuedItems`](#queueditems)
- [`$result`](#result)
- [`$row`](#row)
- [`$rowIndex`](#rowindex)
- [`$setValue`](#setvalue)
- [`$statusData`](#statusdata)
- [`$validationResult`](#validationresult)
- [`$value`](#value)

---

## `$attempts` [#attempts]

Number of status polls made in deferred mode

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Number of status polls made in deferred mode |

## `$cell` [#cell]

The specific cell value for this column

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Column](/docs/reference/components/Column) | The specific cell value for this column |

## `$colIndex` [#colindex]

Zero-based column index

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Column](/docs/reference/components/Column) | Zero-based column index |

## `$completedItems` [#completeditems]

A list containing the queue items that have been completed (fully processed).

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Queue](/docs/reference/components/Queue) | A list containing the queue items that have been completed (fully processed). |

## `$context` [#context]

Contains the context data passed to the `openAt()` method. This allows menu items to access information about the element or data that triggered the context menu.

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [ContextMenu](/docs/reference/components/ContextMenu) | Contains the context data passed to the `openAt()` method. This allows menu items to access information about the element or data that triggered the context menu. |

## `$data` [#data]

This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances. `$data` also provides an `update` method as a shortcut to the Form's exposed `update` method.

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Form](/docs/reference/components/Form) | This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances. `$data` also provides an `update` method as a shortcut to the Form's exposed `update` method. |

## `$elapsed` [#elapsed]

Time elapsed since polling started in milliseconds

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Time elapsed since polling started in milliseconds |

## `$error` [#error]

Error details (available in `errorNotificationMessage`)

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Error details (available in `errorNotificationMessage`) |

## `$group` [#group]

Context variable exposed by the following components. See individual component descriptions for details.

**Used by:** 2 components

| Component | Description |
| --- | --- |
| [List](/docs/reference/components/List) | Group information when using `groupBy` (available in group templates) |
| [Select](/docs/reference/components/Select) | Group name when using `groupBy` (available in group header templates) |

## `$header` [#header]

This context value represents the header context with props: id (optional), index, label, isActive.

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [TabItem](/docs/reference/components/TabItem) | This context value represents the header context with props: id (optional), index, label, isActive. |

## `$isFirst` [#isfirst]

Boolean indicating if this is the first item

**Used by:** 2 components

| Component | Description |
| --- | --- |
| [Items](/docs/reference/components/Items) | Boolean indicating if this is the first item |
| [List](/docs/reference/components/List) | Boolean indicating if this is the first item |

## `$isLast` [#islast]

Boolean indicating if this is the last item

**Used by:** 2 components

| Component | Description |
| --- | --- |
| [Items](/docs/reference/components/Items) | Boolean indicating if this is the last item |
| [List](/docs/reference/components/List) | Boolean indicating if this is the last item |

## `$item` [#item]

Provides access to the current item being rendered in a list or iteration context.

**Used by:** 5 components

| Component | Description |
| --- | --- |
| [AutoComplete](/docs/reference/components/AutoComplete) | This context value represents an item when you define an option item template. Use `$item.value` and `$item.label` to refer to the value and label of the particular option. |
| [Column](/docs/reference/components/Column) | The complete data row object being rendered |
| [Items](/docs/reference/components/Items) | Current data item being rendered |
| [List](/docs/reference/components/List) | Current data item being rendered |
| [Select](/docs/reference/components/Select) | Represents the current option's data (label and value properties) |

## `$itemContext` [#itemcontext]

Provides the `removeItem()` method for multi-select scenarios

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Select](/docs/reference/components/Select) | Provides the `removeItem()` method for multi-select scenarios |

## `$itemIndex` [#itemindex]

Provides access to the current item being rendered in a list or iteration context.

**Used by:** 3 components

| Component | Description |
| --- | --- |
| [Column](/docs/reference/components/Column) | Zero-based row index |
| [Items](/docs/reference/components/Items) | Zero-based index of current item |
| [List](/docs/reference/components/List) | Zero-based index of current item |

## `$overflow` [#overflow]

Boolean indicating whether the child component is displayed in the overflow dropdown menu (true) or visible in the main bar (false).

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [ResponsiveBar](/docs/reference/components/ResponsiveBar) | Boolean indicating whether the child component is displayed in the overflow dropdown menu (true) or visible in the main bar (false). |

## `$param` [#param]

Context variable exposed by the following components. See individual component descriptions for details.

**Used by:** 2 components

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | The first parameter passed to `execute()` method |
| [ModalDialog](/docs/reference/components/ModalDialog) | First parameter passed to the `open()` method |

## `$params` [#params]

Context variable exposed by the following components. See individual component descriptions for details.

**Used by:** 2 components

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Array of all parameters passed to `execute()` method (access with `$params[0]`, `$params[1]`, etc.) |
| [ModalDialog](/docs/reference/components/ModalDialog) | Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.) |

## `$polling` [#polling]

Boolean indicating if polling is currently active in deferred mode

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Boolean indicating if polling is currently active in deferred mode |

## `$progress` [#progress]

Current progress 0-100 when in deferred mode (extracted via progressExtractor expression)

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Current progress 0-100 when in deferred mode (extracted via progressExtractor expression) |

## `$queuedItems` [#queueditems]

A list containing the items waiting in the queue, icluding the completed items.

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Queue](/docs/reference/components/Queue) | A list containing the items waiting in the queue, icluding the completed items. |

## `$result` [#result]

Response data (available in `completedNotificationMessage`)

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Response data (available in `completedNotificationMessage`) |

## `$row` [#row]

The complete data row object being rendered (the same as `$item`).

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Column](/docs/reference/components/Column) | The complete data row object being rendered (the same as `$item`). |

## `$rowIndex` [#rowindex]

Zero-based row index (the same as `$itemIndex`).

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [Column](/docs/reference/components/Column) | Zero-based row index (the same as `$itemIndex`). |

## `$setValue` [#setvalue]

Function to set the FormItem's value programmatically

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [FormItem](/docs/reference/components/FormItem) | Function to set the FormItem's value programmatically |

## `$statusData` [#statusdata]

Latest status response data when in deferred mode (available in event handlers and notifications)

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [APICall](/docs/reference/components/APICall) | Latest status response data when in deferred mode (available in event handlers and notifications) |

## `$validationResult` [#validationresult]

Current validation state and error messages for this field

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [FormItem](/docs/reference/components/FormItem) | Current validation state and error messages for this field |

## `$value` [#value]

Current value of the FormItem, accessible in expressions and code snippets

**Used by:** 1 component

| Component | Description |
| --- | --- |
| [FormItem](/docs/reference/components/FormItem) | Current value of the FormItem, accessible in expressions and code snippets |

