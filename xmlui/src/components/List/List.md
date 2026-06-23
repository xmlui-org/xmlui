`List` renders a data array with an item template.

```xmlui-pg copy display name="Example: using List"
<App var.rows="{[
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' }
]}">
  <List data="{rows}">
    <Text>{$item.name}</Text>
  </List>
</App>
```

This rewrite slice provides a component-owned List foundation. Full old-suite closure, including virtualization and complete selection behavior, is still pending.
