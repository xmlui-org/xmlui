# PieChart [#piechart]

`PieChart` visualizes proportional data as circular segments; each slice represents a percentage of the whole. Note that the height of the component or its parent needs to be set explicitly.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Display When | `displayWhen` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `data`

The data to be displayed in the chart. Needs to be an array of objects.

### `dataKey`

This property specifies the key in the data objects that will be used to render the chart.

### `labelListPosition`

> [!DEF]  default: **"inside"**

The position of the label list.

Available values: `top`, `left`, `right`, `bottom`, `inside` **(default)**, `outside`, `insideLeft`, `insideRight`, `insideTop`, `insideBottom`, `insideTopLeft`, `insideBottomLeft`, `insideTopRight`, `insideBottomRight`, `insideStart`, `insideEnd`, `end`, `center`, `centerTop`, `centerBottom`, `middle`

### `nameKey`

Specifies the key in the data objects that will be used to label the different data series.

### `outerRadius`

The outer radius of the pie chart, can be a number or a string (e.g., '100%').

### `showLabel`

> [!DEF]  default: **true**

Toggles whether to show labels (`true`) or not (`false`).

### `showLabelList`

> [!DEF]  default: **false**

Whether to show labels in a list (`true`) or not (`false`).

### `showLegend`

> [!DEF]  default: **false**

Toggles whether to show legend (`true`) or not (`false`).

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [textColor](/docs/styles-and-themes/common-units/#color)-labelList-PieChart | $textColor-primary | $textColor-primary |
