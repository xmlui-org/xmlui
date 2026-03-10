# Text [#text]

The `Text` component displays textual information in a number of optional styles and variants.

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

### `breakMode` [#breakmode]

> [!DEF]  default: **"normal"**

This property controls how text breaks into multiple lines. `normal` uses standard word boundaries, `word` breaks long words to prevent overflow, `anywhere` breaks at any character, `keep` prevents word breaking, and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior or theme variables.

Available values:

| Value | Description |
| --- | --- |
| `normal` | Uses standard word boundaries for breaking **(default)** |
| `word` | Breaks long words when necessary to prevent overflow |
| `anywhere` | Breaks at any character if needed to fit content |
| `keep` | Prevents breaking within words entirely |
| `hyphenate` | Uses automatic hyphenation when breaking words |

### `ellipses` [#ellipses]

> [!DEF]  default: **true**

This property indicates whether ellipses should be displayed when the text is cropped (`true`) or not (`false`).

### `maxLines` [#maxlines]

This property determines the maximum number of lines the component can wrap to. If there is no space to display all the contents, the component displays up to as many lines as specified in this property. When the value is not defined, there is no limit on the displayed lines.

### `overflowMode` [#overflowmode]

> [!DEF]  default: **"not specified"**

This property controls how text overflow is handled. `none` prevents wrapping and shows no overflow indicator, `ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). When not specified, uses the default text behavior.

Available values:

| Value | Description |
| --- | --- |
| `none` | No wrapping, text stays on a single line with no overflow indicator (ignores maxLines) |
| `ellipsis` | Truncates with an ellipsis (default) |
| `scroll` | Forces single line with horizontal scrolling when content overflows (ignores maxLines) |
| `flow` | Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines) |

### `preserveLinebreaks` [#preservelinebreaks]

> [!DEF]  default: **false**

This property indicates if linebreaks should be preserved when displaying text.

### `value` [#value]

The text to be displayed. This value can also be set via nesting the text into the `Text` component.

### `variant` [#variant]

An optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color, and other parameters. If not defined, the text uses the current style of its context. In addition to predefined variants, you can specify custom variant names and style them using theme variables with the pattern `{cssProperty}-Text-{variantName}` (e.g., `textColor-Text-brandTitle`, `fontSize-Text-highlight`). See the documentation for a complete list of supported CSS properties.

Available values:

| Value | Description |
| --- | --- |
| `abbr` | Represents an abbreviation or acronym |
| `caption` | Represents the caption (or title) of a table |
| `cite` | Is used to mark up the title of a cited work |
| `code` | Represents a line of code |
| `deleted` | Represents text that has been deleted |
| `em` | Marks text to stress emphasis |
| `inherit` | Represents text that inherits the style from its parent element |
| `inserted` | Represents a range of text that has been added to a document |
| `keyboard` | Represents a span of text denoting textual user input from a keyboard or voice input |
| `marked` | Represents text which is marked or highlighted for reference or notation |
| `mono` | Text using a mono style font family |
| `paragraph` | Represents a paragraph |
| `placeholder` | Text that is mostly used as the placeholder style in input controls |
| `sample` | Represents sample (or quoted) output from a computer program |
| `secondary` | Represents a bit dimmed secondary text |
| `small` | Represents side-comments and small print |
| `sub` | Specifies inline text as subscript |
| `strong` | Contents have strong importance |
| `subheading` | Indicates that the text is the subtitle in a heading |
| `subtitle` | Indicates that the text is the subtitle of some other content |
| `sup` | Specifies inline text as superscript |
| `tableheading` | Indicates that the text is a table heading |
| `title` | Indicates that the text is the title of some other content |
| `var` | Represents the name of a variable in a mathematical expression |

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Text is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

### `hasOverflow` [#hasoverflow]

Returns true when the displayed text overflows its container boundaries.

**Signature**: `hasOverflow(): boolean`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Text-code | rgb(from $color-surface-100 r g b / 0.4) | rgb(from $color-surface-100 r g b / 0.4) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Text-keyboard | rgb(from $color-surface-100 r g b / 0.4) | rgb(from $color-surface-100 r g b / 0.4) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Text-marked | rgb(from $color-primary-200 r g b / 0.4) | rgb(from $color-primary-400 r g b / 0.4) |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Text-code | $color-surface-100 | $color-surface-100 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Text-keyboard | $color-surface-300 | $color-surface-300 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Text | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Text-code | 4px | 4px |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Text-keyboard | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Text | solid | solid |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Text-code | solid | solid |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Text-keyboard | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Text | $space-0 | $space-0 |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Text-code | 1px | 1px |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Text-keyboard | 1px | 1px |
| [direction](/docs/styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text | $fontFamily | $fontFamily |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text-code | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text-codefence | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text-keyboard | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text-mono | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text-sample | $fontFamily-monospace | $fontFamily-monospace |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text | $fontSize | $fontSize |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-code | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-codefence | $fontSize-code | $fontSize-code |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-keyboard | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-paragraph | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-placeholder | $fontSize-xs | $fontSize-xs |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-sample | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-secondary | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-small | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-sub | $fontSize-xs | $fontSize-xs |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-subheading | $fontSize-H6 | $fontSize-H6 |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-subtitle | $fontSize-xl | $fontSize-xl |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-sup | $fontSize-xs | $fontSize-xs |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-tableheading | $fontSize-H6 | $fontSize-H6 |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-title | $fontSize-2xl | $fontSize-2xl |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text-cite | italic | italic |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text-em | italic | italic |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text-marked | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text-placeholder | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text-subheading | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text-var | italic | italic |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-Text | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-abbr | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-keyboard | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-marked | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-placeholder | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-strong | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-subheading | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-tableheading | $fontWeight-bold | $fontWeight-bold |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Text-caption | 0.05rem | 0.05rem |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Text-subheading | 0.04em | 0.04em |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-Text | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Text-codefence | 1.5 | 1.5 |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Text-marked | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Text-code | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Text-small | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Text-tableheading | $space-4 | $space-4 |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Text-code | *none* | *none* |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Text-small | *none* | *none* |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Text-code | *none* | *none* |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Text-small | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Text-code | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Text-small | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Text-tableheading | $space-1 | $space-1 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Text-code | 2px | 2px |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Text-code | $space-0_5 | $space-0_5 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Text-codefence | $space-4 | $space-4 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Text-keyboard | $space-1 | $space-1 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Text-marked | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Text-tableheading | $space-1 | $space-1 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Text-codefence | $space-3 | $space-3 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Text-paragraph | $space-1 | $space-1 |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text | $textColor | $textColor |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-code--hover | initial | initial |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-codefence | $color-surface-900 | $color-surface-900 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-marked | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-placeholder | $color-surface-500 | $color-surface-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-placeholder--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-secondary | $textColor-secondary | $textColor-secondary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-secondary--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-small--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-subheading | $textColor-secondary | $textColor-secondary |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text-subheading--hover | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Text-deleted | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Text-inserted | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Text-deleted | line-through | line-through |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Text-inserted | underline | underline |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Text-deleted | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Text-inserted | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Text-deleted | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Text-inserted | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-Text | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-Text | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Text-abbr | uppercase | uppercase |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Text-subheading | uppercase | uppercase |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Text | *none* | *none* |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Text-code | *none* | *none* |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Text-small | *none* | *none* |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Text-sub | sub | sub |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Text-sup | super | super |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-Text | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-Text | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-Text | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-Text | *none* | *none* |
