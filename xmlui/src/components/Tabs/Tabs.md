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

The component accepts only [TabItem](/docs/reference/components/TabItem) components as children. Other child components will not be displayed. Each [TabItem](/docs/reference/components/TabItem) has a `label` property for the tab button text, with content provided by placing child components within the [TabItem](/docs/reference/components/TabItem).

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

%-DESC-END

%-PROP-START headerTemplate

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

%-PROP-END

%-PROP-START tabAlignment

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

%-PROP-END

%-PROP-START accordionView

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

%-PROP-END

%-API-START next

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

%-API-END

%-EVENT-START didChange

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


%-EVENT-END

%-API-START prev

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

%-API-END

%-API-START setActiveTabIndex

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

%-API-END

%-API-START setActiveTabById

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

%-API-END
