# Use accessors to simplify complex expressions

Extract a deeply nested value into a named local variable so you can reference it cleanly throughout a component.

When a deeply nested path like `weatherData.value.current_condition[0]` appears in multiple expressions, repeating it in full on every binding is noisy and error-prone. Adding `var.condition="{ weatherData.value.current_condition[0] }"` to any containing element declares a reactive local variable that evaluates once and can be referenced by the shorter name `condition` everywhere inside that element.

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

## Key points

**Declare `var.name` on any container element**: The variable is available to all descendants of the element it's declared on — the accessor's scope matches the element's subtree.

**Accessors are reactive**: The expression is re-evaluated whenever any variable it references (such as `weatherData.loaded`) changes. The shorthand name `condition` always reflects the latest value.

**It is just a variable — not special syntax**: `var.condition` is the same as any other `var.*` variable. You can compute, transform, or combine values in the expression, not just extract a nested path.

**Use accessors for repeated paths of three or more levels**: A single-level path such as `{item.name}` is already readable. Accessors pay off when the same sub-path appears three or more times, or when the path is long enough to obscure intent.

---

## See also

- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — combine multiple variables into a single reactive expression
- [Assign a complex JSON literal to a variable](/docs/howto/assign-a-complex-json-literal-to-a-component-variable) — initialize a variable with a structured object literal
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — share variables across the component tree