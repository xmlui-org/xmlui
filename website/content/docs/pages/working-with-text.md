# Working with Text

Text elements appear in UI components such as menu items, titles, headings, labels, and descriptions. There is also a [Markdown](/docs/reference/components/Markdown) component for complete text documents (like this page). We'll cover `Text` here and `Markdown` in the [next chapter](/docs/guides/working-with-markdown).

You can nest text in any component that renders its children.


```xmlui-pg display name="Example: displaying text"
<App>
  This is text!
  <Button label="This is text too." />
  This is more text!
</App>
```

To gain more control we can use the  `Text` component.

```xmlui-pg display name="Example: Using the Text component"
<App>
  <Text fontSize="1.5rem" color="purple">This is a text!</Text>
  <Button label="I'm just a button" />
  <Text backgroundColor="lightgreen">This is another text!</Text>
</App>
```

Components that render text support theme variables. You can use them, for example, to control the styling of the heading family of components ([Heading](/docs/reference/components/Heading), [H1](/docs/reference/components/H1), [H2](/docs/reference/components/H2), etc).

```xmlui-pg display name="Example: Text can be styled"
<App>
  <Theme
    textColor-H1 = "red"
    textColor-H2 = "green">
    <H1>My Main Title</H1>
    This document contains several sections.
    <H2>Section Title</H2>
  </Theme>
</App>
```

## Specifying text content

Components like `Text`, `H1` and `Badge` can display text in two ways:

- **Nesting text**
- **Setting the `value` property**

We've seen nesting, here's an example that uses the `value` property.

```xmlui-pg display name="Example: Text and the value property"
<App>
  <H2 value="Text Content with Properties" />
  <Text value="This text is set in the 'value' property of 'Text'." />
</App>
```

>[!INFO]
> With nested text, multiple consecutive spaces or newlines collapse to a single space. That doesn't happen when you set text using the `value`.

Whitespace collapsing enables you to maintain source text that's broken into multiple lines for easier editing.

The collapsed view renders neatly.

```xmlui-pg display name="Example: whitespace collapsing"
<App>
  This is a long text broken into multiple lines.

  The source markup would be challenging to read if

  the entire text were specified in a single line.
</App>
```


## Binding expressions

Binding expressions are placeholders for computed values.


```xmlui-pg display name="Try the reset button!"
<App>
   Seconds of the current minute: { getDate().getSeconds() }
</App>
```

Results of binding expressions are displayed with collapsed whitespace.


## Inline and block rendering

When you render text, it accommodates the current layout context. If that context uses inline rendering, the text is rendered inline; otherwise, it renders as a block.

In an `HStack`, text segments render inline.

```xmlui-pg copy display name="Example: inline rendering"
<App>
  <HStack>
    Show me a trash
    <Icon name="trash"/>
    icon!
  </HStack>
</App>
```



In a `VStack` they render as blocks.

```xmlui-pg copy display name="Example: block rendering"
<App>
  <VStack>
    Show me a trash
    <Icon name="trash"/>
    icon!
  </VStack>
</App>
```

## Non-breaking spaces

Use `&nbsp;` to preserve spaces in a context where they would otherwise collapse.

```xmlui-pg copy display name="Example: non-breaking spaces"
<App>
  A series of non-breaking segments: [1&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;&nbsp;4]
</App>
```


## Long text

With long text you may need to control how that text is broken into new lines (if at all) and how to handle overflows. By default a long text breaks into multiple lines.

```xmlui-pg copy display name="Example: text breaks into multiple lines"
<App>
  <Text width="200px">
    This long text does not fit into a width constraint of 200 pixels.
  </Text>
</App>
```

If necessary, breaks occur within a word.

```xmlui-pg copy display name="Example: break within a word"
<App>
  <Text width="200px">
    ThisLongTextDoesNotFitInTheGivenConstraint of 200 pixels wide.
   </Text>
</App>
```

## Preserving line breaks

Sometimes you want to preserve line breaks, as when inspecting a JSON object.

```xmlui-pg copy display name="Example: preserving line breaks" /preserveLinebreaks="true"/
<App
  var.data = "{
    {
      apples: 3,
      oranges: 4
    }
  }"
>
  <Text preserveLinebreaks="false">
    { JSON.stringify(data, null, 2) }
  </Text>
  <Text preserveLinebreaks="true">
    { JSON.stringify(data, null, 2) }
  </Text>
</App>
```

## Variants of the Text component

In addition to the theme variables that govern the `Text` component, you can use the [`variant`](/docs/reference/components/Text#variant) property to control styles directly.

```xmlui-pg
<App>
  <HStack>
    <Text width="150px">default:</Text>
    <Text>This is an example text</Text>
  </HStack>
  <HStack>
    <Text width="150px">paragraph:</Text>
    <Text variant="paragraph">This is an example paragraph</Text>
  </HStack>
  <HStack>
    <Text width="150px">placeholder:</Text>
    <Text variant="placeholder">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">secondary:</Text>
    <Text variant="secondary">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">code:</Text>
    <Text variant="code">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">codefence + code:</Text>
    <Text variant="codefence">
      <Text variant="code">
        This is an example text
      </Text>
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">keyboard:</Text>
    <Text variant="keyboard">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">sup:</Text>
    <Text>
      This is an example text
      <Text variant="sup">(with some additional text)</Text>
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">sub:</Text>
    <Text>
      This is an example text
      <Text variant="sub">(with some additional text)</Text>
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">mono:</Text>
    <Text variant="mono">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">strong:</Text>
    <Text variant="strong">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">small:</Text>
    <Text variant="small">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">caption:</Text>
    <Text variant="caption">
      This is an example text
    </Text>
  </HStack>
</App>
```

