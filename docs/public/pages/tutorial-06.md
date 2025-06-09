# Slider

test

```xmlui-pg display
---app
<App>
  Test:
  <SliderDemo />
</App>
---comp
<Component name="SliderDemo">
  <script>
    function sliderValueToDate(value) {
      const start = new Date('2022-06-01');
      const resultDate = new Date(start);
      resultDate.setDate(start.getDate() + value);

      const year = resultDate.getFullYear();
      const month = String(resultDate.getMonth() + 1).padStart(2, '0');
      const day = String(resultDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    var startDate = '2022-06-01';
    var endDate = '2022-06-30';
  </script>

  <DataSource
    id="dailyRevenue"
    url="/resources/files/daily-revenue.json"
    method="GET"
  />

  <!-- Calculate filtered data based on date range -->
  <variable name="filteredData" value="{
    dailyRevenue.value ?
    dailyRevenue.value.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    }) : []
  }" />

  <VStack>
    <H1>Slider Demo - Date Range Selection</H1>

    <Text>Current Range: {startDate} to {endDate} ({filteredData.length} records)</Text>

    <Fragment when="{dailyRevenue.value}">
      <Slider
        id="dateSlider"
        label="Select Date Range"
        minValue="0"
        maxValue="29"
        initialValue="[0, 29]"
        step="1"
        onDidChange="{
          startDate = sliderValueToDate(dateSlider.value[0]);
          endDate = sliderValueToDate(dateSlider.value[1]);
        }"
        valueFormat="{ (value) => sliderValueToDate(value) }"
      />
    </Fragment>

    <Text>Total Revenue in Range: ${filteredData.reduce((sum, item) => sum + item.total, 0)}</Text>
  </VStack>
</Component>
```