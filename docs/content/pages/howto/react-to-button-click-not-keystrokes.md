# React to button click not keystrokes

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---comp display /searchText/ /triggerSearch/
  <!-- Use two different variables -->
<Component name="Test" var.searchText="" var.triggerSearch="{false}">
  <TextBox
    id="searchInput"
    placeholder="Type something..."
    width="300px"
  />
  <Button
    label="Search"
    onClick="searchText = searchInput.value; triggerSearch = true"
  />
  <DataSource
    id="searchResults"
    url="/api/search"
    body="{JSON.stringify({query: searchText})}"
    method="POST"
    when="{triggerSearch}"
    onDidLoad="triggerSearch = false"
  />
  <Fragment when="{searchResults.loaded}">
    <Text>Search results for: {searchText}</Text>
    <Text>Found {searchResults.value.results.length} results</Text>
  </Fragment>
</Component>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.searchData = [
    { id: 1, title: 'Introduction to XMLUI', category: 'tutorial' },
    { id: 2, title: 'DataSource Best Practices', category: 'guide' },
    { id: 3, title: 'Building Forms in XMLUI', category: 'tutorial' },
    { id: 4, title: 'Advanced Component Patterns', category: 'guide' }
  ]",
  "operations": {
    "post-search": {
      "url": "/search",
      "method": "post",
      "handler": "
        const query = $body.query || '';
        const results = query ?
          $state.searchData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          ) :
          $state.searchData;
        return {
          status: 'ok',
          query: query,
          results: results
        };
      "
    }
  }
}
```
