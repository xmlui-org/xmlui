# TableOfContents [#tableofcontents]

`TableOfContents` collects [Heading](/components/Heading) and [Bookmark](/components/Bookmark) within the current page and displays them in a navigable tree. Uses the same Scroller behavior as NavPanel (scrollStyle, showScrollerFade).

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `maxHeadingLevel` [#maxheadinglevel]

> [!DEF]  default: **6**

Defines the maximum heading level (1 to 6) to include in the table of contents. For example, if it is 2, then `H1` and `H2` are displayed, but lower levels (`H3` to `H6`) are not.

### `omitH1` [#omith1]

> [!DEF]  default: **false**

If true, the `H1` heading is not included in the table of contents. This is useful when the `H1` is used for the page title and you want to avoid duplication.

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity. On mobile/touch devices, this property is ignored and the browser's native scrollbar is always used.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **true**

When enabled, displays gradient fade indicators at the top and bottom edges when scrollable content extends beyond the visible area. Only works with "overlay", "whenMouseOver", and "whenScrolling" scroll styles. On mobile/touch devices, this property has no effect.

### `smoothScrolling` [#smoothscrolling]

> [!DEF]  default: **false**

This property indicates that smooth scrolling is used while scrolling the selected table of contents items into view.

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the TableOfContents is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-TableOfContents](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-TableOfContents](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | 2px solid $color-surface-100 | 2px solid $color-surface-100 |
| [borderLeft-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRight-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-TableOfContents](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-TableOfContents](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-TableOfContents](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-TableOfContentsItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-TableOfContents](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-TableOfContents](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [color-indicator-TableOfContents](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [color-indicator-TableOfContents--active](/docs/styles-and-themes/common-units/#color) | $color-surface-900 | $color-surface-900 |
| [direction-TableOfContentsItem](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-TableOfContentsItem-level-1](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-TableOfContentsItem-level-2](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-TableOfContentsItem-level-3](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-TableOfContentsItem-level-4](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-TableOfContentsItem-level-5](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-TableOfContentsItem-level-6](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-TableOfContentsItem](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontStretch-TableOfContentsItem](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#fontStyle) | italic | italic |
| [fontVariant-TableOfContentsItem](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-TableOfContentsItem](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-1--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-1--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-medium | $fontWeight-medium |
| [fontWeight-TableOfContentsItem-level-2--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-2--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [fontWeight-TableOfContentsItem-level-3--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-3--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [fontWeight-TableOfContentsItem-level-4--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-4--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [fontWeight-TableOfContentsItem-level-5--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-5--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [fontWeight-TableOfContentsItem-level-6--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-TableOfContentsItem-level-6--hover](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [height-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | auto | auto |
| [letterSpacing-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-TableOfContentsItem](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [padding-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingLeft-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingLeft-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [paddingLeft-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [paddingLeft-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [paddingLeft-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [paddingRight-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingVertical-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textAlign-TableOfContentsItem](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | $color-secondary-500 | $color-secondary-500 |
| [textColor-TableOfContentsItem--active](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-400 |
| [textColor-TableOfContentsItem--hover](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-TableOfContentsItem](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-TableOfContentsItem](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-TableOfContentsItem](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [width-indicator-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [width-TableOfContents](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [wordBreak-TableOfContentsItem](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-TableOfContentsItem](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-TableOfContentsItem](/docs/styles-and-themes/common-units/#word-wrap) | break-word | break-word |
| [wordWrap-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-TableOfContentsItem](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-TableOfContentsItem-level-1](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-TableOfContentsItem-level-2](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-TableOfContentsItem-level-3](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-TableOfContentsItem-level-4](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-TableOfContentsItem-level-5](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-TableOfContentsItem-level-6](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
