# Share a ModalDialog across components

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.items = [
    { id: 1, title: 'Mountain View' },
    { id: 2, title: 'City Lights' },
    { id: 3, title: 'Ocean Sunset' }
  ]",
  "operations": {
    "get-items": {
      "url": "/items",
      "method": "get",
      "handler": "return $state.items"
    }
  }
}
---comp display
<Component name="Test">

  <AppState id="settings" bucket="appSettings" initialValue="{{
    itemSize: 'medium',
    showDetails: true
  }}" />

  <!-- Settings modal defined at App level - accessible to all components -->
  <ModalDialog id="settingsDialog" title="Settings">
    <SettingsPanel />
  </ModalDialog>

  <DataSource id="items" url="/api/items" />

  <AppHeader title="Demo App">
    <property name="profileMenuTemplate">
      <Icon name="cog" onClick="settingsDialog.open()" />
    </property>
  </AppHeader>

  <VStack gap="1rem">
    <HStack gap="1rem">
      <Text>Items ({settings.value.itemSize} size)</Text>
      <Button
        label="Settings"
        size="sm"
        onClick="settingsDialog.open()"
      />
    </HStack>

    <List data="{items}">
      <Card>
        <VStack>
          <Text>{$item.title}</Text>
          <Fragment when="{settings.value.showDetails}">
            <Text variant="caption">ID: {$item.id}</Text>
          </Fragment>
        </VStack>
      </Card>
    </List>
  </VStack>

</Component>
---comp display
<Component name="SettingsPanel">
  <AppState id="settings" bucket="appSettings" />

  <VStack gap="1rem">

    <Select
      label="Item Size"
      initialValue="{settings.value.itemSize}"
      onDidChange="(value) => settings.update({ itemSize: value })"
    >
      <Option value="small" label="Small" />
      <Option value="medium" label="Medium" />
      <Option value="large" label="Large" />
    </Select>

    <Switch
      label="Show details"
      initialValue="{settings.value.showDetails}"
      onDidChange="(value) => settings.update({ showDetails: value })"
    />

  </VStack>
</Component>
```
