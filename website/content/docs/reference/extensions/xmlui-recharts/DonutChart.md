# DonutChart [#donutchart]

A derivative of [PieChart](/components/PieChart) with a hollow center. Note that the height of the component or its parent needs to be set explicitly.

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

The data to be displayed in the chart. Needs to be an array of objects.

### `dataKey`

This property specifies the key in the data objects that will be used to render the chart.

### `innerRadius`

> [!DEF]  default: **60**

Sets the inner radius of the donut chart.

### `nameKey`

Specifies the key in the data objects that will be used to label the different data series.

### `showLabel`

> [!DEF]  default: **true**

Toggles whether to show labels (`true`) or not (`false`).

### `showLabelList`

> [!DEF]  default: **false**

Whether to show labels in a list (`true`) or not (`false`).

### `showLegend`

> [!DEF]  default: **false**

Whether to show a legend (`true`) or not (`false`).

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [textColor](/docs/styles-and-themes/common-units/#color)-labelList-PieChart | $textColor-primary | $textColor-primary |
