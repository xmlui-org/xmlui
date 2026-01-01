# React to button click not keystrokes

To drive the search you can gate the `DataSource` with a `triggerSearch` variable that's initially false. The `Button` click transfers the `TextBox` value to the `submittedSearch` variable and also sets `triggerSearch` true. Now the query runs and results display.

```xmlui-pg name="Try searching for 'xmlui' or 'best'"
---app display /submittedSearch/ /triggerSearch/
<App var.submittedSearch="" var.triggerSearch="{false}">
  <DataSource
      id="searchResults"
      url="/api/search"
      body="{JSON.stringify({query: submittedSearch})}"
      method="POST"
      when="{triggerSearch}"
      onDidLoad="triggerSearch = false"
    />
  <HStack>
    <TextBox
      id="searchInput"
      width="300px"
      placeholder="Search text..."
    />
    <Button
      label="Search"
      onClick="submittedSearch = searchInput.value; triggerSearch = true"
    />
  </HStack>
  <Fragment when="{searchResults.loaded}">
    <Text>Search results for: {submittedSearch}</Text>
    <Text>Found {searchResults.value.results.length}</Text>
    <List data="{searchResults.value.results}"/>
  </Fragment>
</App>
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
        const query = JSON.parse($requestBody).query;
        console.log('searching', $state, 'requestBody', $requestBody, 'query', query);
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

Alternatively, you can gate the `DataSource` on an initially-empty `submittedSearch`. Update a `typedSearch` variable when the `TextBox` changes. On the `Button` click, update `typedSearch` to `submittedSearch`. Now the query runs and results display.

```xmlui-pg name="Try searching for 'xmlui' or 'best'"
---app display /typedSearch/ /submittedSearch/
<App var.typedSearch="" var.submittedSearch="">
  <DataSource
    id="searchResults"
    url="/api/search"
    body="{JSON.stringify({ query: submittedSearch })}"
    method="POST"
    when="{submittedSearch !== ''}"
  />
  <HStack>
    <TextBox
      placeholder="Search text..."
      width="300px"
      onDidChange="(value) => typedSearch = value"
    />
    <Button
      label="Search"
      onClick="submittedSearch = typedSearch"
    />
  </HStack>
  <Fragment when="{searchResults.loaded}">
    <Text>Search results for: {submittedSearch}</Text>
    <Text>Found {searchResults.value.results.length}</Text>
    <List data="{searchResults.value.results}"/>
  </Fragment>
</App>
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
        const query = JSON.parse($requestBody).query;
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
