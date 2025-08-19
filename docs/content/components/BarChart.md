# BarChart [#barchart]

`BarChart` displays data as horizontal or vertical bars, supporting both grouped and stacked layouts. It's ideal for comparing values across categories, showing revenue trends, or displaying any quantitative data over time or categories.

The BarChart component accommodates the size of its parent unless you set it explicitly:

```xmlui-pg copy display height="300px" name="Example: dimension determined by the parent" /Card height="240px" width="75%"/
<Card height="240px" width="75%">
  <BarChart
    layout="horizontal"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    dataKeys="{['A']}"
    nameKey="sprint"
  />
</Card>
```

```xmlui-pg copy display height="300px" name="Example: dimension overwritten by BarChart" /height="240px"/ /height="200px"/
<Card height="240px">
  <BarChart
    layout="horizontal"
    height="200px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    dataKeys="{['A']}"
    nameKey="sprint"
  />
</Card>
```

**Key features:**
- **Flexible orientation**: Choose horizontal or vertical bar layouts
- **Multiple data series**: Display several metrics on the same chart with different colored bars
- **Stacked vs grouped**: Stack bars on top of each other or place them side by side
- **Custom formatting**: Use `tickFormatter` to format axis labels and [`LabelList`](/components/LabelList) for data labels

## Properties [#properties]

### `data` [#data]

This property is used to provide the component with data to display.The data needs to be an array of objects.

### `dataKeys` [#datakeys]

This property specifies the keys in the data objects that should be used for rendering the bars.E.g. 'id' or 'key'.

### `hideTickX` (default: false) [#hidetickx-default-false]

Controls the visibility of the X-axis ticks. If set to `true`, tick labels on the X-axis will be hidden.

### `hideTickY` (default: false) [#hideticky-default-false]

Controls the visibility of the Y-axis ticks. If set to `true`, tick labels on the Y-axis will be hidden.

### `hideTooltip` (default: false) [#hidetooltip-default-false]

Determines whether the tooltip should be hidden. If set to `true`, tooltips will not appear on hover.

### `hideX` (default: false) [#hidex-default-false]

Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.

### `hideY` (default: false) [#hidey-default-false]

Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.

### `layout` (default: "vertical") [#layout-default-vertical]

This property determines the orientation of the bar chart. The `vertical` variant specifies the horizontal axis as the primary and lays out the bars from left to right. The `horizontal` variant specifies the vertical axis as the primary and has the bars spread from top to bottom.

Available values: `horizontal`, `vertical` **(default)**

### `nameKey` [#namekey]

Specifies the key in the data objects that will be used to label the different data series.

### `showLegend` (default: false) [#showlegend-default-false]

Determines whether the legend should be displayed.

### `stacked` (default: false) [#stacked-default-false]

This property determines how the bars are laid out.If set to `true`, bars with the same category will be stacked on top of each other rather than placed side by side.

### `tickFormatterX` [#tickformatterx]

A function that formats the tick labels on the X-axis. 

```xmlui-pg copy display height="320px" name="Example: tickFormatterX" /tickFormatterX/
<App>
  <BarChart
    layout="horizontal"
    height="240px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    dataKeys="{['A']}"
    nameKey="sprint"
    tickFormatterX="{(value) => '(' + value + ')'}"
  />
</App>
```

### `tickFormatterY` [#tickformattery]

A function that formats the tick labels on the Y-axis. 

```xmlui-pg copy display height="320px" name="Example: tickFormatterY" /tickFormatterY/
<App>
  <BarChart
    layout="horizontal"
    height="240px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    dataKeys="{['A']}"
    nameKey="sprint"
    tickFormatterY="{(value) => '$' + value}"
  />
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
