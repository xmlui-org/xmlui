# Embed an external site in an IFrame

Use `IFrame` with `sandbox` and `allow` for secure third-party embeds.

`IFrame` renders an embedded browsing context inside your app. Point `src` at any URL or pass raw HTML via `srcdoc`. Use the `sandbox` attribute to restrict what the embedded content can do, and `allow` to grant specific permissions like fullscreen or camera access.

```xmlui-pg copy display name="Embedded web page"
---app display
<App>
  <variable name="url" value="https://en.wikipedia.org/wiki/Main_Page" />

  <HStack marginBottom="$space-2" verticalAlignment="center">
    <TextBox
      id="urlInput"
      width="*"
      initialValue="{url}"
      placeholder="Enter a URL..." />
    <Button
      label="Load"
      variant="solid"
      onClick="url = urlInput.value" />
  </HStack>

  <IFrame
    src="{url}"
    height="320px"
    sandbox="allow-scripts allow-same-origin"
  />
</App>
```

## Key points

**`src` loads a remote page**: Pass any URL to `src` and the page renders inside the frame. The `IFrame` defaults to `width="100%"` and `height="300px"` — override `height` when the embedded content needs more space.

**`sandbox` restricts the embedded content**: Without `sandbox`, the iframe has full access to scripts, forms, and popups. Add `sandbox="allow-scripts allow-same-origin"` to permit scripts while blocking form submission, popups, and top-level navigation. Omit `allow-scripts` entirely for untrusted content.

**`srcdoc` renders inline HTML**: When you don't need a remote URL, pass raw HTML to `srcdoc` — useful for previewing user-generated HTML or rendering a self-contained widget without a server roundtrip.

**`allow` grants permissions policies**: Set `allow="fullscreen; camera; microphone"` to let embedded content request those browser APIs. Permissions not listed are denied even if the embedded page requests them.

**`postMessage()` communicates with the iframe**: Call `iframeId.postMessage(data, targetOrigin)` from your app to send messages into the embedded page. The iframe can respond via `window.parent.postMessage()`; listen for replies with a `MessageListener` in your XMLUI markup.

---

## See also

- [Render a Markdown file as a page](/docs/howto/render-a-markdown-file-as-a-page) — display rich content without an iframe
- [Generate a QR code from user input](/docs/howto/generate-a-qr-code-from-user-input) — another way to render dynamic content inline
- [Lazy-load images for performance](/docs/howto/lazy-load-images-for-performance) — defer offscreen media to improve initial load time
