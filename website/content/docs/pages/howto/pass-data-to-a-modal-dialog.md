# Pass data to a Modal Dialog

Click a list item or table row to open a dialog pre-populated with that row's data.

Give `ModalDialog` an `id` and call `dialogId.open(data)` from any event handler. The value passed to `open()` becomes available inside the dialog as `$param`, so any attribute or expression in the dialog content can reference it directly.

```xmlui-pg name="Click on a team member to edit details" height="500px"
---api
{
  "apiUrl": "/api",
  "initialize": "$state.team_members = [
    { id: 1, name: 'Sarah Chen', role: 'Product Manager', email: 'sarah@company.com', avatar: 'https://i.pravatar.cc/100?u=sarah', department: 'Product', startDate: '2022-03-15' },
    { id: 2, name: 'Marcus Johnson', role: 'Senior Developer', email: 'marcus@company.com', avatar: 'https://i.pravatar.cc/100?u=marcus', department: 'Engineering', startDate: '2021-08-20' },
    { id: 3, name: 'Elena Rodriguez', role: 'UX Designer', email: 'elena@company.com', avatar: 'https://i.pravatar.cc/100?u=elena', department: 'Design', startDate: '2023-01-10' }
  ]",
  "operations": {
    "get_team_members": {
      "url": "/team_members",
      "method": "get",
      "handler": "return $state.team_members"
    }
  }
}
---app display /memberDetailsDialog/
<App>
  <DataSource
    id="team_members"
    url="/api/team_members"
  />

  <ModalDialog id="memberDetailsDialog" title="Team Member Details">
      <VStack>
      <!-- Avatar and Basic Info -->
      <HStack>
        <Avatar
          url="{$param.avatar}"
          size="$space-12"
          name="{$param.name}"
        />
        <VStack gap="0">
          <Text variant="strong">{$param.name}</Text>
          <Text variant="caption">{$param.role}</Text>
          <Text variant="caption" color="blue">{$param.email}</Text>
        </VStack>
      </HStack>

      <!-- Details Card -->
      <Card gap="0">
          <HStack>
            <Text variant="strong">Department:</Text>
            <Text>{$param.department}</Text>
          </HStack>
          <HStack>
            <Text variant="strong">Start Date:</Text>
            <Text>{$param.startDate}</Text>
          </HStack>
          <HStack>
            <Text variant="strong">Employee ID:</Text>
            <Text>#{$param.id}</Text>
          </HStack>
      </Card>

      <!-- Actions -->
      <HStack>
        <Button
          label="Send Email"
          size="sm"
          onClick="console.log('Email to:', $param.email)"
        />
        <Button
          label="View Calendar"
          size="sm"
          variant="secondary"
          onClick="console.log('Calendar for:', $param.name)"
        />
      </HStack>
    </VStack>
  </ModalDialog>

  <H3>Team Directory</H3>

  <VStack>
    <Items data="{team_members}">
      <Card
        orientation="horizontal"
        onClick="memberDetailsDialog.open($item)">
          <Avatar
            url="{$item.avatar}"
            size="sm"
            name="{$item.name}"
          />
          <VStack gap="0">
            <Text variant="strong">{$item.name}</Text>
            <Text variant="caption">{$item.role} - {$item.department}</Text>
          </VStack>
      </Card>
    </Items>
  </VStack>

</App>
```

## Key points

**`dialogId.open(data)` passes any value into the dialog**: Call it from an `onClick` or any other event handler, typically passing `$item` for the current list or table row. The dialog opens and the value becomes immediately available inside it.

**`$param` holds the first argument**: Inside the dialog, read any field with `$param.fieldName` — in expressions, attributes, or script blocks. For multiple arguments, use `$params[0]`, `$params[1]`, etc.

**The dialog re-evaluates each time `open()` is called**: Clicking a different card shows that card's data without resetting a shared variable. The dialog always reflects whatever was last passed to `open()`.

**`title` can be bound to `$param` for a context-aware header**: Rather than a generic title like `"Team Member Details"`, use `title="{$param.name}"` to display the selected item's name in the title bar. `titleTemplate` supports a fully custom layout.

**The `id` attribute is the handle for the programmatic API**: Every dialog you want to open imperatively needs a unique `id`. Without it there is no way to call `open()` on a specific instance.

---

## See also

- [Build a fullscreen modal dialog](/docs/howto/build-a-fullscreen-modal-dialog) — use fullscreen mode for complex details views
- [Keep a ModalDialog reopenable with onClose](/docs/howto/use-modal-dialog-onclose) — reset the controlling variable so `when`-gated dialogs can reopen
- [Add row actions with a context menu](/docs/howto/add-row-actions-with-a-context-menu) — show per-row actions without opening a dialog
