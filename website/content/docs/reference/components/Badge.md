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
| Publish/Subscribe | `subscribeToTopic` |
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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Badge | rgb(from $color-secondary-500 r g b / 0.6) | rgb(from $color-secondary-500 r g b / 0.6) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Badge | 0px solid $borderColor | 0px solid $borderColor |
| [border](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge | 4px | 4px |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-Badge | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-Badge-pill | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Badge | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Badge-pill | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Badge | 0.8em | 0.8em |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | 0.8em | 0.8em |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-Badge | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-Badge-pill | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Badge | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Badge-pill | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-Badge | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-Badge-pill | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Badge | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Badge-pill | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-Badge | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-Badge-pill | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Badge | $space-0_5 $space-2 | $space-0_5 $space-2 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | $space-0_5 $space-2 | $space-0_5 $space-2 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Badge | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Badge-pill | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-Badge | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-Badge-pill | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Badge | $const-color-surface-0 | $const-color-surface-0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Badge | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Badge-pill | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Badge | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Badge-pill | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Badge | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Badge-pill | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-Badge | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-Badge-pill | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-Badge | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-Badge-pill | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Badge | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Badge-pill | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-Badge | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-Badge-pill | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-Badge | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-Badge-pill | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-Badge | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-Badge-pill | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-Badge | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-Badge-pill | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-Badge | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-Badge-pill | *none* | *none* |
