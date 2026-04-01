# BarChart [#barchart]

`BarChart` displays data as horizontal or vertical bars, supporting both grouped and stacked layouts. It's ideal for comparing values across categories, showing revenue trends, or displaying any quantitative data over time or categories.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `data`

This property is used to provide the component with data to display.The data needs to be an array of objects.

### `hideTickX`

> [!DEF]  default: **false**

Controls the visibility of the X-axis ticks. If set to `true`, tick labels on the X-axis will be hidden.

### `hideTickY`

> [!DEF]  default: **false**

Controls the visibility of the Y-axis ticks. If set to `true`, tick labels on the Y-axis will be hidden.

### `hideTooltip`

> [!DEF]  default: **false**

Determines whether the tooltip should be hidden. If set to `true`, tooltips will not appear on hover.

### `hideX`

> [!DEF]  default: **false**

Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.

### `hideY`

> [!DEF]  default: **false**

Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.

### `orientation`

> [!DEF]  default: **"vertical"**

This property determines the orientation of the bar chart. The `vertical` variant specifies the horizontal axis as the primary and lays out the bars from left to right. The `horizontal` variant specifies the vertical axis as the primary and has the bars spread from top to bottom.

Available values: `horizontal`, `vertical` **(default)**

### `showLegend`

> [!DEF]  default: **false**

Determines whether the legend should be displayed.

### `stacked`

> [!DEF]  default: **false**

This property determines how the bars are laid out.If set to `true`, bars with the same category will be stacked on top of each other rather than placed side by side.

### `tickFormatterX`

A function that formats the tick labels on the X-axis. 

### `tickFormatterY`

A function that formats the tick labels on the Y-axis. 

### `tooltipTemplate`

This property allows replacing the default template to display a tooltip.

### `xKey`

This property specifies the keys in the data objects that should be used for rendering the bars.E.g. 'id' or 'key'.

### `yKeys`

Specifies the key in the data objects that will be used to label the different data series.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
