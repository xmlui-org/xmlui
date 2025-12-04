# BarChart [#barchart]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `BarChart` component represents a bar chart.Accepts a `LabelLst` component as a child to parametrize display labels.

## Properties

### `data`

This property is used to provide the component with data to display.The data needs to be an array of objects.

### `dataKeys`

This property specifies the keys in the data objects that should be used for rendering the bars.E.g. 'id' or 'key'.

### `hideTickX (default: false)`

Controls the visibility of the X-axis ticks. If set to `true`, tick labels on the X-axis will be hidden.

### `hideTickY (default: false)`

Controls the visibility of the Y-axis ticks. If set to `true`, tick labels on the Y-axis will be hidden.

### `hideX (default: false)`

Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.

### `hideY (default: false)`

Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.

### `layout (default: "vertical")`

This property determines the orientation of the bar chart. The `vertical` variant specifies the horizontal axis as the primary and lays out the bars from left to right. The `horizontal` variant specifies the vertical axis as the primary and has the bars spread from top to bottom.

Available values: `horizontal`, `vertical` **(default)**

### `nameKey`

Specifies the key in the data objects that will be used to label the different data series.

### `showLegend (default: false)`

Determines whether the legend should be displayed.

### `stacked (default: false)`

This property determines how the bars are laid out.If set to `true`, bars with the same category will be stacked on top of each other rather than placed side by side.

### `tickFormatter`

A function that formats the axis tick labels. It receives a tick value and returns a formatted string.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
