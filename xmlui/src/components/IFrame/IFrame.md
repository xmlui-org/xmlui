%-DESC-START

**Key features:**
- **External content embedding**: Load web pages, documents, or media from external URLs
- **Security controls**: Built-in sandbox and permission policies for safe content isolation
- **HTML content support**: Display inline HTML content without external sources
- **Event handling**: Track loading states with load events

%-DESC-END

%-PROP-START src

```xmlui-pg copy display name="Example: src"
<App>
  <IFrame 
    src="https://example.com" 
    width="100%" 
    height="300px" />
</App>
```

%-PROP-END

%-PROP-START srcdoc

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

%-PROP-END

%-PROP-START allow

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

%-PROP-END

%-PROP-START name

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

%-PROP-END

%-EVENT-START load

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

%-EVENT-END

%-STYLE-START

### Size Control

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

%-STYLE-END

%-API-START postMessage

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

%-API-END

%-API-START getContentWindow

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

%-API-END

%-API-START getContentDocument

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

%-API-END
