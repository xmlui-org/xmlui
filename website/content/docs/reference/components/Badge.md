# Badge [#badge]

`Badge` displays small text labels with colored backgrounds, commonly used for status indicators, categories, tags, and counts. It supports dynamic color mapping based on content values, useful for status systems and data categorization.

**Key features:**
- **Dynamic color mapping**: Automatically applies colors based on the badge value (e.g., status states)
- **Two shape variants**: Choose between `badge` (rounded corners) or `pill` (fully rounded)
- **Flexible color control**: Set just background color or customize both background and text colors

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Live Region | `withLiveRegion`, `liveRegionMessage`, `liveRegionPoliteness` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `colorMap` [#colormap]

The `Badge` component supports the mapping of a list of colors using the `value` prop as the key. If this property is not set, no color mapping is used.

Provide the component with a list or key-value pairs in two ways:

1. Only change the background color

```xmlui-pg copy {2} name="Example: only background color"
<App var.simpleColorMap="{{ important: 'red', regular: 'blue', unimportant: 'black' }}">
  <Badge value="important" colorMap="{simpleColorMap}" />
</App>
```

2. Change the background and label color

```xmlui-pg copy display {2-5} name="Example: background and label color"
<App 
  var.simpleColorMap="{{ 
    important: { label: 'red', background: 'pink' }, 
    unimportant: { label: 'black', background: 'gray' }
  }}">
  <Badge value="important" colorMap="{simpleColorMap}" />
  <Badge value="unimportant" colorMap="{simpleColorMap}" />
  <Badge value="other" colorMap="{simpleColorMap}" />
</App>
```

### `value` [#value]

> [!DEF]  This property is required.

The text that the component displays. If this is not defined, the component renders its children as the content of the badge. If neither text nor any child is defined, the component renders a single frame for the badge with a non-breakable space.

```xmlui-pg copy name="Example: value" 
<App>
  <Badge value="Example value" />
  <Badge value="Example badge">
    Example Child
  </Badge>
  <Badge />
</App>  
```

### `variant` [#variant]

> [!DEF]  default: **"badge"**

Modifies the shape of the component. Comes in the regular `badge` variant or the `pill` variant with fully rounded corners.

Available values: `badge` **(default)**, `pill`

```xmlui-pg copy display name="Example: variant"
<App>
  <Badge value="Example badge" variant="badge" />
  <Badge value="Example pill" variant="pill" />
</App>
```

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Badge is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Badge](/docs/styles-and-themes/common-units/#color) | rgb(from $color-secondary-500 r g b / 0.6) | rgb(from $color-secondary-500 r g b / 0.6) |
| [backgroundColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-Badge](/docs/styles-and-themes/common-units/#border) | 0px solid $borderColor | 0px solid $borderColor |
| [border-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Badge](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-Badge](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Badge-pill](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Badge](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Badge-pill](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-Badge](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-Badge](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-Badge](/docs/styles-and-themes/common-units/#border-rounding) | 4px | 4px |
| [borderRight-Badge](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-Badge](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Badge-pill](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Badge](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Badge-pill](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-Badge](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-Badge](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Badge-pill](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-Badge](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Badge-pill](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [direction-Badge](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-Badge-pill](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-Badge](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Badge-pill](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-Badge](/docs/styles-and-themes/common-units/#size-values) | 0.8em | 0.8em |
| [fontSize-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | 0.8em | 0.8em |
| [fontStretch-Badge](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-Badge-pill](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-Badge](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-Badge-pill](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontVariant-Badge](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-Badge-pill](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-Badge](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Badge-pill](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [letterSpacing-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-Badge](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-Badge-pill](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Badge](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 $space-2 | $space-0_5 $space-2 |
| [padding-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 $space-2 | $space-0_5 $space-2 |
| [paddingBottom-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textAlign-Badge](/docs/styles-and-themes/common-units/#text-align) | center | center |
| [textAlign-Badge-pill](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-Badge](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-Badge-pill](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-Badge](/docs/styles-and-themes/common-units/#color) | $const-color-surface-0 | $const-color-surface-0 |
| [textColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-Badge](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-Badge-pill](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-Badge](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-Badge-pill](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-Badge](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-Badge-pill](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-Badge](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-Badge-pill](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-Badge](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-Badge-pill](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-Badge](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-Badge-pill](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-Badge](/docs/styles-and-themes/common-units/#textTransform) | uppercase | uppercase |
| [textTransform-Badge-pill](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textUnderlineOffset-Badge](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-Badge-pill](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [wordBreak-Badge](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-Badge-pill](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-Badge](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-Badge-pill](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-Badge](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-Badge-pill](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-Badge](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-Badge-pill](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
