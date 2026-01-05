# Markdown [#markdown]

`Markdown` renders formatted text using markdown syntax. Use [Text](/working-with-text) for simple, styled text content, and `Markdown` when you need [rich formatting](/working-with-markdown).

**Key features:**
- **Rich formatting**: Support for headings, bold, italic, lists, links, images, blockquotes, and code blocks
- **Dynamic content**: Use &#64;{} binding expressions to inject variables and function results
- **File loading**: Load markdown content from external files using the `data` property

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

## Properties [#properties]

### `content` [#content]

This property sets the markdown content to display. Alternatively, you can nest the markdown content as a child in a CDATA section. In neither this property value nor any child is defined, empty content is displayed.

Use this property when the text you provide is not static but a result of calculations (you assemble the text or get it from other components).

### `grayscale` [#grayscale]

This boolean property specifies whether images should be displayed in grayscale. If set to `true`, all images within the markdown will be rendered in grayscale.

### `removeBr` (default: false) [#removebr-default-false]

This boolean property specifies whether `<br>` (line break) elements should be omitted from the rendered output. When set to `true`, `<br/>` tags in the markdown content will not be rendered. When `false` (default), `<br/>` tags render as horizontal bars.

### `removeIndents` (default: true) [#removeindents-default-true]

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

If this property is not set, the engine checks if `showHeadingAnchors` flag is turned on in the global configuration (in the `appGlobals` configuration object) and displays the heading anchor accordingly.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The component itself cannot be styled, but the components that render the final text have customizable style variables.

[`Text`](/components/Text#styling)
[`Heading`](/components/Heading#styling)
[`Link`](/components/Link#styling)
[`Image`](/components/Image#styling)
[`Checkbox`](/components/Checkbox#styling)

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-markdown | $color-primary-100 | $color-primary-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-markdown-danger | $color-danger-100 | $color-danger-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-markdown-info | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-markdown-note | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-markdown-tip | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-markdown-warning | $color-warn-100 | $color-warn-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Blockquote-markdown | $color-surface-100 | $color-surface-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-even-Tr-markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tbody-markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tfoot-markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Th-markdown--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Thead-markdown | $color-surface-100 | $color-surface-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Tr-markdown--hover | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Admonition-markdown | 1px solid $color-primary-300 | 1px solid $color-primary-300 |
| [border](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Table-markdown | 1px solid $borderColor | 1px solid $borderColor |
| [border](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-markdown-danger | $color-danger-300 | $color-danger-300 |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-markdown-info | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-markdown-note | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-markdown-tip | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-markdown-warning | $color-warn-300 | $color-warn-300 |
| [borderColor](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HorizontalRule-markdown | $borderColor | $borderColor |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Admonition-markdown | $space-2 | $space-2 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Admonition-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Details-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Li-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Ol-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Table-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Th-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Tr-markdown | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Ul-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HorizontalRule-markdown | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Admonition-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Blockquote-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Details-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Li-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Ol-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Table-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Th-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Tr-markdown | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Ul-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Admonition-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Blockquote-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Details-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Li-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Ol-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Ul-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Admonition-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Blockquote-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Details-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Li-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Ol-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Table-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Th-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Tr-markdown | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Ul-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HorizontalRule-markdown | 2px | 2px |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-accent-Blockquote-markdown | $color-surface-500 | $color-surface-500 |
| [direction](../styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Table-markdown | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text-markdown | $fontSize | $fontSize |
| [fontSize](../styles-and-themes/common-units/#size)-Th-markdown | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Thead-markdown | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Tr-markdown | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-HtmlTd | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Table-markdown | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-markdown | fontWeight-Text | fontWeight-Text |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Th-markdown | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Thead-markdown | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Tr-markdown | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-Text | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| listStyleType-Li-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Admonition-markdown | $space-6 | $space-6 |
| [marginBottom](../styles-and-themes/common-units/#size)-Blockquote-markdown | $space-6 | $space-6 |
| [marginBottom](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H1-markdown | $space-6 | $space-6 |
| [marginBottom](../styles-and-themes/common-units/#size)-H2-markdown | $space-5 | $space-5 |
| [marginBottom](../styles-and-themes/common-units/#size)-H3-markdown | $space-4 | $space-4 |
| [marginBottom](../styles-and-themes/common-units/#size)-H4-markdown | $space-3 | $space-3 |
| [marginBottom](../styles-and-themes/common-units/#size)-H5-markdown | $space-3 | $space-3 |
| [marginBottom](../styles-and-themes/common-units/#size)-H6-markdown | $space-2_5 | $space-2_5 |
| [marginBottom](../styles-and-themes/common-units/#size)-Image-markdown | $space-6 | $space-6 |
| [marginBottom](../styles-and-themes/common-units/#size)-Li-markdown | $space-2_5 | $space-2_5 |
| [marginBottom](../styles-and-themes/common-units/#size)-Ol-markdown | $space-5 | $space-5 |
| [marginBottom](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-markdown | $space-6 | $space-6 |
| [marginBottom](../styles-and-themes/common-units/#size)-Ul-markdown | $space-5 | $space-5 |
| [marginBottom](../styles-and-themes/common-units/#size)-Video-markdown | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-content-Admonition-markdown | $space-1_5 | $space-1_5 |
| [marginLeft](../styles-and-themes/common-units/#size)-Image-markdown | $space-0 | $space-0 |
| [marginLeft](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-Ol-markdown | $space-8 | $space-8 |
| [marginLeft](../styles-and-themes/common-units/#size)-Text-markdown | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-Ul-markdown | $space-8 | $space-8 |
| [marginRight](../styles-and-themes/common-units/#size)-Image-markdown | $space-0 | $space-0 |
| [marginRight](../styles-and-themes/common-units/#size)-Ol-markdown | $space-0 | $space-0 |
| [marginRight](../styles-and-themes/common-units/#size)-Text-markdown | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Ul-markdown | $space-0 | $space-0 |
| [marginTop](../styles-and-themes/common-units/#size)-Admonition-markdown | $space-6 | $space-6 |
| [marginTop](../styles-and-themes/common-units/#size)-Blockquote-markdown | $space-6 | $space-6 |
| [marginTop](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-H1-markdown | $space-4 | $space-4 |
| [marginTop](../styles-and-themes/common-units/#size)-H2-markdown | $space-8 | $space-8 |
| [marginTop](../styles-and-themes/common-units/#size)-H3-markdown | $space-7 | $space-7 |
| [marginTop](../styles-and-themes/common-units/#size)-H4-markdown | $space-6 | $space-6 |
| [marginTop](../styles-and-themes/common-units/#size)-H5-markdown | $space-5 | $space-5 |
| [marginTop](../styles-and-themes/common-units/#size)-H6-markdown | $space-4 | $space-4 |
| [marginTop](../styles-and-themes/common-units/#size)-Image-markdown | $space-6 | $space-6 |
| [marginTop](../styles-and-themes/common-units/#size)-Li-markdown | $space-2_5 | $space-2_5 |
| [marginTop](../styles-and-themes/common-units/#size)-Ol-markdown | $space-2_5 | $space-2_5 |
| [marginTop](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text-markdown | $space-3 | $space-3 |
| [marginTop](../styles-and-themes/common-units/#size)-Ul-markdown | $space-2_5 | $space-2_5 |
| [marginTop](../styles-and-themes/common-units/#size)-Video-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Th-markdown | $space-2 | $space-2 |
| [padding](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Admonition-markdown | $space-2 | $space-2 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Blockquote-markdown | $space-2_5 | $space-2_5 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Blockquote-markdown | $space-6 | $space-6 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Admonition-markdown | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Admonition-markdown | $space-6 | $space-6 |
| [paddingRight](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Admonition-markdown | $space-3 | $space-3 |
| [paddingTop](../styles-and-themes/common-units/#size)-Blockquote-markdown | $space-3 | $space-3 |
| [paddingTop](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Admonition-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Blockquote-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Details-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Li-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Ol-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Th-markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Ul-markdown | *none* | *none* |
| [size](../styles-and-themes/common-units/#size)-icon-Admonition-markdown | $space-5 | $space-5 |
| text-align-HtmlTd | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-Tbody-markdown | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Table-markdown | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Tbody-markdown | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Tfoot-markdown | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Th-markdown | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Thead-markdown | $color-surface-500 | $color-surface-500 |
| [textColor](../styles-and-themes/common-units/#color)-Tr-markdown | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Tr-markdown--hover | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-Text | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Table-markdown | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Tbody-markdown | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Thead-markdown | uppercase | uppercase |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-HtmlTd | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Tbody-markdown | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-accent-Blockquote-markdown | 3px | 3px |
| [width](../styles-and-themes/common-units/#size)-Table-markdown | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-Text | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-Text | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-Text | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-Text | *none* | *none* |
