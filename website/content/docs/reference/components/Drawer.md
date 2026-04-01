# Drawer [#drawer]

`Drawer` is a panel that slides in from one of the four edges of the viewport. It can be opened and closed programmatically using its API methods `open()` and `close()`. An optional backdrop dims the content behind the drawer.

**Key features:**
- **Slide from any edge**: Drawer can slide in from `left`, `right`, `top`, or `bottom`
- **Programmatic control**: Open and close via exposed methods like `open()`, `close()`, and `isOpen()`
- **Optional backdrop**: Semi-transparent overlay dims content behind the drawer
- **Click-away closing**: Automatically close when user clicks outside the drawer
- **Focus management**: Automatically handles focus trapping and keyboard navigation
- **Smooth animations**: Configurable slide and fade animations with theme variables

## Using the Component [#using-the-component]

The `Drawer` component is a sliding panel that appears from the edge of the viewport. It's commonly used for navigation menus, settings panels, or contextual filters.

### Basic Usage with Imperative API [#basic-usage-with-imperative-api]

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

### Different Positions [#different-positions]

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

### With Backdrop Control [#with-backdrop-control]

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

### Drawer with Events [#drawer-with-events]

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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Display When | `displayWhen` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `closeButtonVisible` [#closebuttonvisible]

> [!DEF]  default: **true**

When `true`, an ✕ button is displayed in the top-right corner of the drawer that closes it when clicked.

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

### `closeOnClickAway` [#closeonclickaway]

> [!DEF]  default: **true**

When `true`, clicking outside the drawer panel closes it.

### `hasBackdrop` [#hasbackdrop]

> [!DEF]  default: **true**

When `true`, a translucent overlay is shown behind the drawer while it is open.

### `headerTemplate` [#headertemplate]

A custom template rendered in the sticky header area, next to the close button.

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

### `initiallyOpen` [#initiallyopen]

> [!DEF]  default: **false**

When `true`, the drawer is open on its first render.

### `position` [#position]

> [!DEF]  default: **"left"**

Specifies the edge from which the drawer slides in.

Available values: `left` **(default)**, `right`, `top`, `bottom`

## Events [#events]

### `close` [#close]

Fired when the `Drawer` is closed.

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

### `open` [#open]

Fired when the `Drawer` is opened.

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

## Exposed Methods [#exposed-methods]

### `close` [#close]

Closes the `Drawer`. Invoke with `drawerId.close()`.

**Signature**: `close(): void`

### `isOpen` [#isopen]

Returns `true` when the `Drawer` is currently open, `false` otherwise.

**Signature**: `isOpen(): boolean`

### `open` [#open]

Opens the `Drawer`. Invoke with `drawerId.open()`.

**Signature**: `open(): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [animationDuration](/docs/styles-and-themes/layout-props/#animationDuration)-Drawer | 250ms | 250ms |
| [animation](/docs/styles-and-themes/layout-props/#animation)Easing-Drawer | cubic-bezier(0.4, 0, 0.2, 1) | cubic-bezier(0.4, 0, 0.2, 1) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-backdrop-Drawer | rgba(0, 0, 0, 0.4) | rgba(0, 0, 0, 0.4) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Drawer | $backgroundColor-primary | $backgroundColor-primary |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Drawer | $borderRadius | $borderRadius |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Drawer | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) |
| [gap](/docs/styles-and-themes/common-units/#size)-Drawer | $space-4 | $space-4 |
| [height](/docs/styles-and-themes/common-units/#size-values)-Drawer | 320px | 320px |
| [maxHeight](/docs/styles-and-themes/common-units/#size-values)-Drawer | 50% | 50% |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-Drawer | 80% | 80% |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingTop-Drawer $paddingRight-Drawer $paddingBottom-Drawer $paddingLeft-Drawer | $paddingTop-Drawer $paddingRight-Drawer $paddingBottom-Drawer $paddingLeft-Drawer |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingVertical-Drawer | $paddingVertical-Drawer |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Drawer | $space-4 | $space-4 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingHorizontal-Drawer | $paddingHorizontal-Drawer |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingHorizontal-Drawer | $paddingHorizontal-Drawer |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingVertical-Drawer | $paddingVertical-Drawer |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Drawer | $space-4 | $space-4 |
| right-closeButton-Drawer | $space-3 | $space-3 |
| top-closeButton-Drawer | $space-2 | $space-2 |
| [width](/docs/styles-and-themes/common-units/#size-values)-Drawer | 320px | 320px |
| zIndex-Drawer | 200 | 200 |
