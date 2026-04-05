# React to button click, not keystrokes

Decouple the `TextBox` from the `DataSource` so the search query only runs when the user explicitly clicks Search, not on every keystroke.

When a `DataSource` is bound to a text input directly, it fires a new request on every character typed. Instead, keep the typed value in a local variable and only commit it to the variable that gates the `DataSource` when the user clicks the Search button. Two patterns achieve this: a boolean trigger flag, or a separate "submitted" copy of the typed value.

**Pattern 1 — Boolean trigger flag**: Gate the `DataSource` with a `triggerSearch` variable that is initially `false`. The `Button` click transfers the `TextBox` value to `submittedSearch` and sets `triggerSearch` to `true`. The `DataSource` fires once, then `onDidLoad` resets the flag.

```xmlui-pg name="Try searching for 'xmlui' or 'best'"
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

**Pattern 2 — Submitted-value copy**: Keep a `typedSearch` variable for the `TextBox` and a separate `submittedSearch` variable that starts empty. The `DataSource` is gated on `submittedSearch !== ''`. On button click, copy `typedSearch` into `submittedSearch`. The `DataSource` re-fetches whenever `submittedSearch` changes.

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

## Key points

**Gate `DataSource` with `when`, not by binding `url` to live input**: Using `when="{triggerSearch}"` or `when="{submittedSearch !== ''}"` gives you full control over when a fetch fires. The `DataSource` only executes when its `when` expression is truthy.

**Button `onClick` is the commit point**: Copy the typed value into the submitted variable — or flip a boolean flag — inside `onClick`. All other reactive wiring follows from that single action.

**Reset the trigger after load to allow re-searching the same term**: With the boolean flag pattern, set `triggerSearch = false` in `onDidLoad`. This allows the user to click Search again with the same term and get a fresh result.

**Both patterns work — choose based on whether you need re-fetch control**: The boolean flag gives you exact control over when a re-fetch happens (including re-fetching the same query). The submitted-value copy is simpler but re-fetches only when the query text changes.

---

## See also

- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — trigger a search automatically while the user types, with throttle or debounce
- [Throttle rapid value updates](/docs/howto/throttle-rapid-value-updates) — limit how often a handler fires during rapid input
- [Buffer a reactive edit](/docs/howto/buffer-a-reactive-edit) — stage edits locally before committing them to a data source
