# HeroSection [#herosection]

HeroSection

## Properties

### `backgroundTemplate`

The template for the background of the hero section

### `contentAlignment` (default: "center")

Horizontal alignment of the content within its area

### `contentPlacement` (default: "bottom")

Position of the content area relative to the header

### `contentWidth` (default: "$maxWidth-content")

Width of the hero content (header + content sections)

### `ctaButtonIcon`

The icon for the call-to-action button

### `ctaButtonTemplate`

The template for the call-to-action button

### `ctaButtonText`

The text for the call-to-action button

### `fullWidthBackground` (default: true)

Whether the background should span the full width of the viewport

### `gap`

Gap between header and content sections

### `headerAlignment` (default: "center")

Alignment of the header content

### `headerWidth` (default: "50%")

Width of the header section in horizontal layouts

### `headline`

The headline text for the hero section

### `image`

The image for the hero section

### `imageHeight`

The height of the image

### `imageWidth`

The width of the image

### `mainText`

The main text content for the hero section

### `mainTextTemplate`

The template for the text content in the hero section

### `preamble`

The preamble text for the hero section

### `subheadline`

The subheadline text for the hero section

## Events

### `ctaClick`

Triggered when the call-to-action button is clicked

## Exposed Methods

This component does not expose any methods.

## Parts

The component has some parts that can be styled through layout properties and theme variables separately:

- **`background`**: The background template area of the hero section
- **`content`**: The content section containing image and children
- **`ctaButton`**: The call-to-action button for the hero section
- **`header`**: The header section containing all text content and CTA button
- **`headingSection`**: The heading section containing preamble, headline, and subheadline
- **`headline`**: The headline text for the hero section
- **`image`**: The image for the hero section
- **`mainText`**: The main text content for the hero section
- **`preamble`**: The preamble text for the hero section
- **`subheadline`**: The subheadline text for the hero section

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-headline-HeroSection | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-subheadline-HeroSection | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-headline-HeroSection | *none* | *none* |
| [direction](../styles-and-themes/layout-props#direction)-subheadline-HeroSection | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-headline-HeroSection | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-subheadline-HeroSection | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-headline-HeroSection | 3em | 3em |
| [fontSize](../styles-and-themes/common-units/#size)-mainText-HeroSection | 1.4em | 1.4em |
| [fontSize](../styles-and-themes/common-units/#size)-subheadline-HeroSection | 2em | 2em |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-headline-HeroSection | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-subheadline-HeroSection | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-headline-HeroSection | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-subheadline-HeroSection | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-headline-HeroSection | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-subheadline-HeroSection | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-headline-HeroSection | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-subheadline-HeroSection | $fontWeight-bold | $fontWeight-bold |
| [gap](../styles-and-themes/common-units/#size)-headline-HeroSection | $space-8 | $space-8 |
| [gap](../styles-and-themes/common-units/#size)-mainText-HeroSection | $space-4 | $space-4 |
| [gap](../styles-and-themes/common-units/#size)-preamble-HeroSection | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-subheadline-HeroSection | $space-4 | $space-4 |
| [letterSpacing](../styles-and-themes/common-units/#size)-headline-HeroSection | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-subheadline-HeroSection | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-headline-HeroSection | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-subheadline-HeroSection | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-headline-HeroSection | 1.4em | 1.4em |
| [lineHeight](../styles-and-themes/common-units/#size)-mainText-HeroSection | 1.1em | 1.1em |
| [lineHeight](../styles-and-themes/common-units/#size)-subheadline-HeroSection | 1.1em | 1.1em |
| [maxWidth-content](../styles-and-themes/common-units/#size) | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HeroSection | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HeroSection | $space-12 | $space-12 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HeroSection | $space-12 | $space-12 |
| [paddingLeft](../styles-and-themes/common-units/#size)-HeroSection | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HeroSection | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HeroSection | $space-12 | $space-12 |
| [paddingVertical](../styles-and-themes/common-units/#size)-HeroSection | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-headline-HeroSection | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-subheadline-HeroSection | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-headline-HeroSection | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-subheadline-HeroSection | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-headline-HeroSection | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-subheadline-HeroSection | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-headline-HeroSection | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-subheadline-HeroSection | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-headline-HeroSection | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-subheadline-HeroSection | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-headline-HeroSection | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-subheadline-HeroSection | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-headline-HeroSection | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-subheadline-HeroSection | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-headline-HeroSection | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-subheadline-HeroSection | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-headline-HeroSection | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-subheadline-HeroSection | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-headline-HeroSection | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-subheadline-HeroSection | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-headline-HeroSection | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-subheadline-HeroSection | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-headline-HeroSection | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-subheadline-HeroSection | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-headline-HeroSection | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-subheadline-HeroSection | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-headline-HeroSection | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-subheadline-HeroSection | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-headline-HeroSection | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-subheadline-HeroSection | *none* | *none* |
