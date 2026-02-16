# FlowLayout [#flowlayout]

>[!WARNING]
> We plan to deprecate the FlowLayout component in the near future. Please use HStack with wrapContent set to true; it will overtake the role of FlowLayout.

`FlowLayout` positions content in rows with automatic wrapping. When items exceed the available horizontal space, they automatically wrap to a new line.

For details on how to work with \`FlowLayout\` (like sizing children), see [this guide](/layout#flowlayout).

## Using `SpaceFiller` with `FlowLayout` [#using-spacefiller-with-flowlayout]

The `SpaceFiller` component can be used as a line break.
See the [reference docs](/components/SpaceFiller) for details.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `columnGap` [#columngap]

> [!DEF]  default: **"$gap-normal"**

The `columnGap` property specifies the space between items in a single row; it overrides the `gap` value.

The `columnGap` property specifies the space between items in a single row; it overrides the `gap` value.

```xmlui-pg copy display name="Example: columnGap"
---app copy display
<App>
  <FlowLayout columnGap="$space-8">
  <Stack width="25%" height="32px" backgroundColor="red" />
  <Stack width="25%" height="32px" backgroundColor="blue" />
  <Stack width="25%" height="32px" backgroundColor="green" />
  <Stack width="25%" height="32px" backgroundColor="yellow" />
  <Stack width="25%" height="32px" backgroundColor="maroon" />
  <Stack width="25%" height="32px" backgroundColor="teal" />
  <Stack width="25%" height="32px" backgroundColor="seagreen" />
  <Stack width="25%" height="32px" backgroundColor="olive" />
  </FlowLayout>
</App>
---desc
You can observe no gap between the rows of the `FlowLayout`, as `columnGap` keeps the space between rows intact:
```

### `gap` [#gap]

> [!DEF]  default: **"$gap-normal"**

This property defines the gap between items in the same row and between rows. The FlowLayout component creates a new row when an item is about to overflow the current row.

The `gap` property defines the gap between items in the same row and between rows. The `FlowLayout` component creates a new row when an item is about to overflow the current row.

```xmlui-pg copy display name="Example: gap"
---app copy display
<App>
  <FlowLayout gap="$space-12">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
    <Stack width="25%" height="32px" backgroundColor="maroon" />
    <Stack width="25%" height="32px" backgroundColor="teal" />
    <Stack width="25%" height="32px" backgroundColor="seagreen" />
    <Stack width="25%" height="32px" backgroundColor="olive" />
  </FlowLayout>
</App>
---desc
In this markup, only four items fit in a single row. 
The `gap` property sets the same gaps within and between rows.
```

This markup demonstrates different `gap` values:

```xmlui-pg copy display name="Example: different size units"
---app copy display
<App>
  <FlowLayout>
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
  <FlowLayout gap="10px">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
  <FlowLayout gap="1rem">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
  <FlowLayout gap="4ch">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
</App>
---desc
All items within a `FlowLayout` instance fit in a single row, so `gap` affects only the space between items. The space between rows comes from the outermost `Stack`.
```

### `rowGap` [#rowgap]

> [!DEF]  default: **"$gap-normal"**

The `rowGap` property specifies the space between the FlowLayout rows; it overrides the `gap` value.

The `rowGap` property specifies the space between the `FlowLayout` rows; it overrides the `gap` value.

```xmlui-pg copy display name="Example: rowGap"
---app copy display
<App>
  <FlowLayout rowGap="2px">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
    <Stack width="25%" height="32px" backgroundColor="maroon" />
    <Stack width="25%" height="32px" backgroundColor="teal" />
    <Stack width="25%" height="32px" backgroundColor="seagreen" />
    <Stack width="25%" height="32px" backgroundColor="olive" />
  </FlowLayout>
</App>
---desc
You can observe no gap between the items in a single row of the `FlowLayout`, as `rowGap` keeps the gap within a row intact:
```

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **true**

When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. The fade indicators automatically appear/disappear based on the current scroll position. Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. Only works with overlay scrollbar modes (not with 'normal' mode).

### `verticalAlignment` [#verticalalignment]

> [!DEF]  default: **"start"**

Manages the vertical content alignment for each child element within the same row. This aligns items along the cross-axis of the flex container.

Available values: `start` **(default)**, `center`, `end`

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the FlowLayout is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

### `scrollToBottom` [#scrolltobottom]

Scrolls the FlowLayout container to the bottom. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToTop` [#scrolltotop]

Scrolls the FlowLayout container to the top. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void`

## Styling [#styling]

This component does not have any styles.
