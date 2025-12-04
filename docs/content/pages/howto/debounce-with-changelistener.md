# Debounce with ChangeListener

Use `ChangeListener` with `throttleWaitInMs` to delay reactions to value changes, reducing unnecessary operations. The following example implements search within a product catalog (sample products are Laptop, Mouse, Keyboard, etc.) using the ChangeListener component to throttle API calls.

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

## Key Points

**Listen to the right value**: Use `listenTo` to watch the specific variable or component property that drives your logic:

```xmlui
<!-- ✅ Correct - listens to the searchTerm variable -->
<ChangeListener
  listenTo="{searchTerm}"
  throttleWaitInMs="500"
  onDidChange="arg => handleSearch(arg.newValue)"
/>

<!-- ✅ Also correct - listens to component's value property -->
<ChangeListener
  listenTo="{searchInput.value}"
  throttleWaitInMs="500"
  onDidChange="arg => handleSearch(arg.newValue)"
/>
```

**Access previous and new values**: The event argument provides both `prevValue` and `newValue` for comparison:

```xmlui
<ChangeListener
  listenTo="{userInput}"
  throttleWaitInMs="300"
  onDidChange="arg => {
    if (!arg.prevValue && !arg.newValue) return; // Skip initial empty state
    console.log(`Changed from '${arg.prevValue}' to '${arg.newValue}'`);
  }"
/>
```

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
