# LineChart [#linechart]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.Represents a line chart component.

## Properties

### `data`

The data to be displayed in the line chart.It needs to be an array of objects, where each object represents a data point.

### `dataKeys`

This property specifies the keys in the data objects that should be used for rendering the lines.

### `hideTooltip (default: false)`

Determines whether the tooltip should be hidden.If set to (`true`), no tooltip will be shown when hovering over data points.

### `hideX (default: false)`

Determines whether the X-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `nameKey`

The key in the data objects used for labeling different data series.

### `showLegend (default: false)`

Determines whether the legend should be displayed.

### `tickFormatter`

A function that formats the axis tick labels. It receives a tick value and returns a formatted string.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
