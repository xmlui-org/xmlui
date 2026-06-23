`AutoComplete` lets users type to filter available `Option` values and select one of them.

```xmlui-pg copy display name="Example: using AutoComplete"
<App var.selected="{''}">
  <AutoComplete placeholder="Choose" onDidChange="value => selected = value">
    <Option value="alpha">Alpha</Option>
    <Option value="beta">Beta</Option>
  </AutoComplete>
  <Text>Selected: {selected}</Text>
</App>
```

This rewrite slice provides the component-owned native autocomplete foundation. Full old-suite closure is still pending.
