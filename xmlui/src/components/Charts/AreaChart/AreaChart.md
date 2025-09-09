%-DESC-START

Interactive area chart for showing data trends over time with filled areas under the curve.

**Key features:**
- **Time series visualization**: Perfect for showing data trends over time with filled areas under the curve
- **Multiple data series**: Display several metrics on the same chart with different colored areas
- **Stacked vs overlapping**: Stack areas on top of each other or display them overlapping
- **Curved lines**: Use smooth curves for more visually appealing continuous data
- **Custom formatting**: Use `tickFormatter` to format axis labels

%-DESC-END

%-PROP-START data

```xml
<AreaChart 
  nameKey="name"
  data="{[
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 150 },
    { name: 'Mar', value: 120 }
  ]}"
  dataKeys="{['value']}"
/>
```

%-PROP-END

%-PROP-START nameKey

```xml
<AreaChart 
  nameKey="month"
  data="{[
    { month: 'Jan', sales: 1200, profit: 400 },
    { month: 'Feb', sales: 1900, profit: 600 },
    { month: 'Mar', sales: 1500, profit: 500 }
  ]}"
  dataKeys="{['sales', 'profit']}"
/>
```

%-PROP-END

%-PROP-START dataKeys

```xml
<AreaChart 
  nameKey="category"
  data="{[
    { category: 'A', value1: 100, value2: 200 },
    { category: 'B', value1: 150, value2: 250 },
    { category: 'C', value1: 120, value2: 180 }
  ]}"
  dataKeys="{['value1', 'value2']}"
/>
```

%-PROP-END

%-PROP-START hideX

```xml
<AreaChart 
  nameKey="name"
  data="{[
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
    { name: 'C', value: 150 }
  ]}"
  dataKeys="{['value']}"
  hideX="true"
/>
```

%-PROP-END

%-PROP-START hideY

```xml
<AreaChart 
  nameKey="name"
  data="{[
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
    { name: 'C', value: 150 }
  ]}"
  dataKeys="{['value']}"
  hideY="true"
/>
```

%-PROP-END

%-PROP-START hideTickX

```xml
<AreaChart 
  nameKey="name"
  data="{[
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
    { name: 'C', value: 150 }
  ]}"
  dataKeys="{['value']}"
  hideTickX="true"
/>
```

%-PROP-END

%-PROP-START hideTickY

```xml
<AreaChart 
  nameKey="name"
  data="{[
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
    { name: 'C', value: 150 }
  ]}"
  dataKeys="{['value']}"
  hideTickY="true"
/>
```

%-PROP-END

%-PROP-START hideTooltip

```xml
<AreaChart 
  nameKey="name"
  data="{[
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
    { name: 'C', value: 150 }
  ]}"
  dataKeys="{['value']}"
  hideTooltip="true"
/>
```

%-PROP-END

%-PROP-START showLegend

```xml
<AreaChart 
  nameKey="quarter"
  data="{[
    { quarter: 'Q1', revenue: 1000, expenses: 800, profit: 200 },
    { quarter: 'Q2', revenue: 1200, expenses: 900, profit: 300 },
    { quarter: 'Q3', revenue: 1100, expenses: 850, profit: 250 },
    { quarter: 'Q4', revenue: 1400, expenses: 1000, profit: 400 }
  ]}"
  dataKeys="{['revenue', 'expenses', 'profit']}"
  showLegend="true"
/>
```

%-PROP-END

%-PROP-START stacked

```xml
<AreaChart 
  nameKey="category"
  data="{[
    { category: 'A', value1: 100, value2: 200 },
    { category: 'B', value1: 150, value2: 250 },
    { category: 'C', value1: 120, value2: 180 }
  ]}"
  dataKeys="{['value1', 'value2']}"
  stacked="true"
/>
```

%-PROP-END

%-PROP-START curved

```xml
<AreaChart 
  nameKey="time"
  data="{[
    { time: '00:00', temperature: 18 },
    { time: '06:00', temperature: 15 },
    { time: '12:00', temperature: 25 },
    { time: '18:00', temperature: 22 },
    { time: '24:00', temperature: 19 }
  ]}"
  dataKeys="{['temperature']}"
  curved="true"
/>
```

%-PROP-END

%-PROP-START tooltipTemplate

```xmlui-pg copy display height="320px" name="Example: tooltipTemplate" /tooltipTemplate/
<App>
  <AreaChart
    height="240px"
    data="{[
        { 'month': 'Jan', 'sales': 1200, 'profit': 400 },
        { 'month': 'Feb', 'sales': 1900, 'profit': 600 },
        { 'month': 'Mar', 'sales': 1500, 'profit': 500 },
        { 'month': 'Apr', 'sales': 1800, 'profit': 700 }
       ]}"
    dataKeys="{['sales', 'profit']}"
    nameKey="month"
  >
    <property name="tooltipTemplate">
        <VStack backgroundColor='white' padding="$space-2">
          <Text fontWeight='bold'>{$tooltip.label}</Text>
          <HStack>
            <Text color='blue'>Sales: {$tooltip.payload.sales}</Text>
            <Text color='green'>Profit: {$tooltip.payload.profit}</Text>
          </HStack>
        </VStack>
    </property>
  </AreaChart>
</App>
```

The `tooltipTemplate` prop allows you to customize the appearance and content of chart tooltips. The template receives a `$tooltip` context variable containing:

- `$tooltip.label`: The label for the data point (typically the nameKey value)
- `$tooltip.payload`: An object containing all data values for the hovered point
- `$tooltip.active`: Boolean indicating if the tooltip is currently active

%-PROP-END
