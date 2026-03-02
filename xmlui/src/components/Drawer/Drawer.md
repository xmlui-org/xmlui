%-DESC-START

**Key features:**
- **Slide from any edge**: Drawer can slide in from `left`, `right`, `top`, or `bottom`
- **Programmatic control**: Open and close via exposed methods like `open()`, `close()`, and `isOpen()`
- **Optional backdrop**: Semi-transparent overlay dims content behind the drawer
- **Click-away closing**: Automatically close when user clicks outside the drawer
- **Focus management**: Automatically handles focus trapping and keyboard navigation
- **Smooth animations**: Configurable slide and fade animations with theme variables

## Using the Component

The `Drawer` component is a sliding panel that appears from the edge of the viewport. It's commonly used for navigation menus, settings panels, or contextual filters.

### Basic Usage with Imperative API

The simplest way to use a drawer is with the imperative API. Set an `id` and call `open()` and `close()` methods to control its visibility.

```xmlui-pg copy display name="Example: Basic drawer" height="280px"
<App>
  <VStack>
    <Button label="Open Drawer" onClick="drawer.open()" />
  </VStack>
  <Drawer id="drawer">
    <Text weight="bold" size="lg">Navigation</Text>
    <VStack marginTop="$space-3">
      <Button label="Profile" variant="ghost" />
      <Button label="Settings" variant="ghost" />
      <Button label="Help" variant="ghost" />
    </VStack>
  </Drawer>
</App>
```

### Different Positions

Use the `position` property to slide the drawer from different edges of the viewport.

```xmlui-pg copy display name="Example: Drawer positions" height="300px"
<App>
  <HStack>
    <Button label="Left" onClick="leftDrawer.open()" />
    <Button label="Right" onClick="rightDrawer.open()" />
    <Button label="Top" onClick="topDrawer.open()" />
    <Button label="Bottom" onClick="bottomDrawer.open()" />
  </HStack>
  
  <Drawer id="leftDrawer" position="left">
    <Text>Left Drawer</Text>
  </Drawer>
  <Drawer id="rightDrawer" position="right">
    <Text>Right Drawer</Text>
  </Drawer>
  <Drawer id="topDrawer" position="top">
    <Text>Top Drawer</Text>
  </Drawer>
  <Drawer id="bottomDrawer" position="bottom">
    <Text>Bottom Drawer</Text>
  </Drawer>
</App>
```

### With Backdrop Control

By default, a semi-transparent backdrop appears behind the drawer. Disable it with `hasBackdrop="false"` or control whether clicking the backdrop closes the drawer with `closeOnClickAway`.

```xmlui-pg copy display name="Example: Backdrop control" height="280px"
<App>
  <HStack>
    <Button label="With Backdrop" onClick="drawer1.open()" />
    <Button label="No Backdrop" onClick="drawer2.open()" />
    <Button label="Click-away disabled" onClick="drawer3.open()" />
  </HStack>
  
  <Drawer id="drawer1" hasBackdrop="true" closeOnClickAway="true">
    <Text>Click outside to close</Text>
  </Drawer>
  <Drawer id="drawer2" hasBackdrop="false">
    <Text>No backdrop overlay</Text>
  </Drawer>
  <Drawer id="drawer3" hasBackdrop="true" closeOnClickAway="false" closeButtonVisible="true">
    <Text>Click the close button to dismiss</Text>
  </Drawer>
</App>
```

### Initially Open

Use `initiallyOpen="true"` to have the drawer open when the component first renders.

```xmlui-pg copy display name="Example: Initially open" height="280px"
<App>
  <Drawer initiallyOpen="true" position="left">
    <Text weight="bold">Drawer opened automatically</Text>
    <Button label="Close" onClick="drawer.close()" marginTop="$space-3" />
  </Drawer>
</App>
```

### Right-side Navigation Menu

A common use case is a right-side navigation drawer that doesn't close on click-away, forcing users to use the close button.

```xmlui-pg copy display name="Example: Navigation drawer" height="340px"
<App>
  <VStack height="100%">
    <HStack>
      <Text weight="bold" size="lg">My App</Text>
      <Button label="☰" onClick="navDrawer.open()" marginLeft="*" size="lg" variant="ghost" />
    </HStack>
    <Text color="$color-text-secondary">Main content area</Text>
  </VStack>
  
  <Drawer id="navDrawer" position="right" closeOnClickAway="false">
    <VStack spacing="$space-2">
      <Text weight="bold" size="lg">Menu</Text>
      <Button label="Dashboard" variant="ghost" width="100%" />
      <Button label="Profile" variant="ghost" width="100%" />
      <Button label="Settings" variant="ghost" width="100%" />
      <Button label="Logout" variant="ghost" width="100%" />
    </VStack>
  </Drawer>
</App>
```

### Drawer with Events

Monitor when the drawer opens or closes using `onOpen` and `onClose` events.

```xmlui-pg copy display name="Example: Events" height="300px"
<App>
  <VStack var.openCount="{0}" var.closeCount="{0}">
    <Button label="Open Drawer" onClick="drawer.open()" />
    <Text>Opened: {openCount} times</Text>
    <Text>Closed: {closeCount} times</Text>
  </VStack>
  
  <Drawer 
    id="drawer" 
    onOpen="openCount++" 
    onClose="closeCount++">
    <Text>I track my open/close events</Text>
  </Drawer>
</App>
```

%-DESC-END

%-PROP-START position

The edge from which the drawer slides in.

```xmlui-pg copy display name="Example: position values" height="320px"
<App>
  <VStack spacing="$space-2">
    <Button label="Left" onClick="leftDrawer.open()" width="150px" />
    <Button label="Right" onClick="rightDrawer.open()" width="150px" />
    <Button label="Top" onClick="topDrawer.open()" width="150px" />
    <Button label="Bottom" onClick="bottomDrawer.open()" width="150px" />
  </VStack>
  
  <Drawer id="leftDrawer" position="left"><Text>Left</Text></Drawer>
  <Drawer id="rightDrawer" position="right"><Text>Right</Text></Drawer>
  <Drawer id="topDrawer" position="top"><Text>Top</Text></Drawer>
  <Drawer id="bottomDrawer" position="bottom"><Text>Bottom</Text></Drawer>
</App>
```

%-PROP-END

%-PROP-START hasBackdrop

Controls whether a semi-transparent overlay appears behind the drawer.

```xmlui-pg copy display name="Example: hasBackdrop" height="280px"
<App>
  <HStack>
    <Button label="With Backdrop (default)" onClick="drawer1.open()" />
    <Button label="Without Backdrop" onClick="drawer2.open()" />
  </HStack>
  
  <Drawer id="drawer1" hasBackdrop="true">
    <Text>Backdrop visible behind me</Text>
  </Drawer>
  <Drawer id="drawer2" hasBackdrop="false">
    <Text>No backdrop visible</Text>
  </Drawer>
</App>
```

%-PROP-END

%-PROP-START initiallyOpen

When `true`, the drawer is open when it first renders.

```xmlui-pg copy display name="Example: initiallyOpen" height="280px"
<App>
  <Drawer initiallyOpen="true" position="left">
    <Text weight="bold">I opened automatically</Text>
    <Button label="Close" onClick="drawer.close()" marginTop="$space-3" />
  </Drawer>
</App>
```

%-PROP-END

%-PROP-START closeButtonVisible

Controls whether the close (✕) button appears in the top-right corner of the drawer.

```xmlui-pg copy display name="Example: closeButtonVisible" height="280px"
<App>
  <HStack>
    <Button label="With Close Button (default)" onClick="drawer1.open()" />
    <Button label="Without Close Button" onClick="drawer2.open()" />
  </HStack>
  
  <Drawer id="drawer1" closeButtonVisible="true">
    <Text>Close button visible</Text>
  </Drawer>
  <Drawer id="drawer2" closeButtonVisible="false" closeOnClickAway="true">
    <Text>No close button, click outside to dismiss</Text>
  </Drawer>
</App>
```

%-PROP-END

%-PROP-START closeOnClickAway

When `true`, clicking the backdrop dimming area closes the drawer.

```xmlui-pg copy display name="Example: closeOnClickAway" height="280px"
<App>
  <HStack>
    <Button label="Close on click-away" onClick="drawer1.open()" />
    <Button label="Stay open" onClick="drawer2.open()" />
  </HStack>
  
  <Drawer id="drawer1" closeOnClickAway="true">
    <Text>Click outside to close</Text>
  </Drawer>
  <Drawer id="drawer2" closeOnClickAway="false" closeButtonVisible="true">
    <Text>Must use the close button</Text>
  </Drawer>
</App>
```

%-PROP-END

%-EVENT-START open

Fired when the drawer opens (either via `open()` API or another trigger).

```xmlui-pg copy display name="Example: onOpen event" height="280px"
<App>
  <VStack var.status="{}">
    <Button label="Open Drawer" onClick="drawer.open()" />
    <Text>{status}</Text>
  </VStack>
  
  <Drawer id="drawer" onOpen="status = 'Drawer opened at ' + new Date().toLocaleTimeString()">
    <Text>I triggered the onOpen event</Text>
  </Drawer>
</App>
```

%-EVENT-END

%-EVENT-START close

Fired when the drawer closes (via API, close button, backdrop click, or Escape key).

```xmlui-pg copy display name="Example: onClose event" height="280px"
<App>
  <VStack var.status="{}">
    <Button label="Open Drawer" onClick="drawer.open()" />
    <Text>{status}</Text>
  </VStack>
  
  <Drawer id="drawer" onClose="status = 'Drawer closed at ' + new Date().toLocaleTimeString()">
    <Text>I triggered the onClose event</Text>
  </Drawer>
</App>
```

%-EVENT-END
