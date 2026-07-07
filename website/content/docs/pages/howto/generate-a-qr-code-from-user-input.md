# Generate a QR code from user input

Bind `QRCode` value to a `TextBox` so the code updates live as the user types.

The `QRCode` component renders an SVG QR code from any string. Because XMLUI is fully reactive, binding `value` to a variable that a `TextBox` writes to makes the QR code redraw on every keystroke — giving the user instant visual feedback.

```xmlui-pg copy display name="Type a URL to generate a QR code"
---app display
<App>
  <variable name="text" value="https://xmlui.com" />

  <HStack wrapContent verticalAlignment="start">
    <VStack width="*" minWidth="240px">
      <TextBox
        label="Text or URL"
        initialValue="{text}"
        onDidChange="value =>text = value"
        placeholder="Enter text..." />
      <HStack>
        <Text variant="caption">Characters: {text.length} / 2953</Text>
      </HStack>
      <HStack>
        <Button
          label="Copy link"
          variant="outlined"
          onClick="text = 'https://xmlui.com'" />
        <Button
          label="Clear"
          onClick="text = ''" />
      </HStack>
    </VStack>
    <CVStack width="*" minWidth="200px">
      <QRCode
        value="{text || ' '}"
        size="{200}"
        level="M"
        title="Generated QR code" />
    </CVStack>
  </HStack>
</App>
```

## Key points

**`value` is the only required prop**: Pass any string — a URL, plain text, an email address, or a JSON payload. The component encodes it into a QR code SVG. The maximum length is 2 953 characters (QR spec limit).

**The QR code updates reactively**: Bind `value="{text}"` to a variable and update that variable from a `TextBox`. Every change triggers a re-render of the SVG — no manual refresh needed.

**`level` controls error correction**: Choose `"L"` (7 %), `"M"` (15 %, default), `"Q"` (25 %), or `"H"` (30 %). Higher levels make the code scannable even when partially obscured, but increase the number of modules (dots), making the code visually denser.

**`size` sets the intrinsic pixel dimension**: The default is `256`. The SVG scales to its container, so `size` controls the resolution rather than the on-screen display size. Use layout props like `width` and `height` to control how large the code appears.

**`color` and `backgroundColor` customise the palette**: Set `color="#1a1a2e"` for dark modules and `backgroundColor="#e0e0e0"` for the background. Keep sufficient contrast — most QR scanners fail when the foreground and background are too similar.

---

## See also

- [Render a Markdown file as a page](/docs/howto/render-a-markdown-file-as-a-page) — display dynamic content from a string
- [Lazy-load images for performance](/docs/howto/lazy-load-images-for-performance) — defer offscreen media to improve load time
- [Embed an external site in an IFrame](/docs/howto/embed-an-external-site-in-an-iframe) — embed external content inline
