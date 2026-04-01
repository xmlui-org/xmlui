# RadarChart [#radarchart]

Interactive radar chart for displaying multivariate data in a two-dimensional chart of three or more quantitative variables

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

This property is used to provide the component with data to display. The data needs to be an array of objects.

### `dataKeys`

This property specifies the keys in the data objects that should be used for rendering the chart elements. E.g. 'value' or 'amount'.

### `filled`

> [!DEF]  default: **true**

Determines whether the radar areas should be filled. If set to `true`, areas will be filled with color.

### `fillOpacity`

> [!DEF]  default: **0.3**

Sets the fill opacity for the radar areas when filled is true. Value between 0 and 1.

### `hideAngleAxis`

> [!DEF]  default: **false**

Determines whether the angle axis should be hidden. If set to `true`, the angle axis will not be rendered.

### `hideGrid`

> [!DEF]  default: **false**

Determines whether the polar grid should be hidden. If set to `true`, the grid will not be rendered.

### `hideRadiusAxis`

> [!DEF]  default: **false**

Determines whether the radius axis should be hidden. If set to `true`, the radius axis will not be rendered.

### `hideTooltip`

> [!DEF]  default: **false**

Determines whether the tooltip should be hidden. If set to `true`, the tooltip will not be rendered.

### `nameKey`

Specifies the key in the data objects that will be used to label the different data series.

### `showLegend`

> [!DEF]  default: **false**

Determines whether the legend should be shown. If set to `true`, the legend will be rendered.

### `strokeWidth`

> [!DEF]  default: **2**

Sets the stroke width for the radar lines. Higher values create thicker lines.

### `tooltipTemplate`

This property allows replacing the default template to display a tooltip.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
