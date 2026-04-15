%-DESC-START

Interactive radar chart for displaying multivariate data in a two-dimensional chart of three or more quantitative variables.

**Key features:**
- **Multivariate visualization**: Perfect for displaying data across multiple dimensions in a polar coordinate system
- **Multiple data series**: Compare several entities across the same set of metrics
- **Filled areas**: Configurable fill opacity for better visual comparison
- **Flexible styling**: Customizable stroke width and fill properties
- **Polar grid system**: Clear reference lines for value estimation

%-DESC-END

%-PROP-START data

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

%-PROP-END

%-PROP-START nameKey

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

%-PROP-END

%-PROP-START dataKeys

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
/>
```

%-PROP-END

%-PROP-START hideGrid

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
/>
```

%-PROP-END

%-PROP-START hideAngleAxis

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
  hideAngleAxis="true"
/>
```

%-PROP-END

%-PROP-START hideRadiusAxis

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
  hideRadiusAxis="true"
/>
```

%-PROP-END

%-PROP-START hideTooltip

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
  hideTooltip="true"
/>
```

%-PROP-END

%-PROP-START showLegend

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
  showLegend="true"
/>
```

%-PROP-END

%-PROP-START filled

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
/>
```

%-PROP-END

%-PROP-START strokeWidth

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
  strokeWidth="4"
/>
```

%-PROP-END

%-PROP-START fillOpacity

```xml
<RadarChart 
  nameKey="dimension"
  data="{[
    { dimension: 'Usability', product1: 85, product2: 75 },
    { dimension: 'Performance', product1: 90, product2: 95 },
    { dimension: 'Design', product1: 80, product2: 85 },
    { dimension: 'Features', product1: 75, product2: 80 }
  ]}"
  dataKeys="{['product1', 'product2']}"
  filled="true"
  fillOpacity="0.6"
/>
```

%-PROP-END

%-PROP-START tooltipTemplate

```xmlui-pg copy display height="320px" name="Example: tooltipTemplate" /tooltipTemplate/
<App>
  <RadarChart
    height="240px"
    data="{[
        { 'skill': 'Communication', 'teamA': 80, 'teamB': 90 },
        { 'skill': 'Problem Solving', 'teamA': 95, 'teamB': 85 },
        { 'skill': 'Leadership', 'teamA': 70, 'teamB': 95 },
        { 'skill': 'Technical', 'teamA': 90, 'teamB': 80 }
       ]}"
    dataKeys="{['teamA', 'teamB']}"
    nameKey="skill"
  >
    <property name="tooltipTemplate">
        <VStack backgroundColor='white' padding="$space-2">
          <Text fontWeight='bold'>{$tooltip.label}</Text>
          <HStack>
            <Text color='blue'>Team A: {$tooltip.payload.teamA}</Text>
            <Text color='green'>Team B: {$tooltip.payload.teamB}</Text>
          </HStack>
        </VStack>
    </property>
  </RadarChart>
</App>
```

The `tooltipTemplate` prop allows you to customize the appearance and content of chart tooltips. The template receives a `$tooltip` context variable containing:

- `$tooltip.label`: The label for the data point (typically the nameKey value)
- `$tooltip.payload`: An object containing all data values for the hovered point
- `$tooltip.active`: Boolean indicating if the tooltip is currently active

%-PROP-END
