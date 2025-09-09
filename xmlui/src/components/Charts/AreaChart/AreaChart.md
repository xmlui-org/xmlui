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
