# Stack [#stack]

`Stack` is the fundamental layout container that organizes child elements in configurable horizontal or vertical arrangements. As the most versatile building block in XMLUI's layout system, it provides comprehensive alignment, spacing, and flow control options that serve as the foundation for all specialized stack variants.

**Key features:**
- **Dynamic orientation**: Switch between horizontal and vertical layouts programmatically
- **Comprehensive alignment**: Precise control over both horizontal and vertical child positioning
- **Flexible spacing**: Configurable gaps between elements with theme-aware sizing
- **Content wrapping**: Automatic wrapping when space constraints require it
- **Order control**: Reverse child element order with the reverse property
- **Foundation for variants**: Powers HStack, VStack, CHStack, and CVStack specialized components

For common scenarios, consider the specialized variants: [HStack](/components/HStack) (horizontal), [VStack](/components/VStack) (vertical), [CHStack](/components/CHStack) (centered horizontal), and [CVStack](/components/CVStack) (centered vertical).

## Properties [#properties]

### `gap` (default: "$gap-normal") [#gap-default-gap-normal]

Optional size value indicating the gap between child elements.

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

### `horizontalAlignment` (default: "start") [#horizontalalignment-default-start]

Manages the horizontal content alignment for each child element in the Stack.

Available values: `start` **(default)**, `center`, `end`

>[!INFO]
> The `start` and `end` values can be affected by i18n if the layout is in a right-to-left writing style.

```xmlui-pg copy {3} display name="Example: horizontalAlignment"
<App>
  <Stack width="100%" horizontalAlignment="center" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

### `orientation` (default: "vertical") [#orientation-default-vertical]

An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).

Available values: `horizontal`, `vertical` **(default)**

### `reverse` (default: false) [#reverse-default-false]

Optional boolean property to reverse the order of child elements.

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

### `verticalAlignment` (default: "start") [#verticalalignment-default-start]

Manages the vertical content alignment for each child element in the Stack.

Available values: `start` **(default)**, `center`, `end`

```xmlui-pg copy {2} display name="Example: verticalAlignment"
<App>
  <Stack height="100px" verticalAlignment="end" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

### `wrapContent` (default: false) [#wrapcontent-default-false]

Optional boolean which wraps the content if set to true and the available space is not big enough. Works only with horizontal orientations.

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

## Events [#events]

### `click` [#click]

This event is triggered when the Stack is clicked.

Describes the logic that fires when the component is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <HStack var.shown="{false}">
    <Stack height="40px" width="40px" backgroundColor="red" onClick="shown = !shown" />
    <Stack when="{shown}" height="40px" width="40px" backgroundColor="blue" />
  </HStack>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
