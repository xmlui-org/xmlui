# Pre-select a tree node on load

Bind `selectedValue` to an ID so the right tree node is highlighted the moment the tree renders.

When the selected section is stored in a variable — loaded from a URL parameter, a saved preference, or application state — pass it directly to `selectedValue`. The Tree highlights the matching node and, combined with `autoExpandToSelection`, expands any collapsed ancestors so the node is visible without manual navigation.

```xmlui-pg copy display name="Settings tree with pre-selected node"
---app display /selectedSection/
<App var.selectedSection="security">
  <HSplitter initialPrimarySize="200px" minPrimarySize="150px" maxPrimarySize="-160px">
    <Tree
      data="{[
        { id: 'settings',      name: 'Settings' },
        { id: 'account',       name: 'Account',       parentId: 'settings' },
        { id: 'profile',       name: 'Profile',        parentId: 'account' },
        { id: 'security',      name: 'Security',       parentId: 'account' },
        { id: 'notifications', name: 'Notifications',  parentId: 'settings' },
        { id: 'appearance',    name: 'Appearance',     parentId: 'settings' }
      ]}"
      selectedValue="{selectedSection}"
      autoExpandToSelection="{true}"
      onSelectionDidChange="({ newNode }) => selectedSection = newNode?.id ?? null"
    />
    <VStack padding="$space-3">
      <Text fontWeight="bold">{selectedSection ?? '(nothing selected)'}</Text>
      <Text variant="secondary">Settings content for this section goes here.</Text>
    </VStack>
  </HSplitter>
</App>
```

## Key points

**`selectedValue` binds the selection to any reactive source**: Set it to a variable, a URL parameter (`$routeParams.section`), or a stored preference. The Tree reads this value on every render and highlights the matching node — no manual `selectNode()` call is needed.

**`autoExpandToSelection="{true}"` (the default) opens ancestor nodes automatically**: If the pre-selected node is inside a collapsed subtree, the Tree expands all necessary parents so the node is immediately visible. Disable it only if you want the node highlighted but intentionally hidden inside a collapsed branch.

**`defaultExpanded` controls which nodes are open on load independent of selection**: Use `"none"` to collapse everything, `"all"` to open the full tree, `"first-level"` to open root nodes only, or pass an array of specific IDs. `autoExpandToSelection` adds to this — it never collapses what `defaultExpanded` opened.

**`onSelectionDidChange` receives `{ newNode, previousNode }`**: The event delivers the newly selected node object, so you can access `newNode.id`, `newNode.name`, and any custom fields from your source data. Assign the new ID back to your variable to keep `selectedValue` in sync when the user changes the selection manually.

**`selectNode(id)` and `scrollIntoView(id)` for programmatic control**: Call these Tree API methods (e.g. `treeRef.selectNode('security')`) from a button or script to change the selection without user interaction. Pair `scrollIntoView` with `selectNode` to ensure the freshly selected node scrolls into the visible area of a long tree.

---

## See also

- [Lazy-load tree children on expand](/docs/howto/lazy-load-tree-children-on-expand) — load child nodes from an API on demand when the user expands a node
- [Configure tree data format and mapping](/docs/howto/configure-tree-data-format-and-mapping) — choose flat vs hierarchy format and map custom field names
- [Build a master–detail layout](/docs/howto/build-a-master-detail-layout) — the same split-panel pattern using a Table for selection instead of a Tree
