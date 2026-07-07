# Buffer a reactive edit

Keep an in-progress edit in a local buffer, then send one write request when focus leaves the field.

Saving on every keystroke fires requests too aggressively and can cause the cursor to jump if the UI re-renders from a server response. Instead, copy the focused row into a buffer, update only that buffer while the user types, and commit the final value from `onLostFocus`.

```xmlui-pg copy display name="Buffered task editing" height="620px"
---app display /editingTaskId/ /editBuffer/
<App
  var.editingTaskId="{null}"
  var.editBuffer=""
  var.lastSaved="{null}"
  var.statusColors="{{
    Saving: { background: '#f59e0b', label: 'white' },
    Saved: { background: '#3b82f6', label: 'white' },
    Editing: { background: '#10b981', label: 'white' }
  }}">

  <DataSource id="taskList" url="/api/tasks" />
  <APICall
    id="saveTask"
    method="put"
    url="/api/tasks/{$param.id}"
    body="{$param}"
    invalidates="{[]}"
    onSuccess="(result) => {
      lastSaved = result;
      taskList.refetch();
    }" />

  <script>
    function startEditing(task) {
      editingTaskId = task.id;
      editBuffer = task.description;
    }

    function commitEditing(task) {
      const nextDescription = editBuffer.trim();
      const wasEditingThisTask = editingTaskId === task.id;

      editingTaskId = null;

      if (!wasEditingThisTask) return;
      if (nextDescription.length === 0) {
        taskList.refetch();
        return;
      }
      if (nextDescription === task.description) return;

      saveTask.execute({
        id: task.id,
        description: nextDescription
      });
    }
  </script>

  <VStack gap="$space-4">
    <H1>Todo list</H1>

    <Items data="{taskList}">
      <HStack verticalAlignment="center" gap="$space-2">
        <Text width="32px">#{$item.id}</Text>
        <TextBox
          width="320px"
          initialValue="{$item.description}"
          onDidChange="(val) => { editBuffer = val; }">
          <event name="gotFocus">
            editingTaskId = $item.id;
            editBuffer = $item.description;
          </event>
          <event name="lostFocus">
            commitEditing($item);
          </event>
        </TextBox>
        <Badge
          value="Editing"
          colorMap="{statusColors}"
          when="{editingTaskId === $item.id}" />
        <Badge
          value="Saved"
          colorMap="{statusColors}"
          when="{lastSaved.id === $item.id && editingTaskId !== $item.id}" />
      </HStack>
    </Items>

    <Card>
      <VStack gap="$space-2">
        <HStack verticalAlignment="center" gap="$space-2">
          <Text variant="strong">Mock API</Text>
          <Badge
            value="Saving"
            colorMap="{statusColors}"
            when="{saveTask.inProgress}" />
        </HStack>
        <Text when="{lastSaved == null}">
          Focus a task, change its text, then click outside the field.
        </Text>
        <Text when="{lastSaved != null}">
          Last PUT /api/tasks/{lastSaved.id}: {lastSaved.description}
        </Text>
      </VStack>
    </Card>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.tasks = [{ id: 1, description: 'Review pull requests' }, { id: 2, description: 'Update documentation' }, { id: 3, description: 'Push changes' }]",
  "operations": {
    "get-tasks": {
      "url": "/tasks",
      "method": "get",
      "handler": "return $state.tasks.map(task => ({ ...task }))"
    },
    "update-task": {
      "url": "/tasks/:id",
      "method": "put",
      "pathParamTypes": { "id": "string" },
      "handler": "const task = $state.tasks.find(task => task.id === Number($pathParams.id)); if (!task) { throw Error('Task not found'); } task.description = $requestBody.description; return { ...task };"
    }
  }
}
```

## Key points

**The field stays editable, but the active row is visible**: `editingTaskId` is set in `onGotFocus`, cleared in `onLostFocus`, and used only for feedback such as the `Editing` badge. Users can tell which row is in edit mode without guessing why input behavior changed.

**`editBuffer` holds the in-progress text**: Initialize it from `$item.description` when focus enters, update it on every `onDidChange`, and read it once from `onLostFocus`. The server value is not touched until the user finishes editing.

**Validate before committing**: `commitEditing()` ignores unchanged text, and it refetches the original row when the buffered text is empty. Blur does not automatically mean "send a request"; replace those checks with whatever validation your field needs.

**`APICall` models the write**: `saveTask.execute()` sends a single `PUT` after blur. The example uses the playground's `---api` mock backend, so the request updates server state and `taskList.refetch()` reads the confirmed value back into the UI.

---

## See also

- [React to button click, not keystrokes](/docs/howto/react-to-button-click-not-keystrokes) - commit a value only when the user explicitly submits
- [Assign a complex JSON literal to a variable](/docs/howto/assign-a-complex-json-literal-to-a-component-variable) - initialize structured state with an object literal
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) - share editing state across components that are not parent-child
