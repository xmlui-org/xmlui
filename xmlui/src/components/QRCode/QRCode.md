%-DESC-START

**Key features:**
- **Universal compatibility**: Works with standard QR code scanners on any mobile device
- **UTF-8 support**: Handles emoji, Korean, Japanese, and other non-ASCII characters natively
- **Customizable appearance**: Control colors and size to match your design
- **Error correction**: Four levels to ensure reliability even if QR code is damaged
- **Responsive**: Automatically scales to fit container while maintaining aspect ratio

%-DESC-END

%-PROP-START value

```xmlui-pg copy display name="Example: Basic QR code with URL"
<App>
  <QRCode value="https://xmlui.com" />
</App>
```

%-PROP-END

%-PROP-START size

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

%-PROP-END

%-PROP-START level

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

%-PROP-END

%-PROP-START color

```xmlui-pg copy display name="Example: Custom foreground color"
<App>
  <HStack gap="$space-4">
    <QRCode value="https://xmlui.com" color="#FF0000" size="128" />
    <QRCode value="https://xmlui.com" color="#0000FF" size="128" />
    <QRCode value="https://xmlui.com" color="#00AA00" size="128" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START backgroundColor

```xmlui-pg copy display name="Example: Custom background color"
<App>
  <HStack gap="$space-4">
    <QRCode value="https://xmlui.com" backgroundColor="#FFEEEE" size="128" />
    <QRCode value="https://xmlui.com" backgroundColor="#EEEEFF" size="128" />
    <QRCode value="https://xmlui.com" backgroundColor="#EEFFEE" size="128" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START title

```xmlui-pg copy display name="Example: Accessible QR code"
<App>
  <QRCode value="https://xmlui.com" title="QR code linking to XMLUI website" />
</App>
```

%-PROP-END

%-USE-CASES-START

## Sharing URLs

Generate QR codes for easy sharing of website links:

```xmlui-pg copy display name="Example: Share website link"
<App>
  <Card padding="$space-6">
    <VStack gap="$space-4" horizontalAlignment="center">
      <Heading level="3">Visit Our Website</Heading>
      <QRCode value="https://xmlui.com" />
      <Text>Scan to visit XMLUI</Text>
    </VStack>
  </Card>
</App>
```

## UTF-8 Text Support

QR codes with non-ASCII characters including emoji:

```xmlui-pg copy display name="Example: UTF-8 text"
<App>
  <HStack gap="$space-6">
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode value="こんにちは 🎌" size="128" />
      <Text>Japanese + Emoji</Text>
    </VStack>
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode value="안녕하세요 🇰🇷" size="128" />
      <Text>Korean + Emoji</Text>
    </VStack>
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode value="Hello 😊🎉" size="128" />
      <Text>Emoji</Text>
    </VStack>
  </HStack>
</App>
```

## Branded QR Code

Customize colors to match your brand:

```xmlui-pg copy display name="Example: Branded QR code"
<App>
  <HStack gap="$space-6">
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode 
        value="https://xmlui.com" 
        color="#1E3A8A" 
        backgroundColor="#DBEAFE"
        size="128"
      />
      <Text>Blue Theme</Text>
    </VStack>
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode 
        value="https://xmlui.com" 
        color="#9333EA" 
        backgroundColor="#F3E8FF"
        size="128"
      />
      <Text>Purple Theme</Text>
    </VStack>
  </HStack>
</App>
```

## Best Practices

### Maintain Good Contrast

Ensure sufficient contrast between foreground and background colors for reliable scanning:

```xmlui-pg copy display name="Example: Good vs poor contrast"
<App>
  <HStack gap="$space-6">
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode value="https://xmlui.com" color="#000000" backgroundColor="#FFFFFF" size="128" />
      <Badge>✓ Good Contrast</Badge>
    </VStack>
    <VStack gap="$space-2" horizontalAlignment="center">
      <QRCode value="https://xmlui.com" color="#666666" backgroundColor="#999999" size="128" />
      <Badge variant="danger">✗ Poor Contrast</Badge>
    </VStack>
  </HStack>
</App>
```

### Use Higher Error Correction for Critical Data

For QR codes that might be printed or displayed in challenging conditions, use higher error correction levels:

```xmlui-pg copy display name="Example: High error correction"
<App>
  <QRCode 
    value="https://xmlui.com/important-page" 
    level="H"
    title="Critical link with high error correction"
  />
</App>
```

### Quiet Zone

The QRCode component automatically includes padding (quiet zone) around the code for optimal scanning. The default padding can be customized via the `padding-QRCode` theme variable.

%-USE-CASES-END
