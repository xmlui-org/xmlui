# DonutChart [#donutchart]

A derivative of [PieChart](/components/PieChart) with a hollow center. Note that the height of the component or its parent needs to be set explicitly.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `data` [#data]

The data to be displayed in the chart. Needs to be an array of objects.

### `dataKey` [#datakey]

This property specifies the key in the data objects that will be used to render the chart.

### `innerRadius` [#innerradius]

-  default: **60**

Sets the inner radius of the donut chart.

### `nameKey` [#namekey]

Specifies the key in the data objects that will be used to label the different data series.

### `showLabel` [#showlabel]

-  default: **true**

Toggles whether to show labels (`true`) or not (`false`).

### `showLabelList` [#showlabellist]

-  default: **false**

Whether to show labels in a list (`true`) or not (`false`).

### `showLegend` [#showlegend]

-  default: **false**

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
