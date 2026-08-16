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

## XMLUI playground apps

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

%-DESC-END

%-STYLE-START
The component itself cannot be styled, but the components that render the final text have customizable style variables.

[`Text`](/docs/reference/components/Text#styling)
[`Heading`](/docs/reference/components/Heading#styling)
[`Link`](/docs/reference/components/Link#styling)
[`Image`](/docs/reference/components/Image#styling)
[`Checkbox`](/docs/reference/components/Checkbox#styling)


%-STYLE-END

%-PROP-START content

Use this property when the text you provide is not static but a result of calculations (you assemble the text or get it from other components).


%-PROP-END

%-PROP-START interpolateBindings

By default, `Markdown` evaluates `@{...}` binding expressions in its content. That is convenient for text you author, but risky for text that arrives at runtime as **data** — transcripts, logs, or user input.

The collision is a bare `@` immediately followed by `{`, which is common in real code and markup: PowerShell hashtables (`@{ LogName = "System" }`), Razor/Blazor code blocks (`@{ ... }`), Objective-C dictionary literals (`@{ @"k": v }`), Perl dereferences (`@{ $ref }`), and LaTeX column specs (`@{...}`). When such text is evaluated as a binding it produces wrong output or an error — and an empty `@{}` (e.g. a LaTeX inter-column spec) is silently **removed** rather than shown.

Set `interpolateBindings="false"` for data-fed content so every `@{...}` sequence renders literally:

```xmlui-pg copy display name="Example: interpolateBindings"
<App var.logLine="{'Get-WinEvent -FilterHashtable @{ LogName = System; Id = 3077 }'}">
  <Markdown interpolateBindings="false" content="{logLine}" />
</App>
```

%-PROP-END

%-PROP-START allowHtml

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

If this property is not set, the engine checks if the `showHeadingAnchors` flag is turned on in `xmluiConfig` and displays the heading anchor accordingly.

%-PROP-END

+%-PROP-START truncateLinks

```xmlui-pg copy display name="Example: truncateLinks property"
<App>
  <Markdown truncateLinks="true">
    <![CDATA[
This is a long link truncated for display: https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE1VSS2vjMBD%2BK2LIYRdsy7u0F%2BEGlvbYPSXspQmLYo0dUXskpHHqNvi%2FL1Lchd7m9T1mmCtE1mT04AhBXUF7DwqaX95vDyRE82wjC6NZPxzgzOyjklJ7W3E3VL27VNOrHCyhHJ1BydMJZWTNUzxAxgshmj3OvL1uLONYkR5xUWLNEnKXxzG%2B1MfqBt3hBYPl9yeMbbCeraOlkZklW5LJ0%2FZAjby5hAJaN3pHSBxBvRxTTp3t0z5JEBQ8OzKOxH46obgpQgF8xhET4grWgIJ5HCZbGtemJs6MZOJnOYsMLoCCTQ5KH%2Byow3t5X9efXH90iEm0c8Q7%2B5GEf9z5GQo46fa1D24i85jBaZuydSaNhP70rQtuFCtxnEKnWyx%2F1rUIohcnIUVd3X2HArw2xlL%2FBb6JPk3Xf%2B9hWY7LUoDLN7s5sTOaffIGqtNDxALim%2FYezf%2FcB7xYfPud2daaCxaJdaIBBWcX7Icj1gMUoFu2F1wpv55sbeVPgsH2Z85XI0ZiUPm1luUfOQ4%2BonECAAA%3D
    ]]>
  </Markdown>
</App>
```

%-PROP-END

%-PROP-START breakMode

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

%-PROP-END

%-PROP-START overflowMode

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

%-PROP-END
