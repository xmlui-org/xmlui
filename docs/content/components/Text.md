# Text [#text]

The `Text` component displays textual information in a number of optional styles and variants.

You can learn more about this component in the [Working with Text](/working-with-text) article.

Also note that variants of the `Text` component are also mapped to HtmlTag components.
See the [variant](#variant) section to check which variant maps to which HtmlTag.

## Properties [#properties]

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

An optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color, and other parameters. If not defined, the text uses the current style of its context.

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

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
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
| [color](../styles-and-themes/common-units/#color)-Text-codefence | $color-surface-900 | $color-surface-900 |
| [color](../styles-and-themes/common-units/#color)-Text-marked | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Text-placeholder | $color-surface-500 | $color-surface-500 |
| [color](../styles-and-themes/common-units/#color)-Text-secondary | $textColor-secondary | $textColor-secondary |
| [color](../styles-and-themes/common-units/#color)-Text-subheading | $textColor-secondary | $textColor-secondary |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text | $fontFamily | $fontFamily |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-code | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-codefence | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-keyboard | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-mono | $fontFamily-monospace | $fontFamily-monospace |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Text-sample | $fontFamily-monospace | $fontFamily-monospace |
| [fontSize](../styles-and-themes/common-units/#size)-Text | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Text-code | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Text-codefence | $fontSize-code | $fontSize-code |
| [fontSize](../styles-and-themes/common-units/#size)-Text-keyboard | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Text-paragraph | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Text-placeholder | $fontSize-smaller | $fontSize-smaller |
| [fontSize](../styles-and-themes/common-units/#size)-Text-sample | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Text-secondary | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Text-small | $fontSize-small | $fontSize-small |
| [fontSize](../styles-and-themes/common-units/#size)-Text-sub | $fontSize-smaller | $fontSize-smaller |
| [fontSize](../styles-and-themes/common-units/#size)-Text-subheading | $fontSize-H6 | $fontSize-H6 |
| [fontSize](../styles-and-themes/common-units/#size)-Text-subtitle | $fontSize-medium | $fontSize-medium |
| [fontSize](../styles-and-themes/common-units/#size)-Text-sup | $fontSize-smaller | $fontSize-smaller |
| [fontSize](../styles-and-themes/common-units/#size)-Text-tableheading | $fontSize-H6 | $fontSize-H6 |
| [fontSize](../styles-and-themes/common-units/#size)-Text-title | $fontSize-large | $fontSize-large |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-cite | italic | italic |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-em | italic | italic |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-marked | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-placeholder | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-subheading | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Text-var | italic | italic |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-abbr | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-keyboard | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-marked | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-placeholder | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-subheading | $fontWeight-bold | $fontWeight-bold |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Text-tableheading | $fontWeight-bold | $fontWeight-bold |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text-caption | 0.05rem | 0.05rem |
| [letterSpacing](../styles-and-themes/common-units/#size)-Text-subheading | 0.04em | 0.04em |
| [lineHeight](../styles-and-themes/common-units/#size)-Text-codefence | 1.5 | 1.5 |
| [lineHeight](../styles-and-themes/common-units/#size)-Text-marked | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Text-small | $lineHeight-tight | $lineHeight-tight |
| [marginBottom](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginBottom](../styles-and-themes/common-units/#size)-Text-tableheading | $space-4 | $space-4 |
| [marginLeft](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginLeft](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginRight](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text-small | *none* | *none* |
| [marginTop](../styles-and-themes/common-units/#size)-Text-tableheading | $space-1 | $space-1 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Text-code | 2px | 2px |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-code | $space-0_5 | $space-0_5 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-codefence | $space-4 | $space-4 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-keyboard | $space-1 | $space-1 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Text-tableheading | $space-1 | $space-1 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Text-codefence | $space-3 | $space-3 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Text-paragraph | $space-1 | $space-1 |
| [textColor](../styles-and-themes/common-units/#color)-Text | $textColor-primary | $textColor-primary |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text-deleted | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Text-inserted | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text-deleted | line-through | line-through |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Text-inserted | underline | underline |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text-deleted | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Text-inserted | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text-deleted | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Text-inserted | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text-abbr | uppercase | uppercase |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Text-subheading | uppercase | uppercase |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-small | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-sub | sub | sub |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Text-sup | super | super |
