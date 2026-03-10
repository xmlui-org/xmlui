# FormSection [#formsection]

`FormSection` groups elements within a `Form`. Child components are placed in a [FlowLayout](/components/FlowLayout).

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `columnGap` [#columngap]

> [!DEF]  default: **"3rem"**

The gap between columns of items within the section.

### `heading` [#heading]

The heading text to be displayed at the top of the form section.

### `headingLevel` [#headinglevel]

> [!DEF]  default: **"h3"**

The semantic and visual level of the heading.

Available values: `h1`, `h2`, `h3` **(default)**, `h4`, `h5`, `h6`

### `headingWeight` [#headingweight]

> [!DEF]  default: **"bold"**

The font weight of the heading.

### `info` [#info]

Informational text displayed below the heading.

### `infoFontSize` [#infofontsize]

> [!DEF]  default: **"0.8rem"**

The font size of the informational text.

### `paddingTop` [#paddingtop]

> [!DEF]  default: **"$space-normal"**

The top padding of the FlowLayout where the section's children are placed.

### `rowGap` [#rowgap]

> [!DEF]  default: **"$space-normal"**

The gap between rows of items within the section.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
