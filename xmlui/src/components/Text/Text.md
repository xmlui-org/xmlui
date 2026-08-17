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

%-PROP-START inline

By default a `Text` is `display: inline-block`, so a line built from several styled `Text` runs treats each run as an atomic box and may break *between* runs — splitting a word across a style boundary. Set `inline="true"` to render `display: inline` instead, so adjacent runs share one line-breaking context and wrap as continuous text, breaking only at whitespace.

Both blocks render the **same sentence at the same width**, differing only in `inline`. The highlighted `Authentication` sits mid-identifier (`getUser` + `Authentication` + `Token`). With `inline="true"` the whole identifier flows as one word and the line breaks only at the surrounding spaces; with the default `inline-block` each segment is an atomic box, so the line breaks *inside* the identifier — dropping part of it onto its own line.

```xmlui-pg copy display name="Example: inline keeps a styled word whole" height="360px"
<App>
  <VStack gap="$space-4" width="200px">
    <VStack gap="$space-1">
      <Text variant="strong" fontSize="$fontSize-sm">inline="true" — one flowing word</Text>
      <Text>Call <Text inline="true">getUser</Text><Text inline="true" backgroundColor="yellow" color="black" borderRadius="0">Authentication</Text><Text inline="true">Token</Text> before the request.</Text>
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong" fontSize="$fontSize-sm">default — inline-block splits the word</Text>
      <Text>Call <Text>getUser</Text><Text backgroundColor="yellow" color="black" borderRadius="0">Authentication</Text><Text>Token</Text> before the request.</Text>
    </VStack>
  </VStack>
</App>
```

Inline mode is for composing flowing rich text, so it is mutually exclusive with `maxLines`, `ellipses`, and `overflowMode` — those need a block formatting context and are ignored when `inline` is set.

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

%-PROP-START highlightText

Wraps matching text in `<mark>` elements, without the caller having to split the string into segments. Matching is identical to [`Markdown`'s property of the same name](/components/Markdown#highlighttext) — case-insensitive, a string treated as one phrase, an array as independent terms, terms under 2 characters ignored — so a list mixing `Text` and `Markdown` rows highlights consistently.

```xmlui-pg copy display name="Example: highlightText"
<App>
  <Text highlightText="ticker">The pty ticker fires once per second.</Text>
  <Text highlightText="{['pty', 'ticker']}">The pty layer and the ticker.</Text>
</App>
```

Because the marks are rendered inside the `Text` element itself, a match falling in the middle of a word does not break the word, and styling set on the `Text` applies once rather than needing to be repeated per segment.

%-PROP-END

%-PROP-START highlightActiveIndex

Selects which occurrence of [`highlightText`](#highlighttext) is the *active* match: it gets `data-active="true"`, is styled with `backgroundColor-markActive-Text`, and is scrolled into view.

Occurrences are counted across all terms in document order, matching `Markdown`. That shared numbering is the point: a find-in-page stepping through a list of mixed `Text` and `Markdown` rows walks every match as one sequence, regardless of which component rendered it.

```xmlui-pg copy display name="Example: highlightActiveIndex"
<App var.step="{0}">
  <HStack>
    <Button label="Previous" onClick="step = Math.max(0, step - 1)" />
    <Button label="Next" onClick="step = Math.min(2, step + 1)" />
    <Text value="Match {step + 1} of 3" />
  </HStack>
  <Text highlightText="pty" highlightActiveIndex="{step}">
    The pty ticker, the pty layer, and the pty menu.
  </Text>
</App>
```

%-PROP-END

%-PROP-START segments

Renders **pre-computed** highlight spans. Use this instead of [`highlightText`](#highlighttext) when the highlights are decided upstream rather than by matching a term here.

The distinction matters more than it first appears. A full-text search snippet marks whole tokens after its own tokenization, and the excerpt that reaches the client has usually lost the context needed to re-derive those spans. Substring matching over the same text is not an approximation of that result — it disagrees in both directions, marking part of a token where the server marked all of it, and marking inside words where the server did not.

```xmlui-pg copy display name="Example: segments"
<App>
  <Text segments="{[
    { text: 'the ', hit: false },
    { text: 'ticker', hit: true },
    { text: ' fires once per ', hit: false },
    { text: 'second', hit: true, active: true }
  ]}" />
</App>
```

Each entry needs a `text` string. `hit` renders that span highlighted; `active` marks it as the current occurrence, styled with `backgroundColor-markActive-Text` and scrolled into view.

When `segments` is set it supplies the component's content — `value` and any children are not rendered, and `highlightText` is ignored (in a development build, setting both logs a warning). If `segments` is absent or `undefined`, the component renders its normal content, so a data-bound `segments` that is briefly undefined during a refetch degrades quietly rather than blanking the row.

If no segment carries `active`, [`highlightActiveIndex`](#highlightactiveindex) selects which `hit` is active, counting in document order — the same numbering `highlightText` uses, so a find-in-page can step through a list mixing both kinds of row as one sequence.

> [!INFO] `segments` expresses **one kind of span**: whether it matched a search, and whether it is the current match. It is deliberately not a general mechanism for styling arbitrary runs of text. Content that carries other, orthogonal span kinds — added and removed words in a diff, say, which a row may hold *alongside* search hits — needs its own styling and should compose those runs itself. Keeping this property to a single meaning is what lets `hit` and `active` mean the same thing here as they do for `highlightText`.
>
> The field set — `text`, `hit`, `active` — is **closed for this release**, and that is a decision rather than an oversight. Should a second span kind ever warrant first-class support, a per-segment variant is the intended extension point; until then, content needing more than one kind of span composes it itself.

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