# TableOfContents [#tableofcontents]

`TableOfContents` collects [Heading](/components/Heading) and [Bookmark](/components/Bookmark) within the current page and displays them in a navigable tree. Uses the same Scroller behavior as NavPanel (scrollStyle, showScrollerFade).

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

### `maxHeadingLevel` [#maxheadinglevel]

> [!DEF]  default: **6**

Defines the maximum heading level (1 to 6) to include in the table of contents. For example, if it is 2, then `H1` and `H2` are displayed, but lower levels (`H3` to `H6`) are not.

### `omitH1` [#omith1]

> [!DEF]  default: **false**

If true, the `H1` heading is not included in the table of contents. This is useful when the `H1` is used for the page title and you want to avoid duplication.

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **true**

When enabled, displays gradient fade indicators at the top and bottom edges when scrollable content extends beyond the visible area. Only works with "overlay", "whenMouseOver", and "whenScrolling" scroll styles.

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-1 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-2 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-3 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-4 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-5 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-6 | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | 2px solid $color-surface-100 | 2px solid $color-surface-100 |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--active | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem--hover | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-TableOfContents | $color-surface-100 | $color-surface-100 |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-TableOfContents--active | $color-surface-900 | $color-surface-900 |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem-level-1 | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem-level-2 | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem-level-3 | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem-level-4 | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem-level-5 | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-6 | italic | italic |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem--active | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem--hover | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-1--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-1--hover | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-2 | $fontWeight-medium | $fontWeight-medium |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-2--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-2--hover | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-3 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-3--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-3--hover | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-4 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-4--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-4--hover | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-5 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-5--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-5--hover | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-6 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-6--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-6--hover | *none* | *none* |
| [height](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | auto | auto |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-1 | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-2 | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-3 | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-4 | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-5 | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-6 | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | $space-2 | $space-2 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | $space-1 | $space-1 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | $space-3 | $space-3 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | $space-5 | $space-5 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | $space-6 | $space-6 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | $space-6 | $space-6 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | $space-6 | $space-6 |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | $space-1 | $space-1 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-1 | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-2 | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-3 | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-4 | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-5 | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-6 | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-1 | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-2 | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-3 | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-4 | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-5 | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-6 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | $color-secondary-500 | $color-secondary-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--active | $color-primary-400 | $color-primary-400 |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem--hover | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-1 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-2 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-3 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-4 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-5 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-6 | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-1 | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-2 | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-3 | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-4 | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-5 | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-6 | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-1 | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-2 | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-3 | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-4 | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-5 | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-6 | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-1 | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-2 | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-3 | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-4 | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-5 | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-6 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-1 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-2 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-3 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-4 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-5 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-TableOfContentsItem-level-6 | *none* | *none* |
| [width](/docs/styles-and-themes/common-units/#size-values)-indicator-TableOfContents | 2px | 2px |
| [width](/docs/styles-and-themes/common-units/#size-values)-TableOfContents | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-1 | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-2 | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-3 | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-4 | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-5 | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-6 | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-1 | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-2 | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-3 | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-4 | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-5 | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-6 | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem | break-word | break-word |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-1 | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-2 | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-3 | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-4 | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-5 | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-6 | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-1 | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-2 | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-3 | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-4 | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-5 | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-6 | *none* | *none* |
