# Badge [#badge]

The `Badge` is a text label that accepts a color map to define its background color and, optionally, its label color.

## Properties [#properties]

### `colorMap` [#colormap]

The `Badge` component supports the mapping of a list of colors using the `value` prop as the key. Provide the component with a list or key-value pairs in two ways:

1. Only change the background color

```xmlui-pg copy display {2} name="Example: only background color"
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

### `value (required)` [#value-required]

The text that the component displays

```xmlui-pg copy display name="Example: value" 
<App>
  <Badge value="Example badge" />
</App>  
```

### `variant (default: "badge")` [#variant-default-badge]

Modifies the shape of the component. Comes in the regular `badge` variant or the `pill` variant with fully rounded corners.

Available values: `badge` **(default)**, `pill`

```xmlui-pg copy display name="Example: variant"
<App>
  <Badge value="Example badge" variant="badge" />
  <Badge value="Example pill" variant="pill" />
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Badge | rgba($color-secondary-500-rgb, .6) | rgba($color-secondary-500-rgb, .6) |
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
| [border](../styles-and-themes/common-units/#border)EndEndRadius-Badge | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)EndEndRadius-Badge-pill | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)EndStartRadius-Badge | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)EndStartRadius-Badge-pill | *none* | *none* |
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
| [border](../styles-and-themes/common-units/#border)StartEndRadius-Badge | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)StartEndRadius-Badge-pill | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)StartStartRadius-Badge | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)StartStartRadius-Badge-pill | *none* | *none* |
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
| direction-Badge | *none* | *none* |
| direction-Badge-pill | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Badge | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Badge-pill | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Badge | 0.8em | 0.8em |
| [fontSize](../styles-and-themes/common-units/#size)-Badge-pill | 0.8em | 0.8em |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Badge | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Badge-pill | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Badge | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Badge-pill | *none* | *none* |
| fontVariant-Badge | *none* | *none* |
| fontVariant-Badge-pill | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Badge | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Badge-pill | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| lineBreak-Badge | *none* | *none* |
| lineBreak-Badge-pill | *none* | *none* |
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
| textAlign-Badge | *none* | *none* |
| textAlign-Badge-pill | *none* | *none* |
| textAlignLast-Badge | *none* | *none* |
| textAlignLast-Badge-pill | *none* | *none* |
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
| textIndent-Badge | *none* | *none* |
| textIndent-Badge-pill | *none* | *none* |
| textShadow-Badge | *none* | *none* |
| textShadow-Badge-pill | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Badge | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Badge-pill | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Badge | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Badge-pill | *none* | *none* |
| wordBreak-Badge | *none* | *none* |
| wordBreak-Badge-pill | *none* | *none* |
| wordSpacing-Badge | *none* | *none* |
| wordSpacing-Badge-pill | *none* | *none* |
| wordWrap-Badge | *none* | *none* |
| wordWrap-Badge-pill | *none* | *none* |
| writingMode-Badge | *none* | *none* |
| writingMode-Badge-pill | *none* | *none* |
