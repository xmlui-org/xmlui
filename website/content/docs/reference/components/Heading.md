# Heading [#heading]

`Heading` displays hierarchical text headings with semantic importance levels from H1 to H6, following HTML heading standards. It provides text overflow handling, anchor link generation, and integrates with [`TableOfContents`](/docs/reference/components/TableOfContents).

**Key features:**
- **Semantic levels**: Choose from h1 through h6 for proper document structure and accessibility
- **Text overflow control**: Automatic ellipses and line limiting for long headings
- **Anchor generation**: Optional hover anchors for deep linking to specific sections

For the shorthand versions see: [H1](/docs/reference/components/H1), [H2](/docs/reference/components/H2), [H3](/docs/reference/components/H3), [H4](/docs/reference/components/H4), [H5](/docs/reference/components/H5), [H6](/docs/reference/components/H6).

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

**Context variables available during execution:**

- `$anchorHref`: The href (#id) of the current heading anchor.
- `$anchorId`: The generated id of the current heading anchor.

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

### `anchorTemplate` [#anchortemplate]

An optional template to customize the anchor link rendered next to the heading when `showAnchor` is enabled. The template receives `$anchorId` (the computed anchor ID) and `$anchorHref` (the anchor href string, e.g. `#my-heading`) as context variables.

### `ellipses` [#ellipses]

> [!DEF]  default: **true**

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

### `level` [#level]

> [!DEF]  default: **"h1"**

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

### `omitFromToc` [#omitfromtoc]

> [!DEF]  default: **false**

If true, this heading will be excluded from the table of contents.

### `preserveLinebreaks` [#preservelinebreaks]

> [!DEF]  default: **false**

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

### `showAnchor` [#showanchor]

> [!DEF]  default: **false**

This property indicates whether an anchor link should be displayed next to the heading. If set to `true`, an anchor link will be displayed on hover next to the heading.

If this property is not set, the engine checks if the `showHeadingAnchors` flag is turned on in `xmluiConfig` and displays the heading anchor accordingly.

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
| [backgroundColor-H1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-H2](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-H3](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-H4](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-H5](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-H6](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-anchor-Heading](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-anchor-Heading ](/docs/styles-and-themes/common-units/#color) | $color-surface-400 | $color-surface-400 |
| [fontFamily-H1](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-H2](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-H3](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-H4](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-H5](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-H6](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Heading](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily | $fontFamily |
| [fontWeight-H1](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-H2](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-H3](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-H4](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-H5](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-H6](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Heading](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [gap-anchor-Heading](/docs/styles-and-themes/common-units/#size) | *none* | *none* |
| [gap-anchor-Heading ](/docs/styles-and-themes/common-units/#size) | $space-2 | $space-2 |
| [letterSpacing-H1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-H2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-H3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-H4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-H5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-H6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-Heading ](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [textColor-H1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-H2](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-H3](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-H4](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-H5](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-H6](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Heading](/docs/styles-and-themes/common-units/#color) | $textColor | $textColor |
| [textDecorationColor-H1](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-H2](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-H3](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-H4](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-H5](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-H6](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-anchor-Heading](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-anchor-Heading ](/docs/styles-and-themes/common-units/#textDecoration) | underline | underline |
| [textDecorationLine-H1](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-H2](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-H3](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-H4](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-H5](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-H6](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-H1](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-H2](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-H3](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-H4](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-H5](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-H6](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-H1](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-H2](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-H3](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-H4](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-H5](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-H6](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textUnderlineOffset-H1](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-H2](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-H3](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-H4](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-H5](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-H6](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
