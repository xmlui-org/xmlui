# QRCode [#qrcode]

`QRCode` generates a scannable QR code from text, URLs, or any string value. It supports UTF-8 text including emoji and non-ASCII characters, customizable colors, sizes, and error correction levels. Perfect for sharing links, contact information, or any data that needs to be quickly scanned by mobile devices.

**Key features:**
- **Universal compatibility**: Works with standard QR code scanners on any mobile device
- **UTF-8 support**: Handles emoji, Korean, Japanese, and other non-ASCII characters natively
- **Customizable appearance**: Control colors and size to match your design
- **Error correction**: Four levels to ensure reliability even if QR code is damaged
- **Responsive**: Automatically scales to fit container while maintaining aspect ratio

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

```xmlui-pg copy display name="Example: Custom background color"
<App>
  <HStack gap="$space-4">
    <QRCode value="https://xmlui.com" backgroundColor="#FFEEEE" size="128" />
    <QRCode value="https://xmlui.com" backgroundColor="#EEEEFF" size="128" />
    <QRCode value="https://xmlui.com" backgroundColor="#EEFFEE" size="128" />
  </HStack>
</App>
```

### `color` [#color]

> [!DEF]  default: **"#000000"**

This property sets the foreground color (the dark squares) of the QR code. Accepts any valid CSS color value (hex, rgb, color name).

```xmlui-pg copy display name="Example: Custom foreground color"
<App>
  <HStack gap="$space-4">
    <QRCode value="https://xmlui.com" color="#FF0000" size="128" />
    <QRCode value="https://xmlui.com" color="#0000FF" size="128" />
    <QRCode value="https://xmlui.com" color="#00AA00" size="128" />
  </HStack>
</App>
```

### `level` [#level]

> [!DEF]  default: **"L"**

This property sets the error correction level of the QR code. Higher levels increase reliability but also increase the QR code density. 'L' = Low (7% recovery), 'M' = Medium (15% recovery), 'Q' = Quartile (25% recovery), 'H' = High (30% recovery).

Available values: `L` **(default)**, `M`, `Q`, `H`

```xmlui-pg copy display name="Example: Error correction levels"
<App>
  <VStack gap="$space-4">
    <HStack gap="$space-2" verticalAlignment="center">
      <QRCode value="https://xmlui.com" level="L" size="128" />
      <Text>Level L (7% recovery)</Text>
    </HStack>
    <HStack gap="$space-2" verticalAlignment="center">
      <QRCode value="https://xmlui.com" level="M" size="128" />
      <Text>Level M (15% recovery)</Text>
    </HStack>
    <HStack gap="$space-2" verticalAlignment="center">
      <QRCode value="https://xmlui.com" level="Q" size="128" />
      <Text>Level Q (25% recovery)</Text>
    </HStack>
    <HStack gap="$space-2" verticalAlignment="center">
      <QRCode value="https://xmlui.com" level="H" size="128" />
      <Text>Level H (30% recovery)</Text>
    </HStack>
  </VStack>
</App>
```

### `size` [#size]

> [!DEF]  default: **256**

This property defines the intrinsic size of the QR code in pixels. The actual display size can be controlled using layout properties (width/height). This value affects the internal resolution and detail level of the generated QR code. If not specified, uses the `size-QRCode` theme variable, or defaults to 256.

```xmlui-pg copy display name="Example: Different sizes"
<App>
  <HStack gap="$space-4">
    <QRCode value="https://xmlui.com" size="128" />
    <QRCode value="https://xmlui.com" size="256" />
  </HStack>
</App>
```

Using theme variable:

```xmlui-pg copy display name="Example: Size via theme variable"
<App>
  <Theme themeVars="{{
    'size-QRCode': '512'
  }}">
    <QRCode value="https://xmlui.com" />
  </Theme>
</App>
```

### `title` [#title]

This property sets the accessible title attribute for the QR code SVG element. Improves accessibility by providing a text description for screen readers.

```xmlui-pg copy display name="Example: Accessible QR code"
<App>
  <QRCode value="https://xmlui.com" title="QR code linking to XMLUI website" />
</App>
```

### `value` [#value]

This property specifies the text or data to encode in the QR code. The QR code can store up to 2953 characters according to the official QR specification. Supports UTF-8 text including emoji, Korean, Japanese, and other non-ASCII characters.

```xmlui-pg copy display name="Example: Basic QR code with URL"
<App>
  <QRCode value="https://xmlui.com" />
</App>
```

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
