# Column [#column]

`Column` defines the structure and behavior of individual table columns within a [`Table`](/docs/reference/components/Table) component. Each Column controls data binding, header display, sorting capabilities, sizing, and can contain any XMLUI components for rich cell content.

**Context variables available during execution:**

- `$cell`: The specific cell value for this column
- `$colIndex`: Zero-based column index
- `$item`: The complete data row object being rendered
- `$itemIndex`: Zero-based row index
- `$row`: The complete data row object being rendered (the same as `$item`).
- `$rowIndex`: Zero-based row index (the same as `$itemIndex`).

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `bindTo` [#bindto]

Indicates the name of the current row item's property, the value of which to lay out in the column. If this property is not defined, the column is not sortable.

### `canResize` [#canresize]

> [!DEF]  default: **true**

This property indicates whether the user can resize the column. If set to `true`, the column can be resized by dragging the column border. If set to `false`, the column cannot be resized. Double-clicking the column border resets to the original size.

### `canSort` [#cansort]

> [!DEF]  default: **true**

This property sets whether the user can sort by a column by clicking on its header (`true`) or not (`false`). If the `bindTo` property is not defined, the column is not sortable.

### `header` [#header]

This property defines a label for a particular column. If not set, the `bindTo` property value is used for the label.

### `maxWidth` [#maxwidth]

Indicates the maximum width a particular column can have. Same rules apply as with [width](#width).

### `minWidth` [#minwidth]

Indicates the minimum width a particular column can have. Same rules apply as with [width](#width).

### `pinTo` [#pinto]

This property allows the column to be pinned to the `left` (left-to-right writing style) or `right` (left-to-right writing style) edge of the table. If the writing style is right-to-left, the locations are switched. If this property is not set, the column is not pinned to any edge.

Available values: `left`, `right`

### `width` [#width]

This property defines the width of the column. You can use a numeric value, a pixel value (such as `100px`), or a star size value (such as `*`, `2*`, etc.). You will get an error if you use any other unit (or value).If not defined, the component will use a width according to the column values and the available space.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
