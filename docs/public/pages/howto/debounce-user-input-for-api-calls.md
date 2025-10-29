# Debounce user input for API calls

Use `debounce` to delay function execution until user input pauses, reducing unnecessary API calls. The following example implements search within a product catalog (sample products are Laptop, Mouse, Keyboard, etc.).

```xmlui-pg copy display name="Search with debounced API calls" height="400px"
---comp display /debounce/
<Component 
  name="DebouncedSearch" 
  var.searchTerm="" 
  var.results="{[]}"
  var.inProgress="{false}">
  <VStack>
    <TextBox
      label="Search products:"
      placeholder="Type to search..."
      onDidChange="e => {
        searchTerm = e;
        inProgress = true;
        // Only call API after 500ms of no typing
        debounce(500, (term) => {
          const response = Actions.callApi({
            url: '/api/search',
            method: 'POST',
            body: { query: term }
          });
          results = response.status === 'ok' ? response.results : [];
          inProgress = false;
        }, e);
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
        const query = $requestBody.query.toLowerCase();
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

**Pass values as arguments**: Always pass event values as additional arguments to `debounce` rather than relying on closure capture:

```ts
// ✅ Correct
onDidChange="e => debounce(500, (val) => handleSearch(val), e)"

// ❌ Wrong - 'e' may be undefined when executed
onDidChange="e => debounce(500, () => handleSearch(e))"
```

**Use the same function reference**: Each unique function source gets its own timer. Keep the function structure consistent:

```ts
// ✅ Correct - single timer
debounce(500, (val) => console.log('Value:', val), e)

// ❌ Wrong - creates different timers
if (condition) {
  debounce(500, (val) => console.log('A:', val), e);
} else {
  debounce(500, (val) => console.log('B:', val), e);
}
```

**Common use cases**:
- Search inputs — wait for typing to stop
- Form validation — delay until user pauses
- Auto-save — save changes after editing stops
- Filter controls — reduce computation frequency
