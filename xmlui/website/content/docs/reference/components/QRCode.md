# QRCode [#qrcode]

`QRCode` generates a scannable QR code from text, URLs, or any string value. It supports UTF-8 text including emoji and non-ASCII characters, customizable colors, sizes, and error correction levels. Perfect for sharing links, contact information, or any data that needs to be quickly scanned by mobile devices.

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

### `backgroundColor` [#backgroundcolor]

> [!DEF]  default: **"#FFFFFF"**

This property sets the background color (the light squares) of the QR code. Accepts any valid CSS color value (hex, rgb, color name). Note: QR codes should maintain good contrast for reliable scanning.

### `color` [#color]

> [!DEF]  default: **"#000000"**

This property sets the foreground color (the dark squares) of the QR code. Accepts any valid CSS color value (hex, rgb, color name).

### `level` [#level]

> [!DEF]  default: **"L"**

This property sets the error correction level of the QR code. Higher levels increase reliability but also increase the QR code density. 'L' = Low (7% recovery), 'M' = Medium (15% recovery), 'Q' = Quartile (25% recovery), 'H' = High (30% recovery).

Available values: `L` **(default)**, `M`, `Q`, `H`

### `size` [#size]

> [!DEF]  default: **256**

This property defines the intrinsic size of the QR code in pixels. The actual display size can be controlled using layout properties (width/height). This value affects the internal resolution and detail level of the generated QR code. If not specified, uses the `size-QRCode` theme variable, or defaults to 256.

### `title` [#title]

This property sets the accessible title attribute for the QR code SVG element. Improves accessibility by providing a text description for screen readers.

### `value` [#value]

This property specifies the text or data to encode in the QR code. The QR code can store up to 2953 characters according to the official QR specification. Supports UTF-8 text including emoji, Korean, Japanese, and other non-ASCII characters.

## Events [#events]

### `init` [#init]

This event is triggered when the QRCode is about to be rendered for the first time.

**Signature**: `init(): void`

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-QRCode | #FFFFFF | #FFFFFF |
| [color](/docs/styles-and-themes/common-units/#color)-QRCode | #000000 | #000000 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-QRCode | $space-4 | $space-4 |
| [size](/docs/styles-and-themes/common-units/#size-values)-QRCode | 256 | 256 |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`size-QRCode`** | Sets the default intrinsic size of the QR code in pixels. The size prop overrides this theme variable, which falls back to the default of 256. Must be a numeric string (e.g., "256", "512"). |
