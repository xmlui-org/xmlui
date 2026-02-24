# IFrame [#iframe]

`IFrame` embeds external content from another HTML document into the current page. It provides security controls through sandbox and allow attributes, and supports features like fullscreen display and referrer policy configuration.

**Key features:**
- **External content embedding**: Load web pages, documents, or media from external URLs
- **Security controls**: Built-in sandbox and permission policies for safe content isolation
- **HTML content support**: Display inline HTML content without external sources
- **Event handling**: Track loading states with load events

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

### `allow` [#allow]

Specifies the permissions policy for the iframe. Controls which features (like camera, microphone, geolocation) the embedded content can use.

The `allow` property controls which browser features the embedded content can access. Common values include camera, microphone, geolocation, and fullscreen permissions.

```xmlui-pg copy display name="Example: allow"
<App>
  <IFrame
      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
      allow="camera; microphone; geolocation"
      width="560px"
      height="315px"
      title="Rick Astley - Never Gonna Give You Up (Official Video)"
    />
</App>
```

### `name` [#name]

Specifies a name for the iframe, which can be used as a target for links and forms.

```xmlui-pg copy display name="Example: name" /name="myFrame"/
<App>
  <VStack gap="$space-2">
    <Button 
      label="Open 'Kraftwerk: The Model' in IFrame" 
      onClick="window.open('https://www.youtube-nocookie.com/embed/-s4zRw16tMA', 'myFrame')" 
    />
    <IFrame 
      src="https://example.com"
      name="myFrame"
      width="100%" 
      height="300px" />
  </VStack>
</App>
```

### `referrerPolicy` [#referrerpolicy]

Controls how much referrer information is sent when fetching the iframe content.

Available values:

| Value | Description |
| --- | --- |
| `no-referrer` | Never send referrer information |
| `no-referrer-when-downgrade` | Send referrer only for same-security destinations |
| `origin` | Send only the origin as referrer |
| `origin-when-cross-origin` | Send full URL for same-origin, origin only for cross-origin |
| `same-origin` | Send referrer only for same-origin requests |
| `strict-origin` | Send origin only for same-security destinations |
| `strict-origin-when-cross-origin` | Full URL for same-origin, origin for cross-origin same-security |
| `unsafe-url` | Always send full URL as referrer |

### `sandbox` [#sandbox]

Applies extra restrictions to the content in the iframe. Value is a space-separated list of sandbox flags (e.g., 'allow-scripts allow-same-origin').

### `src` [#src]

Specifies the URL of the document to embed in the iframe. Either `src` or `srcdoc` should be specified, but not both.

```xmlui-pg copy display name="Example: src"
<App>
  <IFrame 
    src="https://example.com" 
    width="100%" 
    height="300px" />
</App>
```

### `srcdoc` [#srcdoc]

Specifies the HTML content to display in the iframe. Either `src` or `srcdoc` should be specified, but not both.

```xmlui-pg copy display name="Example: srcdoc"
<App>
  <IFrame 
    srcdoc="
      <h1>Hello World</h1>
      <p>This is embedded HTML content with <strong>formatting</strong>.</p>
    "
    width="100%" 
    height="200px" />
</App>
```

## Events [#events]

### `load` [#load]

This event is triggered when the IFrame content has finished loading.

**Signature**: `load(): void`

```xmlui-pg copy display name="Example: load"
<App var.loadStatus="Loading...">
  <VStack gap="$space-2">
    <Text value="Status: {loadStatus}" />
    <IFrame 
      src="https://example.com"
      onLoad="loadStatus = 'Content loaded successfully!'"
      width="100%" 
      height="200px" />
  </VStack>
</App>
```

## Exposed Methods [#exposed-methods]

### `getContentDocument` [#getcontentdocument]

This method returns the content document of the iframe element.

**Signature**: `getContentDocument(): Document | null`

Get access to the iframe's content document object. Returns null if the content document is not accessible.

```xmlui-pg copy display name="Example: getContentDocument" /getContentDocument/
<App>
  <VStack var.iFrameTitle="<not queried yet>" >
    <Button 
      label="Get Document Title" 
      onClick="
        const contentDoc = myIframe.getContentDocument();
        iFrameTitle = contentDoc 
          ? contentDoc.title 
          : 'Content document not accessible';
      " />
    <Card title="IFrame title: {iFrameTitle}" />
    <IFrame 
      id="myIframe"
      srcdoc="
        <html>
          <head><title>My Awesome Document</title></head>
          <body><h1>Awesome Content</h1></body>
        </html>"
      width="100%" 
      height="200px" />
  </VStack>
</App>
```

### `getContentWindow` [#getcontentwindow]

This method returns the content window of the iframe element.

**Signature**: `getContentWindow(): Window | null`

Get access to the iframe's content window object. Returns null if the content window is not accessible.

```xmlui-pg copy display name="Example: getContentWindow" /getContentWindow/
<App>
  <VStack var.windowStatus="Not checked yet" gap="$space-2">
    <Button 
      label="Check Content Window" 
      onClick="
        const contentWindow = myIframe.getContentWindow();
        windowStatus = contentWindow 
          ? 'Content window is accessible' 
          : 'Content window is not accessible';
      " />
    <Card title="Status: {windowStatus}" />
    <IFrame 
      id="myIframe"
      src="https://example.com"
      width="100%" 
      height="200px" />
  </VStack>
</App>
```

### `postMessage` [#postmessage]

This method sends a message to the content window of the iframe.

**Signature**: `postMessage(message: any, targetOrigin?: string): void`

- `message`: The message to send to the iframe's content window.
- `targetOrigin`: The origin to which the message should be sent. Defaults to '*'.

```xmlui-pg copy display name="Example: postMessage" /postMessage/
<App>
  <VStack var.messageStatus="Ready to send" gap="$space-2">
    <Button 
      label="Send Message to IFrame" 
      onClick="
        myIframe.postMessage({type: 'greeting', text: 'Hello from parent!'}, '*');
        messageStatus = 'Message sent!';
      " />
    <Card title="Status: {messageStatus}" />
    <IFrame 
      id="myIframe"
      srcdoc="
        <script>
          window.addEventListener('message', (event) => \{
            console.log('Received message:', event.data);
            document.body.innerHTML = 
              '<h1>Message: ' + JSON.stringify(event.data) + '</h1>';
          });
        </script>
        <h1>Waiting for message...</h1>
      "
      width="100%" 
      height="200px" />
  </VStack>
</App>
```

## Styling [#styling]

### Size Control [#size-control]

IFrame supports these theme variables for consistent sizing:
- `width-IFrame`
- `height-IFrame`
- `borderRadius-IFrame`
- `border-IFrame`

```xmlui-pg display copy name="Example: IFrame with custom styling"
<App>
  <Theme 
    width-IFrame="400px" 
    height-IFrame="250px"
    borderRadius-IFrame="8px"
    border-IFrame="2px solid $primaryColor">
    <IFrame src="https://example.com" />
  </Theme>
</App>
```

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [border](../styles-and-themes/common-units/#border)-IFrame | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottom](../styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-IFrame | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-IFrame | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-IFrame | 300px | 300px |
| [width](../styles-and-themes/common-units/#size)-IFrame | 100% | 100% |
