# Stack [#stack]

`Stack` is the fundamental layout container that organizes child elements in configurable horizontal or vertical arrangements. As the most versatile building block in XMLUI's layout system, it provides comprehensive alignment, spacing, and flow control options that serve as the foundation for all specialized stack variants.

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

### `dock` [#dock]

When set on a child of a Stack, activates DockPanel layout in the parent Stack. `top` — child occupies the top of the remaining area, full width, respects its own `height`. `bottom` — child occupies the bottom, full width, respects its own `height`. `left` — child occupies the left of the middle row, respects its own `width`. `right` — child occupies the right of the middle row, respects its own `width`. `stretch` — child fills all remaining middle-row space; its `width` and `height` are ignored. Children without a `dock` prop participate as undocked items in the middle row. The parent Stack must have a defined height for `bottom`-docked children to anchor correctly.

Available values: `top`, `bottom`, `left`, `right`, `stretch`

### `gap` [#gap]

> [!DEF]  default: **"$gap-normal"**

Optional size value indicating the gap between child elements.

### `horizontalAlignment` [#horizontalalignment]

> [!DEF]  default: **"start"**

Manages the horizontal content alignment for each child element in the Stack.

Available values: `start` **(default)**, `center`, `end`

### `itemWidth` [#itemwidth]

The default width applied to child elements in the Stack. For vertical stacks, defaults to '100%' (children take full width). For horizontal stacks, defaults to 'fit-content' (children size to their content).

### `orientation` [#orientation]

> [!DEF]  default: **"vertical"**

An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).

Available values: `horizontal`, `vertical` **(default)**

### `reverse` [#reverse]

> [!DEF]  default: **false**

Optional boolean property to reverse the order of child elements.

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **true**

When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. The fade indicators automatically appear/disappear based on the current scroll position. Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. Only works with overlay scrollbar modes (not with 'normal' mode).

### `verticalAlignment` [#verticalalignment]

> [!DEF]  default: **"start"**

Manages the vertical content alignment for each child element in the Stack.

Available values: `start` **(default)**, `center`, `end`

### `wrapContent` [#wrapcontent]

> [!DEF]  default: **false**

Optional boolean which wraps the content if set to true and the available space is not big enough. Works only with horizontal orientations.

## Events [#events]

### `click` [#click]

This event is triggered when the Stack is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

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

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [gap](/docs/styles-and-themes/common-units/#size)-Stack | $gap-normal | $gap-normal |
