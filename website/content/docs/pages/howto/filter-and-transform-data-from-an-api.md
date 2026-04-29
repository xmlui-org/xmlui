# Transform nested API responses

Use `resultSelector` to extract a subset of the response and `transformResult` to reshape it with custom logic.

APIs often return wrapper objects (`{ status, data: { items: [...] } }`) rather than a flat array. Instead of restructuring data in every consumer, let the `DataSource` do the work. `resultSelector` plucks a nested path (and supports inline `.filter()` / `.map()` calls), while `transformResult` takes a function for heavier processing like lookups or computed fields.

```xmlui-pg copy display name="Extract, filter, and transform API data"
---app
<App>
  <!--
  {
    people:
      [
        { id: 1, name: 'Alice', active: true,  group: 'A' },
        { id: 2, name: 'Bob',   active: false, group: 'B' },
        { id: 3, name: 'Carol', active: true,  group: 'A' },
        { id: 4, name: 'Dave',  active: true,  group: 'B' }
      ]
  }
  -->

  <!-- Use resultSelector to select the items array -->
  <DataSource
    id="allPeople"
    url="/api/people"
    resultSelector="people"
  />

  <!-- Use resultSelector to filter the users array -->
  <DataSource
    id="activePeople"
    url="/api/people"
    resultSelector="people.filter(p => p.active)"
  />

  <!-- Use transformResult -->

  <script>
    function transformPeople (data) {
      const items = data.people;
      const itemMap = {
        A: 'Austin',
        B: 'Boston'
      };
      return items.map(item => ({
        ...item,
        city: itemMap[item.group]
      }));
    };
  </script>

  <DataSource
    id="transformedPeople"
    url="/api/people"
    transformResult="{transformPeople}"
  />

  <Text>All people:</Text>
  <List data="{allPeople}">
    <Text>{$item.name} ({$item.group})</Text>
  </List>

  <Text>Active people:</Text>
  <List data="{activePeople}">
    <Text>{$item.name} ({$item.group})</Text>
  </List>

  <Text>Transformed people:</Text>
  <List data="{transformedPeople}">
    <Text>{$item.name} ({$item.city})</Text>
  </List>
</App>
---api display
{
  "apiUrl": "/api",
  "initialize": "$state.people = [
    { id: 1, name: 'Alice', active: true,  group: 'A' },
    { id: 2, name: 'Bob',   active: false, group: 'B' },
    { id: 3, name: 'Carol', active: true,  group: 'A' },
    { id: 4, name: 'Dave',  active: true,  group: 'B' }
  ]",
  "operations": {
    "get-people": {
      "url": "/people",
      "method": "get",
      "handler": "return { status: 'ok', people: $state.people }"
    }
  }
}
```

## Key points

**`resultSelector` plucks a path from the response**: Set it to a dot-separated key path like `"people"` and the DataSource's `value` will be that nested value instead of the full response object.

**`resultSelector` supports inline expressions**: You can chain `.filter()`, `.map()`, or `.find()` directly — e.g., `resultSelector="people.filter(p => p.active)"`. The expression runs on every fetch result.

**`transformResult` takes a function for complex reshaping**: Assign a function reference — `transformResult="{myTransform}"` — that receives the raw response and returns the final value. Use this when you need lookups, computed fields, or multi-step transformations.

**Both can be combined**: `resultSelector` runs first (extracting a subset), then `transformResult` receives that subset. However, for most cases one or the other is sufficient.

---

## See also

- [Use mock data during development](/docs/howto/use-mock-data-during-development) — test your selectors with inline data
- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) — display a placeholder during the fetch
- [Poll an API at regular intervals](/docs/howto/poll-an-api-at-regular-intervals) — combine transformations with automatic polling
