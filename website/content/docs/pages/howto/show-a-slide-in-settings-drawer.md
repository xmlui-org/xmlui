# Show a slide-in settings drawer

Use `Drawer` with `position="right"` for a non-blocking side panel.

A drawer slides in from the edge of the viewport and sits on top of the main content without replacing it. This makes it perfect for settings panels, filter menus, or detail views where the user may want to glance at the page behind it. Open and close it programmatically with `open()` and `close()`.

```xmlui-pg copy display name="Settings drawer" height="350px"
---app display
<App>
  <Drawer
    id="settingsDrawer"
    position="left"
    hasBackdrop="{true}"
    closeOnClickAway="{true}">
    <property name="headerTemplate">
      <Text variant="strong" fontSize="$fontSize-lg">Settings</Text>
    </property>
    <VStack>
      <Select label="Language">
       <Option value="en" label="English" />
       <Option value="es" label="Spanish" />
       <Option value="de" label="German" />
      </Select>
      <Checkbox 
        label="Enable notifications" 
        labelPosition="start"
        initialValue="{true}" 
      />
      <Checkbox label="Dark mode" labelPosition="start" />
      <Checkbox label="Compact layout" labelPosition="start" />
      <ContentSeparator />
      <Button label="Save" variant="solid" onClick="settingsDrawer.close()" />
    </VStack>
  </Drawer>

  <VStack>
    <HStack verticalAlignment="center">
      <H3>Dashboard</H3>
      <SpaceFiller />
      <Button icon="settings" label="Settings" onClick="settingsDrawer.open()" />
    </HStack>
    <HStack wrapContent>
      <Card width="*" title="Revenue">
        <H2>$42,500</H2>
      </Card>
      <Card width="*" title="Users">
        <H2>1,284</H2>
      </Card>
    </HStack>
    <Card title="Recent Activity">
      <Text>No new activity today.</Text>
    </Card>
  </VStack>
</App>
```

## Key points

**`position` controls the slide-in edge**: Set `position` to `"left"`, `"right"`, `"top"`, or `"bottom"`. The default is `"left"`. Right-side drawers are the conventional choice for settings or detail panels.

**`hasBackdrop` dims the page behind the drawer**: When `true`, a translucent overlay appears behind the open drawer, focusing attention on the panel. Combine with `closeOnClickAway` so clicking the backdrop dismisses the drawer.

**`headerTemplate` adds a sticky title area**: Place content inside `<property name="headerTemplate">` to render a persistent header alongside the close button. Use it for a title, search bar, or action buttons that should not scroll away.

**`open()`, `close()`, and `isOpen()` give full programmatic control**: Call `drawerId.open()` from any event handler to show the drawer. Use `drawerId.isOpen()` to conditionally change a button label or icon based on the drawer state.

**`initiallyOpen` shows the drawer on first render**: Set `initiallyOpen="{true}"` for panels that should be visible by default, like a navigation sidebar users can collapse. The close button (✕) is shown by default; set `closeButtonVisible="{false}"` to hide it.

---

## See also

- [Build a fullscreen modal dialog](/docs/howto/build-a-fullscreen-modal-dialog) — use a modal overlay instead of a slide-in panel
- [Dock elements to panel edges](/docs/howto/dock-elements-to-panel-edges) — anchor elements inside a layout without overlaying
- [Collapse the nav panel on mobile](/docs/howto/collapse-the-nav-panel-on-mobile) — use `NavPanel` with a toggle button for navigation drawers
