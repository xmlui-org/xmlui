# BarChart [#barchart]

The `BarChart` component represents a bar chart.Accepts a `LabelLst` component as a child to parametrize display labels.

## Properties [#properties]

### `data` [#data]

This property is used to provide the component with data to display.The data needs to be an array of objects.

### `dataKeys` [#datakeys]

This property specifies the keys in the data objects that should be used for rendering the bars.E.g. 'id' or 'key'.

### `hideTickX (default: false)` [#hidetickx-default-false]

Controls the visibility of the X-axis ticks. If set to `true`, tick labels on the X-axis will be hidden.

### `hideTickY (default: false)` [#hideticky-default-false]

Controls the visibility of the Y-axis ticks. If set to `true`, tick labels on the Y-axis will be hidden.

### `hideX (default: false)` [#hidex-default-false]

Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.

### `hideY (default: false)` [#hidey-default-false]

Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.

### `layout (default: "vertical")` [#layout-default-vertical]

This property determines the orientation of the bar chart. The `vertical` variant specifies the horizontal axis as the primary and lays out the bars from left to right. The `horizontal` variant specifies the vertical axis as the primary and has the bars spread from top to bottom.

Available values: `horizontal`, `vertical` **(default)**

### `nameKey` [#namekey]

Specifies the key in the data objects that will be used to label the different data series.

### `showLegend (default: false)` [#showlegend-default-false]

Determines whether the legend should be displayed.

### `stacked (default: false)` [#stacked-default-false]

This property determines how the bars are laid out.If set to `true`, bars with the same category will be stacked on top of each other rather than placed side by side.

### `tickFormatter` [#tickformatter]

A function that formats the axis tick labels. It receives a tick value and returns a formatted string.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
