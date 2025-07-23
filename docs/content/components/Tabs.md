# Tabs [#tabs]

`Tabs` enables users to switch among content panels using clickable tab headers. It provides an efficient way to present multiple related sections in a single interface area, with each tab containing distinct content defined by [TabItem](/components/TabItem) components.

**Key features:**
- **Content organization**: Efficiently displays multiple content sections in a single interface area
- **Flexible orientation**: Supports both horizontal (tabs on top) and vertical (tabs on side) layouts
- **Active tab control**: Programmatically set which tab is initially selected
- **Custom tab styling**: Configurable tab appearance via `tabTemplate` property
- **Navigation methods**: Built-in methods for programmatic tab switching

**Usage pattern:**
The component accepts only [TabItem](/components/TabItem) components as children. Other child components will not be displayed. Each [TabItem](/components/TabItem) has a `label` property for the tab button text, with content provided by placing child components within the [TabItem](/components/TabItem).

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

## Properties [#properties]

### `activeTab` [#activetab]

This property indicates the index of the active tab. The indexing starts from 0, representing the starting (leftmost) tab. If not set, the first tab is selected by default.

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

### `orientation` (default: "horizontal") [#orientation-default-horizontal]

This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top.

Available values: `horizontal` **(default)**, `vertical`

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `next` [#next]

This method selects the next tab. If the current tab is the last one, it wraps around to the first tab.

**Signature**: `next(): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

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
