# Use the Modal Dialog onClose() method

You don't normally need `onClose()`, but if a `ModalDialog` has a `when` condition you may need to use `onClose()` to reset it.

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
<!-- When you close, isOpen is still true in your variable scope so you cannot reopen -->
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

