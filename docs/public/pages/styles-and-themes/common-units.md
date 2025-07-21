# Common Visual Property Units

This article describes common values that you can use in layout properties.

## Boolean Values [#boolean]

You can represent the `true` and `false` values with multiple keywords:

| Value | Description                                                                        |
| ----- | ---------------------------------------------------------------------------------- |
| true  | Use a particular style feature. Accepted keywords: `true`, `yes`, or `on`.         |
| false | Do not use a particular style feature. Accepted keywords: `false`, `no`, or `off`. |

## Border Values [#border]

When you specify the border of a component, you can use these three border properties:

- **Border width**. The stroke [width](#size) to draw the border.
- **Border style**. The border [style pattern](#border-style) to apply.
- **Border color**. The [color](#color) of the border.
  You must specify at least one of these properties to display a border. You can specify the border properties in any order; however, you can specify a property only once. All of these border specifications are correct:

```text
1px solid blue
3px
dashed 4px #f0cccc
#f0cccc 4 dashed
#f0f dotted
```

## Border Rounding [#border-rounding]

You can define border rounding values to round the corners of a component's outer border edge. You can set a single radius to make circular corners or two radii to make elliptical ones. Radius values use the size value syntax and semantics.

When you specify multiple radii, the first value determines the horizontal rounding, and the second the vertical rounding.

```xmlui-pg name="Border rounding"
<App>
<FlowLayout gap="8" padding="8">
  <CVStack width="25%" height="64px" border="solid 4px $color-surface-800" borderRadius="20px"><Text value="20px" /></CVStack>
  <CVStack width="25%" height="64px" border="solid 4px $color-surface-800" borderRadius="20px 40px"><Text value="20px 40px" /></CVStack>
  <CVStack width="25%" height="64px" border="solid 4px $color-surface-800" borderRadius="25% 20px"><Text value="25% 20px" /></CVStack>
  <CVStack width="25%" height="64px" border="solid 4px $color-surface-800" borderRadius="50%"><Text value="50%" /></CVStack>
</FlowLayout>
</App>
```

## Border Style Values [#border-style]

The engine supports these border style values:

| Value    | Description                                                                               |
| -------- | ----------------------------------------------------------------------------------------- |
| `dashed` | Displays a series of short square-ended dashes or line segments.                          |
| `dotted` | Displays a series of rounded dots.                                                        |
| `double` | Displays two straight lines that add up to the pixel size defined by the border width.    |
| `groove` | Displays a border with a carved appearance. It is the opposite of `ridge`.                |
| `inset`  | Displays a border that makes the element appear embedded. It is the opposite of `outset`. |
| `ouset`  | Displays a border that makes the element appear embossed. It is the opposite of `inset`.  |
| `ridge`  | Displays a border with an extruded appearance. It is the opposite of `groove`.            |
| `solid`  | Displays a single, straight, solid line.                                                  |

```xmlui-pg name="Border styles"
<App>
  <FlowLayout>
    <CVStack width="25%" height="64px" border="dashed 8px $color-surface-800"><Text value="dashed" /></CVStack>
    <CVStack width="25%" height="64px" border="dotted 8px $color-surface-800"><Text value="dotted" /></CVStack>
    <CVStack width="25%" height="64px" border="double 8px $color-surface-800"><Text value="double" /></CVStack>
    <CVStack width="25%" height="64px" border="groove 8px $color-surface-800"><Text value="groove" /></CVStack>
    <CVStack width="25%" height="64px" border="inset 8px $color-surface-800"><Text value="inset" /></CVStack>
    <CVStack width="25%" height="64px" border="outset 8px $color-surface-800"><Text value="outset" /></CVStack>
    <CVStack width="25%" height="64px" border="ridge 8px $color-surface-800"><Text value="ridge" /></CVStack>
    <CVStack width="25%" height="64px" border="solid 8px $color-surface-800"><Text value="solid" /></CVStack>
  </FlowLayout>
</App>
```

## Color Values [#color]

The engine accepts several color value types:

- **Hexadecimal RGB/RGBA color definitions**. You can specify color values with RGB or ARGB codes using a `#` prefix and 3, 4, 6, or 8 hexadecimal digits.
- **The `rgb` function**. Use the `rgb` function with three arguments representing the red, green, and blue components. Each component can be specified as a value between 0 and 255 or as a percentage value between 0% and 100%. You must use the same value type for all colors (numeric value or percentage); they cannot be mixed.
- **The `rgba` function**. Use the `rgba` function with four arguments. The first three arguments represent the color channels (see the `rgb` function). The alpha channel can have a percentage value (0% - 100%) or a float number between 0 and 1.
- **The `hsl` function**. Describe a color with the `hsl` function with three arguments representing the Hue angle (units are `deg`, `rad`, `grad`, or `turn`), the Saturation percentage (0% - 100%), and the Lightness percentage(0% - 100%).
- **The `hsla` function**. Describe a color with the `hsla` function with three arguments representing the H, S, and L values (see `hsl`) and the alpha channel (a percentage value (0% - 100%) or a float number between 0 and 1).
- **Named colors**. You can use standard CSS color names (all lowercase letters). See the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color) for more details.

```xmlui-pg name="Color values"
<App>
  <FlowLayout>
    <H3>Hexadecimal values</H3>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="#f0f"><Text value="#f0f (same as #ff00ff)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="#aaa"><Text value="#aba (same as #aabbaa)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="#f0f8"><Text value="#8f0f (same as #ff00ff88)" /></CVStack>
    </HStack>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="#49aec0"><Text value="#49aec0" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="#fe5a27"><Text value="#fe5a27" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="#49aec0a0"><Text value="#49aec0a0" /></CVStack>
    </HStack>
    <H3>"'rgb' function"</H3>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="rgb(106, 90, 205)"><Text value="rgb(106, 90, 205)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="rgb(80%, 40%, 20%)"><Text value="rgb(80%, 40%, 20%)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="rgb(128, 40%, 128)"><Text value="rgb(128, 40%, 128), invalid" /></CVStack>
    </HStack>
    <H3>"'rgba' function"</H3>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="rgba(106, 90, 205, .5)"><Text value="rgba(106, 90, 205, .5)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="rgba(80%, 40%, 20%, 80%)"><Text value="rgba(80%, 40%, 20%, 80%)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="rgba(70, 130, 180, 1)"><Text value="rgba(70, 130, 180, 1)" /></CVStack>
    </HStack>
    <H3>"'hsl' function"</H3>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="hsl(189, 49%, 52%)"><Text value="hsl(189, 49%, 52%)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="hsl(14, 99%, 57%)"><Text value="hsl(14, 99%, 57%)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="hsl(28, 100%, 86%)"><Text value="hsl(28, 100%, 86%)" /></CVStack>
    </HStack>
    <H3>"'hsla' function"</H3>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="hsla(189, 49%, 52%, 20%)"><Text value="hsla(189, 49%, 52%, 20%)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="hsla(14, 99%, 57%, 0.8)"><Text value="hsla(14, 99%, 57%, 0.8)" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="hsla(28, 100%, 86%, 0.25)"><Text value="hsla(28, 100%, 86%, 0.25)" /></CVStack>
    </HStack>
    <H3>"Named colors"</H3>
    <HStack>
      <CVStack width="32%" height="36px" backgroundColor="palegoldenrod"><Text value="palegoldenrod" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="seagreen"><Text value="seagreen" /></CVStack>
      <CVStack width="32%" height="36px" backgroundColor="orangered"><Text value="orangered" /></CVStack>
    </HStack>
  </FlowLayout>
</App>
```

## Cursor Values [#cursor]

This type of value sets the mouse cursor, if any, to show when the mouse pointer is over a particular component.

### General

| Value     | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `auto`    | The engine will determine the cursor to display based on the current context. |
| `default` | The platform-dependent default cursor. Typically, an arrow.                   |
| `none`    | No cursor is rendered.                                                        |

### Links and Status

| Value          | Description                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `context‑menu` | A context menu is available.                                                                                                                    |
| `help`         | Help information is available.                                                                                                                  |
| `pointer`      | The cursor is a pointer that indicates a link. Typically, it is an image of a pointing hand.                                                    |
| `progress`     | The program is busy in the background, but the user can still interact with the interface (in contrast to `wait`).                              |
| `wait`         | The program is busy, and the user can't interact with the interface (in contrast to `progress`). Sometimes an image of an hourglass or a watch. |

### Selection

| Value           | Description                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| `cell`          | The table cell or set of cells can be selected.                               |
| `crosshair`     | Cross cursor, often used to indicate selection in a bitmap.                   |
| `text`          | The text can be selected. Typically, the shape of an I-beam.                  |
| `vertical‑text` | The vertical text can be selected. Typically, the shape of a sideways I-beam. |

### Drag and Drop

| Value         | Description                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `alias`       | An alias or shortcut is to be created.                                                                        |
| `copy`        | Something is to be copied.                                                                                    |
| `move`        | Something is to be moved.                                                                                     |
| `no‑drop`     | An item may not be dropped at the current location. On Windows and macOS, no-drop is the same as not-allowed. |
| `not‑allowed` | The requested action will not be carried out.                                                                 |
| `grab`        | Something can be grabbed (dragged to be moved).                                                               |
| `grabbing`    | Something is being grabbed (dragged to be moved).                                                             |

### Resizing and Scrolling

| Value                                                                                                                                                      | Description                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `all‑scroll`                                                                                                                                               | Something can be scrolled in any direction (panned). [Firefox bug 275174](https://bugzil.la/275174): On Windows, all-scroll is the same as move.                                                                                                                                    |
| `col‑resize`                                                                                                                                               | The item/column can be resized horizontally. Often rendered as arrows pointing left and right with a vertical bar separating them.                                                                                                                                                  |
| `row‑resize`                                                                                                                                               | The item/row can be resized vertically. Often rendered as arrows pointing up and down with a horizontal bar separating them.                                                                                                                                                        |
| `n‑resize`, `e‑resize`, `s‑resize`, `w‑resize`, `ne‑resize`, `nw‑resize`, `se‑resize`, `sw‑resize`, `ew‑resize`, `ns‑resize`, `nesw‑resize`, `nwse‑resize` | Some edge is to be moved. For example, the `se‑resize` cursor is used when the movement starts from the south-east corner of the box. In some environments, an equivalent bidirectional resize cursor is shown. For example, `n‑resize` and `s‑resize` are the same as `ns‑resize`. |

### Zooming

| Value                 | Description                                    |
| --------------------- | ---------------------------------------------- |
| `zoom‑in`, `zoom‑out` | Something can be zoomed (magnified) in or out. |

### Cursor Examples

Move the mouse over the rectangles in the following example to check what the cursor looks like.

```xmlui-pg name="Cursor values"
<App>
  <FlowLayout>
    <CVStack width="20%" height="36px" cursor="auto" border="solid 1px $color-surface-800">auto</CVStack>
    <CVStack width="20%" height="36px" cursor="default" border="solid 1px  $color-surface-800">default</CVStack>
    <CVStack width="20%" height="36px" cursor="none" border="solid 1px  $color-surface-800">none</CVStack>
  </FlowLayout>
  <FlowLayout>
    <CVStack width="20%" height="36px" cursor="context-menu" border="solid 1px $color-surface-800">context-menu</CVStack>
    <CVStack width="20%" height="36px" cursor="help" border="solid 1px $color-surface-800">help</CVStack>
    <CVStack width="20%" height="36px" cursor="pointer" border="solid 1px $color-surface-800">pointer</CVStack>
    <CVStack width="20%" height="36px" cursor="progress" border="solid 1px $color-surface-800">progress</CVStack>
    <CVStack width="20%" height="36px" cursor="wait" border="solid 1px $color-surface-800">wait</CVStack>
  </FlowLayout>
  <FlowLayout>
    <CVStack width="20%" height="36px" cursor="cell" border="solid 1px $color-surface-800">cell</CVStack>
    <CVStack width="20%" height="36px" cursor="crosshair" border="solid 1px $color-surface-800">crosshair</CVStack>
    <CVStack width="20%" height="36px" cursor="text" border="solid 1px $color-surface-800">text</CVStack>
    <CVStack width="20%" height="36px" cursor="vertical-text" border="solid 1px $color-surface-800">vertical-text</CVStack>
  </FlowLayout>
  <FlowLayout>
    <CVStack width="20%" height="36px" cursor="alias" border="solid 1px $color-surface-800">alias</CVStack>
    <CVStack width="20%" height="36px" cursor="copy" border="solid 1px $color-surface-800">copy</CVStack>
    <CVStack width="20%" height="36px" cursor="move" border="solid 1px $color-surface-800">move</CVStack>
    <CVStack width="20%" height="36px" cursor="no-drop" border="solid 1px $color-surface-800">no-drop</CVStack>
    <CVStack width="20%" height="36px" cursor="not-allowed" border="solid 1px $color-surface-800">not-allowed</CVStack>
    <CVStack width="20%" height="36px" cursor="grab" border="solid 1px $color-surface-800">grab</CVStack>
    <CVStack width="20%" height="36px" cursor="grabbing" border="solid 1px $color-surface-800">grabbing</CVStack>
  </FlowLayout>
  <FlowLayout>
    <CVStack width="20%" height="36px" cursor="alt-scroll" border="solid 1px $color-surface-800">all-scroll</CVStack>
    <CVStack width="20%" height="36px" cursor="col-resize" border="solid 1px $color-surface-800">col-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="row-resize" border="solid 1px $color-surface-800">row-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="n-resize" border="solid 1px $color-surface-800">n-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="e-resize" border="solid 1px $color-surface-800">e-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="s-resize" border="solid 1px $color-surface-800">s-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="w-resize" border="solid 1px $color-surface-800">w-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="ne-resize" border="solid 1px $color-surface-800">ne-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="nw-resize" border="solid 1px $color-surface-800">nw-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="se-resize" border="solid 1px $color-surface-800">se-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="sw-resize" border="solid 1px $color-surface-800">sw-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="ew-resize" border="solid 1px $color-surface-800">ew-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="ns-resize" border="solid 1px $color-surface-800">ns-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="nesw-resize" border="solid 1px $color-surface-800">nesw-resize</CVStack>
    <CVStack width="20%" height="36px" cursor="nwse-resize" border="solid 1px $color-surface-800">nwse-resize</CVStack>
  </FlowLayout>
  <FlowLayout>
    <CVStack width="20%" height="36px" cursor="zoom-in" border="solid 1px $color-surface-800">zoom-in</CVStack>
    <CVStack width="20%" height="36px" cursor="zoom-out" border="solid 1px $color-surface-800">zoom-out</CVStack>
  </FlowLayout>
</App>
```

## Font Family Values [#font-family]

Font family values are a prioritized list of one or more font family names and/or generic family names. Multiple names should be separated by commas. Font family names containing whitespace should be quoted.
These are the generic family names:

| Name            | Description                                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serif`         | Glyphs have finishing strokes, flared or tapering ends, or have actual serifed endings.                                                                                                                                                                                      |
| `sans‑serif`    | Glyphs have stroke endings that are plain.                                                                                                                                                                                                                                   |
| `monospace`     | All glyphs have the same fixed width.                                                                                                                                                                                                                                        |
| `cursive`       | Glyphs in cursive fonts generally have either joining strokes or other cursive characteristics beyond those of italic typefaces. The glyphs are partially or completely connected, and the result looks more like handwritten pen or brush writing than printed letter work. |
| `fantasy`       | fantasy fonts are primarily decorative fonts that contain playful representations of characters.                                                                                                                                                                             |
| `system‑ui`     | Glyphs are taken from the default user interface font on a given platform. Because typographic traditions vary widely across the world, this generic is provided for typefaces that don't map cleanly into the other generics.                                               |
| `ui‑serif`      | The default user interface serif font.                                                                                                                                                                                                                                       |
| `ui‑sans‑serif` | The default user interface sans-serif font.                                                                                                                                                                                                                                  |
| `ui‑monospace`  | The default user interface monospace font.                                                                                                                                                                                                                                   |
| `ui‑rounded`    | The default user interface font that has rounded features.                                                                                                                                                                                                                   |
| `math`          | This is for the particular stylistic concerns of representing mathematics: superscript and subscript, brackets that cross several lines, nesting expressions, and double struck glyphs with distinct meanings.                                                               |
| `emoji`         | Fonts that are specifically designed to render emoji.                                                                                                                                                                                                                        |
| `fangsong`      | A particular style of Chinese characters that are between serif-style Song and cursive-style Kai forms. This style is often used for government documents.                                                                                                                   |

> [!INFO]
> A generic font family should be the last item in the list of font family names.

Examples:

```text
Helvetica
"Times New Roman"
Bookville, "Times New Roman", serif
```

## Font Weight Values [#font-weight]

Font weight values set the font's weight (or boldness); the available values depend on the currently selected font family.

Weight values can be numbers between 1 and 1000. The hundreds (100, 200, 300, ..., 900) are conventionally used. You can use a few identifiers to specify the font weights:

| Value     | Description                                               |
| --------- | --------------------------------------------------------- |
| `normal`  | Normal font weight. Same as `400`.                        |
| `bold`    | Bold font weight. Same as `700`.                          |
| `lighter` | One relative font weight lighter than the parent element. |
| `bolder`  | One relative font weight heavier than the parent element. |

## Font Style Values [#fontStyle]

This property determines whether a font should be styled with a normal, italic, or oblique face from its font family.

| Value     | Description                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normal`  | Selects a font that is classified as normal within a font family.                                                                                                                                     |
| `italic`  | Selects a font that is classified as italic. If no italic version of the face is available, one classified as oblique is used instead. If neither is available, the style is artificially simulated.  |
| `oblique` | Selects a font that is classified as oblique. If no oblique version of the face is available, one classified as italic is used instead. If neither is available, the style is artificially simulated. |

## Font Stretch Values [#fontStretch]

This property selects a regular, condensed, or expanded face from a font. Its value can be specified as a percentage value or as one of the following:

| Value                                                               | Description                                                                                     |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `normal`                                                            | Specifies a normal font face.                                                                   |
| `semi‑condensed`, `condensed`, `extra‑condensed`, `ultra‑condensed` | Specifies a more condensed font face than normal, with `ultra‑condensed` as the most condensed. |
| `semi‑expanded`, `expanded`, `extra‑expanded`, `ultra‑expanded`     | Specifies a more expanded font face than normal, with `ultra‑expanded` as the most expanded.    |

## Opacity [#opacity]

This property sets an element's opacity. Opacity is the degree to which the content behind an element is hidden, and it is the opposite of transparency.

The property value is a number in the range of 0.0 to 1.0, inclusive, or a percentage in the range of 0% to 100%, inclusive, representing the opacity of the channel (that is, the value of its alpha channel). Any value outside the interval, though valid, is clamped to the nearest limit in the range.

## Overflow Values [#overflow]

A component may not fit into the viewport its parent provides. An overflow value specifies the engine's strategy in such a case.

| Value     | Description                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visible` | (**default**) Overflow content is not clipped and may be visible outside the element's padding box.                                                                                         |
| `hidden`  | Overflow content is clipped at the element's padding box. There are no scroll bars, and the clipped content is not visible (i.e., clipped content is hidden), but the content still exists. |
| `scroll`  | Overflow content is clipped at the element's padding box, and overflow content can be scrolled into view using scroll bars.                                                                 |

## Outline Values [#outline]

When you specify the outline of a component, you can use these three properties:

- **Outline width**. The stroke [width](#size) to draw the outline.
- **Outline style**. The outline [style pattern](#border-style) to apply.
- **Outline color**. The [color](#color) of the outline.

You must specify all of these properties to display an outline. You can specify the outline properties in any order; however, you can specify a property only once. All of these outline specifications are correct:

```text
1px solid blue
dashed 4px #f0cccc
#f0cccc 4 dashed
```

## Shadow Values [#shadow]

You can define shadow values with one or more shadow effects. If you use more than one effect, you must separate them with a comma. A shadow effect is composed of these parts:

- Horizontal offset of the effect
- Vertical offset of the effect
- Blur radius
- Spread radius
- Optional color

The first up to four [size value](#size)
segments are followed by the optional [color value](#color).

You can use two, three, or four size values.

- If only two values are given, the engine interprets them as the horizontal and vertical offsets.
- If a third value is given, it is interpreted as a blur radius.
- If a fourth value is given, it is interpreted as a spread radius.

When you prefix the shadow value with `inset`, it changes the shadow from an outer box shadow to an inner box shadow (as if the content is pressed into the box).

```xmlui-pg name="Shadow Values" height="360px"
<FlowLayout gap="24">
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="12px 12px 5px orangered" >
    <Text>12px 12px 5px orangered</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="inset 12px 12px 5px #808080" >
    <Text>inset 12px 12px 5px orangered</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="16px 8px green" >
    <Text>16px 8px green</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="-8px -6px green" >
    <Text>"inset 12px 12px 5px orangered"</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="16px 8px 12px blue" >
    <Text>16px 8px 12px blue</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="16px 8px 8px 4px blue" >
    <Text>16px 8px 8px 4px blue</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="12px 12px 5px orangered, inset 8px 6px green" >
    <Text>12px 12px 5px orangered, inset 8px 6px green</Text>
  </Stack>
  <Stack margin="16px" padding="16px" width="80%" border="2px solid $color-surface-800"
    boxShadow="8px 4px 2px blue, -8px -6px green" >
    <Text>12px 12px 5px blue, -8px -6px green</Text>
  </Stack>
</FlowLayout>
```

## Size Values [#size]

Size values are composed of a numeric value and an optional unit. Here are a few examples:

```text
12px
0.25rem
50%
0
125mm
```

UI Engine uses these units with the CSS semantics:

| Unit   | Description                                                                                                                                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cm`   | Centimeters (1cm = 37.8px = 25.2/64in)                                                                                                                                                              |
| `mm`   | Millimeters (1mm = 1/10th of 1cm)                                                                                                                                                                   |
| `in`   | Inches (1in = 2.54cm = 96px)                                                                                                                                                                        |
| `pc`   | Picas (1pc = 1/6th of 1in)                                                                                                                                                                          |
| `pt`   | Points (1pt = 1/72nd of 1in)                                                                                                                                                                        |
| `px`   | Pixels (1px = 1/96th of 1in)                                                                                                                                                                        |
| `em`   | Relative to the font size of the parent component, in the case of typographical properties (like the font size), and font size of the element itself, in the case of other properties like (width). |
| `ex`   | x-height (the height of a normal lowercase "x") of the element's font.                                                                                                                              |
| `ch`   | The advance measure (width) of the glyph "0" of the element's font.                                                                                                                                 |
| `ch`   | The advance measure (width) of the glyph "0" of the element's font.                                                                                                                                 |
| `rem`  | Font size of the root element.                                                                                                                                                                      |
| `vw`   | 1% of the viewport's width.                                                                                                                                                                         |
| `vh`   | 1% of the viewport's height.                                                                                                                                                                        |
| `vmin` | 1% of the viewport's smaller dimension.                                                                                                                                                             |
| `vmax` | 1% of the viewport's smaller dimension.                                                                                                                                                             |
| `%`    | The percentage value is relative to the parent container's viewport size offered for the particular child element.                                                                                  |
| `*`    | Start sizing: The size weight used when calculating the dimension of the particular child element. The base of the calculation is the remaining space size in the parent's viewport.                |

## Alignment Values [#alignment]

Properties such as `verticalAlignment` and `horizontalAlignment` set the alignment of content in a layout component vertically or horizontally.

| Value    | Description                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `start`  | Horizontal: `left` if direction is left-to-right and `right` if direction is right-to-left. Vertical: at the `top`.    |
| `end`    | Horizontal: `right` if direction is left-to-right and `left` if direction is right-to-left. Vertical: at the `bottom`. |
| `center` | The contents are centered within the container.                                                                        |

```xmlui-pg name="Horizontal Alignment Values"
<VStack gap="8px" marginVertical="8px" paddingVertical="8px" width="600px" margin="auto">
  <HStack horizontalAlignment="start" backgroundColor="$color-surface-200">
    <Stack backgroundColor="red" height="36px" width="36px" />
  </HStack>

  <HStack horizontalAlignment="end" backgroundColor="$color-surface-200">
    <Stack backgroundColor="red" height="36px" width="36px" />
  </HStack>

  <HStack horizontalAlignment="center" backgroundColor="$color-surface-200">
    <Stack backgroundColor="red" height="36px" width="36px" />
  </HStack>
</VStack>
```

```xmlui-pg name="Vertical Alignment Values"
<HStack gap="8px" marginVertical="8px" paddingHorizontal="30px" width="600px" height="120px" margin="auto">
  <VStack verticalAlignment="start" backgroundColor="$color-surface-200">
    <Stack backgroundColor="red" height="36px" width="36px" />
  </VStack>

  <VStack verticalAlignment="end" backgroundColor="$color-surface-200">
    <Stack backgroundColor="red" height="36px" width="36px" />
  </VStack>

  <VStack verticalAlignment="center" backgroundColor="$color-surface-200">
    <Stack backgroundColor="red" height="36px" width="36px" />
  </VStack>
</HStack>
```

## Text Alignment Values [#text-align]

This value sets the horizontal alignment of the inline-rendered content (e.g., text) inside its block-rendered parent.

| Value     | Description                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`   | The same as `left` if direction is left-to-right and `right` if direction is right-to-left.                                                                         |
| `end`     | The same as `right` if direction is left-to-right and `left` if direction is right-to-left.                                                                         |
| `left`    | The inline contents are aligned to the left edge of the line box.                                                                                                   |
| `right`   | The inline contents are aligned to the right edge of the line box.                                                                                                  |
| `center`  | The inline contents are centered within the line box.                                                                                                               |
| `justify` | The inline contents are justified. Text should be spaced to line up its left and right edges to the left and right edges of the line box, except for the last line. |

```xmlui-pg name="Alignment Values"
<VStack gap="8px" marginVertical="8px" paddingVertical="8px" width="600px" margin="auto">
  <Text textAlign="left">This is a long text with several words (left)</Text>
  <Text textAlign="right">This is a long text with several words (right)</Text>
  <Text textAlign="center">This is a long text with several words (center)</Text>
  <Text textAlign="justify">This is a long, long,long, long, long, long, long, very long text with several words that do not fit into a single line (justify). Last line is not justified.</Text>
</VStack>
```

## Text Decoration Values [#text-decoration]

A text decoration value is composed of these segments:

- **color**. The color of the decoration
- **line**. The kind of decoration used
- **style**. The line style to use

You can use one, two, or three segments when specifying the text decoration. They can be in any order; however, one segment type can be used only once.

These are the available line values:

| Value          | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| `underline`    | Each line of text has a decorative line beneath it.               |
| `overline`     | Each line of text has a decorative line above it.                 |
| `line-through` | Each line of text has a decorative line going through its middle. |

You can use these style values:

| Value    | Description          |
| -------- | -------------------- |
| `solid`  | Draws a single line. |
| `double` | Draws a double line. |
| `dotted` | Draws a dotted line. |
| `dashed` | Draws a dashed line. |
| `wavy`   | Draws a wavy line.   |

```xmlui-pg name="Text Decoration Values" height="265px"
<VStack margin="8px" gap="8px">
  <Text textDecoration="underline">underline</Text>
  <Text textDecoration="red wavy underline">red wavy underline</Text>
  <Text textDecoration="line-through">line-through</Text>
  <Text textDecoration="line-through orange">line-through orange</Text>
  <Text textDecoration="double line-through blue">double line-through blue</Text>
  <Text textDecoration="overline">overline</Text>
  <Text textDecoration="dotted overline #808080">dotted overline #808080</Text>
</VStack>
```

## Text Transform Values [#text-transform]

This value specifies how to capitalize a component's text. It can be used to make text appear in all-uppercase or all-lowercase, or with each word capitalized.

| Value            | Description                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`           | Converts the first letter of each word to uppercase. Other characters remain unchanged (they retain their original case as written in the element's text)                                                     |
| `capitalize`     | Draws a double line.                                                                                                                                                                                          |
| `uppercase`      | Converts all characters to uppercase.                                                                                                                                                                         |
| `lowercase`      | Converts all characters to lowercase.                                                                                                                                                                         |
| `full-width`     | Forces the writing of a character — mainly ideograms and Latin scripts — inside a square, allowing them to be aligned in the usual East Asian scripts (like Chinese or Japanese).                             |
| `full-size-kana` | Generally used for ruby annotation text, the keyword converts all small Kana characters to the equivalent full-size Kana, to compensate for legibility issues at the small font sizes typically used in ruby. |

## Text Wrap Values [#text-wrap]

This value controls how text inside an element is wrapped.

| Value     | Description                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wrap`    | Text is wrapped across lines at appropriate characters (for example, spaces in languages like English that use space separators) to minimize overflow. (**default**)                                           |
| `nowrap`  | The text does not wrap across lines. It will overflow its containing element rather than breaking onto a new line.                                                                                             |
| `balance` | The text is wrapped in a way that best balances the number of characters on each line, enhancing layout quality and legibility.                                                                                |
| `pretty`  | Results in the same behavior as `wrap`, except that the user agent will use a slower algorithm that favors better layout over speed.                                                                           |
| `stable`  | Results in the same behavior as `wrap`, except that when the user is editing the content, the lines that come before the lines they are editing remain static rather than the whole block of text re-wrapping. |

## User Select Values [#user-select]

These values control whether the user can select text.

| Value      | Description                                                                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`     | The text of the component and its children is not selectable.                                                                                                                                                                                                                                                        |
| `auto`     | Automatically determines the value.                                                                                                                                                                                                                                                                                  |
| `text`     | The text can be selected by the user.                                                                                                                                                                                                                                                                                |
| `all`      | The content of the component shall be selected atomically: If a selection would contain part of the component, then the selection must contain the entire component, including all its children. If a double-click or context-click occurs in sub-components, the highest ancestor with this value will be selected. |
| `contains` | Enables selection to start within the component; however, the selection will be contained by the bounds of that component.                                                                                                                                                                                           |

## Zoom Values [#zoom]

The value of the `zoom` property controls the magnification level of a component:

| Value            | Description                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normal`         | Render the element at its normal size; equal to `1`.                                                                                                                                                 |
| `reset`          | This resets the value to zoom: 1 and prevents the element from being (de)magnified if the user applies non-pinch-based zooming (e.g., by pressing Ctrl—or Ctrl+ keyboard shortcuts) to the document. |
| percentage value | `100%` is equivalent to normal. Values larger than `100%` zoom in. Values smaller than `100%` zoom out.                                                                                              |
| number           | Equivalent to the corresponding percentage (`1.0` = `100%` = `normal`). Values larger than `1.0` zoom in. Values smaller than `1.0` zoom out.                                                        |

```xmlui-pg name="Setting zoom"
<App>
  <HStack>
    <Card zoom="0.75" width="150px" title="Hello!" subtitle="zoom: '0.75' " height="fit-content"/>
    <Card width="150px" title="Hello!" subtitle="zoom: 'normal'" height="fit-content"/>
    <Card zoom="200%" width="150px" title="Hello!" subtitle="zoom: '200%'" height="fit-content"/>
  </HStack>
</App>
```

## Font Variant Values [#font-variant]

This value controls the usage of alternate glyphs in a font. These alternates include things like stylistic variants (such as small caps), ligatures, and more.

| Value        | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `normal`     | Specifies a normal font face; none of the features below are activated.                               |
| `small-caps` | Specifies a font that is specifically designed with capital letters at the size of lowercase letters. |

```xmlui-pg name="Font variant values"
<App>
  <FlowLayout gap="16px">
    <Text fontSize="18px" fontVariant="normal">This text uses normal font variant</Text>
    <Text fontSize="18px" fontVariant="small-caps">This text uses small-caps font variant</Text>
  </FlowLayout>
</App>
```

## Line Break Values [#line-break]

This value determines how line breaking works for languages that use a text wrapping system other than the standard space-based approach.

| Value      | Description                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| `auto`     | Uses the default line break rule.                                             |
| `loose`    | Relaxes the line-breaking rules, allowing more opportunities for a break.     |
| `normal`   | Uses standard line break rules.                                               |
| `strict`   | Tightens the line-breaking rules, reducing the number of break opportunities. |
| `anywhere` | Allows a line break to be inserted between any character.                     |

## Text Shadow Values [#text-shadow]

This value adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its decorations.

A shadow is described by:

- Horizontal offset (required)
- Vertical offset (required)
- Blur radius (optional)
- Color (optional)

```xmlui-pg name="Text shadow examples"
<App>
  <VStack gap="16px">
    <Text fontSize="20px" textShadow="2px 2px">Simple shadow (black)</Text>
    <Text fontSize="20px" textShadow="2px 2px 5px red">Shadow with blur</Text>
    <Text fontSize="20px" textShadow="2px 2px blue, 4px 4px 10px red">Multiple shadows</Text>
    <Text fontSize="20px" color="white" textShadow="1px 1px 2px black, 0 0 25px blue, 0 0 5px darkblue">Glow effect</Text>
  </VStack>
</App>
```

## Text Indent Values [#text-indent]

This value specifies the amount of indentation (empty space) that should be left before the first line of the text content of a block element.

```xmlui-pg name="Text indent examples"
<App>
  <VStack gap="16px" width="100%">
    <Text textIndent="0px">This paragraph has <Text variant="strong">no text indent</Text>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor.</Text>
    <Text textIndent="30px">This paragraph has a <Text variant="strong">30px text indent</Text>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor.</Text>
    <Text textIndent="10%">This paragraph has a <Text variant="strong">10% text indent</Text>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor.</Text>
  </VStack>
</App>
```

## Word Break Values [#word-break]

This value specifies how words should break when reaching the end of a line.

| Value        | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `normal`     | Uses default line break rules.                                                                        |
| `break-all`  | May break between any two characters to prevent overflow.                                             |
| `keep-all`   | Prevents breaks for Chinese, Japanese, and Korean (CJK) text. Non-CJK text behavior is set to normal. |
| `break-word` | Allows unbreakable words to be broken at arbitrary points if there are no acceptable break points.    |

```xmlui-pg name="Word break examples"
<App>
  <FlowLayout gap="16px">
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-break: normal</Text>
      <Text wordBreak="normal">This is a very long text with a verylongwordthatdoesnotbreak normally</Text>
    </VStack>
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-break: break-all</Text>
      <Text wordBreak="break-all">This is a very long text with a verylongwordthatbreaks anywhere</Text>
    </VStack>
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-break: keep-all</Text>
      <Text wordBreak="keep-all">This is a very long text with a verylongwordthatdoesnotbreak normally</Text>
    </VStack>
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-break: break-word</Text>
      <Text wordBreak="break-word">This is a very long text with a verylongwordthatdoesnotbreak normally</Text>
    </VStack>
  </FlowLayout>
</App>
```

## Word Spacing Values [#word-spacing]

This value sets the length of white space between words and between tags. Positive values increase the space between words, while negative values bring them closer together.

```xmlui-pg name="Word spacing examples"
<App>
  <VStack gap="16px">
    <Text wordSpacing="normal">This text has <Text variant="strong">normal</Text> word spacing.</Text>
    <Text wordSpacing="5px">This text has <Text variant="strong">5px</Text> word spacing.</Text>
    <Text wordSpacing="10px">This text has <Text variant="strong">10px</Text> word spacing.</Text>
    <Text wordSpacing="-2px">This text has <Text variant="strong">-2px</Text> word spacing.</Text>
  </VStack>
</App>
```

## Word Wrap Values [#word-wrap]

This value determines whether the browser should break lines within words when they would otherwise overflow the container.

| Value        | Description                                                                           |
| ------------ | ------------------------------------------------------------------------------------- |
| `normal`     | Lines may only break at normal break points (such as spaces between words).           |
| `break-word` | To prevent overflow, an otherwise unbreakable word may be broken at arbitrary points. |
| `anywhere`   | To prevent overflow, the browser may break between any two characters.                |

```xmlui-pg name="Word wrap examples"
<App>
  <FlowLayout gap="16px">
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-wrap: normal</Text>
      <Text wordWrap="normal">This is a very long text with a verylongwordthatdoesnotbreak normally</Text>
    </VStack>
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-wrap: break-word</Text>
      <Text wordWrap="break-word">This is a very long text with a verylongwordthatbreaks when needed</Text>
    </VStack>
    <VStack width="150px" border="1px solid gray" padding="8px">
      <Text>word-wrap: anywhere</Text>
      <Text wordWrap="anywhere">This is a very long text with a verylongwordthatbreaks when needed</Text>
    </VStack>
  </FlowLayout>
</App>
```

## Writing Mode Values [#writing-mode]

This value sets whether lines of text are laid out horizontally or vertically, as well as the direction in which blocks progress.

| Value           | Description                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| `horizontal-tb` | Content flows horizontally from left to right, vertically from top to bottom.                 |
| `vertical-rl`   | Content flows vertically from top to bottom, horizontally from right to left.                 |
| `vertical-lr`   | Content flows vertically from top to bottom, horizontally from left to right.                 |
| `sideways-rl`   | Content flows vertically from top to bottom and all glyphs are set sideways toward the right. |
| `sideways-lr`   | Content flows vertically from top to bottom and all glyphs are set sideways toward the left.  |

```xmlui-pg name="Writing mode examples"
<App>
  <FlowLayout gap="24px">
    <VStack width="100px" height="200px" border="1px solid gray" padding="8px">
      <Text>horizontal-tb</Text>
      <Text writingMode="horizontal-tb">Horizontal writing mode</Text>
    </VStack>
    <VStack width="100px" height="200px" border="1px solid gray" padding="8px">
      <Text>vertical-rl</Text>
      <Text writingMode="vertical-rl">Vertical 1</Text>
      <Text writingMode="vertical-rl">Vertical 2</Text>
    </VStack>
    <VStack width="100px" height="200px" border="1px solid gray" padding="8px">
      <Text>vertical-lr</Text>
      <Text writingMode="vertical-lr">Vertical 1</Text>
      <Text writingMode="vertical-lr">Vertical 2</Text>
    </VStack>
    <VStack width="100px" height="200px" border="1px solid gray" padding="8px">
      <Text>sideways-rl</Text>
      <Text writingMode="sideways-rl">Vertical 1</Text>
      <Text writingMode="sideways-rl">Vertical 2</Text>
    </VStack>
    <VStack width="100px" height="200px" border="1px solid gray" padding="8px">
      <Text>sideways-lr</Text>
      <Text writingMode="sideways-lr">Vertical 1</Text>
      <Text writingMode="sideways-lr">Vertical 2</Text>
    </VStack>
  </FlowLayout>
</App>
```

## Transition Values [#transition]

This value specifies the CSS property to animate, the duration of the transition effect, the timing function, and the delay before the transition starts. It creates smooth animations between property value changes.

A transition value can include up to four parts (in any order):

- **Property name**: Specifies the CSS property to transition (e.g., `opacity`, `color`, `width`)
- **Duration**: How long the transition takes (e.g., `0.5s`, `300ms`)
- **Timing function**: How the transition progresses over time (e.g., `ease`, `linear`)
- **Delay**: How long to wait before starting the transition (e.g., `0s`, `200ms`)

You can specify multiple transitions by separating them with commas.

| Timing Function Values  | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `ease`                  | Starts slow, becomes fast, then ends slowly. This is the default value. |
| `linear`                | Same speed from start to end.                                           |
| `ease-in`               | Starts slowly and accelerates.                                          |
| `ease-out`              | Starts quickly and decelerates.                                         |
| `ease-in-out`           | Starts slowly, speeds up in the middle, and ends slowly.                |
| `cubic-bezier(n,n,n,n)` | Define your own timing function with four values.                       |
