# Markdown [#markdown]

`Markdown` renders formatted text using markdown syntax. Use [Text](/working-with-text) for simple, styled text content, and `Markdown` when you need [rich formatting](/working-with-markdown).

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

### `content` [#content]

This property sets the markdown content to display. Alternatively, you can nest the markdown content as a child in a CDATA section. In neither this property value nor any child is defined, empty content is displayed.

### `grayscale` [#grayscale]

This boolean property specifies whether images should be displayed in grayscale. If set to `true`, all images within the markdown will be rendered in grayscale.

### `openLinkInNewTab` [#openlinkinnewtab]

This boolean property specifies whether links should open in a new tab. If set to `true`, all links within the markdown will open in a new tab with `target="_blank"`. Links that explicitly specify their own target using the `| target=...` syntax will override this setting.

### `overflowMode` [#overflowmode]

> [!DEF]  default: **"not specified"**

This property controls how text overflow is handled. `none` prevents wrapping and shows no overflow indicator, `ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, and `flow` allows multi-line wrapping with vertical scrolling when needed. When not specified, uses the default text behavior.

Available values:

| Value | Description |
| --- | --- |
| `none` | No wrapping, text stays on a single line with no overflow indicator |
| `ellipsis` | Truncates with an ellipsis |
| `scroll` | Forces single line with horizontal scrolling when content overflows |
| `flow` | Allows text to wrap into multiple lines with vertical scrolling when container height is constrained |

### `removeBr` [#removebr]

> [!DEF]  default: **false**

This boolean property specifies whether `<br>` (line break) elements should be omitted from the rendered output. When set to `true`, `<br/>` tags in the markdown content will not be rendered. When `false` (default), `<br/>` tags render as horizontal bars.

### `removeIndents` [#removeindents]

> [!DEF]  default: **true**

This boolean property specifies whether leading indents should be removed from the markdown content. If set to `true`, the shortest indent found at the start of the content lines is removed from the beginning of every line.

### `showHeadingAnchors` [#showheadinganchors]

This boolean property specifies whether heading anchors should be displayed. If set to `true`, heading anchors will be displayed on hover next to headings.

### `truncateLinks` [#truncatelinks]

This boolean property specifies whether long links should be truncated with ellipsis. If set to `true`, links will be displayed with a maximum width and overflow will be hidden with text-overflow: ellipsis.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | $color-surface-100 | $color-primary-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-card | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-danger | $color-danger-100 | $color-danger-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-def | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-feat | $color-surface-50 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-info | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-note | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-tip | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-warning | $color-warn-100 | $color-warn-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | $color-surface-100 | $color-surface-50 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-even-Tr-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tbody-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tfoot-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Th-markdown--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Thead-markdown | $color-surface-100 | $color-surface-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown--hover | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | 0px solid $color-primary-300 | 0px solid $color-primary-300 |
| [border](/docs/styles-and-themes/common-units/#border)-Admonition-markdown-card | 1px solid $color-surface-200 | 1px solid $color-surface-200 |
| [border](/docs/styles-and-themes/common-units/#border)-Admonition-markdown-feat | 1px solid $color-surface-200 | 1px solid $color-surface-200 |
| [border](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Table-markdown | 1px solid $borderColor | 1px solid $borderColor |
| [border](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Tr-markdown | 1px solid $borderColor | 1px solid $borderColor |
| [border](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-card | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-danger | $color-danger-300 | $color-danger-300 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-def | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-feat | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-info | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-note | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-tip | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown-warning | $color-warn-300 | $color-warn-300 |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-HorizontalRule-markdown | $borderColor | $borderColor |
| [borderColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Td-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Td-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Admonition-markdown | $space-2 | $space-2 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Td-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Td-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-card | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-danger | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-def | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-feat | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-info | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-note | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-tip | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown-warning | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-HorizontalRule-markdown | solid | solid |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Td-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Td-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Td-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-card | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-danger | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-def | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-feat | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-info | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-note | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-tip | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown-warning | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-HorizontalRule-markdown | 2px | 2px |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-accent-Blockquote-markdown | $color-surface-500 | $color-surface-500 |
| [direction](/docs/styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Table-markdown | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Text | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-H1-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-H2-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-H3-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-H4-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-H5-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-H6-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Text-markdown | $fontSize | $fontSize |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | $fontSize-sm | $fontSize-sm |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Thead-markdown | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Tr-markdown | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-Text | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Table-markdown | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Td-markdown | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Text-markdown | fontWeight-Text | fontWeight-Text |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Th-markdown | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Thead-markdown | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Tr-markdown | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-Text | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| listStyleType-Li-markdown | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | $space-6 | $space-6 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | $space-6 | $space-6 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-H1-markdown | $space-6 | $space-6 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-H2-markdown | $space-5 | $space-5 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-H3-markdown | $space-4 | $space-4 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-H4-markdown | $space-3 | $space-3 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-H5-markdown | $space-3 | $space-3 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-H6-markdown | $space-2_5 | $space-2_5 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Image-markdown | $space-6 | $space-6 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | $space-2_5 | $space-2_5 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | $space-5 | $space-5 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Text-markdown | $space-2 | $space-2 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | $space-5 | $space-5 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-Video-markdown | *none* | *none* |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-content-Admonition-markdown | $space-1_5 | $space-1_5 |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Image-markdown | $space-0 | $space-0 |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | $space-8 | $space-8 |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Text-markdown | *none* | *none* |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | $space-8 | $space-8 |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Image-markdown | $space-0 | $space-0 |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | $space-0 | $space-0 |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Text-markdown | *none* | *none* |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | $space-0 | $space-0 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | $space-6 | $space-6 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | $space-6 | $space-6 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-H1-markdown | $space-4 | $space-4 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-H2-markdown | $space-8 | $space-8 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-H3-markdown | $space-7 | $space-7 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-H4-markdown | $space-6 | $space-6 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-H5-markdown | $space-5 | $space-5 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-H6-markdown | $space-4 | $space-4 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Image-markdown | $space-6 | $space-6 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | $space-2_5 | $space-2_5 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | $space-2_5 | $space-2_5 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Text-markdown | $space-2 | $space-2 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | $space-2_5 | $space-2_5 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-Video-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | $space-2 | $space-2 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | $space-2 | $space-2 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | $space-2 | $space-2 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | $space-2_5 | $space-2_5 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | $space-6 | $space-6 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | $space-2 | $space-2 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | $space-6 | $space-6 |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | $space-3 | $space-3 |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | $space-3 | $space-3 |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Admonition-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Blockquote-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Details-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-HtmlThead | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Li-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Ol-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Td-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Th-markdown | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Ul-markdown | *none* | *none* |
| [size](/docs/styles-and-themes/common-units/#size-values)-icon-Admonition-markdown | $space-5 | $space-5 |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Tbody-markdown | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Td-markdown | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tbody-markdown | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tfoot-markdown | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Thead-markdown | $color-surface-500 | $color-surface-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Tr-markdown--hover | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-Text | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-Text | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Table-markdown | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Tbody-markdown | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Thead-markdown | uppercase | uppercase |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-Text | *none* | *none* |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Tbody-markdown | *none* | *none* |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Td-markdown | top | top |
| [width](/docs/styles-and-themes/common-units/#size-values)-accent-Blockquote-markdown | 3px | 3px |
| [width](/docs/styles-and-themes/common-units/#size-values)-Table-markdown | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-Text | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-Text | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-Text | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-Text | *none* | *none* |
