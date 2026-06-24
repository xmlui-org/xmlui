`RadioGroup` lets users select one value from a group of `Option` children.

```xmlui-pg copy display name="Example: using RadioGroup"
<App var.selected="{'b'}">
  <RadioGroup initialValue="{selected}" onDidChange="value => selected = value">
    <Option value="a">Alpha</Option>
    <Option value="b">Beta</Option>
  </RadioGroup>
  <Text>Selected: {selected}</Text>
</App>
```

This rewrite slice provides the component-owned native radio foundation. Full old-suite closure is still pending.
