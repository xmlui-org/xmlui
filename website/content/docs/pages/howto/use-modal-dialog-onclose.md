# Keep a ModalDialog reopenable with onClose

Reset the controlling variable in `onClose` so a `when`-gated dialog can be opened more than once.

When a `ModalDialog` is shown via a `when` condition, the user clicking ✕ or clicking the backdrop triggers the dialog's internal close logic — but that logic does not reach back out to update your variable. The next time the button is pressed, the variable is already `true`, so no reactive change fires and the dialog stays invisible. Adding an `onClose` handler that sets the variable back to `false` closes the loop.

```xmlui-pg height="250px" name="Wrong: Can close but not reopen"
---app display
<App>
  <variable name="isOpen" value="{false}"/>
  <Button label="Open Dialog" onClick="isOpen = true" />

  <ModalDialog
    when="{isOpen}"
    title="Example Dialog">
    <Text value="Try to close and then reopen this dialog..." />
  </ModalDialog>
</App>
<!-- 
  When you close, isOpen is still true in your variable scope 
  so you cannot reopen 
-->
```

```xmlui-pg height="250px" name="Right: Can reopen after close"
---app display {9}
<App>
  <variable name="isOpen" value="{false}"/>
  <Button label="Open Dialog" onClick="isOpen = true" />

  <ModalDialog
    when="{isOpen}"
    title="Example Dialog"
    onClose="isOpen = false">
    <Text value="Try to close and then reopen this dialog..." />
    <!-- onClose ensures the 'isOpen' variable is updated when the dialog
    tries to close, so when="{isOpen}" becomes false and the dialog stays closed. -->
  </ModalDialog>
</App>
```

## Key points

**`onClose` fires on every close trigger**: Whether the user clicks the ✕ button, clicks the backdrop, or your code calls `dialogId.close()`, the `onClose` handler runs. Use it to reset the controlling boolean variable so the dialog can be reopened.

**Without `onClose`, a `when`-controlled dialog cannot reopen**: The dialog's internal close mechanism unmounts the component, but the variable that gates `when` stays `true`. On the next button click the variable is already `true`, so no state change occurs and the dialog stays hidden.

**Write to a shared variable before closing to "return" data**: Inside the dialog, set a variable (e.g. `selectedColor = 'blue'`) from a button handler, then call `dialogId.close()`. The parent reads the variable after the dialog closes — no callback needed.

**The `open()` / `close()` API is the simpler alternative**: Instead of toggling a boolean with `when`, give the dialog an `id` and call `dialogId.open()`. The dialog manages its own visibility internally, and you only need `onClose` if you want to run clean-up logic after dismissal.

**Combine `onClose` with `onOpen` for initialisation**: Use `onOpen` to reset form fields or fetch fresh data each time the dialog appears, and `onClose` to persist changes or clear temporary state.

---

## See also

- [Pass data to a Modal Dialog](/docs/howto/pass-data-to-a-modal-dialog) — send context to the dialog with `open($item)`
- [Build a fullscreen modal dialog](/docs/howto/build-a-fullscreen-modal-dialog) — use fullscreen mode for complex editing flows
- [Open a confirmation before delete](/docs/howto/open-a-confirmation-before-delete) — gate destructive actions with the global `confirm()` function