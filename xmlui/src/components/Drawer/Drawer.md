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
  <Drawer id="drawer" position="right">
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
<App scrollWholePage="false">
  <HStack>
    <Button label="Right" onClick="rightDrawer.open()" />
    <Button label="Bottom" onClick="bottomDrawer.open()" />
  </HStack>
  <SpaceFiller />
  <HStack>
    <SpaceFiller />
    <Button label="Left" onClick="leftDrawer.open()" />
    <Button label="Top" onClick="topDrawer.open()" />
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
  <VStack horizontalAlignment="end">
    <Button label="With Backdrop" onClick="drawer1.open()" />
    <Button label="No Backdrop" onClick="drawer2.open()" />
    <Button label="Click-away disabled" onClick="drawer3.open()" />
  </VStack>
  
  <Drawer id="drawer1">
    <Text>Click outside to close</Text>
  </Drawer>
  <Drawer id="drawer2" hasBackdrop="false">
    <Text>No backdrop overlay</Text>
  </Drawer>
  <Drawer id="drawer3" closeOnClickAway="false">
    <Text>Click the close button to dismiss</Text>
  </Drawer>
</App>
```

### Drawer with Events

Monitor when the drawer opens or closes using `onOpen` and `onClose` events.

```xmlui-pg copy display name="Example: Events" height="300px"
<App var.openCount="{0}" var.closeCount="{0}">
  <VStack>
    <Button label="Open Drawer" onClick="drawer.open()" />
    <Text>Opened: {openCount} times</Text>
    <Text>Closed: {closeCount} times</Text>
  </VStack>
  
  <Drawer 
    id="drawer"
    position="right"
    onOpen="openCount++" 
    onClose="closeCount++">
    <Text>I track my open/close events</Text>
  </Drawer>
</App>
```

%-DESC-END

%-PROP-START closeButtonVisible

Controls whether the close (✕) button appears in the top-right corner of the drawer.

```xmlui-pg copy display name="Example: closeButtonVisible" height="280px"
<App>
  <VStack horizontalAlignment="end">
    <Button label="With Close Button (default)" onClick="drawer1.open()" />
    <Button label="Without Close Button" onClick="drawer2.open()" />
  </VStack>
  
  <Drawer id="drawer1" closeButtonVisible="true">
    <Text>Close button visible</Text>
  </Drawer>
  <Drawer id="drawer2" closeButtonVisible="false">
    <Text>No close button, click outside to dismiss</Text>
  </Drawer>
</App>
```

%-PROP-END

%-PROP-START headerTemplate

This property defines a custom template rendered in the sticky header area of the drawer, next to the close button. Use it to display a logo, title, or any custom content that stays fixed at the top while the drawer body scrolls.

```xmlui-pg copy display {5-7} name="Example: headerTemplate" height="280px"
<App>
  <Button label="Open Drawer" onClick="drawer.open()" />
  <Drawer id="drawer" position="left">
    <property name="headerTemplate">
      <H3>Navigation</H3>
    </property>
    <VStack gap="$space-2">
      <Button label="Home" variant="ghost" />
      <Button label="Settings" variant="ghost" />
      <Button label="Help" variant="ghost" />
    </VStack>
  </Drawer>
</App>
```

%-PROP-END

%-EVENT-START open

Fired when the drawer opens (either via `open()` API or another trigger).

```xmlui-pg copy display name="Example: onOpen event" height="280px"
<App var.status="">
  <VStack >
    <Button label="Open Drawer" onClick="drawer.open()" />
    <Text>{status}</Text>
  </VStack>
  
  <Drawer 
    id="drawer" 
    position="right"
    onOpen="status = 'Drawer opened at ' + formatDateTime(getDate())">
    <Text>I triggered the onOpen event</Text>
  </Drawer>
</App>
```

%-EVENT-END

%-EVENT-START close

Fired when the drawer closes (via API, close button, backdrop click, or Escape key).

```xmlui-pg copy display name="Example: onClose event" height="280px"
<App var.status="">
  <VStack>
    <Button label="Open Drawer" onClick="drawer.open()" />
    <Text>{status}</Text>
  </VStack>
  
  <Drawer 
    id="drawer" 
    position="right"
    onClose="status = 'Drawer closed at ' + formatDateTime(getDate())">
    <Text>I triggered the onClose event</Text>
  </Drawer>
</App>
```

%-EVENT-END
