# React to button click not keystrokes

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---comp display
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
    url="https://httpbin.org/post"
    body="{JSON.stringify({query: searchText})}"
    method="POST"
    when="{triggerSearch}"
    onDidLoad="triggerSearch = false"
  />
  <Fragment when="{searchResults.loaded}">
    <Text>Search results for: {searchText}</Text>
    <Text>Response received: {searchResults.value.json ? 'Yes' : 'No'}</Text>
  </Fragment>
</Component>
```
