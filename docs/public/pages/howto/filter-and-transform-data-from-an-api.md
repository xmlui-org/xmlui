# Filter and transform data from an API

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
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
      "handler": "return { status: 'ok', data: { items: $state.people } }"
    }
  }
}
---comp display
<Component name="Test">

  <!--
  {
    items:
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
    resultSelector="data.items"
  />

  <!-- Use resultSelector to filter the items array -->
  <DataSource
    id="activePeople"
    url="/api/people"
    resultSelector="data.items.filter(p => p.active)"
  />

  <!-- Use transformResult -->

  <!--
  window.transformPeople = function(data) {
    console.log(data);
    const items = data.data.items;
    const itemMap = {
      A: 'Austin',
      B: 'Boston'
    };
    return items.map(item => ({
      ...item,
      city: itemMap[item.group]
    }));
  };
  -->

  <DataSource
    id="transformedPeople"
    url="/api/people"
    transformResult="{window.transformPeople}"
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


</Component>
```
