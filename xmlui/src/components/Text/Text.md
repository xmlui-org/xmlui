%-DESC-START

You can learn more about this component in the [Working with Text](/working-with-text) article.

Also note that variants of the `Text` component are also mapped to HtmlTag components.
See the [variant](#variant) section to check which variant maps to which HtmlTag.

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

```xmlui-pg copy display name="Example: overflowMode"
<App>
  <VStack gap="16px">
    <VStack gap="8px">
      <Text variant="strong">overflowMode="ellipsis" (default)</Text>
      <Text
        width="200px"
        backgroundColor="lightblue"
        padding="8px"
        overflowMode="ellipsis"
        maxLines="1">
        This is a very long text that will show ellipsis when it 
        overflows the container width.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">overflowMode="scroll"</Text>
      <Text
        width="200px"
        backgroundColor="lightgreen"
        padding="8px"
        overflowMode="scroll">
        This is a very long text that will enable horizontal scrolling 
        when it overflows the container width.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">overflowMode="none"</Text>
      <Text
        width="200px"
        backgroundColor="lightcoral"
        padding="8px"
        overflowMode="none"
        maxLines="2">
        This is a very long text that will be clipped cleanly without 
        any overflow indicator when it exceeds the specified lines.
      </Text>
    </VStack>
  </VStack>
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
