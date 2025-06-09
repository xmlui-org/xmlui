# Slider
The Slider component allows you to select numeric values or ranges. This example demonstrates how to use a slider for date range selection with reactive data filtering.
```xmlui-pg display copy
---app
<App>
  <SliderDemo />
</App>
---comp
<Component name="SliderDemo">
  <variable name="startDate" value="2022-06-01" />
  <variable name="endDate" value="2022-06-30" />
  
  <variable name="dailyData" value="{[
    {date: '2022-06-01', total: 1200},
    {date: '2022-06-02', total: 1850},
    {date: '2022-06-03', total: 0},
    {date: '2022-06-04', total: 950},
    {date: '2022-06-05', total: 1650},
    {date: '2022-06-06', total: 2200},
    {date: '2022-06-07', total: 1400},
    {date: '2022-06-08', total: 0},
    {date: '2022-06-09', total: 1750},
    {date: '2022-06-10', total: 1300},
    {date: '2022-06-11', total: 1900},
    {date: '2022-06-12', total: 2350},
    {date: '2022-06-13', total: 0},
    {date: '2022-06-14', total: 1800},
    {date: '2022-06-15', total: 2150},
    {date: '2022-06-16', total: 1450},
    {date: '2022-06-17', total: 0},
    {date: '2022-06-18', total: 2000},
    {date: '2022-06-19', total: 1250},
    {date: '2022-06-20', total: 1950},
    {date: '2022-06-21', total: 0},
    {date: '2022-06-22', total: 1600},
    {date: '2022-06-23', total: 1850},
    {date: '2022-06-24', total: 2250},
    {date: '2022-06-25', total: 0},
    {date: '2022-06-26', total: 1750},
    {date: '2022-06-27', total: 2050},
    {date: '2022-06-28', total: 1500},
    {date: '2022-06-29', total: 0},
    {date: '2022-06-30', total: 2200}
  ]}" />

  <variable name="filteredData" value="{
    dailyData.filter(item => item.date >= startDate && item.date <= endDate)
  }" />

  <VStack>
    <H1>Date Range Slider Demo</H1>
    
    <Text>Range: {startDate} to {endDate} ({filteredData.length} records)</Text>
    
    <Slider
      id="dateSlider"
      label="Select Date Range"
      minValue="0"
      maxValue="29"
      initialValue="[0, 29]"
      step="1"
      onDidChange="{
        startDate = window.sliderValueToDate(dateSlider.value[0]);
        endDate = window.sliderValueToDate(dateSlider.value[1]);
      }"
      valueFormat="{ (value) => window.sliderValueToDate(value) }"
    />
    
    <Text>Total Revenue: ${filteredData.reduce((sum, item) => sum + item.total, 0)}</Text>
  </VStack>
</Component>
```

This demonstrates:
1. **Slider component** with dual thumbs for range selection
2. **Reactive variables** that update when slider changes
3. **Data filtering** based on the selected date range  
4. **Custom value formatting** to show dates instead of numbers