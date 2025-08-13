# TabItem [#tabitem]

`TabItem` defines individual tabs within a [Tabs](/components/Tabs) component, providing both the tab header label and the content that displays when the tab is selected. As a non-visual structural component, it serves as a container that organizes content into distinct, switchable sections.

**Key features:**
- **Label definition**: Provides the clickable tab header text via the label property
- **Content container**: Wraps any child components that display when the tab is active
- **Structural organization**: Creates the relationship between tab headers and their corresponding content
- **Seamless integration**: Designed exclusively for use within [Tabs](/components/Tabs) components

**Usage pattern:**
Always used as a direct child of [Tabs](/components/Tabs) components. The `label` property defines the tab button text, while child components placed within the TabItem provide the content that displays when the tab is selected.

**Context variables available during execution:**

- `$header`: This context value represents the header context with props: id (optional), index, label, isActive.

## Properties [#properties]

### `headerTemplate` [#headertemplate]

This property allows the customization of the TabItem header.

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

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
