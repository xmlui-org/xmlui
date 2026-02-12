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

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `gap` [#gap]

-  default: **"$gap-normal"**

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

### `horizontalAlignment` [#horizontalalignment]

-  default: **"start"**

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

### `orientation` [#orientation]

-  default: **"vertical"**

An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).

Available values: `horizontal`, `vertical` **(default)**

### `reverse` [#reverse]

-  default: **false**

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

### `scrollStyle` [#scrollstyle]

-  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

-  default: **true**

When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. The fade indicators automatically appear/disappear based on the current scroll position. Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. Only works with overlay scrollbar modes (not with 'normal' mode).

### `verticalAlignment` [#verticalalignment]

-  default: **"start"**

Manages the vertical content alignment for each child element in the Stack.

Available values: `start` **(default)**, `center`, `end`

```xmlui-pg copy {2} display name="Example: verticalAlignment"
<App>
  <Stack height="100px" verticalAlignment="end" backgroundColor="cyan">
    <Stack width="36px" height="36px" backgroundColor="red" />
  </Stack>
</App>
```

### `wrapContent` [#wrapcontent]

-  default: **false**

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

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

Describes the logic that fires when the component is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <HStack var.shown="{false}">
    <Stack height="40px" width="40px" backgroundColor="red" onClick="shown = !shown" />
    <Stack when="{shown}" height="40px" width="40px" backgroundColor="blue" />
  </HStack>
</App>
```

### `contextMenu` [#contextmenu]

This event is triggered when the Stack is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

### `scrollToBottom` [#scrolltobottom]

Scrolls the Stack container to the bottom. Works when the Stack has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToEnd` [#scrolltoend]

Scrolls the Stack container to the end (right in LTR, left in RTL). Works when the Stack has an explicit width and overflowX is set to 'scroll'.

**Signature**: `scrollToEnd(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToStart` [#scrolltostart]

Scrolls the Stack container to the start (left in LTR, right in RTL). Works when the Stack has an explicit width and overflowX is set to 'scroll'.

**Signature**: `scrollToStart(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToTop` [#scrolltotop]

Scrolls the Stack container to the top. Works when the Stack has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void`

## Styling [#styling]

This component does not have any styles.
