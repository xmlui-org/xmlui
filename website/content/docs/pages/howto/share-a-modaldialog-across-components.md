# Share a ModalDialog across components

Define the dialog once at the `App` level so any component in the tree can open it by `id`.

A `ModalDialog` defined as a direct child of `App` is in scope everywhere. Multiple triggers — a header icon, a toolbar button, a list row — can all call `dialogId.open()` independently. Pair this with an app-level `global` variable so the dialog content and every component that reads the settings always stay in sync.

```xmlui-pg
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
---app display /settings/ /settingsDialog/ /appSettings/
<App global.settings="{{
    itemSize: 'medium',
    showDetails: true
  }}">

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

  <VStack>
    <HStack>
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

</App>

---comp display /settings/ /settingsDialog/ /appSettings/
<Component name="SettingsPanel">
  <VStack>

    <Select
      label="Item Size"
      initialValue="{settings.itemSize}"
      onDidChange="(value) => settings.itemSize = value"
    >
      <Option value="small" label="Small" />
      <Option value="medium" label="Medium" />
      <Option value="large" label="Large" />
    </Select>

    <Switch
      label="Show details"
      initialValue="{settings.showDetails}"
      onDidChange="(value) => settings.showDetails = value"
    />

  </VStack>
</Component>
```

## Key points

**Place the dialog as a direct child of `App` so its `id` is in scope everywhere**: Any component in the tree — including those in a `NavPanel`, `AppHeader`, or deeply nested custom component — can call `settingsDialog.open()` without prop drilling or event bubbling.

**Multiple triggers can open the same dialog**: In this example the header icon and the content-area button both call `settingsDialog.open()`. There is no limit on the number of triggers; they all reference the same instance by `id`.

**Extract the dialog content into a component to keep the markup readable**: Placing `<SettingsPanel />` inside the dialog body keeps the `App`-level markup short. The component is defined separately in the `---comp` block and can have its own local state if needed.

**`global.xxx` on `App` creates a mutable value accessible across all components**: Declaring `global.settings="{{...}}"` on the `<App>` tag exposes `settings` as a reactive global. Any component that reads `settings.fieldName` automatically re-renders when the value changes — no event callbacks or shared variables are needed.

**Changes made inside the dialog take effect live on the page behind it**: Because both the dialog and the content area read from the same `settings` global, toggling "Show details" or changing "Item Size" inside the open dialog immediately updates the list behind it.

---

## See also

- [Pass data to a Modal Dialog](/docs/howto/pass-data-to-a-modal-dialog) — open a dialog pre-populated with a specific row's data
- [Keep a ModalDialog reopenable with onClose](/docs/howto/use-modal-dialog-onclose) — reset the controlling variable so `when`-gated dialogs can reopen
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — share state across components without a modal
