# Text [#text]

The `Text` component displays textual information in a number of optional styles and variants.

You can learn more about this component in the [Working with Text](/docs/guide/working-with-text) article.

Also note that variants of the `Text` component are also mapped to HtmlTag components.
See the [variant](#variant) section to check which variant maps to which HtmlTag.

## Custom Variants [#custom-variants]

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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Live Region | `withLiveRegion`, `liveRegionMessage`, `liveRegionPoliteness` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `breakMode` [#breakmode]

> [!DEF]  default: **"normal"**

This property controls how text breaks into multiple lines. `normal` uses standard word boundaries, `word` breaks long words to prevent overflow, `anywhere` breaks at any character, `keep` prevents word breaking, and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior or theme variables.

Available values:

| Value | Description |
| --- | --- |
| `normal` | Uses standard word boundaries for breaking **(default)** |
| `word` | Breaks long words when necessary to prevent overflow |
| `anywhere` | Breaks at any character if needed to fit content |
| `keep` | Prevents breaking within words entirely |
| `hyphenate` | Uses automatic hyphenation when breaking words |

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

### `ellipses` [#ellipses]

> [!DEF]  default: **true**

This property indicates whether ellipses should be displayed when the text is cropped (`true`) or not (`false`).

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

### `highlightActiveIndex` [#highlightactiveindex]

Which occurrence (0-based) of `highlightText` is the active match: it is emphasized and scrolled into view. Occurrences are counted **across all terms in document order**, matching `Markdown`, so a find-in-page stepping through a mixed list walks every match as one sequence regardless of which component rendered it. -1 or unset means none. With [`segments`](#segments), counts over the `hit` segments instead.

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

### `highlightText` [#highlighttext]

When set, wraps every case-insensitive occurrence in the displayed text in a `<mark>` element (highlighted). Accepts a **string** (a single phrase) or a **string array** (each term highlighted independently). A term shorter than 2 characters, an empty string, or an empty array is a no-op. Matching is identical to `Markdown`'s property of the same name, so a list mixing `Text` and `Markdown` rows highlights consistently.

Wraps matching text in `<mark>` elements, without the caller having to split the string into segments. Matching is identical to [`Markdown`'s property of the same name](/components/Markdown#highlighttext) — case-insensitive, a string treated as one phrase, an array as independent terms, terms under 2 characters ignored — so a list mixing `Text` and `Markdown` rows highlights consistently.

```xmlui-pg copy display name="Example: highlightText"
<App>
  <Text highlightText="ticker">The pty ticker fires once per second.</Text>
  <Text highlightText="{['pty', 'ticker']}">The pty layer and the ticker.</Text>
</App>
```

Because the marks are rendered inside the `Text` element itself, a match falling in the middle of a word does not break the word, and styling set on the `Text` applies once rather than needing to be repeated per segment.

### `inline` [#inline]

> [!DEF]  default: **false**

When `true`, the component renders `display: inline` so a sequence of adjacent `Text` runs joins one line-breaking context and wraps as continuous text, breaking only at whitespace rather than between runs. Use it to compose per-run-styled segments (syntax colors, highlights) into a single flowing line. Inline mode is mutually exclusive with `maxLines`, `ellipses`, and `overflowMode`, which require a block formatting context and are ignored when `inline` is set.

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

### `maxLines` [#maxlines]

This property determines the maximum number of lines the component can wrap to. If there is no space to display all the contents, the component displays up to as many lines as specified in this property. When the value is not defined, there is no limit on the displayed lines.

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

### `overflowMode` [#overflowmode]

> [!DEF]  default: **"not specified"**

This property controls how text overflow is handled. `none` prevents wrapping and shows no overflow indicator, `ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). When not specified, uses the default text behavior.

Available values:

| Value | Description |
| --- | --- |
| `none` | No wrapping, text stays on a single line with no overflow indicator (ignores maxLines) |
| `ellipsis` | Truncates with an ellipsis (default) |
| `scroll` | Forces single line with horizontal scrolling when content overflows (ignores maxLines) |
| `flow` | Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines) |

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

### `preserveLinebreaks` [#preservelinebreaks]

> [!DEF]  default: **false**

This property indicates if linebreaks should be preserved when displaying text.

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

### `segments` [#segments]

Pre-computed highlight spans, as an array of `{ text, hit, active }` objects. Use this instead of [`highlightText`](#highlighttext) when the highlights are decided upstream rather than by matching a search term here — a full-text search snippet, for example, whose marks fall on token boundaries that cannot be reproduced by substring matching. Segments with `hit` are rendered as highlighted; `active` marks the current occurrence. A segment may instead carry `variant`, naming a non-search span kind (such as a changed word in a diff) styled through `backgroundColor-mark-<variant>-Text`. Precedence is `active` > `hit` > `variant`, so a segment that is a hit renders as a hit and its variant is ignored, and only `hit` segments are counted by `highlightActiveIndex`. When set, `segments` supplies the `Text`'s content and `highlightText` is ignored.

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

> [!INFO] Precedence is `active` > `hit` > `variant`: a segment that is a search hit renders as one, and its `variant` is ignored. Only `hit` segments are counted by [`highlightActiveIndex`](#highlightactiveindex), so variant spans never enter the sequence a find-in-page steps through.

### A second span kind: `variant` [#a-second-span-kind-variant]

Some content carries spans that have nothing to do with searching — a word that changed on one side of a diff, say — and a row may hold those *alongside* search hits. Give such a segment a `variant` naming its kind:

```xmlui
<Text segments="{[
  { text: 'the ', hit: false },
  { text: 'quick', variant: 'emphasis' },
  { text: ' brown ', hit: false },
  { text: 'fox', hit: true, active: true }
]}" />
```

Colours come from your theme, keyed by the variant name:

```
backgroundColor-mark-emphasis-Text
textColor-mark-emphasis-Text
```

Declare those for every variant you use. An undeclared variant renders as plain text — the span is still there, just unstyled — and a development build warns once per name so a typo in a data-driven field does not pass silently.

This is deliberately not a general styling channel: exactly those two properties resolve, keyed by a name you declare in the theme, rather than arbitrary CSS travelling in your data.

> [!INFO] Two namespaces here point in opposite directions, deliberately. In the **DOM**, a hit is a `<mark>` and a variant is a `<span data-variant="…">` — they are different kinds of thing, and code that counts or queries marks to find search hits should not also collect diff spans. In the **theme**, both live under `mark-` (`backgroundColor-mark-Text`, `backgroundColor-markActive-Text`, `backgroundColor-mark-emphasis-Text`) — from a theme author's side they are one family of span styling to keep visually coherent.

### `value` [#value]

The text to be displayed. This value can also be set via nesting the text into the `Text` component.

```xmlui-pg copy display name="Example: value"
<App>
  <Text value="An example text" />
  <Text>An example text</Text>
</App>
```

### `variant` [#variant]

An optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color, and other parameters. If not defined, the text uses the current style of its context.

Available values:

| Value | Description |
| --- | --- |
| `abbr` | Represents an abbreviation or acronym |
| `caption` | Represents the caption (or title) of a table |
| `cite` | Is used to mark up the title of a cited work |
| `code` | Represents a line of code |
| `deleted` | Represents text that has been deleted |
| `description` | Represents descriptive supporting text |
| `em` | Marks text to stress emphasis |
| `inherit` | Represents text that inherits the style from its parent element |
| `inserted` | Represents a range of text that has been added to a document |
| `info` | Represents compact informational metadata text |
| `keyboard` | Represents a span of text denoting textual user input from a keyboard or voice input |
| `marked` | Represents text which is marked or highlighted for reference or notation |
| `blurb` | Represents a short summary or teaser text |
| `mono` | Text using a mono style font family |
| `paragraph` | Represents a paragraph |
| `placeholder` | Text that is mostly used as the placeholder style in input controls |
| `sample` | Represents sample (or quoted) output from a computer program |
| `secondary` | Represents a bit dimmed secondary text |
| `small` | Represents side-comments and small print |
| `sub` | Specifies inline text as subscript |
| `strong` | Contents have strong importance |
| `subheading` | Indicates that the text is the subtitle in a heading |
| `subtitle` | Indicates that the text is the subtitle of some other content |
| `sup` | Specifies inline text as superscript |
| `tableheading` | Indicates that the text is a table heading |
| `title` | Indicates that the text is the title of some other content |
| `var` | Represents the name of a variable in a mathematical expression |

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

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Text is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

### `hasOverflow` [#hasoverflow]

Returns true when the displayed text overflows its container boundaries.

**Signature**: `hasOverflow(): boolean`

## Styling [#styling]

### Custom Variant Theme Variables [#custom-variant-theme-variables]

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

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-mark-Text](/docs/styles-and-themes/common-units/#color) | $color-warn-200 | $color-warn-200 |
| [backgroundColor-markActive-Text](/docs/styles-and-themes/common-units/#color) | $color-warn-400 | $color-warn-400 |
| [backgroundColor-Text](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Text-code](/docs/styles-and-themes/common-units/#color) | rgb(from $color-surface-100 r g b / 0.4) | rgb(from $color-surface-100 r g b / 0.4) |
| [backgroundColor-Text-keyboard](/docs/styles-and-themes/common-units/#color) | rgb(from $color-surface-100 r g b / 0.4) | rgb(from $color-surface-100 r g b / 0.4) |
| [backgroundColor-Text-marked](/docs/styles-and-themes/common-units/#color) | rgb(from $color-primary-300 r g b / 0.4) | rgb(from $color-primary-400 r g b / 0.4) |
| [borderColor-Text-code](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [borderColor-Text-keyboard](/docs/styles-and-themes/common-units/#color) | $color-surface-300 | $color-surface-300 |
| [borderRadius-Text](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-Text-code](/docs/styles-and-themes/common-units/#border-rounding) | 4px | 4px |
| [borderRadius-Text-keyboard](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Text](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderStyle-Text-code](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderStyle-Text-keyboard](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-Text](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [borderWidth-Text-code](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [borderWidth-Text-keyboard](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [direction-Text](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-Text](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily | $fontFamily |
| [fontFamily-Text-code](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily-Text-codefence](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily-Text-keyboard](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily-Text-mono](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily-Text-sample](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily-monospace | $fontFamily-monospace |
| [fontSize-Text](/docs/styles-and-themes/common-units/#size-values) | $fontSize | $fontSize |
| [fontSize-Text-code](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-Text-codefence](/docs/styles-and-themes/common-units/#size-values) | $fontSize-code | $fontSize-code |
| [fontSize-Text-keyboard](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-Text-paragraph](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Text-placeholder](/docs/styles-and-themes/common-units/#size-values) | $fontSize-xs | $fontSize-xs |
| [fontSize-Text-sample](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-Text-secondary](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-Text-small](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-Text-sub](/docs/styles-and-themes/common-units/#size-values) | $fontSize-xs | $fontSize-xs |
| [fontSize-Text-subheading](/docs/styles-and-themes/common-units/#size-values) | $fontSize-H6 | $fontSize-H6 |
| [fontSize-Text-subtitle](/docs/styles-and-themes/common-units/#size-values) | $fontSize-xl | $fontSize-xl |
| [fontSize-Text-sup](/docs/styles-and-themes/common-units/#size-values) | $fontSize-xs | $fontSize-xs |
| [fontSize-Text-tableheading](/docs/styles-and-themes/common-units/#size-values) | $fontSize-H6 | $fontSize-H6 |
| [fontSize-Text-title](/docs/styles-and-themes/common-units/#size-values) | $fontSize-2xl | $fontSize-2xl |
| [fontStretch-Text](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-Text](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-Text-cite](/docs/styles-and-themes/common-units/#fontStyle) | italic | italic |
| [fontStyle-Text-em](/docs/styles-and-themes/common-units/#fontStyle) | italic | italic |
| [fontStyle-Text-marked](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-Text-placeholder](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-Text-subheading](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-Text-var](/docs/styles-and-themes/common-units/#fontStyle) | italic | italic |
| [fontVariant-Text](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-Text](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [fontWeight-Text-abbr](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-Text-keyboard](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-Text-marked](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Text-placeholder](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Text-strong](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-Text-subheading](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-Text-tableheading](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [letterSpacing-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-Text-caption](/docs/styles-and-themes/common-units/#size-values) | 0.05rem | 0.05rem |
| [letterSpacing-Text-subheading](/docs/styles-and-themes/common-units/#size-values) | 0.04em | 0.04em |
| [lineBreak-Text](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-Text-codefence](/docs/styles-and-themes/common-units/#size-values) | 1.5 | 1.5 |
| [lineHeight-Text-marked](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-Text-code](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-Text-small](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-Text-tableheading](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [marginLeft-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginLeft-Text-code](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginLeft-Text-small](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginRight-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginRight-Text-code](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginRight-Text-small](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-Text-code](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-Text-small](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginTop-Text-tableheading](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingBottom-Text-code](/docs/styles-and-themes/common-units/#size-values) | 2px | 2px |
| [paddingHorizontal-Text-code](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [paddingHorizontal-Text-codefence](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingHorizontal-Text-keyboard](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingHorizontal-Text-marked](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Text-tableheading](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingVertical-Text-codefence](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingVertical-Text-paragraph](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [textAlign-Text](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-Text](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-mark-Text](/docs/styles-and-themes/common-units/#color) | inherit | inherit |
| [textColor-Text](/docs/styles-and-themes/common-units/#color) | $textColor | $textColor |
| [textColor-Text--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Text-code--hover](/docs/styles-and-themes/common-units/#color) | initial | initial |
| [textColor-Text-codefence](/docs/styles-and-themes/common-units/#color) | $color-surface-900 | $color-surface-900 |
| [textColor-Text-marked](/docs/styles-and-themes/common-units/#color) | $color-secondary-800 | $color-secondary-800 |
| [textColor-Text-placeholder](/docs/styles-and-themes/common-units/#color) | $color-surface-500 | $color-surface-500 |
| [textColor-Text-placeholder--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Text-secondary](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| [textColor-Text-secondary--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Text-small--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Text-subheading](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| [textColor-Text-subheading--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-Text](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-Text-deleted](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-Text-inserted](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-Text](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-Text-deleted](/docs/styles-and-themes/common-units/#textDecoration) | line-through | line-through |
| [textDecorationLine-Text-inserted](/docs/styles-and-themes/common-units/#textDecoration) | underline | underline |
| [textDecorationStyle-Text](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-Text-deleted](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-Text-inserted](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-Text](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-Text-deleted](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-Text-inserted](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-Text](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-Text](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-Text](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-Text-abbr](/docs/styles-and-themes/common-units/#textTransform) | uppercase | uppercase |
| [textTransform-Text-subheading](/docs/styles-and-themes/common-units/#textTransform) | uppercase | uppercase |
| [textUnderlineOffset-Text](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [verticalAlignment-Text](/docs/styles-and-themes/common-units/#alignment) | *none* | *none* |
| [verticalAlignment-Text-code](/docs/styles-and-themes/common-units/#alignment) | *none* | *none* |
| [verticalAlignment-Text-small](/docs/styles-and-themes/common-units/#alignment) | *none* | *none* |
| [verticalAlignment-Text-sub](/docs/styles-and-themes/common-units/#alignment) | sub | sub |
| [verticalAlignment-Text-sup](/docs/styles-and-themes/common-units/#alignment) | super | super |
| [wordBreak-Text](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-Text](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-Text](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-Text](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
