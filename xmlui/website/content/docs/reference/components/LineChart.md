# LineChart [#linechart]

`LineChart` displays data as connected points over a continuous axis, ideal for showing trends, changes over time, or relationships between variables. Use it time series data, progress tracking, and comparing multiple data series on the same scale.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `data` [#data]

The data to be displayed in the line chart.It needs to be an array of objects, where each object represents a data point.

### `hideTickX` [#hidetickx]

> [!DEF]  default: **false**

Determines whether the X-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.

### `hideTickY` [#hideticky]

> [!DEF]  default: **false**

Determines whether the Y-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.

### `hideTooltip` [#hidetooltip]

> [!DEF]  default: **false**

Determines whether the tooltip should be hidden.If set to (`true`), no tooltip will be shown when hovering over data points.

### `hideX` [#hidex]

> [!DEF]  default: **false**

Determines whether the X-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `hideY` [#hidey]

> [!DEF]  default: **false**

Determines whether the Y-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `marginBottom` [#marginbottom]

The bottom margin of the chart

### `marginLeft` [#marginleft]

The left margin of the chart

### `marginRight` [#marginright]

The right margin of the chart

### `marginTop` [#margintop]

The top margin of the chart

### `showLegend` [#showlegend]

> [!DEF]  default: **false**

Determines whether the legend should be displayed.

### `tickFormatterX` [#tickformatterx]

A function that formats the X-axis tick labels. It receives a tick value and returns a formatted string.

### `tickFormatterY` [#tickformattery]

A function that formats the Y-axis tick labels. It receives a tick value and returns a formatted string.

### `tooltipTemplate` [#tooltiptemplate]

This property allows replacing the default template to display a tooltip.

### `xKey` [#xkey]

The key in the data objects used for labeling different data series.

### `yKeys` [#ykeys]

This property specifies the keys in the data objects that should be used for rendering the lines.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [width](/docs/styles-and-themes/common-units/#size-values)-line-LineChart | 1px | 1px |
