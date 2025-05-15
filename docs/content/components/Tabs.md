# Tabs [#tabs]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `Tabs` component provides a tabbed layout where each tab has a clickable label and content.

The component accepts only `TabItem` components as children.
Other child components will not be displayed.

The `TabItem` component has a `label` prop to define the tab button label text.
Content is provided to a tab via placing child components under the `TabItem`.

```xmlui-pg copy display name="Example: using Tabs" height="200px"
<App>
  <Tabs>
    <TabItem label="Account">
      <Text>Account</Text>
    </TabItem>
    <TabItem label="Stream">
      <Text>Stream</Text>
    </TabItem>
    <TabItem label="Support">
      <Text>Support</Text>
    </TabItem>
  </Tabs>
</App>
```

## Properties

### `activeTab`

This property indicates the index of the active tab. The indexing starts from 0, representing the starting (leftmost) tab.

```xmlui-pg copy display name="Example: activeTab" height="200px"
<App>
  <Tabs activeTab="2">
    <TabItem label="Account">
      <Text>Account</Text>
    </TabItem>
    <TabItem label="Stream">
      <Text>Stream</Text>
    </TabItem>
    <TabItem label="Support">
      <Text>Support</Text>
    </TabItem>
  </Tabs>
</App>
```

### `orientation (default: "vertical")`

This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top.

Available values: `horizontal`, `vertical` **(default)**

```xmlui-pg copy display name="Example: orientation" height="200px"
<App>
  <Tabs orientation="horizontal">
    <TabItem label="Account">
      <Text>Account</Text>
    </TabItem>
    <TabItem label="Stream">
      <Text>Stream</Text>
    </TabItem>
    <TabItem label="Support">
      <Text>Support</Text>
    </TabItem>
  </Tabs>
</App>
```

### `tabTemplate`

This property declares the template for the clickable tab area.

```xmlui-pg copy {2-4} display name="Example: tabTemplate" height="200px"
<App>
  <Tabs>
    <property name="tabTemplate">
      <Card title="{$item.label}" />
    </property>
    <TabItem label="Account">
      <Text>Account</Text>
    </TabItem>
    <TabItem label="Stream">
      <Text>Stream</Text>
    </TabItem>
    <TabItem label="Support">
      <Text>Support</Text>
    </TabItem>
  </Tabs>
</App>
```

## Events

This component does not have any events.

## Exposed Methods

### `next`

This method selects the next tab.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-list-Tabs | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tabs | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-trigger-Tabs | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-trigger-Tabs--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-trigger-Tabs--hover | $color-surface-100 | $color-surface-100 |
| [border](../styles-and-themes/common-units/#border)-list-Tabs | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-trigger-Tabs | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-active-Tabs | $color-primary | $color-primary |
| [borderColor](../styles-and-themes/common-units/#color)-Tabs | $borderColor | $borderColor |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-list-Tabs | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-trigger-Tabs | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Tabs | solid | solid |
| [borderWidth](../styles-and-themes/common-units/#size)-Tabs | 2px | 2px |
| [padding](../styles-and-themes/common-units/#size)-trigger-Tabs | $space-4 | $space-4 |
| [paddingBottom](../styles-and-themes/common-units/#size)-trigger-Tabs | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-trigger-Tabs | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-trigger-Tabs | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-trigger-Tabs | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-trigger-Tabs | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-trigger-Tabs | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-trigger-Tabs | *none* | *none* |
