# Rate-limit value changes with debounce or throttle

Use rate limiting when a value can change faster than your app should react to it. XMLUI gives you two places to do that:

- Use the global `debounce()` function inside an event handler when the action belongs to that event.
- Use `ChangeListener` when the action should react to a variable or expression, no matter which component changed it.
- Use `ChangeListener` with `throttleWaitInMs` when you want periodic updates during a burst instead of waiting for the burst to end.

`ChangeListener` is useful when the watched value is shared, derived, or updated from multiple places. For a single `TextBox` whose handler immediately calls an API, the global `debounce()` helper is usually simpler. See [Debounce user input for API calls](/docs/howto/debounce-user-input-for-api-calls) for that event-handler pattern.

The example below watches `searchTerm`. The API call runs only after the value has stayed unchanged for 100 ms, regardless of what updated `searchTerm`.

```xmlui-pg copy display name="Debounced value listener" height="400px"
---app display /ChangeListener/ /debounceWaitInMs/
<App
  name="DebouncedSearch"
  var.searchTerm=""
  var.results="{[]}"
  var.inProgress="{false}">

  <TextBox
    id="searchInput"
    label="Search products:"
    placeholder="Type to search..."
    value="{searchTerm}"
    onDidChange="value => searchTerm = value"
  />

  <ChangeListener
    listenTo="{searchTerm}"
    debounceWaitInMs="100"
    onDidChange="({newValue}) => {
      results = [];
      if (!newValue) {
        inProgress = false;
        return;
      }

      inProgress = true;
      const response = Actions.callApi({
        url: '/api/search',
        method: 'POST',
        body: { query: newValue }
      });
      results = response.status === 'ok' ? response.results : [];
      inProgress = false;
    }"
  />

  <Card when="{searchTerm.length > 0}">
    <VStack>
      <Text when="{inProgress}" variant="em">
        Searching for: {searchTerm}
      </Text>
      <Fragment when="{!inProgress}">
        <Fragment when="{results.length > 0}">
          <H4>Found {results.length} result(s)</H4>
          <List data="{results}">
            {$item.name} ({$item.category}) - ${$item.price}
          </List>
        </Fragment>
        <Text when="{results.length === 0}">
          No results found
        </Text>
      </Fragment>
    </VStack>
  </Card>
</App>
---desc
The following items can be searched for among the products:
Laptop, Mouse, Keyboard, Monitor, Desk Chair, Desk Lamp
---api
{
  "apiUrl": "/api",
  "initialize": "$state.products = [{ id: 1, name: 'Laptop', price: 999, category: 'Electronics' }, { id: 2, name: 'Mouse', price: 29, category: 'Electronics' }, { id: 3, name: 'Keyboard', price: 79, category: 'Electronics' }, { id: 4, name: 'Monitor', price: 299, category: 'Electronics' }, { id: 5, name: 'Desk Chair', price: 199, category: 'Furniture' }, { id: 6, name: 'Desk Lamp', price: 49, category: 'Furniture' }]",
  "operations": {
    "post-search": {
      "url": "/search",
      "method": "post",
      "handler": "delay(800); const query = ($requestBody.query || '').toLowerCase(); const filtered = $state.products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)); return { status: 'ok', query: query, results: filtered };"
    }
  }
}
```

## Choose the mechanism

**Use `debounce()` for one event source**: Put `debounce(wait, callback, ...args)` directly in an event handler when the delayed work belongs to that handler. Pass the event value as an argument so the callback receives the value that triggered it.

```xmlui
<TextBox
  onDidChange="value => debounce(500, (term) => runSearch(term), value)"
/>
```

**Use `ChangeListener` with `debounceWaitInMs` for reactive side effects**: Watch a variable, component property, or derived expression and run the handler after the watched value settles. This is the better fit when several controls update the same value, or when the source is an expression such as `{quantity * unitPrice}`.

```xmlui
<ChangeListener
  listenTo="{searchTerm}"
  debounceWaitInMs="500"
  onDidChange="({newValue}) => runSearch(newValue)"
/>
```

**Use `ChangeListener` with `throttleWaitInMs` for periodic updates**: Throttle fires immediately, then at most once per interval. Use it when users should see intermediate updates during a burst, such as scroll tracking, slider previews, or live collaboration cursors.

```xmlui
<ChangeListener
  listenTo="{sliderValue}"
  throttleWaitInMs="200"
  onDidChange="({newValue}) => previewPrice = newValue * unitPrice"
/>
```

## Key points

**`ChangeListener` is non-visual and does not fire on initial mount**: Place it anywhere in the component tree. It only reacts to subsequent changes, so setting a variable's initial value via `var.name` is safe and will not trigger the handler.

**`listenTo` accepts any expression**: Watch a single variable (`{searchTerm}`), a component's property (`{searchInput.value}`), or a derived expression (`{quantity * unitPrice}`). The listener fires whenever the evaluated result changes.

**Debounce waits; throttle samples**: Debounce waits until changes stop, so it is best when only the final value matters. Throttle responds at the start of a burst and then caps the rate, so it is best when intermediate values still matter.

**Pick one timing strategy per listener**: Setting both `debounceWaitInMs` and `throttleWaitInMs` is not recommended. Debounce takes precedence when both are set.

**`onDidChange` receives `{prevValue, newValue}`**: Use `newValue` for most reactions. Use `prevValue` when you need to compare the new value with the previous one.

---

## See also

- [Debounce user input for API calls](/docs/howto/debounce-user-input-for-api-calls) - use the global `debounce()` helper directly inside an event handler
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) - compute values reactively without a side effect
