%-DESC-START

**Key features:**
- **Automatic overflow management**: Automatically moves items that don't fit into a dropdown menu
- **Responsive design**: Adapts to container width changes in real-time
- **Zero configuration**: Works out of the box with sensible defaults
- **Customizable overflow icon**: Use custom icons for the overflow dropdown trigger

The component monitors its container width and automatically determines which child components fit within the available space. Components that don't fit are moved into a dropdown menu accessible via a "..." trigger button.

```xmlui-pg copy display name="Example: Basic ResponsiveBar" height="220px"
---app copy display
<App>
  <ResponsiveBar>
    <Button label="File" />
    <Button label="Edit" />
    <Button label="View" />
    <Button label="Very Long Menu Name" />
    <Button label="Project" />
    <Button label="Build" />
    <Button label="Window" />
    <Button label="Help" />
  </ResponsiveBar>
</App>
---desc
Try resizing the container or browser window to see the responsive behavior:
```

%-DESC-END

%-PROP-START overflowIcon

You can customize the icon used for the overflow dropdown trigger:

```xmlui-pg copy display name="Example: Custom overflow icon" height="220px"
<App>
  <ResponsiveBar overflowIcon="dotmenu">
    <Button label="File" />
    <Button label="Edit" />
    <Button label="View" />
    <Button label="Very Long Menu Name" />
    <Button label="Project" />
    <Button label="Build" />
    <Button label="Window" />
    <Button label="Help" />
  </ResponsiveBar>
</App>
```

%-PROP-END

%-EVENT-START click

```xmlui-pg copy display name="Example: Click event" height="200px"
<App>
  <variable name="clickCount" value="{0}" />
  <Text value="ResponsiveBar clicked {clickCount} times" />
  <ResponsiveBar onClick="clickCount += 1">
    <Button label="Item 1" />
    <Button label="Item 2" />
    <Button label="Item 3" />
    <Button label="Item 4" />
    <Button label="Item 5" />
    <Button label="Item 6" />
    <Button label="Item 7" />
    <Button label="Item 8" />
    <Button label="Item 9" />
  </ResponsiveBar>
</App>
```

%-EVENT-END

## Advanced Usage

### With Different Content Types

ResponsiveBar works with any type of child components:

```xmlui-pg copy display name="Example: Mixed content" height="200px"
<App>
  <ResponsiveBar>
    <Button label="New" icon="plus" />
    <Button label="Open" icon="folder" />
    <Text>|</Text>
    <Button label="Save" icon="save" />
    <Button label="Print" icon="printer" />
    <Text>|</Text>
    <Button label="Settings" icon="cog" />
  </ResponsiveBar>
</App>
```

### Navigation Menu Example

Perfect for responsive navigation menus:

```xmlui-pg copy display name="Example: Navigation menu" height="200px"
<App>
  <ResponsiveBar>
    <Button label="Dashboard" variant="ghost" />
    <Button label="Analytics" variant="ghost" />
    <Button label="Reports" variant="ghost" />
    <Button label="Settings" variant="ghost" />
    <Button label="Users" variant="ghost" />
    <Button label="Profile" variant="ghost" />
  </ResponsiveBar>
</App>
```
