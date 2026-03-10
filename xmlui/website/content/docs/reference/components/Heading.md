# Heading [#heading]

`Heading` displays hierarchical text headings with semantic importance levels from H1 to H6, following HTML heading standards. It provides text overflow handling, anchor link generation, and integrates with [`TableOfContents`](/docs/reference/components/TableOfContents).

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

### `ellipses` [#ellipses]

> [!DEF]  default: **true**

This property indicates whether ellipses should be displayed (`true`) when the heading text is cropped or not (`false`).

### `level` [#level]

> [!DEF]  default: **"h1"**

This property sets the visual significance (level) of the heading. Accepts multiple formats: `h1`-`h6`, `H1`-`H6`, or `1`-`6`.Invalid values default to `h1`.

Available values: `h1` **(default)**, `h2`, `h3`, `h4`, `h5`, `h6`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `1`, `2`, `3`, `4`, `5`, `6`

### `maxLines` [#maxlines]

This optional property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified. If the value is not specified, there is no limit on the number of displayed lines.

### `omitFromToc` [#omitfromtoc]

> [!DEF]  default: **false**

If true, this heading will be excluded from the table of contents.

### `preserveLinebreaks` [#preservelinebreaks]

> [!DEF]  default: **false**

This property indicates whether linebreaks should be preserved when displaying text.

### `showAnchor` [#showanchor]

> [!DEF]  default: **false**

This property indicates whether an anchor link should be displayed next to the heading. If set to `true`, an anchor link will be displayed on hover next to the heading.

### `value` [#value]

This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `hasOverflow` [#hasoverflow]

Returns true when the displayed text overflows the bounds of this heading component.

**Signature**: `hasOverflow()`

### `scrollIntoView` [#scrollintoview]

Scrolls the heading into view.

**Signature**: `scrollIntoView()`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-H1 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-H2 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-H3 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-H4 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-H5 | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-H6 | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-anchor-Heading | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-anchor-Heading  | $color-surface-400 | $color-surface-400 |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-H1 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-H2 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-H3 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-H4 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-H5 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-H6 | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Heading | $fontFamily | $fontFamily |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-H1 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-H2 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-H3 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-H4 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-H5 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-H6 | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Heading | $fontWeight-bold | $fontWeight-bold |
| [gap](/docs/styles-and-themes/common-units/#size)-anchor-Heading | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-anchor-Heading  | $space-2 | $space-2 |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-H1 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-H2 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-H3 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-H4 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-H5 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-H6 | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Heading  | 0 | 0 |
| [textColor](/docs/styles-and-themes/common-units/#color)-H1 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-H2 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-H3 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-H4 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-H5 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-H6 | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Heading | $textColor | $textColor |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-H1 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-H2 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-H3 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-H4 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-H5 | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-H6 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-anchor-Heading | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-anchor-Heading  | underline | underline |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-H1 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-H2 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-H3 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-H4 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-H5 | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-H6 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-H1 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-H2 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-H3 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-H4 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-H5 | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-H6 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-H1 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-H2 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-H3 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-H4 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-H5 | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-H6 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-H1 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-H2 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-H3 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-H4 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-H5 | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-H6 | *none* | *none* |
