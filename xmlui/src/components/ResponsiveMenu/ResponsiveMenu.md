%-DESC-START

**Key features:**
- **Automatic overflow handling**: Moves items to dropdown when they don't fit
- **Responsive design**: Adapts to container width changes in real-time
- **Preserves functionality**: Items work the same in both visible and overflow states
- **VS Code-like behavior**: Familiar interaction pattern for application menus

You can nest `ResponsiveMenuItem` components into `ResponsiveMenu` to create a horizontal menu that automatically handles overflow:

```xmlui-pg copy display name="Example: Using ResponsiveMenu" height="240px"
---app copy display
<App>
  <ResponsiveMenu>
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="Go" />
    <ResponsiveMenuItem label="Run" />
    <ResponsiveMenuItem label="Terminal" />
    <ResponsiveMenuItem label="Help" />
  </ResponsiveMenu>
</App>
---desc
Try resizing the window to see how items move to the overflow dropdown:
```

%-DESC-END

%-PROP-START overflowIcon

You can customize the icon used for the overflow dropdown button:

```xmlui-pg copy display name="Example: overflowIcon" height="240px"
<App>
  <VStack spacing="md">
    <ResponsiveMenu overflowIcon="dots-horizontal">
      <ResponsiveMenuItem label="Item 1" />
      <ResponsiveMenuItem label="Item 2" />
      <ResponsiveMenuItem label="Item 3" />
      <ResponsiveMenuItem label="Item 4" />
      <ResponsiveMenuItem label="Item 5" />
    </ResponsiveMenu>
    
    <ResponsiveMenu overflowIcon="chevrondown">
      <ResponsiveMenuItem label="Item 1" />
      <ResponsiveMenuItem label="Item 2" />
      <ResponsiveMenuItem label="Item 3" />
      <ResponsiveMenuItem label="Item 4" />
      <ResponsiveMenuItem label="Item 5" />
    </ResponsiveMenu>
  </VStack>
</App>
```

%-PROP-END

%-PROP-START overflowLabel

This property sets the accessible label for the overflow button to improve screen reader support:

```xmlui-pg copy display name="Example: overflowLabel" height="240px"
<App>
  <ResponsiveMenu overflowLabel="Additional menu items">
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="Go" />
    <ResponsiveMenuItem label="Run" />
    <ResponsiveMenuItem label="Terminal" />
    <ResponsiveMenuItem label="Help" />
  </ResponsiveMenu>
</App>
```

%-PROP-END
