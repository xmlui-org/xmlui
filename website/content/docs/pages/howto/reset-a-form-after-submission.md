# Reset a form after submission

Use dataAfterSubmit to clear or reset form fields, and completedNotificationMessage for visual feedback.

A support ticket form should clear its fields after the user submits successfully so they can immediately start a new ticket. `dataAfterSubmit="clear"` does this automatically on a successful submit — no manual reset logic required.

```xmlui-pg copy display name="Support ticket form with auto-clear"
---app display
<App>
  <Form
    data="{{ subject: '', description: '', priority: 'normal' }}"
    dataAfterSubmit="clear"
    completedNotificationMessage="Ticket submitted — fields cleared!"
    onSubmit="(data) => delay(500)"
    saveLabel="Submit ticket"
  >
    <TextBox label="Subject" bindTo="subject" required="true" />
    <Select
      label="Priority"
      bindTo="priority"
      data="{['low', 'normal', 'high']}"
    />
    <TextArea label="Description" bindTo="description" required="true" />
  </Form>
</App>
```

## Key points

**`dataAfterSubmit` controls post-submit field state**: Three values cover the common cases:

| Value | Behaviour |
|---|---|
| `"keep"` | Fields retain the submitted values (default) |
| `"reset"` | Fields return to the values set in the `data` prop |
| `"clear"` | All fields are emptied as if `data` were never set |

Use `"reset"` when the form has meaningful initial values to restore (e.g. an edit form that re-shows the saved record). Use `"clear"` for creation forms where each submission starts fresh.

**`completedNotificationMessage` shows toast feedback**: Set it to a string to display a success notification automatically after the `onSubmit` handler completes without throwing. This replaces manual `toast(...)` calls in `onSubmit`:

```xmlui
<Form
  completedNotificationMessage="Changes saved successfully."
  onSubmit="(data) => api.save(data)"
>
```

**`onSubmit` vs success feedback timing**: `completedNotificationMessage` appears after `onSubmit` returns (or after its promise resolves). If `onSubmit` is async, the notification correctly waits for the operation to finish before showing.

**Forcing a reset programmatically**: Call the `reset()` method on the form to restore the form to its `data` value at any time — useful for a dedicated Reset button or after a failed conditional check:

```xmlui
<Form id="ticketForm" data="{{ subject: '' }}">
  <TextBox bindTo="subject" label="Subject" />
  <Button label="Discard changes" onClick="ticketForm.reset()" variant="outlined" />
</Form>
```

**`errorNotificationMessage` for failure feedback**: Pair `completedNotificationMessage` with `errorNotificationMessage` to cover both outcomes without extra event handler logic:

```xmlui
<Form
  completedNotificationMessage="Saved!"
  errorNotificationMessage="Save failed — please try again."
  onSubmit="(data) => api.save(data)"
>
```

---

**See also**
- [Form component](/docs/reference/components/Form) — `dataAfterSubmit`, `completedNotificationMessage`, `errorNotificationMessage`, `reset()`
