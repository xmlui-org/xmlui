# Configure Tree data format and mapping

Choose between flat and hierarchy `dataFormat`, and map fields with `idField`, `nameField`, `parentIdField`, and more.

Tree supports two data shapes: flat arrays where each node references its parent by ID, and nested arrays where each node carries its children inline. Set `dataFormat` to choose the shape, then use field-mapping props to adapt any API response without transforming the data first.

```xmlui-pg copy display name="Tree flat vs hierarchy data format"
---app display
<App>
  <variable name="mode" value="flat" />
  <HStack marginBottom="$space-3">
    <Button 
      label="Flat format" 
      variant="{mode === 'flat' ? 'solid' : 'outlined'}" 
      onClick="mode = 'flat'" 
    />
    <Button 
      label="Hierarchy format" 
      variant="{mode === 'hierarchy' ? 'solid' : 'outlined'}" 
      onClick="mode = 'hierarchy'" 
    />
  </HStack>

  <!-- Flat format: nodes reference parent by parentId -->
  <Tree
    when="{mode === 'flat'}"
    dataFormat="flat"
    idField="id"
    nameField="name"
    parentIdField="parentId"
    defaultExpanded="all"
    data="{[
      { id: 1, name: 'Electronics', parentId: null },
      { id: 2, name: 'Phones', parentId: 1 },
      { id: 3, name: 'Laptops', parentId: 1 },
      { id: 4, name: 'iPhone', parentId: 2 },
      { id: 5, name: 'Pixel', parentId: 2 }
    ]}"
  />

  <!-- Hierarchy format: nodes embed their children inline -->
  <Tree
    when="{mode === 'hierarchy'}"
    dataFormat="hierarchy"
    idField="key"
    nameField="title"
    childrenField="items"
    defaultExpanded="all"
    data="{[
      { key: 1, title: 'Electronics', items: [
          { key: 2, title: 'Phones', items: [
              { key: 4, title: 'iPhone', items: [] },
              { key: 5, title: 'Pixel', items: [] }
          ]},
          { key: 3, title: 'Laptops', items: [] }
      ]}
    ]}"
    backgroundColor="lightgreen"
  />
</App>
```

## Key points

**`dataFormat="flat"` uses parent references**: Each node is an object in a flat array that references its parent via a field (default: `parentId`). Nodes without a parent ID (or with `null`) become root items. Use `parentIdField` to remap to any field name your API returns, such as `"parent_id"` or `"pid"`.

**`dataFormat="hierarchy"` uses nested child arrays**: Each node embeds its children inline under a field (default: `"children"`). Use `childrenField` to remap to any field name your API returns, such as `"items"` or `"nodes"`. `parentIdField` is unused in this mode.

**`idField` and `nameField` apply to both formats**: `idField` (default `"id"`) is required for selection, expansion state, and async loading. `nameField` (default `"name"`) is the display text. Map these to whatever your API returns.

**`defaultExpanded` controls initial open state**: Accepted values are `"none"` (all collapsed), `"all"` (everything open), `"first-level"` (only root children visible), or an array of IDs for selective expansion. `autoExpandToSelection` (default `true`) automatically opens the path to a pre-selected node.

**`iconField`, `selectableField`, and friends are also remappable**: Per-node icon names come from `iconField` (default `"icon"`). Node-level selectability is read from `selectableField` (default `"selectable"`). For async trees, `dynamicField` marks nodes that can load children on demand.

---

## See also

- [Lazy-load tree children on expand](/docs/howto/lazy-load-tree-children-on-expand) — async child loading with the `loadChildren` event
- [Pre-select a tree node on load](/docs/howto/pre-select-a-tree-node-on-load) — `selectedValue` with `autoExpandToSelection`
- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — alternative list display for flat data
