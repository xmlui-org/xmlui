# React to value changes with debounce or throttle

Use `ChangeListener` to react when a variable changes — with optional debouncing or throttling to reduce the number of times your handler fires.

A `ChangeListener` watches any variable via its `listenTo` prop and calls `onDidChange` with the previous and new values. Adding `debounceWaitInMs` delays the handler until the value has been stable for that many milliseconds, which is ideal for search-as-you-type scenarios. The example below shows debounced product search: the API call fires only after the user stops typing for 500 ms.

```xmlui-pg copy display name="Search with ChangeListener debouncing" height="400px"
---app display /ChangeListener/ /debounceWaitInMs/ 
<App
  name="DebouncedSearch" 
  var.searchTerm="" 
  var.results="{[]}"
  var.inProgress="{false}">

  <!-- 
    products = [
      { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
      { id: 2, name: 'Mouse', price: 29, category: 'Electronics' },
      { id: 3, name: 'Keyboard', price: 79, category: 'Electronics' },
      { id: 4, name: 'Monitor', price: 299, category: 'Electronics' },
      { id: 5, name: 'Desk Chair', price: 199, category: 'Furniture' },
      { id: 6, name: 'Desk Lamp', price: 49, category: 'Furniture' }
    ]
  -->

  <TextBox
    id="searchInput"
    label="Search products:"
    placeholder="Type to search..."
    value="{searchTerm}"
    onDidChange="e => searchTerm = e"
  />

  <ChangeListener
    listenTo="{searchTerm}"
    debounceWaitInMs="500"
    onDidChange="arg => {
      results = [];
      if (!arg.newValue) {
        inProgress = false;
        return;
      }
      
      inProgress = true;
      const response = Actions.callApi({
        url: '/api/search',
        method: 'POST',
        body: { query: arg.newValue }
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
          <H4>Found {pluralize(results.length, 'result', 'results')}</H4>
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
---api
{
  "apiUrl": "/api",
  "initialize": "$state.products = [
    { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
    { id: 2, name: 'Mouse', price: 29, category: 'Electronics' },
    { id: 3, name: 'Keyboard', price: 79, category: 'Electronics' },
    { id: 4, name: 'Monitor', price: 299, category: 'Electronics' },
    { id: 5, name: 'Desk Chair', price: 199, category: 'Furniture' },
    { id: 6, name: 'Desk Lamp', price: 49, category: 'Furniture' }
  ]",
  "operations": {
    "post-search": {
      "url": "/search",
      "method": "post",
      "handler": "
        delay(800);
        const query = ($requestBody.query || '').toLowerCase();
        const filtered = $state.products.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
        return {
          status: 'ok',
          query: query,
          results: filtered
        };
      "
    }
  }
}
```

## Key points

**`ChangeListener` is non-visual and does not fire on initial mount**: Place it anywhere in the component tree. It only reacts to *subsequent* changes, so setting a variable's initial value via `var.name` is safe and will not trigger the handler.

**`listenTo` accepts any expression**: Watch a single variable (`{searchTerm}`), a component's property (`{searchInput.value}`), or even a derived expression (`{quantity * unitPrice}`). The listener fires whenever the evaluated result changes.

**`debounceWaitInMs` waits for the value to settle before firing**: The handler is postponed until the watched value has not changed for the specified number of milliseconds. Use this when only the *final* value matters — e.g. triggering a search API call after the user finishes typing rather than on every keystroke.

**`throttleWaitInMs` fires immediately, then at most once per interval**: Unlike debounce, throttle guarantees a response at the *start* of a burst and then caps the rate. Use this when you want *some* updates during rapid changes, not just the last one — e.g. scroll tracking, live price preview, or real-time collaboration cursors.

```xmlui
<ChangeListener
  listenTo="{sliderValue}"
  throttleWaitInMs="200"
  onDidChange="({newValue}) => previewPrice = newValue * unitPrice"
/>
```

**`onDidChange` receives `{prevValue, newValue}`**: Both values are available in the event object for comparison or delta computation. Destructure only what you need: `({newValue}) => handleSearch(newValue)`.

---

## See also

- [Throttle rapid value updates](/docs/howto/throttle-rapid-value-updates) — apply `throttleWaitInMs` when you need updates during a burst, not just at the end
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute values reactively without a listener
- [Run a one-time action on page load](/docs/howto/run-a-one-time-action-on-page-load) — trigger initialisation logic once instead of watching a variable
