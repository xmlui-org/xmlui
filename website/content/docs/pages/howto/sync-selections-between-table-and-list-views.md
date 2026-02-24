# Sync selections between a Table view and a List view

The Table view syncs selections automatically via `syncWithAppState`, while the Tiles (List) view uses checkboxes that manually coordinate with AppState.

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
---comp display /selections/ /sharedSelections/ /selectedIds/
<Component name="Files">
  <AppState id="selections" bucket="sharedSelections" initialValue="{{ selectedIds: [] }}" />
  <DataSource id="files" url="/api/files" />
  <Text>Selected: {selections.value.selectedIds.length} items</Text>
  <Tabs>
    <TabItem label="Table View">
      <TableView data="{files}" />
    </TabItem>
    <TabItem label="Tiles View">
      <TilesView data="{files}" />
    </TabItem>
    <TabItem label="Debug">
      <DebugView />
    </TabItem>
  </Tabs>
</Component>
---comp display  /selections/ /sharedSelections/ /selectedIds/
<Component name="TableView">
  <AppState id="selections" bucket="sharedSelections" />
  <Card>
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
  </Card>
</Component>
---comp display  /selections/ /sharedSelections/ /selectedIds/
<Component name="TilesView">
  <AppState id="selections" bucket="sharedSelections" />
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
---desc
The spread operator `...ids` takes all existing IDs from the array, and creates a new array with those IDs plus the new one.

The filter method creates a new array with only items that meet a condition.
---comp display  /selections/ /sharedSelections/ /selectedIds/
<Component name="DebugView">
  <AppState id="selections" bucket="sharedSelections" />
  <Card>
    <VStack>
      <Text>selections.value</Text>
      <Text variant="code">{JSON.stringify(selections.value, null, 2)}</Text>
    </VStack>
  </Card>
</Component>
```




