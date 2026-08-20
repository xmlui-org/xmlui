# HeroSection [#herosection]

HeroSection

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `backgroundTemplate`

The template for the background of the hero section

### `className`

Additional CSS class names to apply to the hero section

### `contentAlignment`

> [!DEF]  default: **"center"**

Horizontal alignment of the content within its area

Available values: `start`, `center` **(default)**, `end`

### `contentPlacement`

> [!DEF]  default: **"bottom"**

Position of the content area relative to the header

Available values: `left`, `right`, `bottom` **(default)**

### `contentTone`

> [!DEF]  default: **"dark"**

The tone for the content section, affecting text colors

Available values: `light`, `dark` **(default)**, `reverse`

### `contentWidth`

> [!DEF]  default: **"$maxWidth-content"**

Width of the hero content (header + content sections)

### `ctaButtonIcon`

The icon for the call-to-action button

### `ctaButtonTemplate`

The template for the call-to-action button

### `ctaButtonText`

The text for the call-to-action button

### `fullWidthBackground`

> [!DEF]  default: **true**

Whether the background should span the full width of the viewport

### `gap`

Gap between header and content sections

### `headerAlignment`

> [!DEF]  default: **"center"**

Alignment of the header content

Available values: `start`, `center` **(default)**, `end`

### `headerTone`

> [!DEF]  default: **"dark"**

The tone for the header section, affecting text colors

Available values: `light`, `dark` **(default)**, `reverse`

### `headerWidth`

> [!DEF]  default: **"50%"**

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
| [backgroundColor-headline-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-mainText-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-preamble-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-subheadline-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [direction-headline-HeroSection](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-mainText-HeroSection](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-preamble-HeroSection](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-subheadline-HeroSection](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-headline-HeroSection](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-mainText-HeroSection](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-preamble-HeroSection](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-subheadline-HeroSection](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-headline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | 3em | 3em |
| [fontSize-mainText-HeroSection](/docs/styles-and-themes/common-units/#size-values) | 1.4em | 1.4em |
| [fontSize-preamble-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-subheadline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | 2em | 2em |
| [fontStretch-headline-HeroSection](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-mainText-HeroSection](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-preamble-HeroSection](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-subheadline-HeroSection](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-headline-HeroSection](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-mainText-HeroSection](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-preamble-HeroSection](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-subheadline-HeroSection](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontVariant-headline-HeroSection](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-mainText-HeroSection](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-preamble-HeroSection](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-subheadline-HeroSection](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-headline-HeroSection](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-mainText-HeroSection](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-preamble-HeroSection](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-subheadline-HeroSection](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [gap-headline-HeroSection](/docs/styles-and-themes/common-units/#size) | $space-8 | $space-8 |
| [gap-mainText-HeroSection](/docs/styles-and-themes/common-units/#size) | $space-4 | $space-4 |
| [gap-preamble-HeroSection](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| [gap-subheadline-HeroSection](/docs/styles-and-themes/common-units/#size) | $space-4 | $space-4 |
| [letterSpacing-headline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-mainText-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-preamble-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-subheadline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-headline-HeroSection](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-mainText-HeroSection](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-preamble-HeroSection](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-subheadline-HeroSection](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-headline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | 1.4em | 1.4em |
| [lineHeight-mainText-HeroSection](/docs/styles-and-themes/common-units/#size-values) | 1.1em | 1.1em |
| [lineHeight-preamble-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-subheadline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | 1.1em | 1.1em |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-HeroSection](/docs/styles-and-themes/common-units/#size-values) | $space-12 | $space-12 |
| [paddingHorizontal-HeroSection](/docs/styles-and-themes/common-units/#size-values) | $space-12 | $space-12 |
| [paddingLeft-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-HeroSection](/docs/styles-and-themes/common-units/#size-values) | $space-12 | $space-12 |
| [paddingVertical-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textAlign-headline-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-mainText-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-preamble-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-subheadline-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-headline-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-mainText-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-preamble-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-subheadline-HeroSection](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-headline-HeroSection](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-mainText-HeroSection](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-preamble-HeroSection](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-subheadline-HeroSection](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textDecorationColor-headline-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-mainText-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-preamble-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-subheadline-HeroSection](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-headline-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-mainText-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-preamble-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-subheadline-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-headline-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-mainText-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-preamble-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-subheadline-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-headline-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-mainText-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-preamble-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-subheadline-HeroSection](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-headline-HeroSection](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-mainText-HeroSection](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-preamble-HeroSection](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-subheadline-HeroSection](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-headline-HeroSection](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-mainText-HeroSection](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-preamble-HeroSection](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-subheadline-HeroSection](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-headline-HeroSection](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-mainText-HeroSection](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-preamble-HeroSection](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-subheadline-HeroSection](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textUnderlineOffset-headline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-mainText-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-preamble-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-subheadline-HeroSection](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [wordBreak-headline-HeroSection](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-mainText-HeroSection](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-preamble-HeroSection](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-subheadline-HeroSection](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-headline-HeroSection](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-mainText-HeroSection](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-preamble-HeroSection](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-subheadline-HeroSection](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-headline-HeroSection](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-mainText-HeroSection](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-preamble-HeroSection](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-subheadline-HeroSection](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-headline-HeroSection](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-mainText-HeroSection](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-preamble-HeroSection](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-subheadline-HeroSection](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
