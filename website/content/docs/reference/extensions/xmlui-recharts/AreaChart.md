# AreaChart [#areachart]

Interactive area chart for showing data trends over time with filled areas under the curve

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

### `curved`

> [!DEF]  default: **false**

Determines whether the area lines should be curved (smooth) or straight. If set to `true`, lines will be curved.

### `data`

This property is used to provide the component with data to display. The data needs to be an array of objects.

### `dataKeys`

This property specifies the keys in the data objects that should be used for rendering the chart elements. E.g. 'value' or 'amount'.

### `hideTickX`

> [!DEF]  default: **false**

Determines whether the X-axis tick labels should be hidden. If set to `true`, the tick labels will not be rendered.

### `hideTickY`

> [!DEF]  default: **false**

Determines whether the Y-axis tick labels should be hidden. If set to `true`, the tick labels will not be rendered.

### `hideTooltip`

> [!DEF]  default: **false**

Determines whether the tooltip should be hidden. If set to `true`, the tooltip will not be rendered.

### `hideX`

> [!DEF]  default: **false**

Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.

### `hideY`

> [!DEF]  default: **false**

Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.

### `nameKey`

Specifies the key in the data objects that will be used to label the different data series.

### `showLegend`

> [!DEF]  default: **false**

Determines whether the legend should be shown. If set to `true`, the legend will be rendered.

### `stacked`

> [!DEF]  default: **false**

Determines whether multiple areas should be stacked on top of each other. If set to `true`, areas will be stacked.

### `tooltipTemplate`

This property allows replacing the default template to display a tooltip.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
