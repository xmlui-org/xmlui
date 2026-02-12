# BarChart [#barchart]

`BarChart` displays data as horizontal or vertical bars, supporting both grouped and stacked layouts. It's ideal for comparing values across categories, showing revenue trends, or displaying any quantitative data over time or categories.

The BarChart component accommodates the size of its parent unless you set it explicitly:

```xmlui-pg copy display height="300px" name="Example: dimension determined by the parent" /Card height="240px" width="75%"/
<Card height="240px" width="75%">
  <BarChart
    orientation="horizontal"
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

```xmlui-pg copy display height="300px" name="Example: dimension overwritten by BarChart" /height="240px"/ /height="200px"/
<Card height="240px">
  <BarChart
    orientation="horizontal"
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

This property is used to provide the component with data to display.The data needs to be an array of objects.

### `hideTickX` [#hidetickx]

-  default: **false**

Controls the visibility of the X-axis ticks. If set to `true`, tick labels on the X-axis will be hidden.

### `hideTickY` [#hideticky]

-  default: **false**

Controls the visibility of the Y-axis ticks. If set to `true`, tick labels on the Y-axis will be hidden.

### `hideTooltip` [#hidetooltip]

-  default: **false**

Determines whether the tooltip should be hidden. If set to `true`, tooltips will not appear on hover.

### `hideX` [#hidex]

-  default: **false**

Determines whether the X-axis should be hidden. If set to `true`, the axis will not be rendered.

### `hideY` [#hidey]

-  default: **false**

Determines whether the Y-axis should be hidden. If set to `true`, the axis will not be rendered.

### `orientation` [#orientation]

-  default: **"vertical"**

This property determines the orientation of the bar chart. The `vertical` variant specifies the horizontal axis as the primary and lays out the bars from left to right. The `horizontal` variant specifies the vertical axis as the primary and has the bars spread from top to bottom.

Available values: `horizontal`, `vertical` **(default)**

### `showLegend` [#showlegend]

-  default: **false**

Determines whether the legend should be displayed.

### `stacked` [#stacked]

-  default: **false**

This property determines how the bars are laid out.If set to `true`, bars with the same category will be stacked on top of each other rather than placed side by side.

### `tickFormatterX` [#tickformatterx]

A function that formats the tick labels on the X-axis. 

```xmlui-pg copy display height="320px" name="Example: tickFormatterX" /tickFormatterX/
<App>
  <BarChart
    orientation="horizontal"
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

A function that formats the tick labels on the Y-axis. 

```xmlui-pg copy display height="320px" name="Example: tickFormatterY" /tickFormatterY/
<App>
  <BarChart
    orientation="horizontal"
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
  <BarChart
    orientation="horizontal"
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
  </BarChart>
</App>
```

The `tooltipTemplate` prop allows you to customize the appearance and content of chart tooltips. The template receives a `$tooltip` context variable containing:

- `$tooltip.label`: The label for the data point (typically the yKey value)
- `$tooltip.payload`: An object containing all data values for the hovered point
- `$tooltip.active`: Boolean indicating if the tooltip is currently active

### `xKey` [#xkey]

This property specifies the keys in the data objects that should be used for rendering the bars.E.g. 'id' or 'key'.

### `yKeys` [#ykeys]

Specifies the key in the data objects that will be used to label the different data series.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
