`Select` lets users choose one or more values from a list of `Option` items or from a data array.

```xmlui-pg copy display name="Example: using Select"
<App var.selected="{'a'}">
  <Select initialValue="{selected}" onDidChange="value => selected = value">
    <Option value="a" label="Alpha" />
    <Option value="b" label="Beta" />
  </Select>
  <Text>Selected: {selected}</Text>
</App>
```

This rewrite slice provides the native select foundation. The full original dropdown, searchable, grouped, validation, form, and overlay behavior remains part of the broader Select migration.
