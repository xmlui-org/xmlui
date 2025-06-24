# Markdown [#markdown]

`Markdown` renders formatted text using markdown syntax. Use [Text](/working-with-text) for simple, styled text content, and `Markdown` when you need [rich formatting](/working-with-markdown).

**Key features:**
- **Rich formatting**: Support for headings, bold, italic, lists, links, images, blockquotes, and code blocks
- **Dynamic content**: Use `@{}` binding expressions to inject variables and function results
- **File loading**: Load markdown content from external files using the `data` property
- **Binding expressions**: Evaluate variables and function calls within markdown content

## Using Markdown [#using-markdown]

The `Markdown` component allows you to specify its textual content in two ways:
- You can leverage the `content` property. Use this property when the text you provide is not static but a result of calculations (you assemble the text or get it from other components).
- You declare nested text.

As whitespaces (such as spaces and line breaks) have significance in Markdown, you should wrap the text between the `<![CDATA[` and `]]>` XMLUI tags, which preserve all whitespaces.

Indentation is also essential in Markdown. Start the markdown text in the first column as the following sample shows:

```xmlui-pg copy display height="500px" name="Example: setting text"
<App layout="horizontal-sticky">
  <Markdown>
    <![CDATA[
# My Adventure in Markdown Land [#my-adventure-in-markdown-land]

## The Beginning [#the-beginning]

In the bustling city of Markdownville, I embarked on a journey to discover the 
secrets of Markdown. My adventure started in the heart of the city, where the 
first rule of Markdown was inscribed in stone:

"To create a heading, add number signs (#) in front of a word or phrase.
The number of number signs you use should correspond to the heading level."

Headings give hierarchy to text but sometimes **emphasizing something with bold 
is just enough**.

If not bold, then simply *italic letters give visual diversity*.

## Exploring Blockquotes [#exploring-blockquotes]

As I journeyed further, I encountered blockquotes that spoke of the beauty of 
simplicity:

> Blockquotes can contain multiple paragraphs. Add a > on the blank lines between 
> the paragraphs.
> > Like so

## The Power of Lists [#the-power-of-lists]

I also discovered the power of lists, which were as versatile as the inhabitants 
of Markdownville:

- This is the first list item.
- Here's the second list item.
    - A subsection here would look great below the second list item.
- And here's the third list item.

I found that I can create ordered lists as well:

1. The first item.
2. The second item.
3. Third item.

## The Image [#the-image]

Text is not the only thing I found through my journey. The power of images 
materialized in front of me:

![Colors image](/resources/images/components/markdown/colors.png)

## Navigating with Hyperlinks [#navigating-with-hyperlinks]

Hyperlinks, like signposts, marked other paths that branched off from the road 
I was treading:
- [Source of all truth](https://github.com/xmlui-com/xmlui)
- [Back to where we started](https://ncrm.azurewebsites.net/)

## The Horizontal Rule [#the-horizontal-rule]

In the quiet corners of Markdownville, I found the Horizontal Rule, a line that 
symbolizes the end of a section:

***
    ]]>
  </Markdown>
</App>
```

The `Markdown` component supports these syntax elements:
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

WIP elements:
- Table (GFM syntax)
- Tasklist (GFM syntax)
- Footnote (GFM syntax)

> **GFM** stands for Github Flavored Markdown

These are also found in the **Basic Syntax** table of [this markdown guide](https://www.markdownguide.org/cheat-sheet/).
Note that further components may be added later,
like elements from the [Github Flavored Markdown or GFM syntax](https://github.github.com/gfm/).

## Binding Expressions [#binding-expressions]

Our `Markdown` component is capable of evaluating binding expressions just as other XMLUI components.
Use the `@{}` syntax to wrap expressions that need to be evaluated.

Empty `@{}` expressions are removed.
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

```xmlui-pg copy display name="Example: content property"
<App>
  <VStack>
    <Items data="{[
      {id: 123, name: 'Peter Parker'},
      {id: 234, name: 'Clark Kent'},
      {id: 345, name: 'Bruce Wayne'}
    ]}">
      <Markdown content="{'## ' + $item.id + '\n*' + $item.name + '*' }"/>
    </Items>
  </VStack>
</App>
```

### `removeIndents (default: true)` [#removeindents-default-true]

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

The component itself cannot be styled.

However, the components that are used render the final text, have customizable style variables.

The components used to render the final styled text are either used as regular XMLUI components.
See the links for styling details:
[`Text`](./Text.mdx#styling)
[`Heading`](./Heading.mdx#styling)
[`Link`](./Link.mdx#styling)
[`Image`](./Image.mdx#styling)
[`Checkbox`](./Checkbox.mdx#styling)

Or they are components specifically created and used in the Markdown component.

>[!INFO]
> Components falling into this latter case are only available under the `Markdown` component. They cannot be instantiated in regular XMLUI.

These markdown-specific components are the following:

### Blockquote [#blockquote]

A blockquote is a sentence or paragraph specially formatted to draw attention to the reader. You can use the following theme variables with blockquotes:

- `accent-Blockquote`: sets the color of the strip running down on the left side of the block
- `backgroundColor-Blockquote`: sets the background color
- `margin-Blockquote`: sets the margin
- `padding-Blockquote`: sets the padding
- `borderRadius-Blockquote`: sets the radius of the border for the block
- `boxShadow-Blockquote`: specifies the x offset, y offset, blur radius and color for the block shadow

```xmlui-pg copy display name="Example: styling a horizontal rule" height="260px"
<App>
  <Theme
    accent-Blockquote="transparent"
    backgroundColor-Blockquote="rgba(27, 195, 50, 0.3)"
    margin-Blockquote="8px"
    padding-Blockquote="16px"
    borderRadius-Blockquote="8px"
    boxShadow-Blockquote="5px 10px 5px green"
  >
    <Markdown>
      <![CDATA[
> This text is in a blockquote.
> > This one has an even bigger emphasis, since it is nested.
> > > This one is nested even deeper.
> Continue the original block.
      ]]>
    </Markdown>
  </Theme>
</App>
```

### HorizontalRule [#horizontalrule]

This element visually separates content. The following theme variables influence how the rule looks like:

- `borderColor-HorizontalRule`: changes the color
- `borderStyle-HorizontalRule`: changes the border style to any [CSS border style](https://developer.mozilla.org/en-US/docs/Web/CSS/border-style), default is `solid`
- `borderWidth-HorizontalRule`: changes how tall the rule should be, default is 1px

```xmlui-pg copy display name="Example: styling a horizontal rule"
<App>
  <Theme 
    borderColor-HorizontalRule="red"
    borderWidth-HorizontalRule="8px"
    borderStyle-HorizontalRule="dotted"
  >
    <Markdown>
      <![CDATA[
Section 1

---

Section 2
      ]]>
    </Markdown>
  </Theme>
</App>
```

>[!INFO]
> The `HorizontalRule` component looks similar to the `ContentSeparator` component. They are not the same and are styled separately.

### ListItem [#listitem]

These are the supported theme variables in an ordered or unordered list:

- `paddingLeft-ListItem`: determines how big the gap should be between the list item contents and the item marker

```xmlui-pg copy display name="Example: styling a list item"
<App>  
  <Theme paddingLeft-ListItem="40px"> 
    <Markdown>
      <![CDATA[
1. Get in the driver's seat and buckle up
2. Insert the key into the ignition
3. Put the gearstick in either the "P" or "N" position
4. Twist the ignition key to start the car
      ]]>
    </Markdown>
  </Theme>
</App>
```

### OrderedList [#orderedlist]

This element represents an ordered list with Arabic numbers as markers.
Lists can be nested into one another; the counter will start anew if nested. Ordered lists support these theme variables:

- `paddingLeft-OrderedList`: determines how much space the list should have from the left

```xmlui-pg copy display name="Example: styling an ordered list"
<App>
  <Theme paddingLeft-OrderedList="80px">
    <Markdown>
      <![CDATA[
1. Get in the driver's seat and buckle up
2. Insert the key into the ignition
3. Put the gearstick in either the "P" or "N" position
4. Twist the ignition key to start the car
    ]]>
    </Markdown>
  </Theme>
</App>
```

### UnorderedList [#unorderedlist]

This element represents an unordered list with marker symbols. Lists can be nested into one another; different levels of nested lists will have different markers. These are the theme variables unordered lists support:

- `paddingLeft-UnorderedList`: determines how much space the list should have from the left

```xmlui-pg copy display name="Example: styling an unordered list"
<App>
  <Theme paddingLeft-UnorderedList="80px">
    <Markdown>
      <![CDATA[
- Get in the driver's seat and buckle up
- Insert the key into the ignition
- Put the gearstick in either the "P" or "N" position
- Twist the ignition key to start the car
- Know that cars may refuse to start for any number of reasons
    - Consult your car's manual
    - Take your car to a mechanic
        - If all else fails, troubleshoot the car yourself
      ]]>
    </Markdown>
  </Theme>
</App>
```

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| accentColor-Blockquote | $color-surface-500 | $color-surface-500 |
| accentWidth-Blockquote | 3px | 3px |
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
| [direction](../styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-H1-markdown | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| fontVariant-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text | *none* | *none* |
| iconSize-Admonition | $space-5 | $space-5 |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| lineBreak-Text | *none* | *none* |
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
| [marginLeft](../styles-and-themes/common-units/#size)-Admonition-content | $space-1_5 | $space-1_5 |
| [marginLeft](../styles-and-themes/common-units/#size)-Image-markdown | $space-0 | $space-0 |
| [marginRight](../styles-and-themes/common-units/#size)-Image-markdown | $space-0 | $space-0 |
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
| textAlign-Text | *none* | *none* |
| textAlignLast-Text | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| textIndent-Text | *none* | *none* |
| textShadow-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| wordBreak-Text | *none* | *none* |
| wordSpacing-Text | *none* | *none* |
| wordWrap-Text | *none* | *none* |
| writingMode-Text | *none* | *none* |
