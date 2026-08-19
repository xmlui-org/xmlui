%-DESC-START

**Key features:**
- **Overlay presentation**: Appears above existing content with backdrop dimming
- **Programmatic control**: Open and close via exposed methods like `open()` and `close()`
- **Parameter passing**: Accept data when opened for dynamic dialog content
- **Focus management**: Automatically handles focus trapping and accessibility
- **Form integration**: When containing Form components, automatically closes on form submission or cancellation (unless overridden)

## Using the Component

>[!INFO]
> When using the examples in this article, pop them out to the full screen to check how they work.

Opening and closing the modal dialog can be done in two ways depending on circumstances.

### With Imperative API

Event-driven display of the `ModalDialog` dialog is also possible using imperative API.

This method is a good way to toggle the display of the `ModalDialog` if no deep linking is necessary.
It also lends to itself that these events can be triggered programmatically from codebehind.

Note the `id` property of the `ModalDialog` in the example below and how it is used to call the [`open`](#open-api) and [`close`](#close-api)
operations of the component in the `onClick` event handlers.

```xmlui-pg copy display name="Example: imperative API" height="220px"
<App>
  <ModalDialog id="dialog" title="Example Dialog">
    <Button label="Close Dialog" onClick="dialog.close()" />
  </ModalDialog>
  <Button label="Open Dialog" onClick="dialog.open()" />
</App>
```

>[!INFO]
> The imperative approach is perhaps the most intuitive way to display and hide modal dialogs.

### With `when`

The `when` property accepts a primitive boolean or a binding expression resolving to a boolean value to toggle the display of a component.

Using the `when` property in a `ModalDialog` dialog component is commonly used with deep linking:
showing the modal in conjunction with an updated URL so that the opened state of the modal dialog is referable.

```xmlui-pg name="With when" height="220px"
---app copy display name="Example: when"
<App>
  <variable name="isDialogShown" value="{false}"/>
  <Button label="Open Dialog" onClick="isDialogShown = true" />
  <ModalDialog 
    when="{isDialogShown}" 
    title="Example Dialog" 
    onClose="isDialogShown = false" />
</App>
---desc
Click on the button in the demo below to open the modal dialog. Click anywhere outside the opened dialog or the close button to close it.
```

Setting the `when` property is the most straightforward way for deep-linked modals. If you use deep links with query parameters to show a particular dialog, you can set the `when` property to show or hide the dialog according to parameter values.

### The `ModalDialog` as a Container

The `ModalDialog` component is also a container such as the [`Card`](/docs/reference/components/Card), that it also accepts child components.

```xmlui-pg copy {3-8} display name="Example: children" height="340px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Dialog">
    <Form data="{{ firstName: 'Billy', lastName: 'Bob' }}">
      <FormItem bindTo="firstName" required="true" />
      <FormItem bindTo="lastName" required="true" />
    </Form>
  </ModalDialog>
</App>
```

>[!INFO]
> When a form is nested into a modal dialog, closing the form (canceling it or completing its submit action) automatically closes the dialog.

### Preventing Accidental Close

Use `setDirty(true)` when dialog content changes. When a dirty dialog is about to close, `ModalDialog` shows a confirmation prompt using `confirmCloseTitle`, `canCloseMessage`, `confirmCloseLabel`, and `cancelCloseLabel`.

When the dialog hosts a `Form`, form field edits automatically count as dialog dirty state. The `dirtyChanged` event fires whenever this combined dirty state changes, so you can update labels, badges, or commands without polling `getDirty()`. Set `skipDirtyConfirmation="true"` when dirty state should still be tracked but closing should not ask for confirmation. If you define `willClose`, that event controls closing instead: returning an explicit `false` prevents the close and skips the dirty confirmation flow.

```xmlui-pg name="Prevent Accidental Close" height="520px"
---app copy display name="Example: prevent accidental close"
<App var.dirtyStatus="clean" var.allowGuardedClose="{false}">
  <HStack gap="$space-2">
    <Button label="Edit Draft" onClick="draftDialog.open()" />
    <Button label="Open Guarded Dialog" onClick="guardedDialog.open()" />
  </HStack>

  <ModalDialog
    id="draftDialog"
    title="Edit Draft"
    confirmCloseTitle="Unsaved Draft"
    canCloseMessage="Discard your unsaved changes?"
    confirmCloseLabel="Discard"
    cancelCloseLabel="Keep Editing"
    onDirtyChanged="(dirty) => dirtyStatus = dirty ? 'dirty' : 'clean'">
    <Form id="draftForm" data="{{ title: 'Quarterly plan', estimate: 12 }}">
      <TextBox label="Title" bindTo="title" />
      <NumberBox label="Estimate" bindTo="estimate" />
    </Form>
    <Text>State: {dirtyStatus}</Text>
    <HStack gap="$space-2">
      <Button
        label="Mark Clean"
        onClick="draftForm.setDirty(false)" />
      <Button label="Close" onClick="draftDialog.close()" />
    </HStack>
  </ModalDialog>

  <ModalDialog
    id="guardedDialog"
    title="Guarded Dialog"
    onWillClose="return allowGuardedClose">
    <Text>{allowGuardedClose
      ? 'This dialog can close now.' : 'Close is currently blocked.'}
    </Text>
    <Button
      label="{allowGuardedClose ? 'Block Close' : 'Allow Close'}"
      onClick="allowGuardedClose = !allowGuardedClose" />
  </ModalDialog>
</App>
---desc
Edit the draft dialog and then close it to see the confirmation prompt. The guarded dialog uses `willClose`, so it stays open while closing is blocked.
```

%-DESC-END

%-PROP-START fullScreen

```xmlui-pg name="The ModalDialog as a Container" height="220px"
---app copy display name="Example: fullScreen"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" fullScreen="true" title="Example Dialog" />
</App>
---desc
Click the button to display a full-screen dialog. The icon at the top-right corner of the dialog allows you to close it.
```

%-PROP-END

%-PROP-START title

```xmlui-pg copy {3} display name="Example: title" height="220px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Title" />
</App>
```

%-PROP-END

%-PROP-START closeButtonVisible

```xmlui-pg name="The ModalDialog as a Container 2" height="220px"
---app copy display name="Example: closeButtonVisible"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" closeButtonVisible="false" title="Example Dialog" />
</App>
---desc
Click outside the dialog to close it.
```

%-PROP-END

%-PROP-START closeOnClickAway

```xmlui-pg name="Close on Click Away" height="220px"
---app copy display name="Example: closeOnClickAway"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" closeOnClickAway="false" title="Example Dialog">
    <Text>Clicking outside leaves this dialog open.</Text>
  </ModalDialog>
</App>
---desc
Use the close button to close the dialog.
```

%-PROP-END

%-PROP-START canCloseMessage

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-PROP-END

%-PROP-START skipDirtyConfirmation

Set this property to `true` for short or low-risk dialogs where dirty state should still be tracked, but closing the dialog should not show the unsaved-changes confirmation prompt.

See [Preventing Accidental Close](#preventing-accidental-close) for context.

%-PROP-END

%-PROP-START confirmCloseTitle

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-PROP-END

%-PROP-START confirmCloseLabel

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-PROP-END

%-PROP-START cancelCloseLabel

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-PROP-END

%-EVENT-START close

In this example, the `close` event counts how many times you closed the dialog:

```xmlui-pg name="The ModalDialog as a Container 3" height="220px"
---app copy {6-8} display name="Example: open/close events"
<App>
  <Button label="Open Dialog" onClick="myDialog.open()" />
  <ModalDialog
    id="myDialog"
    title="Example Dialog"
    var.counter="{0}"
    onClose="counter++">
    <Text value="Dialog closed {counter} number of times." />
  </ModalDialog>
</App>
---desc
Open and close the dialog several times to test that it changes the counter.
```

%-EVENT-END

%-EVENT-START willClose

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-EVENT-END

%-EVENT-START dirtyChanged

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-EVENT-END

%-EVENT-START open

In this example, the `open` event counts how many times you opened the dialog:

```xmlui-pg name="The ModalDialog as a Container 4" height="220px"
---app copy {6-8} display name="Example: open/close events"
<App>
  <Button label="Open Dialog" onClick="myDialog.open()" />
  <ModalDialog
    id="myDialog"
    title="Example Dialog"
    var.counter="{0}"
    onOpen="counter++">
    <Text value="Dialog opened {counter} number of times." />
  </ModalDialog>
</App>
---desc
Open and close the dialog several times to test that it changes the counter.
```

%-EVENT-END

%-API-START open

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

%-API-END

%-API-START setDirty

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-API-END

%-API-START getDirty

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

%-API-END

%-API-START close

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

%-API-END
