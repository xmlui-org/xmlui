# ReadingTime [#readingtime]

`ReadingTime` displays the estimated reading time for a piece of text or markdown content as "{N} min read" with a clock icon. The duration is computed by counting words and dividing by `wordsPerMinute`.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `content`

Text or markdown content used to estimate reading time.

### `label`

> [!DEF]  default: **"min read"**

Suffix displayed after the duration. Defaults to "min read".

### `wordsPerMinute`

> [!DEF]  default: **265**

Average reading speed in words per minute.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [color](/docs/styles-and-themes/common-units/#color)-ReadingTime | $textColor-secondary | $textColor-secondary |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-ReadingTime | $fontSize-small | $fontSize-small |
| [gap](/docs/styles-and-themes/common-units/#size)-ReadingTime | 0.375rem | 0.375rem |
| [size](/docs/styles-and-themes/common-units/#size-values)-icon-ReadingTime | 1em | 1em |
