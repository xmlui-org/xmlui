# Markdown [#markdown]

`Markdown` renders formatted text using markdown syntax. Use [Text](/working-with-text) for simple, styled text content, and `Markdown` when you need [rich formatting](/working-with-markdown).

**Key features:**
- **Rich formatting**: Support for headings, bold, italic, lists, links, images, blockquotes, and code blocks
- **Dynamic content**: Use &#64;{} binding expressions to inject variables and function results
- **File loading**: Load Markdown content from external files using the `data` property
- **HTML**: Use a subset of HTML directly in Markdown

## Acquiring content [#acquiring-content]

You can specify Markdown content in these ways.

### The content property [#the-content-property]

Render Markdown content that you calculate or get from other components.

### The data property [#the-data-property]

Render Markdown content from an URL.

### Nested text [#nested-text]

Render Markdown content that you place directly in a Markdown component.

## Whitespace and special characters [#whitespace-and-special-characters]

Whitespace is significant in Markdown, for example headers using the `#` syntax must begin in column 1.

These special XML characters are significant too.

```
< (less than) - Must be escaped as &lt;
> (greater than) - Must be escaped as &gt;
& (ampersand) - Must be escaped as &amp;
" (double quote) - Must be escaped as &quot; in attributes
' (single quote/apostrophe) - Must be escaped as &apos; in attributes
```

You can use a CDATA section to avoid having to escape these characters individually.

```
<Markdown>
  <![CDATA[
  ]]>
</Markdown>
```

Or, as we have done in this page, you can use a code fence (a block delimited by triple backtics) to preserve them.

## Supported elements [#supported-elements]

The `Markdown` component supports these basic elements.

- Heading
- Bold
- Italic
- Strikethrough
- Blockquote
- Ordered List
- Unordered List
- Code
- Horizontal Rule
- Link
- Image
- Table

See [this markdown guide](https://www.markdownguide.org/cheat-sheet/).

## Native HTML [#native-html]

`Markdown` allows a subset of HTML. For example, while Markdown itself does not support `rowspan` and `colspan` in tables, you can use HTML directly.

```xmlui-pg display name="HTML with colspan"
<App>
  <Markdown>
    <![CDATA[
<table>
  <thead>
    <tr>
      <th colspan="2">Name</th>
      <th>Age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jill</td>
      <td>Smith</td>
      <td>43</td>
    </tr>
    <tr>
      <td>Eve</td>
      <td>Jackson</td>
      <td>57</td>
    </tr>
  </tbody>
</table>
    ]]>
  </Markdown>
</App>
```

## Binding Expressions [#binding-expressions]

Our `Markdown` component is capable of evaluating binding expressions just as other XMLUI components.
Use the &#64;{} syntax to wrap expressions that need to be evaluated.

Objects, functions and arrays will be stringified if you place them in `Markdown`.

Function calls are executed and their return values inlined as strings into markdown.

```xmlui-pg copy {5-9} name="Example: binding expressions syntax"
<App>
  <variable name="x" value="{() => { return 'testing' }}" />
  <Markdown>
    <![CDATA[
Empty elements are removed: @{}

Nested objects and functions are handled: @{ { a: 1, b: () => {} } }

Function calls are executed: @{x()}
    ]]>
  </Markdown>
</App>
```

## XMLUI playground apps [#xmlui-playground-apps]

`xmlui-pg` fences accept the same entrypoint format as `Main.xmlui`.
The fence can contain just the app markup, or it can also contain top-level
`<Component>` declarations that are reusable inside that app.

```xmlui-pg name="XMLUI playground apps" copy display
<Component name="StatusPill">
  <Badge value="{$props.value}" variant="pill" />
</Component>

<App>
  <VStack gap="8px">
    <StatusPill value="Ready" />
    <StatusPill value="Synced" />
  </VStack>
</App>
```

An entrypoint may contain zero, one, or many top-level `<Component>` declarations,
but it may contain only one top-level non-`Component` app root. The declarations
and app root can appear in any order. If it contains only `<Component>`
declarations, XMLUI renders an empty `Fragment` and logs a browser warning.
Component files and `---comp` playground sections remain strict component
definitions; if a strict component section or component file has the same name as
an inline entrypoint component, the strict component definition wins.

**Context variables available during execution:**

- `$anchorHref`: The href (#id) of the current heading anchor.
- `$anchorId`: The generated id of the current heading anchor.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `allowHtml` [#allowhtml]

> [!DEF]  default: **true**

When `true` (default), a subset of raw HTML embedded in the content is rendered as real elements. Set this to `false` for content that arrives at runtime as **data** so that raw HTML tags render as literal text instead of markup — a quoted `<table>` shows its tags rather than building a table. Only the HTML-tag interpretation is affected; markdown formatting, code fences, and inline code are untouched. Pair with `interpolateBindings="false"` for a fully data-safe render.

By default, `Markdown` renders a subset of raw HTML embedded in the content as real elements — a `<table>` in the text builds a table. That is fine for markup you author, but for content that arrives at runtime as **data** (transcripts, logs, user input) any quoted HTML would render as live markup and can break layout.

Set `allowHtml="false"` so raw HTML tags render as **literal text** instead. Only the HTML-tag interpretation is neutralized — markdown formatting, code fences, and inline code are untouched, and an unterminated tag survives verbatim rather than being dropped.

This axis is independent of `interpolateBindings`. Pair the two (`interpolateBindings="false" allowHtml="false"`) for a fully data-safe render: nothing is evaluated, nothing is rewritten, and no HTML is activated.

```xmlui-pg copy display name="Example: allowHtml"
<App var.dataLine="{'Rendered row: <tr><td>oops</td></tr> — and a bare <script> tag'}">
  <VStack gap="8px">
    <Text variant="strong">allowHtml="true" (default)</Text>
    <Markdown content="{dataLine}" />
    <Text variant="strong">allowHtml="false"</Text>
    <Markdown allowHtml="false" content="{dataLine}" />
  </VStack>
</App>
```

### `anchorTemplate` [#anchortemplate]

An optional template to customize the anchor link rendered next to each heading. Requires `showHeadingAnchors` to be `true`. The template receives `$anchorId` and `$anchorHref` as context variables.

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

```xmlui-pg copy display name="Example: breakMode='word'" /breakMode="word"/
<App>
  <VStack gap="16px">
    <VStack gap="8px">
      <Text variant="strong">breakMode="normal" (default)</Text>
      <Markdown
        width="200px"
        backgroundColor="lightblue"
        padding="8px"
        breakMode="normal">
        <![CDATA[
This text uses standardwordbreaking at natural boundaries like spaces and hyphens.
        ]]>
      </Markdown>
    </VStack>

    <VStack gap="8px">
      <Text variant="strong">breakMode="word"</Text>
      <Markdown
        width="200px"
        backgroundColor="lightgreen"
        padding="8px"
        breakMode="word">
        <![CDATA[
This text will breakverylongwordswhenneeded to prevent overflow while preserving readability.
        ]]>
      </Markdown>
    </VStack>

    <VStack gap="8px">
      <Text variant="strong">breakMode="anywhere"</Text>
      <Markdown
        width="200px"
        backgroundColor="lightyellow"
        padding="8px"
        breakMode="anywhere">
        <![CDATA[
Thistext willbreakanywhereif neededtofit thecontainer eveninthe middleofwords.
        ]]>
      </Markdown>
    </VStack>
  </VStack>
</App>
```

### `content` [#content]

This property sets the markdown content to display. Alternatively, you can nest the markdown content as a child in a CDATA section. In neither this property value nor any child is defined, empty content is displayed.

Use this property when the text you provide is not static but a result of calculations (you assemble the text or get it from other components).

### `grayscale` [#grayscale]

This boolean property specifies whether images should be displayed in grayscale. If set to `true`, all images within the markdown will be rendered in grayscale.

### `highlightActive` [#highlightactive]

When `true`, this Markdown block holds the active match: its first `highlightText` occurrence is emphasized and scrolled into view.

### `highlightActiveIndex` [#highlightactiveindex]

Which occurrence (0-based) of `highlightText` is the active match: it is emphasized and scrolled into view. Occurrences are counted **across all terms in document order**, so stepping the index walks every `<mark>` top-to-bottom regardless of which term produced it. -1 or unset means none. Generalizes `highlightActive`.

### `highlightText` [#highlighttext]

When set, wraps every case-insensitive occurrence in the rendered content in a `<mark>` element (highlighted). Accepts a **string** (a single phrase) or a **string array** (each term highlighted independently). Works across prose, code, and links. A term shorter than 2 characters, an empty string, or an empty array is a no-op.

### `interpolateBindings` [#interpolatebindings]

> [!DEF]  default: **true**

When `true` (default), the content is treated as **authored** markup: `@{...}` binding expressions are evaluated and replaced with their values, and `xmlui-pg` playground fences and tree-display blocks are rendered as live examples. Set this to `false` for content that arrives at runtime as **data** (transcripts, logs, user text) so that `@{...}` sequences — which collide with real-world syntax such as PowerShell hashtable literals (`@{ ... }`) — render literally instead of being evaluated, and a quoted `xmlui-pg` fence renders as a code block instead of being rewritten into a live playground.

By default, `Markdown` evaluates `@{...}` binding expressions in its content. That is convenient for text you author, but risky for text that arrives at runtime as **data** — transcripts, logs, or user input.

The collision is a bare `@` immediately followed by `{`, which is common in real code and markup: PowerShell hashtables (`@{ LogName = "System" }`), Razor/Blazor code blocks (`@{ ... }`), Objective-C dictionary literals (`@{ @"k": v }`), Perl dereferences (`@{ $ref }`), and LaTeX column specs (`@{...}`). When such text is evaluated as a binding it produces wrong output or an error — and an empty `@{}` (e.g. a LaTeX inter-column spec) is silently **removed** rather than shown.

Set `interpolateBindings="false"` for data-fed content so every `@{...}` sequence renders literally:

```xmlui-pg copy display name="Example: interpolateBindings"
<App var.logLine="{'Get-WinEvent -FilterHashtable @{ LogName = System; Id = 3077 }'}">
  <Markdown interpolateBindings="false" content="{logLine}" />
</App>
```

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

```xmlui-pg copy display name="Example: overflowMode='flow'" /overflowMode="flow"/
<App>
  <VStack gap="16px">
    <VStack gap="8px">
      <Text variant="strong">overflowMode="flow"</Text>
      <Markdown
        width="300px"
        backgroundColor="lightblue"
        padding="8px"
        overflowMode="flow">
        <![CDATA[
This markdown content wraps to multiple lines naturally. It can contain **bold text**, *italic text*, and even [links](https://example.com), all wrapping as needed.

When you have comma-separated lists like: [reference-1](url1), [reference-2](url2), [reference-3](url3), [reference-4](url4), they will wrap appropriately.
        ]]>
      </Markdown>
    </VStack>

    <VStack gap="8px">
      <Text variant="strong">overflowMode="scroll"</Text>
      <Markdown
        width="300px"
        backgroundColor="lightgreen"
        padding="8px"
        overflowMode="scroll">
        <![CDATA[
This text stays on a single line with horizontal scrolling when content overflows the container width.
        ]]>
      </Markdown>
    </VStack>

    <VStack gap="8px">
      <Text variant="strong">overflowMode="ellipsis"</Text>
      <Markdown
        width="300px"
        backgroundColor="lightyellow"
        padding="8px"
        overflowMode="ellipsis">
        <![CDATA[
This text truncates with ellipsis when it exceeds the container width.
        ]]>
      </Markdown>
    </VStack>
  </VStack>
</App>
```

For comma-separated markdown links (common in reference lists), use `overflowMode="flow"` with optional `breakMode="word"`:

```xmlui-pg copy display name="Example: comma-separated references" /overflowMode="flow"/ /breakMode="word"/
<App>
  <Markdown
    width="400px"
    backgroundColor="lavender"
    padding="8px"
    overflowMode="flow"
    breakMode="word">
    <![CDATA[
[issue #123](https://example.com/issue/123), [PR #456](https://example.com/pr/456), [issue #789](https://example.com/issue/789), [PR #1011](https://example.com/pr/1011), [issue #1213](https://example.com/issue/1213)
    ]]>
  </Markdown>
</App>
```

### `removeBr` [#removebr]

> [!DEF]  default: **false**

This boolean property specifies whether `<br>` (line break) elements should be omitted from the rendered output. When set to `true`, `<br/>` tags in the markdown content will not be rendered. When `false` (default), `<br/>` tags render as horizontal bars.

### `removeIndents` [#removeindents]

> [!DEF]  default: **true**

This boolean property specifies whether leading indents should be removed from the markdown content. If set to `true`, the shortest indent found at the start of the content lines is removed from the beginning of every line.

```xmlui-pg copy display name="Example: removeIndents property"
<App layout="horizontal-sticky" padding="1rem">
  <Markdown removeIndents="true">
    <![CDATA[
      # My Adventure in Markdown Land

      ## The Beginning

      In the bustling city of Markdownville, I embarked on a journey to
      discover the secrets of Markdown. My adventure started in the heart
      of the city, where the first rule of Markdown was inscribed in stone.
    ]]>
  </Markdown>
</App>
```

### `showHeadingAnchors` [#showheadinganchors]

This boolean property specifies whether heading anchors should be displayed. If set to `true`, heading anchors will be displayed on hover next to headings.

If this property is not set, the engine checks if the `showHeadingAnchors` flag is turned on in `xmluiConfig` and displays the heading anchor accordingly.

### `truncateLinks` [#truncatelinks]

This boolean property specifies whether long links should be truncated with ellipsis. If set to `true`, links will be displayed with a maximum width and overflow will be hidden with text-overflow: ellipsis.

```xmlui-pg copy display name="Example: truncateLinks property"
<App>
  <Markdown truncateLinks="true">
    <![CDATA[
This is a long link truncated for display: https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE1VSS2vjMBD%2BK2LIYRdsy7u0F%2BEGlvbYPSXspQmLYo0dUXskpHHqNvi%2FL1Lchd7m9T1mmCtE1mT04AhBXUF7DwqaX95vDyRE82wjC6NZPxzgzOyjklJ7W3E3VL27VNOrHCyhHJ1BydMJZWTNUzxAxgshmj3OvL1uLONYkR5xUWLNEnKXxzG%2B1MfqBt3hBYPl9yeMbbCeraOlkZklW5LJ0%2FZAjby5hAJaN3pHSBxBvRxTTp3t0z5JEBQ8OzKOxH46obgpQgF8xhET4grWgIJ5HCZbGtemJs6MZOJnOYsMLoCCTQ5KH%2Byow3t5X9efXH90iEm0c8Q7%2B5GEf9z5GQo46fa1D24i85jBaZuydSaNhP70rQtuFCtxnEKnWyx%2F1rUIohcnIUVd3X2HArw2xlL%2FBb6JPk3Xf%2B9hWY7LUoDLN7s5sTOaffIGqtNDxALim%2FYezf%2FcB7xYfPud2daaCxaJdaIBBWcX7Icj1gMUoFu2F1wpv55sbeVPgsH2Z85XI0ZiUPm1luUfOQ4%2BonECAAA%3D
    ]]>
  </Markdown>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The component itself cannot be styled, but the components that render the final text have customizable style variables.

[`Text`](/docs/reference/components/Text#styling)
[`Heading`](/docs/reference/components/Heading#styling)
[`Link`](/docs/reference/components/Link#styling)
[`Image`](/docs/reference/components/Image#styling)
[`Checkbox`](/docs/reference/components/Checkbox#styling)

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-primary-200 |
| [backgroundColor-Admonition-markdown-card](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [backgroundColor-Admonition-markdown-danger](/docs/styles-and-themes/common-units/#color) | $color-danger-100 | $color-danger-100 |
| [backgroundColor-Admonition-markdown-def](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [backgroundColor-Admonition-markdown-feat](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [backgroundColor-Admonition-markdown-info](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Admonition-markdown-note](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Admonition-markdown-tip](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Admonition-markdown-warning](/docs/styles-and-themes/common-units/#color) | $color-warn-100 | $color-warn-100 |
| [backgroundColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-50 |
| [backgroundColor-even-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-mark-markdown](/docs/styles-and-themes/common-units/#color) | $color-warn-200 | $color-warn-200 |
| [backgroundColor-markActive-markdown](/docs/styles-and-themes/common-units/#color) | $color-warn-400 | $color-warn-400 |
| [backgroundColor-Markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Tbody-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Text](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Tfoot-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Th-markdown--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Thead-markdown](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [backgroundColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Tr-markdown--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | 0px solid $color-primary-300 | 0px solid $color-primary-300 |
| [border-Admonition-markdown-card](/docs/styles-and-themes/common-units/#border) | 1px solid $color-surface-200 | 1px solid $color-surface-200 |
| [border-Admonition-markdown-feat](/docs/styles-and-themes/common-units/#border) | 1px solid $color-surface-200 | 1px solid $color-surface-200 |
| [border-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Tr-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-Tr-markdown](/docs/styles-and-themes/common-units/#border) | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottom-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-danger](/docs/styles-and-themes/common-units/#color) | $color-danger-300 | $color-danger-300 |
| [borderColor-Admonition-markdown-def](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-feat](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-info](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-note](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-tip](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Admonition-markdown-warning](/docs/styles-and-themes/common-units/#color) | $color-warn-300 | $color-warn-300 |
| [borderColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-HorizontalRule-markdown](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-Admonition-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Details-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-HtmlThead](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Li-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Ol-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Table-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Td-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Th-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Tr-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Ul-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Admonition-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Details-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-HtmlThead](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Li-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Ol-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Table-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Td-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Th-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Tr-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Ul-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Tr-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Tr-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-Admonition-markdown](/docs/styles-and-themes/common-units/#border-rounding) | $space-2 | $space-2 |
| [borderRadius-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Table-markdown](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Tr-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-Admonition-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Details-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-HtmlThead](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Li-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Ol-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Table-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Td-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Th-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Tr-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Ul-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Admonition-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Details-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-HtmlThead](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Li-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Ol-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Table-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Td-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Th-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Tr-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Ul-markdown](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-danger](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-def](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-feat](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-info](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-note](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-tip](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Admonition-markdown-warning](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-HorizontalRule-markdown](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Tr-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-Admonition-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Blockquote-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Details-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-HtmlThead](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Li-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Ol-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Table-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Td-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Th-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Tr-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Ul-markdown](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-Admonition-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Details-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-HtmlThead](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Li-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Ol-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Td-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Ul-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-Admonition-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Blockquote-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Details-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-HtmlThead](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Li-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Ol-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Table-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Td-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Th-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Tr-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Ul-markdown](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-danger](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-def](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-feat](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-info](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-note](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-tip](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Admonition-markdown-warning](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-HorizontalRule-markdown](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [borderWidth-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [color-accent-Blockquote-markdown](/docs/styles-and-themes/common-units/#color) | $color-surface-500 | $color-surface-500 |
| [direction-Text](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-Table-markdown](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Text](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-H1-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-H2-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-H3-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-H4-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-H5-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-H6-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Text-markdown](/docs/styles-and-themes/common-units/#size-values) | $fontSize | $fontSize |
| [fontSize-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | $fontSize-tiny | $fontSize-tiny |
| [fontSize-Thead-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Tr-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontStretch-Text](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-Text](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontVariant-Text](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-Table-markdown](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Td-markdown](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Text](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Text-markdown](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-Text | $fontWeight-Text |
| [fontWeight-Th-markdown](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Thead-markdown](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-Tr-markdown](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [letterSpacing-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-Text](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| listStyleType-Li-markdown | *none* | *none* |
| [marginBottom-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginBottom-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginBottom-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-H1-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginBottom-H2-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [marginBottom-H3-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [marginBottom-H4-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [marginBottom-H5-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [marginBottom-H6-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [marginBottom-Image-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginBottom-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [marginBottom-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [marginBottom-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-Text-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [marginBottom-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [marginBottom-Video-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginLeft-content-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-1_5 | $space-1_5 |
| [marginLeft-Image-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [marginLeft-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginLeft-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-8 | $space-8 |
| [marginLeft-Text-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginLeft-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-8 | $space-8 |
| [marginRight-Image-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [marginRight-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [marginRight-Text-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginRight-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [marginTop-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginTop-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginTop-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-H1-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [marginTop-H2-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-8 | $space-8 |
| [marginTop-H3-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-7 | $space-7 |
| [marginTop-H4-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginTop-H5-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [marginTop-H6-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [marginTop-Image-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [marginTop-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [marginTop-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [marginTop-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-Text-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [marginTop-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [marginTop-Video-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2 $space-4 | $space-2 $space-4 |
| [padding-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-4 $space-6 | $space-4 $space-6 |
| [padding-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingBottom-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2_5 | $space-2_5 |
| [paddingBottom-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [paddingHorizontal-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingLeft-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-6 | $space-6 |
| [paddingRight-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingTop-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingTop-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Details-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-HtmlThead](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Li-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Ol-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Td-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Th-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Ul-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [size-icon-Admonition-markdown](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [textAlign-Tbody-markdown](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-Td-markdown](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-Text](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-Text](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-mark-markdown](/docs/styles-and-themes/common-units/#color) | inherit | inherit |
| [textColor-Table-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Tbody-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Text](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Tfoot-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Th-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Thead-markdown](/docs/styles-and-themes/common-units/#color) | $color-surface-500 | $color-surface-500 |
| [textColor-Tr-markdown](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Tr-markdown--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-Text](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-Text](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-Text](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-Text](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-Text](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-Text](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-Table-markdown](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-Tbody-markdown](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-Text](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-Thead-markdown](/docs/styles-and-themes/common-units/#textTransform) | uppercase | uppercase |
| [textUnderlineOffset-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [verticalAlignment-Tbody-markdown](/docs/styles-and-themes/common-units/#alignment) | *none* | *none* |
| [verticalAlignment-Td-markdown](/docs/styles-and-themes/common-units/#alignment) | top | top |
| [width-accent-Blockquote-markdown](/docs/styles-and-themes/common-units/#size-values) | 3px | 3px |
| [width-Table-markdown](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [wordBreak-Text](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-Text](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-Text](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-Text](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
