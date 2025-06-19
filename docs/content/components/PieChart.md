# PieChart [#piechart]

`PieChart` visualizes proportional data as circular segments; each slice represents a percentage of the whole.

**Key features:**
- **Proportional visualization**: Displays data segments as slices of a complete circle
- **Flexible labeling**: Configurable label positions both inside and outside chart segments
- **Data binding**: Connects to array data with specified keys for values and labels
- **Label list display**: Optional legend-style list showing all segments and values
- **Customizable sizing**: Configurable dimensions and outer radius for different layouts

For a variation with a hollow center, see [DonutChart](/components/DonutChart).

## Properties [#properties]

### `data` [#data]

The data to be displayed in the chart. Needs to be an array of objects.

### `dataKeys` [#datakeys]

This property specifies the keys in the data objects that should be used for rendering the bars.

### `height` [#height]

The height of the chart

### `labelListPosition (default: "inside")` [#labellistposition-default-inside]

The position of the label list.

Available values: `top`, `left`, `right`, `bottom`, `inside` **(default)**, `outside`, `insideLeft`, `insideRight`, `insideTop`, `insideBottom`, `insideTopLeft`, `insideBottomLeft`, `insideTopRight`, `insideBottomRight`, `insideStart`, `insideEnd`, `end`, `center`, `centerTop`, `centerBottom`, `middle`

### `nameKey` [#namekey]

Specifies the key in the data objects that will be used to label the different data series.

### `outerRadius` [#outerradius]

The outer radius of the pie chart, can be a number or a string (e.g., '100%').

### `showLabel (default: true)` [#showlabel-default-true]

Toggles whether to show labels (`true`) or not (`false`).

### `showLabelList (default: false)` [#showlabellist-default-false]

Whether to show labels in a list (`true`) or not (`false`).

### `width` [#width]

The width of the chart

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [textColor](../styles-and-themes/common-units/#color)-labelList-PieChart | $textColor-primary | $textColor-primary |
