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

## Key benefits

**Cleaner markup**: Extract complex paths once at the component level, then use simple variable names throughout your component.

**Better maintainability**: If the API structure changes, update the accessor in one place rather than searching through multiple nested expressions.

**Improved readability**: Short variable names like `condition` and `location` are easier to understand than long chains like `weatherData.value.current_condition[0]`.

## Pattern

Use the `var.*` prefix to declare accessors on the component where you need the data:

```xmlui
<Card
  var.myData="{ source.deeply.nested.array[0] }"
  var.otherData="{ source.another.path[0].item }">

  <!-- Now use the simple variable names -->
  <Text>{myData.property}</Text>
  <Text>{otherData.value}</Text>
</Card>
```

## When to use accessors

- Working with API responses that have single-element arrays
- Dealing with deeply nested object structures
- When the same nested path is used multiple times
- To make component code more self-documenting
