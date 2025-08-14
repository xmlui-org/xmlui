# AreaChart

Interactive area chart for showing data trends over time with filled areas under the curve

## Basic Usage

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

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| data | array | [] | Array of data objects for the chart |
| nameKey | string | - | Key in data objects for category labels |
| dataKeys | string[] | [] | Keys in data objects for chart values |
| hideX | boolean | false | Whether to hide the X-axis |
| hideY | boolean | false | Whether to hide the Y-axis |
| hideTickX | boolean | false | Whether to hide X-axis tick labels |
| hideTickY | boolean | false | Whether to hide Y-axis tick labels |
| hideTooltip | boolean | false | Whether to hide the tooltip |
| showLegend | boolean | false | Whether to show the legend |
| stacked | boolean | false | Whether to stack multiple areas |
| curved | boolean | false | Whether to use curved (smooth) lines |

## Examples

### Basic Area Chart
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

### Stacked Area Chart
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
  showLegend="true"
/>
```

### Curved Area Chart
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

### Minimal Area Chart (No Axes)
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
  hideY="true"
  hideTooltip="true"
/>
```

### Multiple Areas with Legend
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
  curved="true"
/>
```

## Data Format

The chart expects an array of objects where:
- Each object represents a data point
- The `nameKey` property specifies which field contains category labels
- The `dataKeys` array specifies which fields contain numeric values to chart

Example:
```json
[
  { "month": "Jan", "sales": 1200, "profit": 400 },
  { "month": "Feb", "sales": 1900, "profit": 600 },
  { "month": "Mar", "sales": 1500, "profit": 500 }
]
```

## Chart Features

### Stacked Areas
When `stacked="true"`, multiple data series are stacked on top of each other, showing both individual values and cumulative totals. This is useful for showing part-to-whole relationships over time.

### Curved Lines
When `curved="true"`, the area boundaries use smooth curves (monotone interpolation) instead of straight lines, creating a more visually appealing chart for continuous data.

### Multiple Data Series
The chart can display multiple areas simultaneously by specifying multiple keys in the `dataKeys` array. Each area gets a different color from the theme palette.

## Responsive Behavior

The chart automatically adapts to its container size:
- **Mini Mode**: When height < 150px, axes and legend are hidden for better readability
- **Responsive Container**: Chart scales to fill available space
- **Mobile Friendly**: Optimized display for smaller screens

## Color Scheme

Areas automatically receive colors from the XMLUI theme palette:
- Primary colors (blue tones)
- Success colors (green tones)  
- Warning colors (yellow/orange tones)
- Danger colors (red tones)
- Info colors (cyan tones)
- Secondary colors (gray tones)

Colors cycle through this palette for multiple data series.

## Accessibility

- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators
- Proper ARIA labels for chart elements

## Use Cases

Area charts are ideal for:
- **Time Series Data**: Showing trends over time (sales, temperature, stock prices)
- **Cumulative Data**: Displaying running totals or cumulative values
- **Part-to-Whole Analysis**: Using stacked areas to show composition changes
- **Comparison**: Comparing multiple metrics with overlapping areas
- **Continuous Data**: Visualizing smooth, continuous datasets with curved lines

## Notes

- Built on Recharts library for reliable chart rendering
- Supports theming through XMLUI theme system
- Automatically handles color assignment for multiple data series
- Responsive design adapts to container constraints
- Areas have 60% fill opacity for better visual layering
- Smooth animations and interactions provided by Recharts
- Grid lines use dashed pattern (strokeDasharray="3 3")
- Tooltip shows precise values on hover
