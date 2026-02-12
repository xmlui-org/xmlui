# TableOfContents [#tableofcontents]

`TableOfContents` collects [Heading](/components/Heading) and [Bookmark](/components/Bookmark) within the current page and displays them in a navigable tree. Uses the same Scroller behavior as NavPanel (scrollStyle, showScrollerFade).

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `maxHeadingLevel` [#maxheadinglevel]

-  default: **6**

Defines the maximum heading level (1 to 6) to include in the table of contents. For example, if it is 2, then `H1` and `H2` are displayed, but lower levels (`H3` to `H6`) are not.

### `omitH1` [#omith1]

-  default: **false**

If true, the `H1` heading is not included in the table of contents. This is useful when the `H1` is used for the page title and you want to avoid duplication.

### `scrollStyle` [#scrollstyle]

-  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

-  default: **true**

When enabled, displays gradient fade indicators at the top and bottom edges when scrollable content extends beyond the visible area. Only works with "overlay", "whenMouseOver", and "whenScrolling" scroll styles.

### `smoothScrolling` [#smoothscrolling]

-  default: **false**

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
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-1 | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-2 | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-3 | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-4 | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-5 | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-6 | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-TableOfContentsItem | 2px solid $color-surface-100 | 2px solid $color-surface-100 |
| [borderLeft](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContents | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--active | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-TableOfContentsItem--hover | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContents | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContentsItem | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContentsItem--active | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-TableOfContentsItem--hover | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-TableOfContents | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-TableOfContents | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--active | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-TableOfContentsItem--hover | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--active | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-TableOfContentsItem--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-indicator-TableOfContents | $color-surface-100 | $color-surface-100 |
| [color](../styles-and-themes/common-units/#color)-indicator-TableOfContents--active | $color-surface-900 | $color-surface-900 |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem-level-1 | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem-level-2 | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem-level-3 | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem-level-4 | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem-level-5 | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-TableOfContentsItem-level-6 | italic | italic |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-2 | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-3 | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-4 | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-5 | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-TableOfContentsItem-level-6 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem--active | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem--hover | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-1 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-1--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-1--hover | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-2 | $fontWeight-medium | $fontWeight-medium |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-2--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-2--hover | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-3 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-3--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-3--hover | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-4 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-4--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-4--hover | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-5 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-5--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-5--hover | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-6 | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-6--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-TableOfContentsItem-level-6--hover | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-TableOfContents | auto | auto |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-1 | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-2 | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-3 | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-4 | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-5 | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-TableOfContentsItem-level-6 | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContents | $space-2 | $space-2 |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem | $space-1 | $space-1 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | $space-3 | $space-3 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | $space-5 | $space-5 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | $space-6 | $space-6 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | $space-6 | $space-6 |
| [paddingLeft](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | $space-6 | $space-6 |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem | $space-1 | $space-1 |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-1 | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-2 | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-3 | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-4 | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-5 | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-6 | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-1 | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-2 | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-3 | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-4 | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-5 | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-TableOfContentsItem-level-6 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | $color-secondary-500 | $color-secondary-500 |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--active | $color-primary-400 | $color-primary-400 |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem--hover | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-1 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-2 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-3 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-4 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-5 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-6 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-1 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-2 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-3 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-4 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-5 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-TableOfContentsItem-level-6 | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-1 | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-2 | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-3 | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-4 | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-5 | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-TableOfContentsItem-level-6 | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-1 | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-2 | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-3 | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-4 | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-5 | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-TableOfContentsItem-level-6 | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-1 | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-2 | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-3 | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-4 | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-5 | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-TableOfContentsItem-level-6 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-1 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-2 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-3 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-4 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-5 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-TableOfContentsItem-level-6 | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-indicator-TableOfContents | 2px | 2px |
| [width](../styles-and-themes/common-units/#size)-TableOfContents | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-1 | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-2 | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-3 | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-4 | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-5 | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-TableOfContentsItem-level-6 | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-1 | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-2 | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-3 | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-4 | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-5 | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-TableOfContentsItem-level-6 | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem | break-word | break-word |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-1 | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-2 | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-3 | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-4 | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-5 | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-TableOfContentsItem-level-6 | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-1 | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-2 | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-3 | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-4 | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-5 | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-TableOfContentsItem-level-6 | *none* | *none* |
