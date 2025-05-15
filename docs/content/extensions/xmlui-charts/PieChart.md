# PieChart [#piechart]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.Represents a pie chart component.

## Properties

### `data`

The data to be displayed in the chart. Needs to be an array of objects.

### `dataKeys`

This property specifies the keys in the data objects that should be used for rendering the bars.

### `height`

The height of the chart

### `labelListPosition (default: "inside")`

The position of the label list.

Available values: `top`, `left`, `right`, `bottom`, `inside` **(default)**, `outside`, `insideLeft`, `insideRight`, `insideTop`, `insideBottom`, `insideTopLeft`, `insideBottomLeft`, `insideTopRight`, `insideBottomRight`, `insideStart`, `insideEnd`, `end`, `center`, `centerTop`, `centerBottom`, `middle`

### `nameKey`

Specifies the key in the data objects that will be used to label the different data series.

### `showLabel (default: true)`

Toggles whether to show labels (`true`) or not (`false`).

### `showLabelList (default: false)`

Whether to show labels in a list (`true`) or not (`false`).

### `width`

The width of the chart

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [textColor](../styles-and-themes/common-units/#color)-labelList-PieChart | $textColor-primary | $textColor-primary |
