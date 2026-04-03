# React to value changes with debounce or throttle

Use `ChangeListener` to react when a variable changes — with optional debouncing or throttling to reduce the number of times your handler fires.

A `ChangeListener` watches any variable via its `listenTo` prop and calls `onDidChange` with the previous and new values. Adding `throttleWaitInMs` makes the handler fire at most once per interval during rapid changes, which is ideal for search-as-you-type scenarios. The example below shows throttled product search: as you type, the `ChangeListener` waits at most 500 ms between API calls.

```xmlui-pg copy display name="Search with ChangeListener throttling" height="400px"
---comp display /ChangeListener/ /throttleWaitInMs/ 
<Component 
  name="DebouncedSearch" 
  var.searchTerm="" 
  var.results="{[]}"
  var.inProgress="{false}">
  <VStack>
    <TextBox
      id="searchInput"
      label="Search products:"
      placeholder="Type to search..."
      value="{searchTerm}"
      onDidChange="e => searchTerm = e"
    />

    <ChangeListener
      listenTo="{searchTerm}"
      throttleWaitInMs="500"
      onDidChange="arg => {
        if (!arg.newValue) {
          results = [];
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
  </VStack>
</Component>
---app display
<App>
  <DebouncedSearch />
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

**`throttleWaitInMs` fires immediately, then at most once per interval**: Ideal for live search, scroll tracking, and similar burst scenarios where you want *some* updates during rapid changes. Use `debounceWaitInMs` instead when only the final settled value matters.

**`onDidChange` receives `{prevValue, newValue}`**: Both values are available in the event object for comparison or delta computation. Destructure only what you need: `({newValue}) => handleSearch(newValue)`.

---

## See also

- [Throttle rapid value updates](/docs/howto/throttle-rapid-value-updates) — throttle vs debounce explained side by side
- [React to button click, not keystrokes](/docs/howto/react-to-button-click-not-keystrokes) — wait for explicit submit instead of reacting while typing
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute values reactively without a listener

**Handle empty values gracefully**: Consider what should happen when the watched value becomes empty:

```xmlui
<ChangeListener
  listenTo="{searchTerm}"
  throttleWaitInMs="500"
  onDidChange="arg => {
    if (!arg.newValue) {
      results = []; // Clear results when search is empty
      return;
    }
    // Perform search with arg.newValue
  }"
/>
```

**Common use cases**:
- Search inputs — throttle API calls as user types
- Form validation — delay validation until user pauses
- Auto-save — save changes after editing stops
- Filters and sorting — reduce computation on rapid changes
- State synchronization — coordinate between components
