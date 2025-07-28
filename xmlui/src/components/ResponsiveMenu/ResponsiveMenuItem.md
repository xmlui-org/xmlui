%-DESC-START

`ResponsiveMenuItem` represents individual clickable items within a `ResponsiveMenu`. Each menu item can display text, icons, and respond to clicks. When the menu overflows, these items are automatically moved to the dropdown menu while maintaining their functionality and appearance.

**Key features:**
- **Consistent behavior**: Works the same whether visible or in overflow dropdown
- **Icon support**: Optional icons with flexible positioning
- **Active states**: Visual indication of current/selected items
- **Accessibility**: Proper keyboard navigation and screen reader support

```xmlui-pg copy display name="Example: Using ResponsiveMenuItem" height="240px"
---app copy display
<App>
  <ResponsiveMenu>
    <ResponsiveMenuItem label="File" icon="file" />
    <ResponsiveMenuItem label="Edit" icon="edit" active />
    <ResponsiveMenuItem label="View" icon="eye" />
    <ResponsiveMenuItem label="Disabled" enabled={false} />
  </ResponsiveMenu>
</App>
---desc
Try clicking on the menu items and resizing to see overflow behavior:
```

%-DESC-END

%-PROP-START icon

You can add icons to menu items to improve visual recognition:

```xmlui-pg copy display name="Example: icon" height="240px"
<App>
  <ResponsiveMenu>
    <ResponsiveMenuItem label="New File" icon="file-plus" />
    <ResponsiveMenuItem label="Open" icon="folder-open" />
    <ResponsiveMenuItem label="Save" icon="save" />
    <ResponsiveMenuItem label="Settings" icon="settings" />
  </ResponsiveMenu>
</App>
```

%-PROP-END

%-PROP-START active

Use the active property to indicate the current or selected menu item:

```xmlui-pg copy display name="Example: active" height="240px"
<App>
  <ResponsiveMenu>
    <ResponsiveMenuItem label="Explorer" />
    <ResponsiveMenuItem label="Search" />
    <ResponsiveMenuItem label="Source Control" active />
    <ResponsiveMenuItem label="Extensions" />
  </ResponsiveMenu>
</App>
```

%-PROP-END

%-PROP-START enabled

Control whether menu items are interactive:

```xmlui-pg copy display name="Example: enabled" height="240px"
<App>
  <ResponsiveMenu>
    <ResponsiveMenuItem label="Cut" enabled={false} />
    <ResponsiveMenuItem label="Copy" />
    <ResponsiveMenuItem label="Paste" />
    <ResponsiveMenuItem label="Undo" enabled={false} />
  </ResponsiveMenu>
</App>
```

%-PROP-END
