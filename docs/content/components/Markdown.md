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
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition | $color-primary-100 | $color-primary-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-danger | $color-danger-100 | $color-danger-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-info | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-note | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-tip | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Admonition-warning | $color-warn-100 | $color-warn-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Blockquote | $color-surface-100 | $color-surface-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-even-HtmlTr | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTbody | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTfoot | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTh--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-HtmlTr--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Admonition | 1px solid $color-primary-300 | 1px solid $color-primary-300 |
| [border](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-danger | $color-danger-300 | $color-danger-300 |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-info | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-note | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-tip | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-warning | $color-warn-300 | $color-warn-300 |
| [borderColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HorizontalRule | $borderColor | $borderColor |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlDetails | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlLi | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlOl | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTable | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTh | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTr | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlUl | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlDetails | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlLi | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlOl | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTable | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTh | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTr | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlUl | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | $space-2 | $space-2 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlDetails | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlLi | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlOl | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTable | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTh | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTr | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-HtmlUl | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlDetails | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlLi | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlOl | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTable | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTd | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTh | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlThead | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlTr | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-HtmlUl | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HorizontalRule | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlDetails | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlLi | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlOl | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTable | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTd | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTh | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlThead | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlTr | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-HtmlUl | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlDetails | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlLi | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlOl | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlTd | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-HtmlUl | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlDetails | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlLi | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlOl | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlTable | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlTd | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlTh | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlThead | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlTr | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-HtmlUl | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HorizontalRule | 2px | 2px |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-accent-Blockquote | $color-surface-500 | $color-surface-500 |
| [direction](../styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-HtmlTable | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-HtmlTr | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text-markdown | fontSize-${COMP} | fontSize-${COMP} |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-HtmlTable | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-HtmlTd | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-HtmlTh | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-HtmlThead | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-HtmlTr | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-markdown | fontWeight-Text | fontWeight-Text |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-Text | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| listStyleType-HtmlLi | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Admonition | $space-7 | $space-7 |
| [marginBottom](../styles-and-themes/common-units/#size)-Blockquote | $space-7 | $space-7 |
| [marginBottom](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H2-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H3-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H4-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H5-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H6-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlLi | $space-2_5 | $space-2_5 |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlVideo | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Image-markdown | $space-4 | $space-4 |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-markdown | $space-6 | $space-6 |
| [marginLeft](../styles-and-themes/common-units/#size)-Admonition-content | $space-1_5 | $space-1_5 |
| [marginLeft](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-Image-markdown | $space-0 | $space-0 |
| [marginLeft](../styles-and-themes/common-units/#size)-Text-markdown | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Image-markdown | $space-0 | $space-0 |
| [marginRight](../styles-and-themes/common-units/#size)-Text-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Admonition | $space-7 | $space-7 |
| [marginTop](../styles-and-themes/common-units/#size)-Blockquote | $space-7 | $space-7 |
| [marginTop](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-H2-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-H3-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-H4-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-H5-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-H6-markdown | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlLi | $space-2_5 | $space-2_5 |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlVideo | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Image-markdown | $space-4 | $space-4 |
| [marginTop](../styles-and-themes/common-units/#size)-Text-markdown | $space-3 | $space-3 |
| [padding](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Admonition | $space-2 | $space-2 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Blockquote | $space-2_5 | $space-2_5 |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Blockquote | $space-6 | $space-6 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Admonition | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Admonition | $space-6 | $space-6 |
| [paddingRight](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Admonition | $space-3 | $space-3 |
| [paddingTop](../styles-and-themes/common-units/#size)-Blockquote | $space-3 | $space-3 |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlDetails | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlLi | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlOl | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlTd | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlTh | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlThead | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-HtmlUl | *none* | *none* |
| [size](../styles-and-themes/common-units/#size)-icon-Admonition | $space-5 | $space-5 |
| text-align-HtmlTd | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-HtmlTbody | *none* | *none* |
| [textAlign](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlTable | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlTbody | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlTfoot | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlTh | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlThead | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlTr | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-HtmlTr--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-Text | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-HtmlTable | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-HtmlTbody | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-HtmlThead | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-HtmlTbody | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-HtmlTd | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-accent-Blockquote | 3px | 3px |
| [width](../styles-and-themes/common-units/#size)-HtmlTable | *none* | *none* |
| [wordBreak](../styles-and-themes/common-units/#word-break)-Text | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-Text | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-Text | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-Text | *none* | *none* |
