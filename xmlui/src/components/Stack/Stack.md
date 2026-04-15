%-DESC-START

**Key features:**
- **Dynamic orientation**: Switch between horizontal and vertical layouts programmatically
- **Comprehensive alignment**: Precise control over both horizontal and vertical child positioning
- **Flexible spacing**: Configurable gaps between elements with theme-aware sizing
- **Content wrapping**: Automatic wrapping when space constraints require it
- **Order control**: Reverse child element order with the reverse property
- **Dock layout**: Anchor children to edges or fill remaining space using the `dock` prop
- **Foundation for variants**: Powers HStack, VStack, CHStack, and CVStack specialized components

For common scenarios, consider the specialized variants: [HStack](/docs/reference/components/HStack) (horizontal), [VStack](/docs/reference/components/VStack) (vertical), [CHStack](/docs/reference/components/CHStack) (centered horizontal), and [CVStack](/docs/reference/components/CVStack) (centered vertical).

## Dock Layout

Setting the `dock` prop on any direct child of a `Stack` switches the parent into **DockPanel layout mode**. Children are anchored to the edges of the parent in declaration order, with the remainder of the space filled by the `stretch` child.

| `dock` value | Behavior |
|---|---|
| `"top"` | Anchored to the top edge, full width, respects its own `height` |
| `"bottom"` | Anchored to the bottom edge, full width, respects its own `height` |
| `"left"` | Anchored to the left of the middle row, respects its own `width` |
| `"right"` | Anchored to the right of the middle row, respects its own `width` |
| `"stretch"` | Fills all remaining space in the middle row; its `width` and `height` are ignored |

Children without a `dock` prop participate as undocked items in the middle row alongside any `stretch` child.

> [!NOTE]
> The parent `Stack` must have a defined `height` for `dock="bottom"` children to anchor to the bottom edge. Without a bounded height the outer flex column has no fixed size and bottom items follow immediately after top items.

```xmlui-pg copy display name="Example: dock layout"
<App>
  <Stack height="300px" width="400px" gap="0">
    <Stack dock="top" height="50px" backgroundColor="coral">
      <Text>Top</Text>
    </Stack>
    <Stack dock="bottom" height="50px" backgroundColor="cornflowerblue">
      <Text>Bottom</Text>
    </Stack>
    <Stack dock="left" width="30%" backgroundColor="lightgreen">
      <Text>Left</Text>
    </Stack>
    <Stack dock="stretch" backgroundColor="lightyellow">
      <Text>Stretch</Text>
    </Stack>
  </Stack>
</App>
```
%-PROP-START gap

In the following example we use pixels, characters (shorthand `ch`), and the `em` CSS unit size which is a relative size to the font size of the element (See size values).

```xmlui-pg copy {3, 10} display name="Example: gap"
<App>
  <Stack orientation="horizontal" backgroundColor="cyan"
    gap="80px">
    <Stack height="40px" width="40px" backgroundColor="red" />
    <Stack height="40px" width="40px" backgroundColor="green" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="yellow" />
  </Stack>
  <Stack orientation="horizontal" backgroundColor="cyan"
    gap="12ch">
    <Stack height="40px" width="40px" backgroundColor="red" />
    <Stack height="40px" width="40px" backgroundColor="green" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="yellow" />
  </Stack>
</App>
```

%-PROP-END

%-PROP-START horizontalAlignment

>[!INFO]
> The `start` and `end` values can be affected by i18n if the layout is in a right-to-left writing style.

```xmlui-pg copy {3} display name="Example: horizontalAlignment"
<App>
  <Stack width="100%" horizontalAlignment="center" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

%-PROP-END

%-PROP-START reverse

Default is **false**, which indicates a left-to-right layout.

```xmlui-pg copy display name="Example: reverse"
<App>
  <Stack backgroundColor="cyan">
    <Stack gap="10px" orientation="horizontal">
      <Stack height="40px" width="40px" backgroundColor="red" />
      <Stack height="40px" width="40px" backgroundColor="green" />
      <Stack height="40px" width="40px" backgroundColor="blue" />
    </Stack>
    <Stack reverse="true" orientation="horizontal">
      <Stack height="40px" width="40px" backgroundColor="red" />
      <Stack height="40px" width="40px" backgroundColor="green" />
      <Stack height="40px" width="40px" backgroundColor="blue" />
    </Stack>
  </Stack>
</App>
```

%-PROP-END

%-PROP-START verticalAlignment

```xmlui-pg copy {2} display name="Example: verticalAlignment"
<App>
  <Stack height="100px" verticalAlignment="end" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

%-PROP-END

%-PROP-START wrapContent

Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.

```xmlui-pg copy display name="Example: wrapContent"
<App>
  <Stack wrapContent="true" width="140px" orientation="horizontal" backgroundColor="cyan">
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
    <Stack height="40px" width="40px" backgroundColor="blue" />
  </Stack>
</App>
```

%-PROP-END

%-EVENT-START click

Describes the logic that fires when the component is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <HStack var.shown="{false}">
    <Stack height="40px" width="40px" backgroundColor="red" onClick="shown = !shown" />
    <Stack when="{shown}" height="40px" width="40px" backgroundColor="blue" />
  </HStack>
</App>
```

%-EVENT-END

## Styling

`Stack` is a layout container; its purpose is to render its nested child components.
`Stack` has no theme variables to change its visual appearance.
