# Working with Text

Text elements are frequently used in most apps as a part of the UI:
in menu items, titles, headings, labels, descriptions, etc.
This article goes into the nitty-gritty details of working with text components.

## Implicit and Explicit Text

<Callout type="info" emoji="💡">
  The engine makes it easy to use text.
  When you nest text in any component that renders its children (such as layout containers and many others), the engine converts them to a body of text.
</Callout>

```xmlui copy {2, 4}
<App>
  This is a text!
  <Button label="I'm just a button" />
  This is another text!
</App>
```

<Playground
  name="Implicit text"
  horizontal
  app={`
    <App>
      This is a text!
      Another line
      <Button label="I'm just a button" />
      This is another text!
    </App>
  `}
/>

This "implicit" text is often unsuitable for a particular context, as you intend to modify the appearance of the text or attach events to it.

<Callout type="info" emoji="💡">
  Use the `Text` component to explicitly style text.
</Callout>

The following example shows how you can use the `Text` component:

```xmlui copy {2, 4}
<App>
  <Text fontSize="1.5rem" color="purple">This is a text!</Text>
  <Button label="I'm just a button" />
  <Text backgroundColor="green">This is another text!</Text>
</App>
```

<Playground
  name="Explicit text"
  horizontal
  app={`
    <App>
      <Text fontSize="1.5rem" color="purple">This is a text!</Text>
      <Button label="I'm just a button" />
      <Text backgroundColor="green">This is another text!</Text>
    </App>
  `}
/>

Besides the `Text` component, other components rendering text do so with custom formatting.

<Callout type="info" emoji="💡">
  Use the heading family of components (`Heading`, `H1`, `H2`, ..., and `H6`) display the text as headings.
</Callout>

```xmlui copy {2, 4}
<App>
  <H1>My Main Title</H1>
  This document contains several sections.
  <H2>Section Title</H2>
</App>
```

<Playground
  name="Explicit text with Headings"
  horizontal
  app={`
    <App>
      <H1>My Main Title</H1>
      This document contains several sections.
      <H2>Section Title</H2>
    </App>
  `}
/>

## Specifying Text Content

Components displaying text offer two ways to do so:

- **Using a component property.** You can set the value of this property to tell the component what to display.
- **Nested text**. You nest the text to display in the component.

<Callout type="info" emoji="📔">
  All the examples shown earlier in this article used the nested text approach.
</Callout>

In the following example, all text-related components use their corresponding property to set their text:

```xmlui copy {2, 3}
<App>
  <H2 value="Text Content with Properties" />
  <Text value="This text is set in the 'value' property of 'Text'." />
</App>
```

<Playground
  name="Using Properties for Text Contents"
  horizontal
  app={`
    <App>
      <H2 value="Text Content with Properties" />
      <Text value="This text is set in the 'value' property of 'Text'." />
    </App>
  `}
/>

There is a significant difference between the two ways you can define text:

- The nested text uses HTML whitespace collapsing.
- The `value` property ignores HTML whitespace collapsing.

<Callout type="info" emoji="📔">
  If you add extra or consecutive white spaces or newlines to the code, HTML will regard it as one white space.
  This feature is known as HTML whitespace collapsing.
</Callout>

Whitespace collapsing is a helpful feature. The following code shows how this feature combines text into one continuous text that is broken into multiple lines (this ensures better readability):

```xmlui copy
<App>
  This is a long text broken into multiple lines

  to demonstrate HTML whitespace collapsing.  The

  source markup would be challenging to read if

  the entire text were specified in a single line.

  Breaking into lines helps this situation, and the

  text renders neatly.
</App>
```

<Playground
    name="HTML Whitespace Collapsing"
    horizontal
    app={`
    <App>
     This is a long text broken into multiple lines

     to demonstrate HTML whitespace collapsing.  The

     source markup would be challenging to read if

     the entire text were specified in a single line.

     Breaking into lines helps this situation, and the

     text renders neatly.
    </App>
  `}
/>

The following sample demonstrates the differences between the two ways of specifying text content:

```xmlui copy
<App>
  <H3 value="       Text with a lot   of   spaces (property)    "></H3>
  <H3>     Text with a lot   of
     spaces (nested)
  </H3>
</App>
```

<Playground
  name="Properties versus Nested text"
  horizontal
  app={`
    <App>
      <H3 value="       Text with a lot   of   spaces (property)    "></H3>
      <H3>  Text with a lot   of   spaces (nested)  </H3>
    </App>
  `}
/>

## Using Binding Expressions

<Callout type="info" emoji="💡">
  You can utilize binding expressions to define text content.
</Callout>

See this in action in the following example:

```xmlui copy
<App>
  <variable name="myValue"
    value="    Text   with   spaces to show   seconds: { getDate().getSeconds() }"/>
  <H3 value="{myValue}" />
  <H3>{myValue}</H3>
</App>
```

<Playground
  name="Vertical Stack (by default)"
  horizontal
  app={`
    <App>
      <variable name="myValue"
        value="    Text   with   spaces to show   seconds: { getDate().getSeconds() }"/>
      <H3 value="{myValue}" />
      <H3>{myValue}</H3>
    </App>
  `}
/>

You can use binding expressions in property values and nested content like text literals. They handle whitespace collapsing the same way as if you used text literals.

<Callout type="info" emoji="📔">
  You can click the **Reset** button to load the app again.
  You can observe that the `getDate().getSeconds()` expression is evaluated at every load.
</Callout>

## Inline and Block Rendering

When you render text, it accommodates the current layout context.
If that context uses inline rendering, the text is rendered inline; otherwise, it renders as a block.

In the following sample, `HStack` uses an inline context, so text segments render in a line:

```xmlui copy
<App>
  <HStack>
    Show me a trash
    <Icon name="trash"/>
    icon!
  </HStack>
</App>
```

<Playground
  name="Text Rendering in Inline Context"
  horizontal
  app={`
    <App>
      <HStack>
        Show me a trash
        <Icon name="trash"/>
        icon!
      </HStack>
    </App>
  `}
/>

In the following sample, `VStack` uses a block context.
So, the engine renders text segments as blocks in new lines:

```xmlui copy
<App>
  <VStack>
    Show me a trash
    <Icon name="trash"/>
    icon!
  </VStack>
</App>
```

<Playground
  name="Text Rendering in Block Context"
  horizontal
  app={`
    <App>
      <VStack>
        Show me a trash
        <Icon name="trash"/>
        icon!
      </VStack>
    </App>
  `}
/>

## Non-Breakable Spaces

<Callout type="info" emoji="💡">
  Use the `&nbsp;` character entity declaration to specify non-breakable spaces within a text.
</Callout>

They behave the same way as the `&nbsp;` HTML entity.

```xmlui copy
<App>
  <H2>Here are four non-breakable spaces between square brackets: [&nbsp;&nbsp;&nbsp;&nbsp;]</H2>
</App>
```

<Playground
  name="Rendering Non-Breakable Spaces"
  horizontal
  app={`
    <App>
      <H2>Here are four non-breakable spaces between square brackets: [&nbsp;&nbsp;&nbsp;&nbsp;]</H2>
    </App>
  `}
/>

## Working with Long Text

Everything works intuitively when the text fits in its container (a single line).
However, with long text, you need to control how that text is broken into new lines (if at all) and how to handle overflows.

By default, a long text breaks into multiple lines (understanding word boundaries):

```xmlui copy
<App>
  <Text width="200px" backgroundColor="olive">
    This long text does not fit into a width constraint of 200 pixels.
  </Text>
</App>
```

<Playground
  name="Example: Rendering Long Text #1"
  horizontal
  app={`
    <App>
      <Text width="200px" backgroundColor="goldenrod">
        This long text does not fit into a width constraint of 200 pixels.
      </Text>
    </App>
  `}
/>

With very long words, where word boundaries do not work, the text is broken within a word:

```xmlui copy
<App>
  <Text width="200px" backgroundColor="goldenrod">
    ThisLongTextDoesNotFitInTheGivenContrants of a 200 pixel width (and long words).
  </Text>
</App>
```

<Playground
  name="Example: Rendering Long Text #2"
  horizontal
  app={`
    <App>
      <Text width="200px" backgroundColor="goldenrod">
        ThisLongTextDoesNotFitInTheGivenContrants of a 200 pixel width (and long words).
      </Text>
    </App>
  `}
/>

### Disable Breaking the Text

<Callout type="info" emoji="💡">
  You can set the `maxLines` property of a `Text` component to **1** to avoid breaking it into multiple lines.
  If the text does not fit into a single line its ending will be cropped and the cropping is indicated by ellipses.
</Callout>

```xmlui copy {5}
<App>
  <Text
    width="200px"
    backgroundColor="goldenrod"
    maxLines="1">
    Though this long text does not fit into a single line, please do not break it!
  </Text>
</App>
```

<Playground
  name="Example: Avoid Breaking Long Text"
  horizontal
  app={`
    <App>
      <Text
        width="200px"
        backgroundColor="goldenrod"
        maxLines="1">
        Though this long text does not fit into a single line, please do not break it!
      </Text>
    </App>
  `}
/>

<Callout type="info" emoji="💡">
  If you do want to hide the ellipses, set the `ellipses` property to `false`.
</Callout>

```xmlui copy {6}
<App>
  <Text
    width="200px"
    backgroundColor="goldenrod"
    maxLines="1"
    ellipses="false">
    Though this long text does not fit into a single line, please do not break it!
  </Text>
</App>
```

<Playground
  name="Example: No Ellipses"
  horizontal
  app={`
    <App>
      <Text
        width="200px"
        backgroundColor="goldenrod"
        maxLines="1"
        ellipses="false">
        Though this long text does not fit into a single line, please do not break it!
      </Text>
    </App>
  `}
/>

### Limiting the Rendered Lines

<Callout type="info" emoji="💡">
  Use the `maxLines` property to set the maximum number of lines when displaying long text.
</Callout>

If the text fits into the allowed range, it is fully rendered.
Otherwise, it will be cropped at the maximum specified. For example, the following sample allows up to two lines:

```xmlui copy {2}
<App>
  <Text
    width="200px"
    backgroundColor="goldenrod"
    maxLines="2">
    This long text does not fit into a width constraint of 200 pixels, even with two lines.
  </Text>
</App>
```

<Playground
  name="Example: Limiting the Number of Lines"
  horizontal
  app={`
    <App>
      <Text
        width="200px"
        backgroundColor="goldenrod"
        maxLines="2">
        This long text does not fit into a width constraint of 200 pixels, even with two lines.
      </Text>
    </App>
  `}
/>

<Callout type="info" emoji="📔">
  Remember, you can use the `ellipses` prop to remove the ellipses from the end of the cropped text.
</Callout>

### Preserving Linebreaks

Occasionally, you need to preserve linebreaks within a text.

<Callout type="info" emoji="💡">
  You can set the `preserveLinebreaks` property to `true` to preserve line breaks in a text.
</Callout>

```xmlui copy {4}
<App>
  <Text
    backgroundColor="goldenrod"
    preserveLinebreaks="true"
    value="(preserve) This long text
with several line breaks
        does not fit into its container." />
  <Text
    backgroundColor="goldenrod"
    value="(do not preserve) This long text
with several line breaks
        does not fit into its container." />
</App>
```
Observe the effect of using `preserveLinebreaks`:

<Playground
    name="Example: Preserve Linebreaks"
    horizontal
    app={`
    <App>
      <Text
        backgroundColor="goldenrod"
        preserveLinebreaks="true"
        value="(preserve) This long text
    with several line breaks
            does not fit into its container." />
      <Text
        backgroundColor="goldenrod"
        value="(do not preserve) This long text
    with several line breaks
            does not fit into its container." />
    </App>
  `}
/>

<Callout type="info" emoji="📔">
  Remember to use the `value` property of `Text`.
  Linebreaks are converted to spaces when nesting text into the `Text` component.
</Callout>

## Working with Overflowing Text

In the previous sections, the text was its own container.
Most containers (e.g., `Stack`) automatically grow in size (like in height) to embed the entire text.
However, when the container width and height are constrained, it cannot accommodate the entire text.

The following example tries to contain a long text into a 200x60 pixel box:

```xmlui copy
<App>
  <VStack width="200px" height="60px" backgroundColor="goldenrod" >
    <Text>
      As its container width and height are fixed, this long text does not
      fit into it; it will overflow.
    </Text>
  </VStack>
</App>
```

The text does not fit, and it overflows its container.
This behavior is not a design flaw or a bug; it is intentional.
By perceiving the overflow, you can decide how to handle it.

<Playground
  name="Example: Text Overflow"
  horizontal
  app={`
    <App>
      <VStack width="200px" height="60px" backgroundColor="goldenrod" >
        <Text>
          As its container width and height are fixed, this long text does not
          fit into it; it will overflow.
        </Text>
      </VStack>
    </App>
  `}
/>

### Hiding the Overflown Text

The `overflowY` layout property of container component allows for defining their behavior in case of overflow.
By default, this value is set to `visible`, so the container displays the overflown text.

<Callout type="info" emoji="💡">
  Set the `overflowY` property value to `hidden` to make the container crop the overflown part of a text.
</Callout>

Observe in the sample below, not the text, but how the `overflowY` property of the container is set:

```xmlui copy {3}
<App>
  <VStack
    overflowY="hidden"
    width="200px" height="60px" backgroundColor="goldenrod">
    <Text>
      As its container width and height are fixed, this long text does not
      fit into it; it will overflow.
    </Text>
  </VStack>
</App>
```

<Playground
  name="Example: Hiding Text Overflow"
  horizontal
  app={`
    <App>
      <VStack
        overflowY="hidden"
        width="200px" height="60px" backgroundColor="goldenrod">
        <Text>
          As its container width and height are fixed, this long text does not
          fit into it; it will overflow.
        </Text>
      </VStack>
    </App>
  `}
/>

### Scrolling the Text

<Callout type="info" emoji="💡">
  You can set `overflowY` to `scroll` to make the container display a vertical scrollbar to reach the non-visible parts of the overflowing text.
</Callout>

```xmlui copy {2}
<App>
  <VStack
    overflowY="scroll"
    width="200px" height="60px" backgroundColor="goldenrod">
    <Text>
      As its container width and height are fixed, this long text does not
      fit into it; it will overflow.
    </Text>
  </VStack>
</App>
```

<Playground
  name="Example: Scrolling the Text"
  horizontal
  app={`
    <App>
      <VStack
        overflowY="scroll"
        width="200px" height="60px" backgroundColor="goldenrod">
        <Text>
          As its container width and height are fixed, this long text does not
          fit into it; it will overflow.
        </Text>
      </VStack>
    </App>
  `}
/>

### Overflowing Dimensions

The text accommodates the available space of the container if not specified otherwise on the component housing the text.

<Callout type="info" emoji="💡">
  Change the size constraints of the component to make text adhere to those constraints rather than the ones of the parent component.
</Callout>

```xmlui copy {4}
<App>
  <VStack height="40px" width="300px" backgroundColor="goldenrod">
    <Text
      width="400px"
      backgroundColor="silver" opacity="0.7">
      This text sets its size explicitly bigger than its container.
      As it does not fit into the space provided by its container - thus it overflows.
    </Text>
  </VStack>
</App>
```

Behind the semi-transparent background of the text, you can see its container in a silverish shade:

<Playground
  name="Example: Explicit Text Dimensions"
  horizontal
  height={140}
  app={`
    <App>
      <VStack height="40px" width="300px" backgroundColor="goldenrod">
        <Text
          width="400px"
          backgroundColor="silver" opacity="0.7">
          This text sets its size explicitly bigger than its container.
          As it does not fit into the space provided by its container - thus it overflows.
        </Text>
      </VStack>
    </App>
  `}
/>

### Horizontal Scrolling

Besides `overflowY`, XMLUI containers provide another layout property, `overflowX`, which has the same values (`visible`, `hidden`, `scroll`).

<Callout type="info" emoji="💡">
  To enable and handle horizontal scrolling, use the `overflowX` property.
</Callout>

```xmlui copy
<App>
  <VStack
    overflowX="scroll"
    height="60px" width="300px" backgroundColor="goldenrod">
    <Text width="400px" backgroundColor="silver" opacity="0.7">
      This text sets its size explicitly bigger than its container.
      As it does not fit into the container, it overflows.
      However, its container supports horizontal scrolling so you can
      see its content.
    </Text>
  </VStack>
</App>
```

<Callout type="info" emoji="📔">
  When you set `overflowX` to `scroll,` it will automatically set `overflowY` to `scroll` if the text exceeds its container vertically.
</Callout>

<Playground
  name="Example: Scrolling the Text Horizontally"
  horizontal
  app={`
    <App>
      <VStack
        overflowX="scroll"
        height="60px" width="300px" backgroundColor="goldenrod">
        <Text width="400px" backgroundColor="silver" opacity="0.7">
          This text sets its size explicitly bigger than its container.
          As it does not fit into the container, it overflows.
          However, its container supports horizontal scrolling so you can
          see its content.
        </Text>
      </VStack>
    </App>
`}
/>

## Text Components

### Text

The `Text` component is useful to render a body of text.
It provides a number of style variants for customization, all of which can be set via the `variant` property:

```xmlui copy
<Text variant="paragraph">This is an example paragraph</Text>
```

See some of these styles below:

<Playground
  name="Example: Text Variants"
  app={`
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
  `}
/>

See the <SmartLink href={COMPONENT_TEXT}>Text component reference</SmartLink> for a more comprehensive list of variants and details on the component properties.

### Heading

The `Heading` component renders text as headings and is useful for sectioning a body of text.
It has the same heading levels as the ones you can find in HTML.

The `level` property to sets the level of a heading:

```xmlui copy
<Heading level="h2" value="Heading Level 2" />
```

See all heading levels compared to regular text:

<Playground
  name="Example: Headings with Levels"
  app={`
  <App>
    <Heading level="h1" value="Heading Level 1" />
    <Text>Text following H1</Text>
    <Heading level="h2" value="Heading Level 2" />
    <Text>Text following H2</Text>
    <Heading level="h3" value="Heading Level 3" />
    <Text>Text following H3</Text>
    <Heading level="h4" value="Heading Level 4" />
    <Text>Text following H4</Text>
    <Heading level="h5" value="Heading Level 5" />
    <Text>Text following H5</Text>
    <Heading level="h6" value="Heading Level 6" />
    <Text>Text following H6</Text>
  </App>
  `}
/>

See more in the <SmartLink href={COMPONENT_HEADING}>Heading component reference</SmartLink>.

<Callout type="info" emoji="💡">
  You can also use specialized components named after the levels for a shorthand version.
</Callout>

```xmlui copy
<App>
  <!-- Both render the a level 2 heading -->
  <Heading level="h2" value="Heading Level 2" />
  <H2 value="Heading Level 2" />
</App>
```

<Playground
  name="Example: Specialized Headings"
  app={`
  <App>
    <Heading level="h2" value="Heading Level 2" />
    <H2 value="Heading Level 2" />
  </App>
  `}
/>

The reference documentation of the shorthand versions of the `Heading` can be found here:
<SmartLink href={COMPONENT_H1}>H1</SmartLink>,
 <SmartLink href={COMPONENT_H2}>H2</SmartLink>,
 <SmartLink href={COMPONENT_H3}>H3</SmartLink>,
 <SmartLink href={COMPONENT_H4}>H4</SmartLink>,
 <SmartLink href={COMPONENT_H5}>H5</SmartLink>,
 <SmartLink href={COMPONENT_H6}>H6</SmartLink>.

### Markdown

This component lets you write text which can be styled using markdown.

<Callout type="info" emoji="💡">
  The text needs to be wrapped in `<![CDATA[` and `]]>` XMLUI tags to preserve whitespaces.
</Callout>

```xmlui copy
<Markdown>
  <![CDATA[
# This is a heading

Just some plain old text.

1. List item #1
2. List item #2
  ]]>
</Markdown>
```

The example below shows all supported markdown syntax elements:

<Playground
  height={500}
  horizontal
  name="Example: Using Markdown"
  app={`
<App>
  <Markdown>
    <![CDATA[
# My Adventure in Markdown Land

## The Beginning

In the bustling city of Markdownville, I embarked on a journey to discover the secrets of Markdown.
My adventure started in the heart of the city, where the first rule of Markdown was inscribed in stone:

"To create a heading, add number signs (#) in front of a word or phrase.
The number of number signs you use should correspond to the heading level."

Headings give hierarchy to text but sometimes **emphasizing something with bold is just enough**.

If not bold, then simply *italic letters give visual diversity*.

## Exploring Blockquotes

As I journeyed further, I encountered blockquotes that spoke of the beauty of simplicity:

> Blockquotes can contain multiple paragraphs. Add a > on the blank lines between the paragraphs.
> > Like so

## The Power of Lists

I also discovered the power of lists, which were as versatile as the inhabitants of Markdownville:

- This is the first list item.
- Here's the second list item.
    - A subsection here would look great below the second list item.
- And here's the third list item.

I found that I can create ordered lists as well:

1. The first item.
2. The second item.
3. Third item.

## The Image

Text is not the only thing I found through my journey. The power of images materialized in front of me:

![Colors image](/resources/images/components/markdown/colors.png)

## Navigating with Hyperlinks

Hyperlinks, like signposts, marked other paths that branched off from the road I was treading:
- [Source of all truth](https://github.com/xmlui-com/xmlui)
- [Back to where we started](https://ncrm.azurewebsites.net/)

## The Horizontal Rule

In the quiet corners of Markdownville, I found the Horizontal Rule, a line that symbolizes the end of a section:

***
    ]]>
  </Markdown>
</App>
  `}
/>

See the <SmartLink href={COMPONENT_MARKDOWN}>Markdown component reference</SmartLink> docs for details.
