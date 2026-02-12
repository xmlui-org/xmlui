# LineChart [#linechart]

`LineChart` displays data as connected points over a continuous axis, ideal for showing trends, changes over time, or relationships between variables. Use it time series data, progress tracking, and comparing multiple data series on the same scale.

The LineChart component accommodates the size of its parent unless you set it explicitly:

```xmlui-pg copy display height="300px" name="Example: dimension determined by the parent" /Card height="240px" width="75%"/
<Card height="240px" width="75%">
  <LineChart
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    yKeys="{['A']}"
    xKey="sprint"
  />
</Card>
```

```xmlui-pg copy display height="300px" name="Example: dimension overwritten by LineChart" /height="240px"/ /height="200px"/
<Card height="240px">
  <LineChart
    height="200px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    yKeys="{['A']}"
    xKey="sprint"
  />
</Card>
```

**Key features:**
- **Flexible orientation**: Choose horizontal or vertical bar layouts
- **Multiple data series**: Display several metrics on the same chart with different colored bars
- **Stacked vs grouped**: Stack bars on top of each other or place them side by side
- **Custom formatting**: Use `tickFormatter` to format axis labels and [`LabelList`](/components/LabelList) for data labels

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

The data to be displayed in the line chart.It needs to be an array of objects, where each object represents a data point.

### `hideTickX` [#hidetickx]

-  default: **false**

Determines whether the X-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.

### `hideTickY` [#hideticky]

-  default: **false**

Determines whether the Y-axis ticks should be hidden. If set to (`true`), the ticks will not be displayed.

### `hideTooltip` [#hidetooltip]

-  default: **false**

Determines whether the tooltip should be hidden.If set to (`true`), no tooltip will be shown when hovering over data points.

### `hideX` [#hidex]

-  default: **false**

Determines whether the X-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `hideY` [#hidey]

-  default: **false**

Determines whether the Y-axis should be hidden. If set to (`true`), the axis will not be displayed.

### `marginBottom` [#marginbottom]

The bottom margin of the chart

### `marginLeft` [#marginleft]

The left margin of the chart

### `marginRight` [#marginright]

The right margin of the chart

### `marginTop` [#margintop]

The top margin of the chart

### `showLegend` [#showlegend]

-  default: **false**

Determines whether the legend should be displayed.

### `tickFormatterX` [#tickformatterx]

A function that formats the X-axis tick labels. It receives a tick value and returns a formatted string.

```xmlui-pg copy display height="320px" name="Example: tickFormatterX" /tickFormatterX/
<App>
  <LineChart
    height="240px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    yKeys="{['A']}"
    xKey="sprint"
    tickFormatterX="{(value) => '(' + value + ')'}"
  />
</App>
```

### `tickFormatterY` [#tickformattery]

A function that formats the Y-axis tick labels. It receives a tick value and returns a formatted string.

```xmlui-pg copy display height="320px" name="Example: tickFormatterY" /tickFormatterY/
<App>
  <LineChart
    height="240px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44 },
        { 'sprint': 'Sprint 2', 'A': 32 },
        { 'sprint': 'Sprint 3', 'A': 48 },
        { 'sprint': 'Sprint 4', 'A': 72 }
       ]}"
    yKeys="{['A']}"
    xKey="sprint"
    tickFormatterY="{(value) => '$' + value}"
  />
</App>
```

### `tooltipTemplate` [#tooltiptemplate]

This property allows replacing the default template to display a tooltip.

```xmlui-pg copy display height="320px" name="Example: tooltipTemplate" /tooltipTemplate/
<App>
  <LineChart
    height="240px"
    data="{[
        { 'sprint': 'Sprint 1', 'A': 44, 'B': 28 },
        { 'sprint': 'Sprint 2', 'A': 32, 'B': 41 },
        { 'sprint': 'Sprint 3', 'A': 48, 'B': 35 },
        { 'sprint': 'Sprint 4', 'A': 72, 'B': 58 }
       ]}"
    yKeys="{['A', 'B']}"
    xKey="sprint"
  >
      <property name="tooltipTemplate">
        <VStack backgroundColor='white' padding="$space-2">
          <Text fontWeight='bold'>{$tooltip.label}</Text>
          <Items data="{$tooltip.payload}">
            <HStack gap="$space-2" verticalAlignment="center">
              <Stack
                width="8px"
                height="8px"
                backgroundColor="{$item.color}" />
              <Text>{$item.label}: {$item.value}</Text>
            </HStack>
          </Items>
        </VStack>
      </property>
  </LineChart>
</App>
```

The `tooltipTemplate` prop allows you to customize the appearance and content of chart tooltips. The template receives a `$tooltip` context variable containing:

- `$tooltip.label`: The label for the data point (typically the yKey value)
- `$tooltip.payload`: An object containing all data values for the hovered point
- `$tooltip.active`: Boolean indicating if the tooltip is currently active

### `xKey` [#xkey]

The key in the data objects used for labeling different data series.

### `yKeys` [#ykeys]

This property specifies the keys in the data objects that should be used for rendering the lines.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [width](../styles-and-themes/common-units/#size)-line-LineChart | 1px | 1px |
