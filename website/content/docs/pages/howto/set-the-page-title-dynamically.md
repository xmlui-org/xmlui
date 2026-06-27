# Set the page title dynamically

Use `PageMetaTitle` with a bound `value` expression to update the browser tab per route.

`PageMetaTitle` is a non-visual component that sets the document title (the text shown in the browser tab). Place it inside any `Page` and bind `value` to a reactive expression — the title updates automatically whenever the expression changes. By default the app name is appended as a suffix; set `noSuffix` to suppress it.

```xmlui-pg copy display name="Page title changes with the active tab"
---app display
<App>
  <variable name="section" value="Dashboard" />
  <PageMetaTitle value="{section + ' — Project Hub'}" noSuffix="{true}" />

  <HStack marginBottom="$space-3">
    <Button
      label="Dashboard"
      variant="{section === 'Dashboard' ? 'solid' : 'outlined'}"
      onClick="section = 'Dashboard'" />
    <Button
      label="Settings"
      variant="{section === 'Settings' ? 'solid' : 'outlined'}"
      onClick="section = 'Settings'" />
    <Button
      label="Reports"
      variant="{section === 'Reports' ? 'solid' : 'outlined'}"
      onClick="section = 'Reports'" />
  </HStack>

  <Card title="{section}">
    <Text>You are viewing the {section} section. Check the browser tab title.</Text>
  </Card>
</App>
```

## Key points

**`value` sets the document title**: Bind any string expression — a route parameter, a fetched record name, or a computed label. The browser tab updates instantly whenever the value changes.

**`noSuffix` suppresses the app name**: By default XMLUI appends ` — AppName` to the title. Set `noSuffix="{true}"` when you want full control over the title string, or when your expression already includes the app name.

**Place one `PageMetaTitle` per page**: Each `Page` in your routes should have its own `PageMetaTitle` so the tab updates when users navigate. If multiple instances exist in the tree, the last one rendered wins.

**Reactive expressions keep the title in sync**: When `value` depends on a variable (e.g. `value="{project.name + ' — Editor'}"`), the title re-evaluates automatically — no manual DOM call needed. This works even when the variable is updated by a `DataSource` or user interaction.

**Static titles work too**: If the page title never changes, use a plain string: `<PageMetaTitle value="About Us" />`. No curly braces needed for a constant.

---

## See also

- [Show toast notifications from code](/docs/howto/show-toast-notifications-from-code) — display transient messages alongside the title update
- [Navigate programmatically](/docs/howto/navigate-programmatically) — change routes from code, which triggers a new `PageMetaTitle`
