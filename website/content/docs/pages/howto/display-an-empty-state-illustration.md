# Display an empty-state illustration

Show a friendly placeholder with an icon and message when a `List` or `Select` has no data to display.

Declare an `emptyListTemplate` inside `List` using the `<property name="emptyListTemplate">` slot syntax. The template is shown automatically when the `data` array is empty or not yet loaded, and hidden the moment any items arrive — no `when` condition needed.

```xmlui-pg copy display name="Task list with an empty state" height="300px"
---app
<App
  var.tasks="{[
    { id: 1, title: 'Review pull requests',  priority: 'High'   },
    { id: 2, title: 'Update documentation',  priority: 'Normal' },
    { id: 3, title: 'Fix login page bug',    priority: 'High'   }
  ]}"
>
  <Button label="Clear all tasks" onClick="tasks = []" />
  <List data="{tasks}">
    <property name="emptyListTemplate">
      <CVStack height="140px">
        <Icon name="inbox" size="48" color="$color-surface-400" />
        <Text fontWeight="bold">No tasks yet</Text>
        <Text variant="secondary">You are all caught up!</Text>
      </CVStack>
    </property>
    <HStack verticalAlignment="center">
      <Text>{$item.title}</Text>
      <SpaceFiller />
      <Badge value="{$item.priority}" />
    </HStack>
  </List>
</App>
```

## Key points

**`emptyListTemplate` replaces the entire list area when data is empty**: The template is shown only when the `data` array is empty or `undefined`. When data arrives or the user adds an item, the template disappears and regular rows render automatically.

**`CVStack height="..."` centers the empty-state effortlessly**: Wrap the icon, heading, and message in `<CVStack height="180px">` to vertically and horizontally center the content within the list's viewport area. Without an explicit height the `CVStack` collapses and centering has no room to work.

**Use `Icon` for a lightweight visual anchor**: XMLUI's built-in set includes names like `"inbox"`, `"search"`, `"folder"`, and `"clipboard"` that suit common empty-state contexts. Increase `size` and use a muted `color` (e.g. `$color-surface-400`) to keep it visually subordinate to actual content.

**Add a call-to-action inside the template**: The most useful empty states guide users toward the next step. Include a `Button` or `Link` inside `emptyListTemplate` that opens an "add item" dialog or navigates to an import flow, turning the dead end into an invitation to act.

**`emptyListTemplate` also works on `Select` and `AutoComplete`**: The same property on a dropdown component shows a custom placeholder in the options menu when no entries match the current search query — useful for showing a "no results" message or a "create new" shortcut.

---

## See also

- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — customize how list rows look when there is data to display
- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) — handle empty groups alongside the overall list empty state
- [Customize Select and AutoComplete menus](/docs/howto/customize-select-and-autocomplete-menus) — use `emptyListTemplate` to style the no-results state inside a dropdown
