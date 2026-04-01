# LineChart [#linechart]

`LineChart` displays data as connected points over a continuous axis, ideal for showing trends, changes over time, or relationships between variables. Use it time series data, progress tracking, and comparing multiple data series on the same scale.

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

The data to be displayed in the line chart.It needs to be an array of objects, where each object represents a data point.

### `hideTickX`

> [!DEF]  default: **false**

Determines whether the X-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.

### `hideTickY`

> [!DEF]  default: **false**

Determines whether the Y-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.

### `hideTooltip`

> [!DEF]  default: **false**

Determines whether the tooltip should be hidden.If set to (`true`), no tooltip will be shown when hovering over data points.

### `hideX`

> [!DEF]  default: **false**

Determines whether the X-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `hideY`

> [!DEF]  default: **false**

Determines whether the Y-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `marginBottom`

The bottom margin of the chart

### `marginLeft`

The left margin of the chart

### `marginRight`

The right margin of the chart

### `marginTop`

The top margin of the chart

### `showLegend`

> [!DEF]  default: **false**

Determines whether the legend should be displayed.

### `tickFormatterX`

A function that formats the X-axis tick labels. It receives a tick value and returns a formatted string.

### `tickFormatterY`

A function that formats the Y-axis tick labels. It receives a tick value and returns a formatted string.

### `tooltipTemplate`

This property allows replacing the default template to display a tooltip.

### `xKey`

The key in the data objects used for labeling different data series.

### `yKeys`

This property specifies the keys in the data objects that should be used for rendering the lines.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [width](/docs/styles-and-themes/common-units/#size-values)-line-LineChart | 1px | 1px |
