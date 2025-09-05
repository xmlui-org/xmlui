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
| [backgroundColor](../styles-and-themes/common-units/#color)-Markdown | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Admonition | 1px solid $color-primary-300 | 1px solid $color-primary-300 |
| [border](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-danger | $color-danger-300 | $color-danger-300 |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-info | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-note | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-tip | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Admonition-warning | $color-warn-300 | $color-warn-300 |
| [borderColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-HorizontalRule | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | $space-2 | $space-2 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Admonition | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Blockquote | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-HorizontalRule | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Admonition | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Blockquote | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Admonition | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Blockquote | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Admonition | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Blockquote | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-HorizontalRule | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-accent-Blockquote | $color-surface-500 | $color-surface-500 |
| [direction](../styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text-markdown | fontSize-${COMP} | fontSize-${COMP} |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-markdown | fontWeight-Text | fontWeight-Text |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [lineBreak](../styles-and-themes/common-units/#line-break)-Text | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Admonition | $space-7 | $space-7 |
| [marginBottom](../styles-and-themes/common-units/#size)-Blockquote | $space-7 | $space-7 |
| [marginBottom](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H2-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H3-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H4-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H5-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-H6-markdown | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlLi | $space-2_5 | $space-2_5 |
| [marginBottom](../styles-and-themes/common-units/#size)-HtmlVideo | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Image-markdown | $space-4 | $space-4 |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-markdown | $space-6 | $space-6 |
| [marginLeft](../styles-and-themes/common-units/#size)-Admonition-content | $space-1_5 | $space-1_5 |
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
| [marginTop](../styles-and-themes/common-units/#size)-HtmlLi | $space-2_5 | $space-2_5 |
| [marginTop](../styles-and-themes/common-units/#size)-HtmlVideo | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Image-markdown | $space-4 | $space-4 |
| [marginTop](../styles-and-themes/common-units/#size)-Text-markdown | $space-3 | $space-3 |
| [padding](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Admonition | $space-2 | $space-2 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Blockquote | $space-2_5 | $space-2_5 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Markdown | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Blockquote | $space-6 | $space-6 |
| [paddingLeft](../styles-and-themes/common-units/#size)-Admonition | $space-2 | $space-2 |
| [paddingLeft](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Admonition | $space-6 | $space-6 |
| [paddingRight](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Admonition | $space-3 | $space-3 |
| [paddingTop](../styles-and-themes/common-units/#size)-Blockquote | $space-3 | $space-3 |
| [paddingTop](../styles-and-themes/common-units/#size)-Markdown | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Admonition | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Blockquote | *none* | *none* |
| [size](../styles-and-themes/common-units/#size)-icon-Admonition | $space-5 | $space-5 |
| [textAlign](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-Text | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-accent-Blockquote | 3px | 3px |
| [wordBreak](../styles-and-themes/common-units/#word-break)-Text | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-Text | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-Text | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-Text | *none* | *none* |
