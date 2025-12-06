# Buffer a reactive edit

When editing data in place, you can save on every keystroke but that may be overkill. Here's how to buffer changes and save only when editing completes.

```xmlui-pg copy display name="Buffered task editing" height="500px"
---app display
<App
  var.editingTaskId=""
  var.editBuffer=""
>

  <AppState id="appState" initialValue="{{
    tasks: [
      { id: 1, description: 'Review pull requests'},
      { id: 2, description: 'Update documentation'}
    ]
  }}" />

  <H1>Todo list</H1>
  <Table data="{appState.value.tasks}" width="100%">

    <Column header="Description">
      <TextBox
        readOnly="{editingTaskId !== $item.id}"
        initialValue="{$item.description}"
        onGotFocus="() => {
          editingTaskId = $item.id;
          editBuffer = $item.description;
        }"
        onDidChange="(val) => { editBuffer = val; }"
        onLostFocus="() => {
          if (editBuffer.trim().length === 0) {
            editingTaskId = null;
            return;
          }
          const updated = appState.value.tasks.map((task) =>
            task.id === $item.id ? { ...task, description: editBuffer } : task
          );
          appState.update({ ...appState.value, tasks: updated });
          apiLog.setValue(apiLog.value + 'PUT ' + JSON.stringify(updated) + '\n');
          editingTaskId = null;
        }" />
    </Column>
  </Table>

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
