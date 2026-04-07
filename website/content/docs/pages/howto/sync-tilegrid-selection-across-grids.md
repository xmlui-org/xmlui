# Sync TileGrid selection across grids

Use `syncWithVar` for cross-grid selection and leverage keyboard shortcut actions.

Multiple `TileGrid` components can share selection state by pointing at the same global variable name via `syncWithVar`. When a user selects items in one grid, the other grids update their selection to match. This is useful for side-by-side comparison grids, filtered views, or dashboards where one grid acts as a source of truth.

```xmlui-pg copy display name="Sync TileGrid selection across two grids"
---app display
<App var.sharedSelection="{{selectedIds: []}}">
  <HStack verticalAlignment="start">
    <VStack width="*">
      <H4>Products</H4>
      <TileGrid
        data="{[
          { id: 1, name: 'MacBook Pro' },
          { id: 2, name: 'iPad' },
          { id: 3, name: 'iPhone' }
        ]}"
        idKey="id"
        itemsSelectable="true"
        enableMultiSelection="true"
        syncWithVar="sharedSelection"
      >
        <property name="itemTemplate">
          <Stack paddingVertical="$space-6" paddingHorizontal="$space-2">
            <Text>{$item.name}</Text>
          </Stack>
        </property>
      </TileGrid>
    </VStack>
    <VStack width="*">
      <H4>Selection mirror</H4>
      <TileGrid
        data="{[
          { id: 1, name: 'MacBook Pro' },
          { id: 2, name: 'iPad' },
          { id: 3, name: 'iPhone' }
        ]}"
        idKey="id"
        itemsSelectable="true"
        enableMultiSelection="true"
        syncWithVar="sharedSelection"
        checkboxPosition="topEnd"
      >
        <property name="itemTemplate">
          <Stack paddingVertical="$space-6" paddingHorizontal="$space-2">
            <Text>{$item.name}</Text>
          </Stack>
        </property>
      </TileGrid>
    </VStack>
  </HStack>
  <Text variant="caption" marginTop="$space-3">
    Selected IDs: {JSON.stringify(sharedSelection.selectedIds)}
  </Text>
</App>
```

## Key points

**`syncWithVar` must be a valid JS identifier referencing an object with a `selectedIds` property**: The value is not a binding expression — it is a plain string naming a global variable. The variable must be an object; TileGrid reads and writes its `.selectedIds` array. Initialize it as `{{ selectedIds: [] }}`.

**Both grids must use the same `idKey`**: The selection is matched by item ID. If two grids have different `idKey` values (or one uses the default), the shared IDs may not correspond to the same items.

**`$selected` in `itemTemplate` reflects the sync state**: Inside `itemTemplate`, `$selected` is `true` when the current item's ID is in the shared `selectedIds` array. Use it to apply selection styling.

**`enableMultiSelection` enables Ctrl/Cmd+Click and Shift+Click**: Multi-selection is on by default. Set `toggleSelectionOnClick="true"` to make a plain click toggle individual items instead of replacing the selection.

**`checkboxPosition` adds visible selection checkboxes**: Set `checkboxPosition="topStart"` (or `topEnd`, `bottomStart`, `bottomEnd`) to render checkboxes on each tile. Use `hideSelectionCheckboxes="true"` to keep selection visual-only via `$selected` styling.

---

## See also

- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — same selection patterns for Table
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — general cross-component state sharing
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — computing derived data from shared selection state
