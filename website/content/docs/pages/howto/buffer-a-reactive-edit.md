# Buffer a reactive edit

Stage a change locally while the user is editing and commit it to the data store only when focus leaves the field.

Saving on every keystroke fires requests too aggressively and can cause the cursor to jump if the UI re-renders from a server response. Instead, track which row is being edited (`editingTaskId`) and keep the in-progress text in a local buffer (`editBuffer`). On focus-gain, copy the current value into the buffer. On focus-loss, write the buffer to state in a single operation and clear the editing flag.

```xmlui-pg copy display name="Buffered task editing" height="580px"
---app display
<App
  var.editingTaskId=""
  var.editBuffer=""
  var.tasks = "{[
      { id: 1, description: 'Review pull requests'},
      { id: 2, description: 'Update documentation'},
      { id: 3, description: 'Push changes'},
    ]}">

  <H1>Todo list</H1>
  <List data="{tasks}" borderCollapse="false">
  <TextBox
    readOnly="{editingTaskId !== $item.id}"
    initialValue="{$item.description}"
    onGotFocus="() => {
      editingTaskId = $item.id;
      editBuffer = $item.description;
    }"
    onDidChange="(val) => { editBuffer = val; }"
    onLostFocus="() => {
      editingTaskId = null;
      if (editBuffer.trim().length === 0) {
        return;
      }
      const updated = tasks.map((task) =>
        task.id === $item.id ? { ...task, description: editBuffer } : task
      );
      tasks = updated;
      apiLog.setValue(apiLog.value + 'PUT ' + JSON.stringify(updated) + '\n');
    }" />
  </List>

  <Card>
      <HStack gap="$space-2">
        <Text variant="strong">API Call Log</Text>
        <Button label="Clear" size="sm" onClick="apiLog.setValue('')" />
      </HStack>
      <TextArea
        id="apiLog"
        readOnly="true"
        placeholder="API calls will appear here..."
        rows="8"
      />
  </Card>
  
</App>
```

## Key points

**`editingTaskId` tracks which row is actively being edited**: Set it to the item's `id` in `onGotFocus` and clear it on `onLostFocus`. Use `readOnly="{editingTaskId !== $item.id}"` on the `TextBox` so only the focused field accepts input.

**`editBuffer` holds the in-progress text**: Initialize it from `$item.description` when focus enters, update it on every `onDidChange`, and write it to state in one call on `onLostFocus`. The original data is never touched until the user finishes editing.

**Validate before committing**: Check `editBuffer.trim().length === 0` (or any other rule) before calling the update. If invalid, simply reset the editing flag without saving, leaving the original value intact.

**Immutable update keeps the list reactive**: Build a new array with `.map()` — `tasks.map(task => task.id === $item.id ? { ...task, description: editBuffer } : task)` — then assign it back to `tasks`. XMLUI detects the reference change and re-renders the `List`. Mutating the existing array in place (e.g. `tasks[i].description = editBuffer`) does not trigger a re-render.

---

## See also

- [React to button click, not keystrokes](/docs/howto/react-to-button-click-not-keystrokes) — commit a value only when the user explicitly submits
- [Assign a complex JSON literal to a variable](/docs/howto/assign-a-complex-json-literal-to-a-component-variable) — initialize structured state with an object literal
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — share editing state across components that are not parent–child
