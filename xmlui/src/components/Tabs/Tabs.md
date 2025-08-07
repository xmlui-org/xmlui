%-DESC-START

**Key features:**
- **Content organization**: Efficiently displays multiple content sections in a single interface area
- **Flexible orientation**: Supports both horizontal (tabs on top) and vertical (tabs on side) layouts
- **Active tab control**: Programmatically set which tab is initially selected
- **Custom header templates**: Configurable tab appearance via `headerTemplate` property
- **Navigation methods**: Built-in methods for programmatic tab switching (`next()`, `prev()`, `setActiveTabIndex()`, `setActiveTabById()`)
- **External ID support**: Optional `id` prop for TabItems with context exposure
- **Dynamic content**: Works seamlessly with `Items` for data-driven tabs

## Using Tabs

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

## Dynamic Tabs

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

## External TabItem identifiers

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

%-DESC-END

%-PROP-START activeTab

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

%-PROP-END

%-PROP-START orientation

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

%-PROP-END

%-PROP-START headerTemplate

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

%-PROP-END

## API Methods

The Tabs component provides several methods for programmatic navigation:

### next()
Navigates to the next tab. If currently on the last tab, wraps around to the first tab.

```xmlui-pg copy display name="Example: next() method" height="250px"
<App>
  <Fragment>
    <Tabs id="myTabs">
      <TabItem label="Tab 1">Content 1</TabItem>
      <TabItem label="Tab 2">Content 2</TabItem>
      <TabItem label="Tab 3">Content 3</TabItem>
    </Tabs>
    <Button onClick="myTabs.next()">Next Tab</Button>
  </Fragment>
</App>
```

### prev()
Navigates to the previous tab. If currently on the first tab, wraps around to the last tab.

```xmlui-pg copy display name="Example: prev() method" height="250px"
<App>
  <Fragment>
    <Tabs id="myTabs">
      <TabItem label="Tab 1">Content 1</TabItem>
      <TabItem label="Tab 2">Content 2</TabItem>
      <TabItem label="Tab 3">Content 3</TabItem>
    </Tabs>
    <Button onClick="myTabs.prev()">Previous Tab</Button>
  </Fragment>
</App>
```

### setActiveTabIndex(index: number)
Sets the active tab by its zero-based index.

```xmlui-pg copy display name="Example: setActiveTabIndex() method" height="250px"
<App>
  <Fragment>
    <Tabs id="myTabs">
      <TabItem label="Tab 1">Content 1</TabItem>
      <TabItem label="Tab 2">Content 2</TabItem>
      <TabItem label="Tab 3">Content 3</TabItem>
    </Tabs>
    <Button onClick="myTabs.setActiveTabIndex(2)">Go to Tab 3</Button>
  </Fragment>
</App>
```

### setActiveTabById(id: string)
Sets the active tab by its external ID (if provided) or internal ID.

```xmlui-pg copy display name="Example: setActiveTabById() method" height="250px"
<App>
  <Fragment>
    <Tabs id="myTabs">
      <TabItem label="Tab 1" id="home">Home Content</TabItem>
      <TabItem label="Tab 2" id="settings">Settings Content</TabItem>
      <TabItem label="Tab 3" id="help">Help Content</TabItem>
    </Tabs>
    <Button onClick="myTabs.setActiveTabById('settings')">Go to Settings</Button>
  </Fragment>
</App>
```

## Advanced Features

### Individual Tab Header Templates

Each TabItem can have its own `headerTemplate` that overrides the global template:

```xmlui-pg copy display name="Example: Individual header templates" height="250px"
<App>
  <Tabs>
    <property name="headerTemplate">
      <Text>Global: {$header.label}</Text>
    </property>
    <TabItem label="Tab 1">
      <property name="headerTemplate">
        <Text color="blue">Custom: {$header.label}</Text>
      </property>
      Content 1
    </TabItem>
    <TabItem label="Tab 2">
      Content 2
    </TabItem>
  </Tabs>
</App>
```
