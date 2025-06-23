%-DESC-START

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

%-PROP-END

%-PROP-START tabTemplate

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

%-PROP-END
