# XMLUI codefences and playgrounds

You can use the `xmlui` directive for a plain codefence with XMLUI syntax highlighting. This markup:

<pre>
```xmlui
&lt;Button label="Hello World" onClick="toast('click')/">
```
</pre>

produces this rendering:

```xmlui
<Button label="Hello World" onClick="toast('click')/">
```

Or you can use the `xmlui-pg` directive to define a live XMLUI playground. This markup:

<pre>
ˋˋˋxmlui-pg
&lt;Button label="Hello World" onClick="toast('click')"/>
ˋˋˋ
</pre>

produces this playground:

```xmlui-pg
<Button label="Hello World" onClick="toast('click')"/>
```

See [Reproducible XMLUI](https://blog.xmlui.org/blog/xmlui-playground) for an overview of how these playgrounds support the XMLUI documentation and also enable XMLUI developers to share issues and bug reports in a reproducible way.

If you click the ![popout](/resources/pg-popout.svg) icon on the playground above you land in [this playground](
https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE1WRQWvcQAyF%2F8rwCCQBu3FLchmaHppLLz01tIc6lFmP7B0yloYZbeJm8X8v42wDuek9SR8P6Yiijr2LwgR7hEsJFp%2B%2FHlSFTXQ7irc9vlGMYn5Jjr6HEb6LYXi87aHiil6cD1WeX%2Fa4%2BtIzGgwyJ2FiLbC%2FH6rmMUwVr3uaqbpHBA%2BLZY6H0HoZChrQosS%2B%2FLc3UJQMi7OtaFMOs8t%2F25uuQ%2FPK%2BulyqeBRWH%2BEF4LFx%2Bu0oMHODY9TlgP7u235nhZtB%2FF1JE%2B7izHLbE7gcsijG6j91HUmm8nszJXpPlxfokFy3gee3q2flVSnuz83WNeHdW0gSYPwa5KwkL%2Bv2WBHFws1KM8uJfJvOmV6CvT8faOdPMmBWF3FwGIvObwIq4to4AYNT3RCvj%2FZqbU9DzFMe92uxkqssNs31%2FUfPnQFWOQBAAA%3D) where you can run and modify the app. Changes you make there won't persist in the URL, but you can use [this codefence authoring tool](https://xmlui-codefence-runner.netlify.app/) to write playgrounds that do produce persistent shareable URLs.

> [!INFO]
> The `xmlui` and `xmlui-pg` codefences in this document use an alternate Unicode character to represent the backtic so the codefences shown here can display without interpretation. If you copy these examples into the codefence authoring tool you'll need to replace them with real backtics.

## Application context

Use the `---app` directive to show a complete app with full `App` context and a specified height. This markup:

<pre>
`ˋˋxmlui-pg height="160px"
---app
&lt;App>
  &lt;NavPanel>
    &lt;NavLink label="Home" to="/" />
    &lt;NavLink label="Page 2" to="/page2" />
  &lt;/NavPanel>
  &lt;Pages>
    &lt;Page url="/">
      &lt;Button label="Hello World" onClick="toast('click')" />
    &lt;/Page>
    &lt;Page url="/page2">
      &lt;Text>page 2&lt;/Text>
    &lt;/Page>
  &lt;/Pages>
&lt;/App>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg height="160px"
---app
<App>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Page 2" to="/page2" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <Button label="Hello World" onClick="toast('click')" />
    </Page>
    <Page url="/page2">
      <Text>page 2</Text>
    </Page>
  </Pages>
</App>
```

## Component context

Use the `---comp` directive to define a component. This markup:

<pre>
`ˋˋxmlui-pg height="160px"
---app
&lt;App>
  &lt;NavPanel>
    &lt;NavLink label="Home" to="/" />
    &lt;NavLink label="Page 2" to="/page2" />
  &lt;/NavPanel>
  &lt;Pages>
    &lt;Page url="/">
      &lt;HelloButton />
    &lt;/Page>
    &lt;Page url="/page2">
      &lt;Text>page 2&lt;/Text>
    &lt;/Page>
  &lt;/Pages>
&lt;/App>
---comp
&lt;Component name="HelloButton">
  &lt;Button label="Hello World" onClick="toast('click')" />
&lt;/Component>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg height="160px"
---app
<App>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Page 2" to="/page2" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <HelloButton />
    </Page>
    <Page url="/page2">
      <Text>page 2</Text>
    </Page>
  </Pages>
</App>
---comp
<Component name="HelloButton">
  <Button label="Hello World" onClick="toast('click')" />
</Component>
```


## Description block

Use the `---desc` directive to add Markdown-based comments between blocks.

Use `display` with `---app` or `---comp` to display the source of a block.

This markup:

<pre>
`ˋˋxmlui-pg height="160px"
---app display
&lt;App>
  &lt;NavPanel>
    &lt;NavLink label="Home" to="/" />
    &lt;NavLink label="Page 2" to="/page2" />
  &lt;/NavPanel>
  &lt;Pages>
    &lt;Page url="/">
      &lt;HelloButton />
    &lt;/Page>
    &lt;Page url="/page2">
      &lt;Text>page 2&lt;/Text>
    &lt;/Page>
  &lt;/Pages>
&lt;/App>
---desc
We define a `HelloButton` component for use in the app.
---comp display
&lt;Component name="HelloButton">
  &lt;Button label="Hello World" onClick="toast('click')" />
&lt;/Component>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg height="160px"
---app display
<App>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Page 2" to="/page2" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <HelloButton />
    </Page>
    <Page url="/page2">
      <Text>page 2</Text>
    </Page>
  </Pages>
</App>
---desc
We define a `HelloButton` component for use in the app.
---comp display
<Component name="HelloButton">
  <Button label="Hello World" onClick="toast('click')" />
</Component>
```

## API configuration

Use the `---api` directive to define an API. This markup:

<pre>
`ˋˋxmlui-pg name="list of fruits"
---app
&lt;App>
  &lt;List data="/api/fruits" />
&lt;/App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.fruits = [
    { id: 1, name: 'Orange' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Pear' },
  ]",
  "operations": {
    "get-fruits": {
      "url": "/fruits",
      "method": "get",
      "handler": "return $state.fruits;"
    }
  }
}
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg name="list of fruits"
---app
<App>
  <List data="/api/fruits" />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.fruits = [
    { id: 1, name: 'Orange' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Pear' },
  ]",
  "operations": {
    "get-fruits": {
      "url": "/fruits",
      "method": "get",
      "handler": "return $state.fruits;"
    }
  }
}
```


## Supported modifiers


### display

Use `display` to show source. This markup:

<pre>
ˋˋˋxmlui-pg
---app display
&lt;App>
  &lt;Button label="Hello World" />
&lt;/App>
ˋˋˋ
</pre>

produces this playground:

```xmlui-pg
---app display
<App>
  <Button label="Hello World" />
</App>
```


### copy

Use `copy` with `display` to add a button that copies the source.

<pre>
ˋˋˋxmlui-pg
---app display copy
&lt;App>
  &lt;Button label="Hello World" />
&lt;/App>
ˋˋˋ
</pre>

produces this playground:

```xmlui-pg
---app display copy
<App>
  <Button label="Hello World" />
</App>
```

### name

Provides a descriptive name for the example.

This markup:

<pre>
ˋˋˋxmlui-pg  name="Named example"
---app
&lt;App>
  &lt;Text>This is a named example</Text>
&lt;/App>
ˋˋˋ
</pre>

produces this playground:

```xmlui-pg
---app display
<App>
  <Text>This is a named example</Text>
</App>
```



### filename
Specifies a filename for the code block, useful for multi-file examples or showing file context.

This markup:

<pre>
```xmlui filename="Main.xmlui"
&lt;App>
  &lt;Button label="Main App" />
&lt;/App>
```
</pre>

produces this rendering:

```xmlui filename="Main.xmlui"
<App>
  <Button label="Main App" />
</App>
```

## Highlighting

You can highlight whole lines or parts of lines.

### Single line

This markup:

<pre>
ˋˋˋxmlui-pg
---app display {3}
&lt;App>
  &lt;VStack>
    &lt;Button label="This line is highlighted" />
  &lt;/VStack>
&lt;/App>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg
---app display {3}
<App>
  <VStack>
    <Button label="This line is highlighted" />
  </VStack>
</App>
```


### Multiple lines (comma-separated)

This markup:

<pre>
ˋˋˋxmlui-pg
---app display {3, 4}
&lt;App>
  &lt;VStack>
    &lt;Button label="Button 1" />
    &lt;Button label="Button 2" />
    &lt;Button label="Button 3" />
  &lt;/VStack>
&lt;/App>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg
---app display {3, 4}
<App>
  <VStack>
    <Button label="Button 1" />
    <Button label="Button 2" />
    <Button label="Button 3" />
  </VStack>
</App>
```

### Line ranges

This markup:

<pre>
ˋˋˋxmlui-pg
---app display {3-5}
&lt;App>
  &lt;VStack>
    &lt;Button label="Button 1" />
    &lt;Button label="Button 2" />
    &lt;Button label="Button 3" />
  &lt;/VStack>
&lt;/App>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg
---app display {3-5}
<App>
  <VStack>
    <Button label="Button 1" />
    <Button label="Button 2" />
    <Button label="Button 3" />
  </VStack>
</App>
```

### Mixed ranges and individual lines

This markup:

<pre>
ˋˋˋxmlui-pg
---app display {1, 3-5, 7}
&lt;App>
  &lt;VStack>
    &lt;Button label="Button 1" />
    &lt;Button label="Button 2" />
    &lt;Button label="Button 3" />
  &lt;/VStack>
&lt;/App>
ˋˋˋ
</pre>

produces this rendering:

```xmlui-pg
---app display {1, 3-5, 7}
<App>
  <VStack>
    <Button label="Button 1" />
    <Button label="Button 2" />
    <Button label="Button 3" />
  </VStack>
</App>
```


### Matches

## Attribute name and value

This markup:

<pre>
ˋˋˋxmlui-pg
---app display  /variant="outlined"/
&lt;App>
  &lt;Button label="Highlighted Attribute" variant="outlined" themeColor="primary" />
&lt;/App>
ˋˋˋ
</pre>


produces this rendering:

```xmlui-pg
---app display  /variant="outlined"/
<App>
  <Button label="Highlighted Attribute" variant="outlined" themeColor="primary" />
</App>
```


### Attribute names

This markup:

<pre>
ˋˋˋxmlui-pg
---app display  /name/ /size/
&lt;App>
    &lt;Icon name="star" size="lg" />
&lt;/App>
```
</pre>


produces this rendering:

```xmlui-pg
---app display /name/ /size/
<App>
  <Icon name="star" size="lg" />
</App>
```

### Red border highlighting

Use `!` before the forward slash delimiters produces a red border instead of the standard highlight.

This markup:

<pre>
```xmlui !/{ 6 * 7 }/
---app display !/{ 6 * 7 }/
&lt;App>
  &lt;Text value="Life, the universe, and everything: { 6 * 7 }" />
&lt;/App>
```
</pre>

produces this rendering:

```xmlui-pg
---app display !/{ 6 * 7 }/
<App>
  <Text value="Life, the universe, and everything: { 6 * 7 }" />
</App>
```

## Modifier combinations

Modifiers can be combined in various ways.

- `copy display` - Shows both code and rendered output with copy functionality
- `display noHeader` - Display without header section
- `{lines} copy` - Copyable code with line highlighting
- `/pattern/ copy` - Pattern highlighting with copy button
- `copy display name="..."` - Named example with copy and display
- `copy display name="..." height="..."` - Full-featured playground with custom height
- `copy display name="..." /pattern/` - Named example with pattern highlighting

## Quick reference

### Fence Types
| Type | Purpose |
|------|---------|
| `xmlui` | Standard XMLUI code display |
| `xmlui-pg` | Interactive playground |
| `---app` | Application context in multi-file examples |
| `---comp` | Component context in multi-file examples |
| `---api` | Mock API configuration (JSON) |
| `---desc` | Narrative description block |

### Modifiers
| Modifier | Effect |
|----------|--------|
| `copy` | Adds copy button |
| `display` | Shows rendered output |
| `noHeader` | Hides header section |
| `name="..."` | Sets example title |
| `height="XXXpx"` | Sets container height |
| `filename="..."` | Shows filename context |

### Highlighting
| Syntax | Purpose |
|--------|---------|
| `{3}` | Highlight line 3 |
| `{2,4,6}` | Highlight multiple lines |
| `{2-4}` | Highlight line range |
| `{2-4, 7}` | Mixed ranges and individual lines |
| `/pattern/` | Highlight pattern matches |
| `!/pattern/` | Red border highlight for pattern |

