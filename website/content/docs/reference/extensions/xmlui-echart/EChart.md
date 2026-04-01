# EChart [#echart]

`EChart` wraps Apache ECharts via echarts-for-react, providing a declarative charting component with full XMLUI theming integration.

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

### `height`

> [!DEF]  default: **"400px"**

Height of the chart container.

### `option`

The ECharts option object. Accepts any valid ECharts configuration. XMLUI theme colors are automatically injected for palette, text, axes, and tooltip unless explicitly overridden in the option.

### `renderer`

> [!DEF]  default: **"canvas"**

Rendering engine: 'canvas' or 'svg'.

Available values: `canvas` **(default)**, `svg`

### `width`

> [!DEF]  default: **"100%"**

Width of the chart container.

## Events

This component does not have any events.

## Exposed Methods

### `getEchartsInstance`

Returns the underlying ECharts instance for programmatic access.

**Signature**: `getEchartsInstance(): ECharts`

## Styling

This component does not have any styles.
