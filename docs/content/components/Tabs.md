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

## Properties [#properties]

### `accordionView` [#accordionview]

-  default: **false**

When enabled, displays tabs in an accordion-like view where tab headers are stacked vertically and only the active tab's content is visible. Each tab header remains visible and clicking a header opens its content while closing others. When enabled, the orientation property is ignored.

The `accordionView` property enables an accordion-like layout where tab headers are stacked vertically and only the active tab's content is visible. All tab headers remain visible, and clicking a header opens its content while closing others.

> [!NOTE] When `accordionView` is enabled, the `orientation` property is ignored.

```xmlui-pg copy display name="Example: accordionView" /accordionView/ height="480px"
<App>
  <Tabs accordionView="true">
    <TabItem label="Account Information">
      <Card title="Account Details">
        <Text>Your account is active and in good standing.</Text>
        <Text>Account ID: 12345</Text>
        <Text>Member since: January 2024</Text>
      </Card>
    </TabItem>
    <TabItem label="Billing & Payments">
      <Card title="Payment Methods">
        <Text>Current Plan: Professional</Text>
        <Text>Next billing date: November 1, 2025</Text>
        <Text>Payment method: xxxx 4242</Text>
      </Card>
    </TabItem>
    <TabItem label="Security Settings">
      <Card title="Security Options">
        <Text>Two-factor authentication: Enabled</Text>
        <Text>Last password change: September 15, 2025</Text>
        <Text>Active sessions: 2</Text>
      </Card>
    </TabItem>
  </Tabs>
</App>
```

The accordion view is particularly useful for mobile layouts or when you need to present expandable sections in a vertical format. Each section can be opened independently by clicking its header.

```xmlui-pg copy display name="Example: accordionView with dynamic content" /accordionView/ height="450px"
<App>
  <Tabs accordionView="true">
    <Items data="{[
        {title: 'Overview', content: 'Dashboard and quick statistics'},
        {title: 'Reports', content: 'Monthly and annual reports'},
        {title: 'Analytics', content: 'User behavior and metrics'},
        {title: 'Export', content: 'Download data in various formats'}
      ]}">
      <TabItem label="{$item.title}">
        <Card>
          <Text>{$item.content}</Text>
        </Card>
      </TabItem>
    </Items>
  </Tabs>
</App>
```

### `activeTab` [#activetab]

This property indicates the index of the active tab. The indexing starts from 0, representing the starting (leftmost) tab. If not set, the first tab is selected by default.

### `headerTemplate` [#headertemplate]

This property declares the template for the clickable tab area.

```xmlui-pg copy {3-6} display name="Example: headerTemplate" /headerTemplate/ height="200px" 
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

```xmlui-pg copy {3-5} display name="Example: headerTemplate" /headerTemplate/ height="200px" 
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

### `orientation` [#orientation]

-  default: **"horizontal"**

This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top. Note: This property is ignored when accordionView is set to true.

Available values: `horizontal` **(default)**, `vertical`

### `tabAlignment` [#tabalignment]

-  default: **"start"**

This property controls how tabs are aligned within the tab header container in horizontal orientation. Use 'start' to align tabs to the left, 'end' to align to the right, 'center' to center the tabs, and 'stretch' to make tabs fill the full width of the header. Note: This property is ignored when orientation is set to 'vertical' or when accordionView is enabled.

Available values: `start` **(default)**, `end`, `center`, `stretch`

The `tabAlignment` property controls how tabs are aligned within the tab header container in horizontal orientation. It accepts four values: `start`, `end`, `center`, and `stretch`.

> [!NOTE] The `tabAlignment` property is ignored when `orientation` is set to `vertical` or when `accordionView` is enabled.

**Alignment: start**

Aligns tabs to the left side of the container:

```xmlui-pg copy display name="Example: tabAlignment='start'" /tabAlignment/ height="200px"
<App>
  <Tabs tabAlignment="start" style="width: 100%">
    <TabItem label="Home">Home content</TabItem>
    <TabItem label="Profile">Profile content</TabItem>
    <TabItem label="Settings">Settings content</TabItem>
  </Tabs>
</App>
```

**Alignment: center**

Centers tabs within the container:

```xmlui-pg copy display name="Example: tabAlignment='center'" /tabAlignment/ height="200px"
<App>
  <Tabs tabAlignment="center" style="width: 100%">
    <TabItem label="Home">Home content</TabItem>
    <TabItem label="Profile">Profile content</TabItem>
    <TabItem label="Settings">Settings content</TabItem>
  </Tabs>
</App>
```

**Alignment: end**

Aligns tabs to the right side of the container:

```xmlui-pg copy display name="Example: tabAlignment='end'" /tabAlignment/ height="200px"
<App>
  <Tabs tabAlignment="end" style="width: 100%">
    <TabItem label="Home">Home content</TabItem>
    <TabItem label="Profile">Profile content</TabItem>
    <TabItem label="Settings">Settings content</TabItem>
  </Tabs>
</App>
```

**Alignment: stretch**

Makes tabs fill the full width of the container, distributing them evenly:

```xmlui-pg copy display name="Example: tabAlignment='stretch'" /tabAlignment/ height="200px"
<App>
  <Tabs tabAlignment="stretch" style="width: 100%">
    <TabItem label="Home">Home content</TabItem>
    <TabItem label="Profile">Profile content</TabItem>
    <TabItem label="Settings">Settings content</TabItem>
  </Tabs>
</App>
```

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Tabs is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `didChange` [#didchange]

This event is triggered when value of Tabs has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

The event handler gets these parameters, which refer to the active tab after the change:
- `index`: The active tab index
- `id`: The identifier of the active tab (if not defined, the framework provides an auto-generated id)
- `label`: The label of the active tab

```xmlui-pg copy display name="Example: didChange" /onDidChange/ height="200px"
<App var.lastTab="(none)">
  <Tabs onDidChange="
    (newIndex, id, label) => 
      lastTab = newIndex + ': ' + label + ' (' + id + ')'
    ">
    <TabItem id="account" label="Account">
      <Text>Account</Text>
    </TabItem>
    <TabItem label="Stream">
      <Text>Stream</Text>
    </TabItem>
    <TabItem label="Support">
      <Text>Support</Text>
    </TabItem>
  </Tabs>
  <Text>Tab index changed to {lastTab}</Text>
</App>
```

## Exposed Methods [#exposed-methods]

### `next` [#next]

This method selects the next tab. If the current tab is the last one, it wraps around to the first tab.

**Signature**: `next(): void`

```xmlui-pg copy display name="Example: next()" /next/ height="250px"
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

### `prev` [#prev]

This method selects the previous tab. If the current tab is the first one, it wraps around to the last tab.

**Signature**: `prev(): void`

```xmlui-pg copy display name="Example: prev()" /prev/ height="250px"
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

### `setActiveTabById` [#setactivetabbyid]

This method sets the active tab by its ID.

**Signature**: `setActiveTabById(id: string): void`

```xmlui-pg copy display name="Example: setActiveTabById()" /setActiveTabById/ height="250px"
<App>
  <Fragment>
    <Tabs id="myTabs">
      <TabItem label="Home" id="home">Home Content</TabItem>
      <TabItem label="Settings" id="settings">Settings Content</TabItem>
      <TabItem label="Help" id="help">Help Content</TabItem>
    </Tabs>
    <Button onClick="myTabs.setActiveTabById('settings')">
      Go to Settings (by ID)
    </Button>
  </Fragment>
</App>
```

### `setActiveTabIndex` [#setactivetabindex]

This method sets the active tab by index (0-based).

**Signature**: `setActiveTabIndex(index: number): void`

```xmlui-pg copy display name="Example: setActiveTabIndex()" /setActiveTabIndex/ height="250px"
<App>
  <Fragment>
    <Tabs id="myTabs">
      <TabItem label="Tab 1">Content 1</TabItem>
      <TabItem label="Tab 2">Content 2</TabItem>
      <TabItem label="Tab 3">Content 3</TabItem>
    </Tabs>
    <Button onClick="myTabs.setActiveTabIndex(2)">Go to Tab 3 (by Index)</Button>
  </Fragment>
</App>
```

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
