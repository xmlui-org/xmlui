# Badge [#badge]

`Badge` displays small text labels with colored backgrounds, commonly used for status indicators, categories, tags, and counts. It supports dynamic color mapping based on content values, useful for status systems and data categorization.

**Key features:**
- **Dynamic color mapping**: Automatically applies colors based on the badge value (e.g., status states)
- **Two shape variants**: Choose between `badge` (rounded corners) or `pill` (fully rounded)
- **Flexible color control**: Set just background color or customize both background and text colors

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

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

-  This property is required.

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

-  default: **"badge"**

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
| [backgroundColor](../styles-and-themes/common-units/#color)-Badge | rgb(from $color-secondary-500 r g b / 0.6) | rgb(from $color-secondary-500 r g b / 0.6) |
| [backgroundColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Badge | 0px solid $borderColor | 0px solid $borderColor |
| [border](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Badge | 4px | 4px |
| [borderRight](../styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Badge | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Badge-pill | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Badge | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Badge-pill | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Badge | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Badge-pill | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-Badge | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-Badge-pill | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Badge | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Badge-pill | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Badge | 0.8em | 0.8em |
| [fontSize](../styles-and-themes/common-units/#size)-Badge-pill | 0.8em | 0.8em |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Badge | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Badge-pill | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Badge | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Badge-pill | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-Badge | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-Badge-pill | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Badge | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Badge-pill | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-Badge | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-Badge-pill | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Badge | $space-0_5 $space-2 | $space-0_5 $space-2 |
| [padding](../styles-and-themes/common-units/#size)-Badge-pill | $space-0_5 $space-2 | $space-0_5 $space-2 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-Badge | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-Badge-pill | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-Badge | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-Badge-pill | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Badge | $const-color-surface-0 | $const-color-surface-0 |
| [textColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Badge | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Badge-pill | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Badge | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Badge-pill | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Badge | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Badge-pill | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Badge | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Badge-pill | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-Badge | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-Badge-pill | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-Badge | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-Badge-pill | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Badge | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Badge-pill | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-Badge | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-Badge-pill | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-Badge | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-Badge-pill | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-Badge | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-Badge-pill | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-Badge | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-Badge-pill | *none* | *none* |
