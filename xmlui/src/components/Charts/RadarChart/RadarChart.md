# RadarChart

Interactive radar chart for displaying multivariate data in a two-dimensional chart of three or more quantitative variables

## Basic Usage

```xml
<RadarChart 
  nameKey="subject"
  data="{[
    { subject: 'Math', A: 120, B: 110, fullMark: 150 },
    { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
    { subject: 'English', A: 86, B: 130, fullMark: 150 }
  ]}"
  dataKeys="{['A', 'B']}"
/>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| data | array | [] | Array of data objects for the chart |
| nameKey | string | - | Key in data objects for category labels |
| dataKeys | string[] | [] | Keys in data objects for chart values |
| hideGrid | boolean | false | Whether to hide the polar grid |
| hideAngleAxis | boolean | false | Whether to hide the angle axis |
| hideRadiusAxis | boolean | false | Whether to hide the radius axis |
| hideTooltip | boolean | false | Whether to hide the tooltip |
| showLegend | boolean | false | Whether to show the legend |
| filled | boolean | true | Whether to fill the radar areas with color |
| strokeWidth | number | 2 | Width of the radar lines |
| fillOpacity | number | 0.3 | Opacity of the filled areas (0-1) |

## Examples

### Basic Radar Chart
```xml
<RadarChart 
  nameKey="skill"
  data="{[
    { skill: 'Communication', teamA: 80, teamB: 90 },
    { skill: 'Problem Solving', teamA: 95, teamB: 85 },
    { skill: 'Leadership', teamA: 70, teamB: 95 },
    { skill: 'Technical', teamA: 90, teamB: 80 }
  ]}"
  dataKeys="{['teamA', 'teamB']}"
/>
```

### Filled Radar Chart with Legend
```xml
<RadarChart 
  nameKey="attribute"
  data="{[
    { attribute: 'Speed', player1: 85, player2: 90, player3: 75 },
    { attribute: 'Strength', player1: 90, player2: 80, player3: 95 },
    { attribute: 'Agility', player1: 75, player2: 85, player3: 80 },
    { attribute: 'Endurance', player1: 80, player2: 75, player3: 90 }
  ]}"
  dataKeys="{['player1', 'player2', 'player3']}"
  filled="true"
  fillOpacity="0.4"
  showLegend="true"
/>
```

### Outline-Only Radar Chart
```xml
<RadarChart 
  nameKey="category"
  data="{[
    { category: 'Performance', current: 80, target: 95 },
    { category: 'Quality', current: 90, target: 85 },
    { category: 'Efficiency', current: 75, target: 90 },
    { category: 'Innovation', current: 85, target: 80 }
  ]}"
  dataKeys="{['current', 'target']}"
  filled="false"
  strokeWidth="3"
/>
```

### Minimal Radar Chart (No Grid/Axes)
```xml
<RadarChart 
  nameKey="metric"
  data="{[
    { metric: 'A', value: 80 },
    { metric: 'B', value: 65 },
    { metric: 'C', value: 90 },
    { metric: 'D', value: 75 }
  ]}"
  dataKeys="{['value']}"
  hideGrid="true"
  hideAngleAxis="true"
  hideRadiusAxis="true"
  hideTooltip="true"
/>
```

### Custom Styling
```xml
<RadarChart 
  nameKey="dimension"
  data="{[
    { dimension: 'Usability', product1: 85, product2: 75 },
    { dimension: 'Performance', product1: 90, product2: 95 },
    { dimension: 'Design', product1: 80, product2: 85 },
    { dimension: 'Features', product1: 75, product2: 80 },
    { dimension: 'Reliability', product1: 95, product2: 90 }
  ]}"
  dataKeys="{['product1', 'product2']}"
  filled="true"
  fillOpacity="0.6"
  strokeWidth="4"
  showLegend="true"
/>
```

## Data Format

The chart expects an array of objects where:
- Each object represents a data point on the radar
- The `nameKey` property specifies which field contains the axis labels
- The `dataKeys` array specifies which fields contain numeric values to plot

Example:
```json
[
  { "skill": "Communication", "teamA": 80, "teamB": 90 },
  { "skill": "Problem Solving", "teamA": 95, "teamB": 85 },
  { "skill": "Leadership", "teamA": 70, "teamB": 95 },
  { "skill": "Technical", "teamA": 90, "teamB": 80 }
]
```

## Chart Features

### Polar Coordinate System
Radar charts use a polar coordinate system with:
- **Angle Axis**: Shows category labels around the perimeter
- **Radius Axis**: Shows value scales from center to edge
- **Polar Grid**: Provides reference lines for easier reading

### Multiple Data Series
The chart can display multiple data series simultaneously, each represented by a different colored radar shape. This is ideal for:
- Comparing multiple entities across the same metrics
- Showing before/after scenarios
- Benchmarking against targets or competitors

### Fill and Stroke Options
- **Filled Areas**: When `filled="true"`, areas are filled with semi-transparent colors
- **Stroke Lines**: Outline of each radar shape with customizable width
- **Fill Opacity**: Control transparency of filled areas for better overlap visibility

## Responsive Behavior

The chart automatically adapts to its container size:
- **Mini Mode**: When height < 150px, axes and legend are hidden for better readability
- **Responsive Container**: Chart scales to fill available space
- **Mobile Friendly**: Optimized display for smaller screens

## Color Scheme

Radar areas automatically receive colors from the XMLUI theme palette:
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

Radar charts are ideal for:
- **Performance Analysis**: Employee skills, team capabilities, product features
- **Competitive Analysis**: Comparing products or services across multiple dimensions
- **Survey Results**: Displaying multi-dimensional survey or assessment data
- **Sports Analytics**: Player or team statistics across different attributes
- **Quality Metrics**: Showing various quality dimensions for products or services
- **Risk Assessment**: Visualizing risk factors across different categories

## Best Practices

### Data Preparation
- Use 3-8 dimensions for optimal readability
- Ensure all values are on similar scales
- Consider normalizing data to 0-100 scale for consistency

### Visual Design
- Use `fillOpacity` between 0.2-0.6 for good overlap visibility
- Set `strokeWidth` to 2-4 for clear line definition
- Enable legend when comparing multiple series

### Interpretation
- Larger areas indicate higher overall performance
- Shape patterns reveal strengths and weaknesses
- Overlapping areas show similarities between series

## Notes

- Built on Recharts library for reliable chart rendering
- Supports theming through XMLUI theme system
- Automatically handles color assignment for multiple data series
- Responsive design adapts to container constraints
- Polar grid provides reference lines for value estimation
- Smooth animations and interactions provided by Recharts
- Tooltip shows precise values on hover
- Legend displays series names and colors when enabled
