# ModalDialog [#modaldialog]

`ModalDialog` creates overlay dialogs that appear on top of the main interface, ideal for forms, confirmations, detailed views, or any content that requires focused user attention. Dialogs are programmatically opened using the `open()` method and can receive parameters for dynamic content.

**Context variables available during execution:**

- `$param`: First parameter passed to the `open()` method
- `$params`: Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.)

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

### `closeButtonVisible` [#closebuttonvisible]

> [!DEF]  default: **true**

Shows (`true`) or hides (`false`) the visibility of the close button on the dialog.

### `fullScreen` [#fullscreen]

> [!DEF]  default: **false**

Toggles whether the dialog encompasses the whole UI (`true`) or not and has a minimum width and height (`false`).

### `title` [#title]

Provides a prestyled heading to display the intent of the dialog.

### `titleTemplate` [#titletemplate]

A custom template to render the dialog title.

## Events [#events]

### `close` [#close]

This event is fired when the close button is pressed or the user clicks outside the `ModalDialog`.

**Signature**: `close(): void`

### `open` [#open]

This event is fired when the `ModalDialog` is opened either via a `when` or an imperative API call (`open()`).

**Signature**: `open(...params: any[]): void`

- `params`: Parameters passed to the open() method, accessible via $param and $params context variables.

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method is used to close the `ModalDialog`. Invoke it using `modalId.close()` where `modalId` refers to a `ModalDialog` component.

**Signature**: `close(): void`

### `open` [#open]

This method imperatively opens the modal dialog. You can pass an arbitrary number of parameters to the method. In the `ModalDialog` instance, you can access those with the `$param` and `$params` context values.

**Signature**: `open(...params: any[]): void`

- `params`: An arbitrary number of parameters that can be used to pass data to the dialog.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`content`**: The main content area of the modal dialog.
- **`title`**: The title area of the modal dialog.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ModalDialog | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ModalDialog | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-overlay-ModalDialog | $backgroundColor-overlay | $backgroundColor-overlay |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-overlay-ModalDialog | $backgroundColor-overlay | $backgroundColor-overlay |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-title-ModalDialog | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ModalDialog | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ModalDialog | $borderRadius | $borderRadius |
| [direction](/docs/styles-and-themes/layout-props#direction)-title-ModalDialog | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-ModalDialog | $fontFamily | $fontFamily |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-ModalDialog | $fontFamily | $fontFamily |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-title-ModalDialog | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-title-ModalDialog | $fontSize-2xl | $fontSize-2xl |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-title-ModalDialog | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-title-ModalDialog | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-title-ModalDialog | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-title-ModalDialog | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-title-ModalDialog | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-title-ModalDialog | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-title-ModalDialog | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-title-ModalDialog | 0 | 0 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-title-ModalDialog | 0 | 0 |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | 450px | 450px |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | 450px | 450px |
| [minWidth](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | $space-7 | $space-7 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | $paddingVertical-ModalDialog | $paddingVertical-ModalDialog |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | $paddingHorizontal-ModalDialog | $paddingHorizontal-ModalDialog |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | $paddingHorizontal-ModalDialog | $paddingHorizontal-ModalDialog |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | $paddingVertical-ModalDialog | $paddingVertical-ModalDialog |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-ModalDialog | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-overlay-ModalDialog | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-title-ModalDialog | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-title-ModalDialog | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-ModalDialog | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-ModalDialog | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-title-ModalDialog | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-title-ModalDialog | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-title-ModalDialog | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-title-ModalDialog | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-title-ModalDialog | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-title-ModalDialog | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-title-ModalDialog | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-title-ModalDialog | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-title-ModalDialog | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-title-ModalDialog | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-title-ModalDialog | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-title-ModalDialog | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-title-ModalDialog | *none* | *none* |
