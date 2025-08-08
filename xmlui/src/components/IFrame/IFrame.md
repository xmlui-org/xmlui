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
      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
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
      onClick="window.open('https://www.youtube.com/embed/-s4zRw16tMA', 'myFrame')" 
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
