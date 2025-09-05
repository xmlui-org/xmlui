# Group items in List by a property

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api display
{
  "apiUrl": "/api",
  "initialize": "$state.people_groupby = [
    { id: 1, name: 'Alice', active: true,  group: 'A' },
    { id: 2, name: 'Bob',   active: false, group: 'B' },
    { id: 3, name: 'Carol', active: true,  group: 'A' },
    { id: 4, name: 'Dave',  active: true,  group: 'B' }
  ]",
  "operations": {
    "get-people-groupby": {
      "url": "/people_groupby",
      "method": "get",
      "handler": "return { status: 'ok', data: { items: $state.people_groupby } }"
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

  <DataSource
    id="allPeopleGroupBy"
    url="/api/people_groupby"
    resultSelector="data.items"
  />
  <List data="{allPeopleGroupBy}" groupBy="group">
    <property name="groupHeaderTemplate">
      <Text variant="subtitle">Group {$group.key}</Text>
    </property>
    <Text>{$item.name}</Text>
  </List>
</Component>
```
