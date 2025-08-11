# DonutChart [#donutchart]

A derivative of [PieChart](/components/PieChart) with a hollow center. Note that the height of the component or its parent needs to be set explicitly.

## Properties [#properties]

### `data` [#data]

The data to be displayed in the chart. Needs to be an array of objects.

### `dataKey` [#datakey]

This property specifies the key in the data objects that will be used to render the chart.

### `innerRadius` (default: 60) [#innerradius-default-60]

Sets the inner radius of the donut chart.

### `nameKey` [#namekey]

Specifies the key in the data objects that will be used to label the different data series.

### `showLabel` (default: true) [#showlabel-default-true]

Toggles whether to show labels (`true`) or not (`false`).

### `showLabelList` (default: false) [#showlabellist-default-false]

Whether to show labels in a list (`true`) or not (`false`).

### `showLegend` (default: false) [#showlegend-default-false]

Whether to show a legend (`true`) or not (`false`).

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [textColor](../styles-and-themes/common-units/#color)-labelList-PieChart | $textColor-primary | $textColor-primary |
