# Use accessors to simplify complex expressions

When working with complex API responses, you can use `var.*` accessors to extract and store nested data, making your component markup cleaner and more maintainable.

```xmlui-pg
---app display {9-10, 13, 22, 26, 29}
<App>
  <!-- Fetch weather data from API -->
  <DataSource id="weatherData" url="/api/weather" />

  <!-- Without accessors: deeply nested expressions -->
  <Card title="Weather (without accessors)" when="{weatherData.loaded}">
    <VStack gap="$space-3">
      <Text>
        Temperature: {weatherData.value.current_condition[0].temp_F}°F
        ({weatherData.value.current_condition[0].temp_C}°C)
      </Text>
      <Text>
        Conditions: {weatherData.value.current_condition[0].weatherDesc[0].value}
      </Text>
    </VStack>
  </Card>

  <!-- With accessors: extract once, use many times -->
  <Card
    title="Weather (with accessors)"
    when="{weatherData.loaded}"
    var.condition="{ weatherData.value.current_condition[0] }"
  >
    <VStack gap="$space-3">
      <Text>
        Temperature: {condition.temp_F}°F ({condition.temp_C}°C)
      </Text>
      <Text>
        Conditions: {condition.weatherDesc[0].value}
      </Text>
    </VStack>
  </Card>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.weatherData = {
    current_condition: [
      {
        temp_F: '72',
        temp_C: '22',
        weatherDesc: [{ value: 'Partly cloudy' }],
        windspeedMiles: '12',
        humidity: '65'
      }
    ],
  }",
  "operations": {
    "get-weather": {
      "url": "/weather",
      "method": "get",
      "handler": "return $state.weatherData"
    }
  }
}
```

