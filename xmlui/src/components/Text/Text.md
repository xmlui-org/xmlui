%-DESC-START

You can learn more about this component in the [Working with Text](/docs/guide/working-with-text) article.

Also note that variants of the `Text` component are also mapped to HtmlTag components.
See the [variant](#variant) section to check which variant maps to which HtmlTag.

## Custom Variants

In addition to the predefined variants, the `Text` component supports **custom variant names** that can be styled using theme variables. This allows you to create application-specific text styles without modifying the component itself.

When you use a custom variant name (one not in the predefined list), the component automatically applies theme variables following the naming pattern: `{cssProperty}-Text-{variantName}`.

```xmlui-pg display name="Example: custom variants"
<App>
  <Theme 
    textColor-Text-brandTitle="rgb(41, 128, 185)"
    fontSize-Text-brandTitle="28px"
    fontWeight-Text-brandTitle="bold"
    letterSpacing-Text-brandTitle="2px"
  >
    <Text variant="brandTitle">
      Welcome to Our Application
    </Text>
  </Theme>
</App>
```

In this example, the custom variant `brandTitle` is styled using theme variables. Any CSS text property can be configured, including `textColor`, `fontSize`, `fontWeight`, `fontFamily`, `textDecoration*`, `lineHeight`, `backgroundColor`, `textTransform`, `letterSpacing`, `wordSpacing`, `textShadow`, and more.

%-DESC-END

%-PROP-START maxLines

```xmlui-pg copy display name="Example: maxLines"
<App>
  <Text
    maxWidth="120px"
    backgroundColor="cyan"
    color="black"
    value="A long text that will likely overflow"
    maxLines="2" />
</App>
```

%-PROP-END

%-PROP-START ellipses

```xmlui-pg copy display name="Example: ellipses"
<App>
  <VStack width="120px">
    <Text
      backgroundColor="cyan"
      color="black"
      maxLines="1"
      ellipses="false">
      Though this long text does is about to crop!
    </Text>
    <Text
      backgroundColor="cyan"
      color="black"
      maxLines="1">
      Though this long text does is about to crop!
    </Text>
  </VStack>
</App>
```

%-PROP-END

%-PROP-START preserveLinebreaks

```xmlui-pg copy {7} display name="Example: preserveLinebreaks"
<App>
  <HStack>
    <Text
      width="250px"
      backgroundColor="cyan"
      color="black"
      preserveLinebreaks="true"
      value="(preserve) This long text

      with several line breaks


              does not fit into a viewport with a 200-pixel width." />
    <Text
      width="250px"
      backgroundColor="cyan"
      color="black"
      preserveLinebreaks="false"
      value="(don't preserve) This long text


      with several line breaks

      
              does not fit into a viewport with a 200-pixel width." />
  </HStack>
</App>
```

> **Note**: Remember to use the `value` property of the `Text`.
> Linebreaks are converted to spaces when nesting the text inside the `Text` component.

%-PROP-END

%-PROP-START value

```xmlui-pg copy display name="Example: value"
<App>
  <Text value="An example text" />
  <Text>An example text</Text>
</App>
```

%-PROP-END

%-PROP-START variant

```xmlui-pg name="Example: variant"
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
    <Text width="150px">abbr:</Text>
    <Text variant="abbr">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">cite:</Text>
    <Text variant="cite">
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
    <Text width="150px">deleted:</Text>
    <Text variant="deleted">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">inserted:</Text>
    <Text variant="inserted">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">keyboard:</Text>
    <Text variant="keyboard">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">marked:</Text>
    <Text variant="marked">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">sample:</Text>
    <Text variant="sample">
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
    <Text width="150px">var:</Text>
    <Text variant="var">
      This is an example text
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
    <Text width="150px">em:</Text>
    <Text variant="em">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">title:</Text>
    <Text variant="title">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">subtitle:</Text>
    <Text variant="subtitle">
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
  <HStack>
    <Text width="150px">placeholder:</Text>
    <Text variant="placeholder">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">subheading:</Text>
    <Text variant="subheading">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">tableheading:</Text>
    <Text variant="tableheading">
      This is an example text
    </Text>
  </HStack>
  <HStack>
    <Text width="150px">secondary:</Text>
    <Text variant="secondary">
      This is an example text
    </Text>
  </HStack>
</App>
```

**HtmlTag Mappings**

The table below indicates which Text `variant` maps to which HtmlTag component.

| Variant     | Component |
| ----------- | --------- |
| `abbr`      | abbr      |
| `cite`      | cite      |
| `code`      | code      |
| `deleted`   | del       |
| `inserted`  | ins       |
| `keyboard`  | kbd       |
| `marked`    | mark      |
| `sample`    | samp      |
| `sub`       | sub       |
| `sup`       | sup       |
| `var`       | var       |
| `strong`    | strong    |
| `em`        | em        |
| `paragraph` | p         |

%-PROP-END

%-PROP-START overflowMode

Here are a few examples.

```xmlui-pg copy display name="Example: overflowMode not specified (maxlines='2')" /maxLines/
<App>
  <Text
    width="200px"
    backgroundColor="lightblue"
    padding="8px"
    maxLines="2">
    This is a very long text that will be clipped with an 
    ellipsis indicator when it exceeds the specified lines.
  </Text>
</App>
```

```xmlui-pg copy display name="overflowMode='none' (maxlines='2')" /overflowMode/ /maxLines/
<App>
  <Text
    width="200px"
    backgroundColor="lightblue"
    padding="8px"
    overflowMode="none"
    maxLines="2">
    This is a very long text that will be clipped cleanly without 
    any overflow indicator when it exceeds the specified lines.
  </Text>
</App>
```

```xmlui-pg copy display name="overflowMode='ellipsis'" /overflowMode/ /maxLines/
<App>
  <Text variant="strong">overflowMode="ellipsis" (default, maxlines='1')</Text>
  <Text
    width="200px"
    backgroundColor="lightblue"
    padding="8px"
    overflowMode="ellipsis"
    maxLines="1">
    This is a very long text that will show ellipsis when it 
    overflows the container width.
  </Text>

  <Text variant="strong">overflowMode="ellipsis" (default, maxlines='2')</Text>
  <Text
    width="200px"
    backgroundColor="lightblue"
    padding="8px"
    overflowMode="ellipsis"
    maxLines="2">
    This is a very long text that will show ellipsis when it 
    overflows the container width.
  </Text>
</App>
```

```xmlui-pg copy display name="overflowMode='scroll'" /overflowMode/
<App>
  <Text
    width="200px"
    backgroundColor="lightblue"
    padding="8px"
    overflowMode="scroll">
    This is a very long text that will enable horizontal scrolling 
    when it overflows the container width.
  </Text>
</App>
```

```xmlui-pg copy display name="overflowMode='flow'" /overflowMode/ /height/
<App>
  <Text variant="strong">overflowMode="flow"</Text>
  <Text
    width="200px"
    height="100px"
    backgroundColor="lightblue"
    padding="8px"
    overflowMode="flow">
    This is a very long text that will wrap to multiple lines and show 
    a vertical scrollbar when the content exceeds the container height. 
    This mode ignores maxLines and allows unlimited text wrapping with 
    vertical scrolling when needed.
  </Text>
  
  <Text variant="strong">overflowMode="flow" (no height constraint)</Text>
  <Text
    width="200px"
    backgroundColor="lightblue"
    padding="8px"
    overflowMode="flow">
    This is a very long text that demonstrates flow mode without a 
    height constraint. The text will wrap to multiple lines naturally 
    and the container will grow to accommodate all the content. No 
    scrollbar will appear since there's no height limitation - the text 
    flows freely across as many lines as needed.
  </Text>
</App>
```

%-PROP-END

%-PROP-START breakMode

```xmlui-pg copy display name="Example: breakMode"
<App>
  <VStack gap="16px">
    <VStack gap="8px">
      <Text variant="strong">breakMode="normal" (default)</Text>
      <Text
        width="150px"
        backgroundColor="lightblue"
        padding="8px"
        breakMode="normal">
        This text uses standardwordbreaking at natural boundaries 
        like spaces and hyphens.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">breakMode="word"</Text>
      <Text
        width="150px"
        backgroundColor="lightgreen"
        padding="8px"
        breakMode="word">
        This text will breakverylongwordswhenneeded to prevent 
        overflow while preserving readability.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">breakMode="anywhere"</Text>
      <Text
        width="150px"
        backgroundColor="lightyellow"
        padding="8px"
        breakMode="anywhere">
        Thistext willbreakanywhereif neededtofit thecontainer 
        eveninthe middleofwords.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">breakMode="keep"</Text>
      <Text
        width="150px"
        backgroundColor="lightcoral"
        padding="8px"
        breakMode="keep">
        This text will keep verylongwords intact and prevent 
        breaking within words entirely.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">breakMode="hyphenate"</Text>
      <Text
        width="150px"
        backgroundColor="lavender"
        padding="8px"
        breakMode="hyphenate"
        lang="en">
        This text uses automatic hyphenation for 
        supercalifragilisticexpialidocious words.
      </Text>
    </VStack>
  </VStack>
</App>
```

%-PROP-END

%-STYLE-START

### Custom Variant Theme Variables

When using custom variants, you can style them using theme variables with the naming pattern `{propertyName}-Text-{variantName}`. The following CSS properties are supported:

| Theme Variable Name | Description | Example Value |
|---------------------|-------------|---------------|
| `textColor-Text-{variant}` | Text color | `rgb(255, 0, 0)`, `#ff0000`, `red` |
| `fontFamily-Text-{variant}` | Font family | `"Arial, sans-serif"`, `monospace` |
| `fontSize-Text-{variant}` | Font size | `16px`, `1.5rem`, `large` |
| `fontStyle-Text-{variant}` | Font style | `normal`, `italic`, `oblique` |
| `fontWeight-Text-{variant}` | Font weight | `normal`, `bold`, `700` |
| `fontStretch-Text-{variant}` | Font stretch | `normal`, `expanded`, `condensed` |
| `textDecorationLine-Text-{variant}` | Decoration line type | `none`, `underline`, `overline`, `line-through` |
| `textDecorationColor-Text-{variant}` | Decoration color | `rgb(255, 0, 0)`, `currentColor` |
| `textDecorationStyle-Text-{variant}` | Decoration style | `solid`, `dashed`, `dotted`, `wavy` |
| `textDecorationThickness-Text-{variant}` | Decoration thickness | `2px`, `from-font`, `auto` |
| `textUnderlineOffset-Text-{variant}` | Underline offset | `5px`, `0.2em`, `auto` |
| `lineHeight-Text-{variant}` | Line height | `1.5`, `24px`, `normal` |
| `backgroundColor-Text-{variant}` | Background color | `rgb(255, 255, 0)`, `transparent` |
| `textTransform-Text-{variant}` | Text transformation | `none`, `uppercase`, `lowercase`, `capitalize` |
| `letterSpacing-Text-{variant}` | Space between letters | `1px`, `0.1em`, `normal` |
| `wordSpacing-Text-{variant}` | Space between words | `5px`, `0.2em`, `normal` |
| `textShadow-Text-{variant}` | Text shadow | `2px 2px 4px rgba(0,0,0,0.5)` |
| `textIndent-Text-{variant}` | First line indentation | `20px`, `2em`, `0` |
| `textAlign-Text-{variant}` | Horizontal alignment | `left`, `center`, `right`, `justify` |
| `textAlignLast-Text-{variant}` | Last line alignment | `left`, `center`, `right`, `justify` |
| `wordBreak-Text-{variant}` | Word breaking behavior | `normal`, `break-all`, `keep-all` |
| `wordWrap-Text-{variant}` | Word wrapping | `normal`, `break-word` |
| `direction-Text-{variant}` | Text direction | `ltr`, `rtl` |
| `writingMode-Text-{variant}` | Writing mode | `horizontal-tb`, `vertical-rl`, `vertical-lr` |
| `lineBreak-Text-{variant}` | Line breaking rules | `auto`, `normal`, `strict`, `loose` |

```xmlui-pg  display name="Example: custom variant styles" /highlight/
<App>
  <Theme 
    textColor-Text-highlight="rgb(255, 193, 7)"
    fontWeight-Text-highlight="bold"
    backgroundColor-Text-highlight="rgba(0, 0, 0, 0.8)"
    padding-Text-highlight="4px 8px"
    textShadow-Text-highlight="0 2px 4px rgba(0,0,0,0.5)"
  >
    <Text variant="highlight">Important Notice</Text>
    <Text variant="highlight">This is Important Too</Text>
  </Theme>
</App>
```

%-STYLE-END