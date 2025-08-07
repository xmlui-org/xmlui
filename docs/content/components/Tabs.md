# Tabs [#tabs]

`Tabs` enables users to switch among content panels using clickable tab headers. It provides an efficient way to present multiple related sections in a single interface area, with each tab containing distinct content defined by [TabItem](/components/TabItem) components.

**Key features:**
- **Content organization**: Efficiently displays multiple content sections in a single interface area
- **Flexible orientation**: Supports both horizontal (tabs on top) and vertical (tabs on side) layouts
- **Active tab control**: Programmatically set which tab is initially selected
- **Custom header templates**: Configurable tab appearance via `headerTemplate` property
- **Navigation methods**: Built-in methods for programmatic tab switching (`next()`, `prev()`, `setActiveTabIndex()`, `setActiveTabById()`)
- **External ID support**: Optional `id` prop for TabItems with context exposure
- **Dynamic content**: Works seamlessly with `Items` for data-driven tabs

## Using Tabs [#using-tabs]

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

## Dynamic Tabs [#dynamic-tabs]

You can create `TabItem` children dynamically:

```xmlui-pg copy display name="Example: using Tabs with dynamic items" height="200px"
<App>
  <Tabs>
    <Items data="{[1, 2, 3, 4]}">
      <TabItem label="Account {$item}">
        <Card title="Tab Content for Account {$item}"/>
      </TabItem>
    </Items>
  </Tabs>
</App>
```

## External TabItem identifiers [#external-tabitem-identifiers]

TabItems can have an optional `id` prop that gets exposed in the `$header` context:

```xmlui-pg copy display name="Example: External ID support" height="250px"
<App>
  <Tabs>
    <TabItem label="Home" id="home-tab">
      <property name="headerTemplate">
        <Text>ID: {$header.id} | {$header.label}</Text>
      </property>
      Home content
    </TabItem>
    <TabItem label="Settings">
      <property name="headerTemplate">
        <Text>No ID | {$header.label}</Text>
      </property>
      Settings content
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

### `headerTemplate` [#headertemplate]

This property declares the template for the clickable tab area.

```xmlui-pg copy {3-8} display name="Example: headerTemplate" /headerTemplate/ height="200px" 
<App>
  <Tabs>
    <property name="headerTemplate">
        <Icon name="chevronright" />
        <Text color="green">Account {$header.index}</Text>
    </property>
    <Items data="{[
        {id: 1, name: 'AcmeCorp'}, 
        {id: 2, name: 'BetaLLC'}, 
        {id: 3, name: 'GammaInc'}]
      }">
      <TabItem label="Account {$item}">
        <Card title="Tab Content for Account {$item.name}"/>
      </TabItem>
    </Items>
  </Tabs>
</App>
```

The `headerTemplate` property allows you to customize the appearance of tab headers. The template receives a `$header` context variable with the following properties:
- `id` (optional): External ID if provided to TabItem
- `index`: Zero-based index of the tab
- `label`: The tab's label text
- `isActive`: Boolean indicating if this tab is currently active

Individual tab items have an optional identifier, which is passed to the header template.

```xmlui-pg copy {3-7} display name="Example: headerTemplate" /headerTemplate/ height="200px" 
<App>
  <Tabs>
    <property name="headerTemplate">
      {$header.label}{$header.id ? ' | ID: ' + $header.id : ''}
    </property>
    <TabItem label="Home" id="home-tab">
      Home content
    </TabItem>
    <TabItem label="Accounts" id="accounts-tab">
      Accounts content
    </TabItem>
    <TabItem label="Settings">
      Settings content
    </TabItem>
  </Tabs>
</App>
```

> [!INFO] Individual `TabItem` children can customize their [header templates](./TabItem#headertemplate), too.

### `orientation` (default: "horizontal") [#orientation-default-horizontal]

This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top.

Available values: `horizontal` **(default)**, `vertical`

```xmlui-pg copy display name="Example: orientation horizontal" height="200px"
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

```xmlui-pg copy name="Example: orientation vertical" height="220px"
<App>
  <Tabs orientation="vertical">
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

### `prev` [#prev]

This method selects the previous tab. If the current tab is the first one, it wraps around to the last tab.

**Signature**: `prev(): void`

### `setActiveTabById` [#setactivetabbyid]

This method sets the active tab by its ID.

**Signature**: `setActiveTabById(id: string): void`

### `setActiveTabIndex` [#setactivetabindex]

This method sets the active tab by index (0-based).

**Signature**: `setActiveTabIndex(index: number): void`

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
