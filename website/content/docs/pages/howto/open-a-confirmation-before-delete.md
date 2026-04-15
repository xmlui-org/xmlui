# Open a confirmation before delete

Gate destructive actions with a confirmation dialog before they run.

Before deleting a record or performing an irreversible operation you should ask the user to confirm. XMLUI offers two approaches: the global `confirm()` function for any event handler, and the `confirmTitle` / `confirmMessage` props on `APICall` for declarative confirmation before a network request fires.

```xmlui-pg copy display name="Confirm before deleting a task" height="280px"
---app display
<App var.tasks="{[
    { id: 1, title: 'Write proposal', status: 'todo' },
    { id: 2, title: 'Review budget', status: 'todo' },
    { id: 3, title: 'Send invitations', status: 'done' }
  ]}">

  <Text variant="strong" marginBottom="$space-2">Task list ({tasks.length})</Text>

  <Items data="{tasks}">
    <HStack verticalAlignment="center">
      <Text>{$item.title}</Text>
      <SpaceFiller />
      <Badge value="{$item.status}" />
      <Button
        icon="trash"
        variant="ghost"
        themeColor="attention"
        onClick="
          const yes = confirm(
            'Delete task',
            'Are you sure you want to delete ' + $item.title + '?',
            'Delete',
            'Keep'
          );
          if (yes) { tasks = tasks.filter(t => t.id !== $item.id) }
        "
      />
    </HStack>
  </Items>
</App>
```

## Key points

**`confirm(title, message, actionLabel, cancelLabel)` resolves to `true` or `false`**: Call it directly in an event handler. The result is `true` when the user clicks the action button and `false` when they cancel or dismiss the dialog.

**All four arguments are optional**: Calling `confirm()` with no arguments shows a generic "Confirm Operation / Are you sure?" dialog. Supply at least a title and message so the user understands what they are agreeing to.

**`confirmTitle` and `confirmMessage` on `APICall` handle confirmation declaratively**: Set these props on an `APICall` and the framework shows the confirmation dialog automatically before executing the request — no script code needed. Use `confirmButtonLabel` and `cancelButtonLabel` to customise the button text.

**The confirmation dialog is modal and blocks interaction**: While the dialog is visible the rest of the UI is dimmed and non-interactive, ensuring the user makes a deliberate choice before the destructive action proceeds.

**Combine with `toast()` for feedback after deletion**: After the confirmed action succeeds, call `toast.success('Task deleted')` to close the loop and reassure the user that the operation completed.

---

## See also

- [Return data from a closed dialog](/docs/howto/use-modal-dialog-onclose) — use `onClose` to pass a result back to the caller
- [Show toast notifications from code](/docs/howto/show-toast-notifications-from-code) — display success or error messages after an action
- [Open a context menu on right-click](/docs/howto/open-a-context-menu-on-right-click) — offer per-item actions including delete from a right-click menu
