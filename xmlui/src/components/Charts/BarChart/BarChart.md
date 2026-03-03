%-DESC-START

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
- **Custom formatting**: Use `tickFormatter` to format axis labels and [`LabelList`](/docs/reference/components/LabelList) for data labels

%-DESC-END

%-PROP-START tickFormatterY

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

%-PROP-END


%-PROP-START tickFormatterX

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

%-PROP-END

%-PROP-START tooltipTemplate

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

%-PROP-END
