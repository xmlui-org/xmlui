%-DESC-START

**Key features:**
- **Label definition**: Provides the clickable tab header text via the label property
- **Content container**: Wraps any child components that display when the tab is active
- **Structural organization**: Creates the relationship between tab headers and their corresponding content
- **Seamless integration**: Designed exclusively for use within [Tabs](/components/Tabs) components

**Usage pattern:**
Always used as a direct child of [Tabs](/components/Tabs) components. The `label` property defines the tab button text, while child components placed within the TabItem provide the content that displays when the tab is selected.

%-DESC-END

%-PROP-START headerTemplate

```xmlui-pg copy {7-9} display name="Example: headerTemplate" /headerTemplate/ height="200px" 
<App>
  <Tabs>
    <TabItem label="Home">
      Home content
    </TabItem>
    <TabItem label="Accounts">
      <property name="headerTemplate">
        <Text variant="title" color="green">Accounts</Text>
      </property>
      Accounts content
    </TabItem>
    <TabItem label="Settings">
      Settings content
    </TabItem>
  </Tabs>
</App>
```

> [!INFO] You can customize the [header templates](./Tabs#headertemplate) of **all** tab items, too. You can mix the `Tabs` level header templates with the `TabItem` level ones. In this case, the `TabItem` level template prevails.


%-PROP-END