%-DESC-START

**Key features:**
- **Rich formatting**: Support for headings, bold, italic, lists, links, images, blockquotes, and code blocks
- **Dynamic content**: Use &#64;{} binding expressions to inject variables and function results
- **File loading**: Load Markdown content from external files using the `data` property
- **HTML**: Use a subset of HTML directly in Markdown

## Acquiring content

You can specify Markdown content in these ways.

### The content property

Render Markdown content that you calculate or get from other components.

### The data property

Render Markdown content from an URL.

### Nested text

Render Markdown content that you place directly in a Markdown component.

## Whitespace and special characters

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

## Supported elements

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

## Native HTML

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


## Binding Expressions

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

%-DESC-END

%-STYLE-START
The component itself cannot be styled, but the components that render the final text have customizable style variables.

[`Text`](/components/Text#styling)
[`Heading`](/components/Heading#styling)
[`Link`](/components/Link#styling)
[`Image`](/components/Image#styling)
[`Checkbox`](/components/Checkbox#styling)


%-STYLE-END

%-PROP-START content

Use this property when the text you provide is not static but a result of calculations (you assemble the text or get it from other components).


%-PROP-END

%-PROP-START removeIndents

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

%-PROP-END

%-PROP-START showHeadingAnchors

If this property is not set, the engine checks if `showHeadingAnchors` flag is turned on in the global configuration (in the `appGlobals` configuration object) and displays the heading anchor accordingly.

%-PROP-END