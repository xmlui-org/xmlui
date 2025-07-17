# LineChart [#linechart]

`LineChart` displays data as connected points over a continuous axis, ideal for showing trends, changes over time, or relationships between variables. Use it time series data, progress tracking, and comparing multiple data series on the same scale.

## Properties [#properties]

### `data` [#data]

The data to be displayed in the line chart.It needs to be an array of objects, where each object represents a data point.

### `dataKeys` [#datakeys]

This property specifies the keys in the data objects that should be used for rendering the lines.

### `hideTooltip` (default: false) [#hidetooltip-default-false]

Determines whether the tooltip should be hidden.If set to (`true`), no tooltip will be shown when hovering over data points.

### `hideX` (default: false) [#hidex-default-false]

Determines whether the X-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `marginBottom` [#marginbottom]

The bottom margin of the chart

### `marginLeft` [#marginleft]

The left margin of the chart

### `marginRight` [#marginright]

The right margin of the chart

### `marginTop` [#margintop]

The top margin of the chart

### `nameKey` [#namekey]

The key in the data objects used for labeling different data series.

### `showLegend` (default: false) [#showlegend-default-false]

Determines whether the legend should be displayed.

### `tickFormatter` [#tickformatter]

A function that formats the axis tick labels. It receives a tick value and returns a formatted string.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
