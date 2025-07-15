# Slider

The `Dashboard` page continues with a chart of daily revenue that uses a [Slider](/components/Slider) to control both ends of a date range.

Here is a simplified version of that mechanism. Try using both slider handles to adjust the date range and corresponding total revenue.

```xmlui-pg noHeader
---app display
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
    <H1>Slider Demo</H1>

    <Text>Selected records: {filteredData.length}</Text>

    <Slider
      id="dateSlider"
      label="Date range"
      minValue="{1}"
      maxValue="{30}"
      initialValue="{[1, 30]}"
      step="{1}"
      onDidChange="{
        startDate = window.sliderValueToDate(dateSlider.value[0]);
        endDate = window.sliderValueToDate(dateSlider.value[1]);
      }"
      valueFormat="{ (value) => {
        const result = window.sliderValueToDate(value);
        return result;
        }
      }"
    />

    <Text>Total Revenue: ${filteredData.reduce((sum, item) => sum + item.total, 0)}</Text>

  </VStack>
</Component>
```

Here's `SliderDemo`.

```xmlui /filteredData/ /startDate/ /endDate/ /sliderValueToDate/
<Component name="SliderDemo">
  <variable name="startDate" value="2022-06-01" />
  <variable name="endDate" value="2022-06-30" />

  <variable name="dailyData" value="{[
    {date: '2022-06-01', total: 1200},
    {date: '2022-06-02', total: 1850},
    ...
    {date: '2022-06-29', total: 0},
    {date: '2022-06-30', total: 2200}
  ]}" />

  <variable name="filteredData" value="{
    dailyData.filter(item => item.date >= startDate && item.date <= endDate)
  }" />

  <VStack>
    <H1>Slider Demo</H1>

    <Text>Selected records: {filteredData.length}</Text>

    <Slider
      id="dateSlider"
      label="Date range"
      minValue="{1}"
      maxValue="{30}"
      initialValue="{[1, 30]}"
      step="{1}"
      onDidChange="{
        startDate = window.sliderValueToDate(dateSlider.value[0]);
        endDate = window.sliderValueToDate(dateSlider.value[1]);
      }"
      valueFormat="{ (value) => {
        const result = window.sliderValueToDate(value);
        return result;
        }
      }"
    />

    <Text>
      Total Revenue: ${filteredData.reduce((sum, item) => sum + item.total, 0)}
    </Text>

  </VStack>
</Component>
```

When the handles move, the slider's `onDidChange` event updates `startDate` and `endDate` using a function, `sliderValueToDate`, that translates the slider position to a date in the range of dates. In the Invoices app those variables form part of a `DataSource` URL that fires when there's a change; here they update the `filteredData` variable to simulate the real `DataSource`.

The slider's `valueFormat` property uses the same function to report the new `startDate` and `endDate`.

## A custom Slider

The Invoices app encapsulates this behavior in a custom component called `DateRangeSlider`.

```xmlui /updateState/
<Component name="DateRangeSlider">
  <variable name="originalStartDate" value="{ $props.minDate }"/>
  <variable name="maxEndDate" value="{ $props.maxDate }"/>
  <variable name="startDate" value="{ originalStartDate }"/>
  <variable name="endDate" value="{ maxEndDate }"/>
  <variable
    name="totalDays"
    value="{ window.daysBetween(originalStartDate, maxEndDate)}"/>

  <ChangeListener
    listenTo="{slider.value}"
    onDidChange="{() => {
      // Update the start and end dates based on slider values
      updateState({
        value: {
          startDate: window.sliderValueToDate(slider.value[0], originalStartDate),
          endDate: window.sliderValueToDate(slider.value[1], originalStartDate)
        }
      });
    }}"
  />

  <Slider
    id="slider"
    label="dateRange"
    minValue="{0}"
    maxValue="{ totalDays }"
    initialValue="{ [0, totalDays] }"
    step="10"
    valueFormat="{ (value) => {
      const date = window.sliderValueToDate(value, originalStartDate);
      return date;
    }}"
  />
</Component>
```

The `updateState` method, available in all components, is a merge operation that can set multiple variables.
