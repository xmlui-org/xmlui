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

### `maps`

An object of `name → GeoJSON` map definitions. Each entry is passed to `echarts.registerMap(name, geojson)` before the option is applied, so a `map`-type series can reference the name (e.g. `series: [{ type: 'map', map: 'my-region', ... }]`). Entries whose value is empty are skipped, so binding a not-yet-loaded DataSource value is safe: the map registers (and the chart re-renders) when the data arrives. Omitting the property leaves current behavior unchanged.

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
