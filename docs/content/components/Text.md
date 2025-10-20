# Text [#text]

The `Text` component displays textual information in a number of optional styles and variants.

You can learn more about this component in the [Working with Text](/working-with-text) article.

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

## Properties [#properties]

### `breakMode` (default: "normal") [#breakmode-default-normal]

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

### `ellipses` (default: true) [#ellipses-default-true]

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

### `overflowMode` (default: "not specified") [#overflowmode-default-not-specified]

This property controls how text overflow is handled. `none` prevents wrapping and shows no overflow indicator, `ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). When not specified, uses the default text behavior.

Available values:

| Value | Description |
| --- | --- |
| `none` | No wrapping, text stays on a single line with no overflow indicator |
| `ellipsis` | Truncates with an ellipsis (default) |
| `scroll` | Forces single line with horizontal scrolling when content overflows |
| `flow` | Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines) |

```xmlui-pg copy display name="Example: overflowMode"
<App>
  <VStack gap="16px">
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
      <Text variant="strong">overflowMode="flow"</Text>
      <Text
        width="200px"
        height="100px"
        backgroundColor="lightyellow"
        padding="8px"
        overflowMode="flow">
        This is a very long text that will wrap to multiple lines and show 
        a vertical scrollbar when the content exceeds the container height. 
        This mode ignores maxLines and allows unlimited text wrapping with 
        vertical scrolling when needed.
      </Text>
    </VStack>
    
    <VStack gap="8px">
      <Text variant="strong">overflowMode="flow" (no height constraint)</Text>
      <Text
        width="200px"
        backgroundColor="lightpink"
        padding="8px"
        overflowMode="flow">
        This is a very long text that demonstrates flow mode without a 
        height constraint. The text will wrap to multiple lines naturally 
        and the container will grow to accommodate all the content. No 
        scrollbar will appear since there's no height limitation - the text 
        flows freely across as many lines as needed.
      </Text>
    </VStack>
  </VStack>
</App>
```

### `preserveLinebreaks` (default: false) [#preservelinebreaks-default-false]

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

### `value` [#value]

The text to be displayed. This value can also be set via nesting the text into the `Text` component.

```xmlui-pg copy display name="Example: value"
<App>
  <Text value="An example text" />
  <Text>An example text</Text>
</App>
```

### `variant` [#variant]

An optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color, and other parameters. If not defined, the text uses the current style of its context. In addition to predefined variants, you can specify custom variant names and style them using theme variables with the pattern `{cssProperty}-Text-{variantName}` (e.g., `textColor-Text-brandTitle`, `fontSize-Text-highlight`). See the documentation for a complete list of supported CSS properties.

Available values:

| Value | Description |
| --- | --- |
| `abbr` | Represents an abbreviation or acronym |
| `caption` | Represents the caption (or title) of a table |
| `cite` | Is used to mark up the title of a cited work |
| `code` | Represents a line of code |
| `deleted` | Represents text that has been deleted |
| `em` | Marks text to stress emphasis |
| `inherit` | Represents text that inherits the style from its parent element |
| `inserted` | Represents a range of text that has been added to a document |
| `keyboard` | Represents a span of text denoting textual user input from a keyboard or voice input |
| `marked` | Represents text which is marked or highlighted for reference or notation |
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

This component does not have any events.

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
| [backgroundColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Text-code | rgb(from $color-surface-100 r g b / 0.4) | rgb(from $color-surface-100 r g b / 0.4) |
| [backgroundColor](../styles-and-themes/common-units/#color)-Text-keyboard | rgb(from $color-surface-100 r g b / 0.4) | rgb(from $color-surface-100 r g b / 0.4) |
| [backgroundColor](../styles-and-themes/common-units/#color)-Text-marked | rgb(from $color-primary-200 r g b / 0.4) | rgb(from $color-primary-400 r g b / 0.4) |
| [borderColor](../styles-and-themes/common-units/#color)-Text-code | $color-surface-100 | $color-surface-100 |
| [borderColor](../styles-and-themes/common-units/#color)-Text-keyboard | $color-surface-300 | $color-surface-300 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Text | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Text-code | 4px | 4px |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Text-keyboard | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Text | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Text-code | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Text-keyboard | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Text | $space-0 | $space-0 |
| [borderWidth](../styles-and-themes/common-units/#size)-Text-code | 1px | 1px |
| [borderWidth](../styles-and-themes/common-units/#size)-Text-keyboard | 1px | 1px |
| [direction](../styles-and-themes/layout-props#direction)-Text | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text | $fontFamily | $fontFamily |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-code | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-codefence | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-keyboard | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-mono | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-sample | $fontFamily-monospace | $fontFamily-monospace |
| [fontSize](../styles-and-themes/common-units/#size)-Text | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Text-code | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Text-codefence | $fontSize-code | $fontSize-code |
| [fontSize](../styles-and-themes/common-units/#size)-Text-keyboard | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Text-paragraph | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text-placeholder | $fontSize-xs | $fontSize-xs |
| [fontSize](../styles-and-themes/common-units/#size)-Text-sample | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Text-secondary | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Text-small | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Text-sub | $fontSize-xs | $fontSize-xs |
| [fontSize](../styles-and-themes/common-units/#size)-Text-subheading | $fontSize-H6 | $fontSize-H6 |
| [fontSize](../styles-and-themes/common-units/#size)-Text-subtitle | $fontSize-xl | $fontSize-xl |
| [fontSize](../styles-and-themes/common-units/#size)-Text-sup | $fontSize-xs | $fontSize-xs |
| [fontSize](../styles-and-themes/common-units/#size)-Text-tableheading | $fontSize-H6 | $fontSize-H6 |
| [fontSize](../styles-and-themes/common-units/#size)-Text-title | $fontSize-2xl | $fontSize-2xl |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Text | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-cite | italic | italic |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-em | italic | italic |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-marked | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-placeholder | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-subheading | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-var | italic | italic |
| [fontVariant](../styles-and-themes/common-units/#font-variant)-Text | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-abbr | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-keyboard | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-marked | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-placeholder | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-subheading | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-tableheading | $fontWeight-bold | $fontWeight-bold |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text-caption | 0.05rem | 0.05rem |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text-subheading | 0.04em | 0.04em |
| [lineBreak](../styles-and-themes/common-units/#line-break)-Text | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Text-codefence | 1.5 | 1.5 |
| [lineHeight](../styles-and-themes/common-units/#size)-Text-marked | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-code | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-tableheading | $space-4 | $space-4 |
| [marginLeft](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-Text-code | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Text-code | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text-code | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text-tableheading | $space-1 | $space-1 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Text-code | 2px | 2px |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-code | $space-0_5 | $space-0_5 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-codefence | $space-4 | $space-4 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-keyboard | $space-1 | $space-1 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-tableheading | $space-1 | $space-1 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Text-codefence | $space-3 | $space-3 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Text-paragraph | $space-1 | $space-1 |
| [textAlign](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textAlignLast](../styles-and-themes/common-units/#text-align)-Text | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-Text--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text-code--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text-codefence | $color-surface-900 | $color-surface-900 |
| [textColor](../styles-and-themes/common-units/#color)-Text-marked | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text-placeholder | $color-surface-500 | $color-surface-500 |
| [textColor](../styles-and-themes/common-units/#color)-Text-secondary | $textColor-secondary | $textColor-secondary |
| [textColor](../styles-and-themes/common-units/#color)-Text-small--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Text-subheading | $textColor-secondary | $textColor-secondary |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text-deleted | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text-inserted | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text-deleted | line-through | line-through |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text-inserted | underline | underline |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text-deleted | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text-inserted | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text-deleted | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text-inserted | *none* | *none* |
| [textIndent](../styles-and-themes/common-units/#text-indent)-Text | *none* | *none* |
| [textShadow](../styles-and-themes/common-units/#text-shadow)-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text-abbr | uppercase | uppercase |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text-subheading | uppercase | uppercase |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-code | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-small | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-sub | sub | sub |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-sup | super | super |
| [wordBreak](../styles-and-themes/common-units/#word-break)-Text | *none* | *none* |
| [wordSpacing](../styles-and-themes/common-units/#word-spacing)-Text | *none* | *none* |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-Text | *none* | *none* |
| [writingMode](../styles-and-themes/common-units/#writing-mode)-Text | *none* | *none* |
