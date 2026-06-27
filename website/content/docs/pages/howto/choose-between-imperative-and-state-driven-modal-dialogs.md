# Choose between imperative and state-driven ModalDialogs

Use `dialog.open()` when a user action should show a dialog right away. Use `when` when the dialog is the visible form of existing app state. The right choice depends on whether the open state belongs to the action that triggered it or to the data that owns the UI.

## Imperative: open the dialog from a direct action

Use the imperative pattern for one-off help, confirmation, or other dialogs that do not need to stay in sync with route state or shared application state.

```xmlui-pg copy display name="Imperative ModalDialog" id="imperative-modaldialog" height="260px"
<App>
  <ModalDialog id="helpDialog" title="Help">
    <Text>
      Use this for static help text or other transient dialogs.
    </Text>
    <Button label="Close" onClick="helpDialog.close()" />
  </ModalDialog>

  <Button label="Open help" onClick="helpDialog.open()" />
</App>
```

If you need to pass context into the dialog, call `helpDialog.open(data)` and read the value as `$param` inside the dialog. That keeps the trigger simple while still letting the dialog render dynamic content.

If you need more than one value, `open(...params)` can pass multiple arguments and the dialog can read them back as `$params[0]`, `$params[1]`, and so on. That is useful when the trigger already has several pieces of context, but for a single record or object, one value is usually easier to read.

## Declarative: bind the dialog to state

Use `when` when the dialog should follow app state, such as a selected record, a previewed image, a route-driven detail view, or a query-parameter deep link.

```xmlui-pg copy display name="State-driven ModalDialog" id="state-driven-modaldialog" height="320px"
<App>
  <variable name="selectedUser" value="{null}" />

  <ModalDialog
    when="{!!selectedUser}"
    title="{selectedUser ? selectedUser.name : ''}"
    onClose="selectedUser = null">
    <Text variant="strong">{selectedUser ? selectedUser.role : ''}</Text>
    <Text>{selectedUser ? selectedUser.email : ''}</Text>
    <Button label="Close" onClick="selectedUser = null" />
  </ModalDialog>

  <Button
    label="Show user details"
    onClick="selectedUser = { name: 'Leslie Peters', role: 'Executive Manager', email: 'leslie@example.com' }"
  />
</App>
```

Here the dialog is not opened by a separate command. It appears because `selectedUser` has a value. When the dialog closes, `onClose` clears that variable so the dialog can reopen later.

## Key points

**Use imperative for simple user-triggered dialogs**: If the dialog is just a direct reaction to a click, `dialog.open()` is usually the simplest and clearest option.

**Use declarative when visibility is real app state**: If the dialog should mirror a selected item, a route, or a query parameter, `when` makes that relationship explicit.

**Use `open(data)` when the action owns the payload**: Imperative dialogs can still be dynamic. Pass the current item, object, or primitive into `open()` and read it as `$param` inside the dialog.

**Pair `when` with `onClose`**: A `when`-controlled dialog should usually clear the variable that opened it inside `onClose`, otherwise the next click may not cause a reactive change.

**Avoid throwaway state for static help text**: If you only need to show a fixed message, do not create a dedicated variable just to toggle the dialog. The imperative pattern is a better fit.

**Deep-linking usually favors `when`**: If the open state should be reflected in the URL or other shared app state, declarative control is easier to reason about than an imperative call.

---

## See also

- [Modal Dialogs](/docs/reference/components/ModalDialog) - the component reference and examples for both patterns
