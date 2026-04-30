# Show toast notifications from code

Call the global `toast()` function from event handlers to display success, error, or informational messages.

The `toast()` function pops up a small, auto-dismissing notification banner without interrupting the user's workflow. Unlike the browser's built-in `alert()`, which freezes the page and blocks all interaction until the user clicks OK, toasts are non-blocking — the page stays fully interactive while the message is visible. Multiple toasts can stack simultaneously, and each variant (`success`, `error`, `loading`) carries distinct styling so the user can read the severity at a glance. Call `toast("message")` for a neutral message, or use the convenience methods `toast.success()`, `toast.error()`, and `toast.loading()` for pre-styled variants. Each call returns a toast ID you can use to dismiss it programmatically.

```xmlui-pg copy display name="Trigger different toast styles"
---app display
<App>
  <VStack>
    <H4>Notification demos</H4>
    <HStack wrapContent>
      <Button
        label="Success"
        onClick="toast.success('Changes saved successfully.')" />
      <Button
        label="Error"
        themeColor="attention"
        onClick="toast.error('Failed to delete the record.')" />
      <Button
        label="Info"
        variant="outlined"
        onClick="toast('Sync started in the background.')" />
      <Button
        label="Loading"
        variant="outlined"
        onClick="() => {
          const id = toast.loading('Uploading file...');
          delay(2000);
          toast.success('Upload complete!', { id });
        }" />
    </HStack>
    <Text variant="caption">Click a button to see the notification.</Text>
  </VStack>
</App>
```

## Key points

**`toast(message)` shows a neutral notification**: The simplest call — pass a string and a small banner appears at the configured position. It dismisses itself automatically after a few seconds.

**`toast.success()` and `toast.error()` add visual styling**: Use `toast.success("Saved!")` for positive confirmations and `toast.error("Failed")` for errors. Each variant applies a distinct icon and colour so the user can distinguish the severity at a glance.

**`toast.loading()` stays until dismissed**: A loading toast does not auto-dismiss. Replace it later by passing its `id` to a success or error call: `toast.success("Done", { id })`. This pattern is ideal for showing progress on an async operation.

**The returned ID enables programmatic control**: Every `toast()` call returns a string ID. Call `toast.dismiss(id)` to remove a specific toast, or `toast.dismiss()` with no argument to clear all visible toasts.

**Position and duration are configurable globally**: Set `notifications.position` (e.g. `"top-end"`, `"bottom-center"`) and `notifications.duration` (milliseconds) in `appGlobals` inside your `config.json` to change defaults for the entire app.

---

## See also

- [Open a confirmation before delete](/docs/howto/open-a-confirmation-before-delete) — use `confirm()` for destructive actions that need explicit user approval
- [Set the page title dynamically](/docs/howto/set-the-page-title-dynamically) — update browser-level metadata from code
- [Run a one-time action on page load](/docs/howto/run-a-one-time-action-on-page-load) — trigger initialization logic that could show a welcome toast
