%-DESC-START

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
