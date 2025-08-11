%-DESC-START

**Key features:**
- **Hierarchical organization**: Supports nested submenus for complex menu structures
- **Flexible triggers**: Customizable button trigger or use your own trigger component
- **Progressive disclosure**: Reveals options on demand

You can nest `MenuItem`, `MenuSeparator`, and `SubMenuItem` components into `DropdownMenu` to define a menu hierarchy. The component provides a trigger to display the menu items:

```xmlui-pg copy display name="Example: Using DropdownMenu" height="240px"
---app copy display
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuSeparator />
    <SubMenuItem label="Submenu">
      <MenuItem>Submenu Item 1</MenuItem>
      <MenuItem>Submenu Item 2</MenuItem>
    </SubMenuItem>
  </DropdownMenu>
</App>
---desc
Try this dropdown menu:
```

%-DESC-END

%-PROP-START alignment

Available values are:
- `start`: Menu items are aligned to the start of the trigger component (default).
- `end`: Menu items are aligned to the end of the trigger component.

```xmlui-pg copy display name="Example: alignment" height="240px"
<App>
  <HStack>
    <DropdownMenu label="Start-aligned menu (open it!)">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
    <DropdownMenu label="End-aligned menu (open it!)" alignment="end">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
  </HStack>
</App>
```

%-PROP-END

%-PROP-START triggerTemplate

```xmlui-pg copy {3-5} display name="Example: triggerTemplate" height="240px"
<App>
  <DropdownMenu label="(ignored)">
    <property name="triggerTemplate">
      <Button label="Custom trigger" icon="chevrondown" iconPosition="end"/>
    </property>
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </DropdownMenu>
</App>
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy {4, 11} display name="Example: enabled" height="240px"
<App>
  <HStack>
    <DropdownMenu
      enabled="true"
      label="Enabled Dropdown">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
    <DropdownMenu
      enabled="false"
      label="Disabled Dropdown">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
  </HStack>
</App>
```

%-PROP-END

%-EVENT-START willOpen

```xmlui-pg copy {6} display name="Example: willOpen" height="240px"
<App>
  <variable name="counter" value="{0}" />
  <Text value="Number of times the dropdown was opened: {counter}" />
  <DropdownMenu
    label="Dropdown"
    onWillOpen="counter += 1">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </DropdownMenu>
</App>
```

%-EVENT-END

%-API-START close

```xmlui-pg copy {4} display name="Example: close" height="240px"
<App>
  <DropdownMenu id="emojiDropdown" label="Emoji Dropdown">
    <EmojiSelector
      onSelect="(reaction) => { emojiDropdown.close(); }"
      autoFocus="true"
    />
  </DropdownMenu>
</App>
```

%-API-END

%-API-START open

```xmlui-pg copy {2} display name="Example: open" height="300px"
<App>
  <Button onClick="emojiDropdown.open()">Open the Dropdown</Button>
  <DropdownMenu id="emojiDropdown" label="Emoji Dropdown">
    <EmojiSelector
      onSelect="(reaction) => { emojiDropdown.close(); }"
      autoFocus="true"
    />
  </DropdownMenu>
</App>
```

%-API-END
