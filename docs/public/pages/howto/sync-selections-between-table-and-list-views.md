# Sync selections between a Table view and a List view

The Table view syncs selections automatically via `syncWithAppState`, while the Tiles view uses checkboxes that manually coordinate with AppState.

```xmlui-pg
---app
<App>
  <Files />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.files = [
    { id: 1, name: 'document.pdf', size: '2.3 MB', type: 'PDF' },
    { id: 2, name: 'image.jpg', size: '1.1 MB', type: 'Image' },
    { id: 3, name: 'spreadsheet.xlsx', size: '856 KB', type: 'Excel' },
    { id: 4, name: 'presentation.pptx', size: '4.2 MB', type: 'PowerPoint' },
    { id: 5, name: 'text.txt', size: '12 KB', type: 'Text' }
  ]",
  "operations": {
    "get-files": {
      "url": "/files",
      "method": "get",
      "handler": "return $state.files"
    }
  }
}
---comp display
<Component name="Files" var.view="table">
  <AppState id="selections" initialValue="{{ selectedIds: [] }}" />
  <DataSource id="files" url="/api/files" />

  <HStack verticalAlignment="center">
    <Button
      label="Table View"
      onClick="view = 'table'"
      variant="{view === 'table' ? 'solid' : 'outlined'}"
    />
    <Button
      label="Tiles View"
      onClick="view = 'tiles'"
      variant="{view === 'tiles' ? 'solid' : 'outlined'}"
    />
    <Text>Selected: {selections.value.selectedIds.length} items</Text>
  </HStack>

  <Fragment when="{view === 'table'}">
    <TableView data="{files}" />
  </Fragment>

  <Fragment when="{view === 'tiles'}">
    <TilesView data="{files}" />
  </Fragment>
</Component>
---comp display
<Component name="TableView">
  <AppState id="selections" bucket="selections" />

  <Table
    data="{$props.data}"
    rowsSelectable="true"
    syncWithAppState="{selections}"
    loading="{!$props.data}"
  >
    <Column bindTo="name" />
    <Column bindTo="size" />
    <Column bindTo="type" />
  </Table>
</Component>
---comp display
<Component name="TilesView">
  <AppState id="selections" bucket="selections" />

  <List data="{$props.data}">
    <Card>
      <HStack verticalAlignment="center">
        <Checkbox
          initialValue="{selections.value.selectedIds?.includes($item.id) || false}"
          onDidChange="(checked) => {
            const ids = selections.value.selectedIds || [];
            if (checked) {
              selections.update({ selectedIds: [...ids, $item.id] });
            } else {
              selections.update({ selectedIds: ids.filter(id => id !== $item.id) });
            }
          }"
        />
        <VStack>
          <Text>{$item.name}</Text>
          <Text variant="caption">{$item.size} - {$item.type}</Text>
        </VStack>
      </HStack>
    </Card>
  </List>
</Component>
```
