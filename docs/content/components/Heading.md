# Heading [#heading]

`Heading` displays hierarchical text headings with semantic importance levels from H1 to H6, following HTML heading standards. It provides text overflow handling, anchor link generation, and integrates with [TableOfContents](/components/TableOfContents).

**Key features:**
- **Semantic levels**: Choose from h1 through h6 for proper document structure and accessibility
- **Text overflow control**: Automatic ellipses and line limiting for long headings
- **Anchor generation**: Optional hover anchors for deep linking to specific sections

For the shorthand versions see: [H1](./H1), [H2](./H2), [H3](./H3), [H4](./H4), [H5](./H5), [H6](./H6).

```xmlui-pg copy display name="Example: Headings with levels"
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
```

## Properties [#properties]

### `ellipses` (default: true) [#ellipses-default-true]

This property indicates whether ellipses should be displayed (`true`) when the heading text is cropped or not (`false`).

```xmlui-pg copy {4} display name="Example: ellipses"
<App>
  <VStack width="200px">
    <H3
      backgroundColor="cyan"
      maxLines="1"
      ellipses="false">
      Though this long text does is about to crop!
    </H3>
    <H3
      backgroundColor="cyan"
      maxLines="1">
      Though this long text does is about to crop!
    </H3>
  </VStack>
</App>
```

### `level` (default: "h1") [#level-default-h1]

This property sets the visual significance (level) of the heading. Accepts multiple formats: `h1`-`h6`, `H1`-`H6`, or `1`-`6`.Invalid values default to `h1`.

Available values: `h1` **(default)**, `h2`, `h3`, `h4`, `h5`, `h6`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `1`, `2`, `3`, `4`, `5`, `6`

| Value | Description                                           |
| :---- | :---------------------------------------------------- |
| `h1`  | **(default)** Equivalent to the `<h1 />` HTML element |
| `h2`  | Equivalent to the `<h2 />` HTML element               |
| `h3`  | Equivalent to the `<h3 />` HTML element               |
| `h4`  | Equivalent to the `<h4 />` HTML element               |
| `h5`  | Equivalent to the `<h5 />` HTML element               |
| `h6`  | Equivalent to the `<h6 />` HTML element               |

For a visual example, see the component description.

### `maxLines` [#maxlines]

This optional property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified. If the value is not specified, there is no limit on the number of displayed lines.

```xmlui-pg copy display name="Example: maxLines"
<App>
  <H2
    maxWidth="160px"
    backgroundColor="cyan"
    value="A long heading text that will likely overflow" maxLines="2" />
</App>
```

### `omitFromToc` (default: false) [#omitfromtoc-default-false]

If true, this heading will be excluded from the table of contents.

### `preserveLinebreaks` (default: false) [#preservelinebreaks-default-false]

This property indicates whether linebreaks should be preserved when displaying text.

```xmlui-pg copy display name="Example: preserveLinebreaks"
---app copy display {5}
<App>
  <HStack>
    <H3
      width="200px"
      backgroundColor="cyan"
      preserveLinebreaks="true"
      value="(preserve) This long text
  with several line breaks
          does not fit into a viewport with a 200-pixel width." />
    <H3
      width="200px"
      backgroundColor="cyan"
      value="(do not preserve) This long text
  with several line breaks
          does not fit into a viewport with a 200-pixel width." />
  </HStack>
</App>
---desc
You can observe the effect of using `preserveLinebreaks`:
```

>[!INFO]
> Remember to use the `value` property of `Heading`.
> Linebreaks are converted to spaces when nesting the text in the `Heading` component.

### `showAnchor` (default: false) [#showanchor-default-false]

This property indicates whether an anchor link should be displayed next to the heading. If set to `true`, an anchor link will be displayed on hover next to the heading.

If this property is not set, the engine checks if `showHeadingAnchors` flag is turned on in the global configuration (in the `appGlobals` configuration object) and displays the heading anchor accordingly.

### `value` [#value]

This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.

```xmlui-pg copy display name="Example: value"
<App>
  <Heading value="This is level 3 (value)" level="h3" />
  <Heading level="h3">This is level 3 (child)</Heading>
  <Heading value="Value" level="h3"><Icon name="trash" /></Heading>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `hasOverflow` [#hasoverflow]

Returns true when the displayed text overflows the bounds of this heading component.

**Signature**: `hasOverflow()`

### `scrollIntoView` [#scrollintoview]

Scrolls the heading into view.

**Signature**: `scrollIntoView()`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [color](../styles-and-themes/common-units/#color)-anchor-Heading | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-anchor-Heading  | $color-surface-400 | $color-surface-400 |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-H1 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-H2 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-H3 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-H4 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-H5 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-H6 | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Heading | $fontFamily | $fontFamily |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-H1 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-H2 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-H3 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-H4 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-H5 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-H6 | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Heading | $fontWeight-bold | $fontWeight-bold |
| [gap](../styles-and-themes/common-units/#size)-anchor-Heading | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-anchor-Heading  | $space-2 | $space-2 |
| [letterSpacing](../styles-and-themes/common-units/#size)-H1 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-H2 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-H3 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-H4 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-H5 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-H6 | *none* | *none* |
| [letterSpacing](../styles-and-themes/common-units/#size)-Heading  | 0 | 0 |
| [textColor](../styles-and-themes/common-units/#color)-H1 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-H2 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-H3 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-H4 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-H5 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-H6 | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Heading | inherit | inherit |
| [textDecorationColor](../styles-and-themes/common-units/#color)-H1 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-H2 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-H3 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-H4 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-H5 | *none* | *none* |
| [textDecorationColor](../styles-and-themes/common-units/#color)-H6 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-anchor-Heading | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-anchor-Heading  | underline | underline |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-H1 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-H2 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-H3 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-H4 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-H5 | *none* | *none* |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-H6 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-H1 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-H2 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-H3 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-H4 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-H5 | *none* | *none* |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-H6 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-H1 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-H2 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-H3 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-H4 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-H5 | *none* | *none* |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-H6 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-H1 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-H2 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-H3 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-H4 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-H5 | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-H6 | *none* | *none* |
