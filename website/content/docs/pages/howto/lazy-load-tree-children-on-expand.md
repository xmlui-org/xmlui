# Lazy-load tree children on expand

Mark root nodes as dynamically loadable so child data is fetched only when the user expands them.

By default, `Tree` renders the full data set up front. Setting `dynamic: true` on individual nodes tells the Tree to show an expand arrow even when there are no pre-loaded children. When the user clicks to expand, the `onLoadChildren` event fires with the node, and whatever the handler returns is appended as its children.

```xmlui-pg copy display name="Department tree with lazy-loaded members"
---app
<App>
  <script>
    function loadMembers(node) {
      const byDept = {
        engineering: [
          { id: 'e1', parentId: 'engineering', name: 'Alice Chen' },
          { id: 'e2', parentId: 'engineering', name: 'Bob Martinez' },
          { id: 'e3', parentId: 'engineering', name: 'Dave Lee' }
        ],
        design: [
          { id: 'd1', parentId: 'design', name: 'Carol Kim' },
          { id: 'd2', parentId: 'design', name: 'Eve Torres' }
        ],
        marketing: [
          { id: 'm1', parentId: 'marketing', name: 'Frank Brown' }
        ]
      };
      delay(800);
      return byDept[node.id] || [];
    }
  </script>
  <Tree
    data="{[
      { id: 'engineering', name: 'Engineering', dynamic: true },
      { id: 'design',      name: 'Design',      dynamic: true },
      { id: 'marketing',   name: 'Marketing',   dynamic: true }
    ]}"
    onLoadChildren="(node) => loadMembers(node)"
  />
</App>
```

## Key points

**`dynamic: true` on a data item marks it as lazily loadable**: The Tree reads the `dynamic` field of each node (controlled by the `dynamicField` prop, defaulting to `"dynamic"`). Nodes with `dynamic: true` display an expand arrow even when they have no children in the data. Returned child nodes without their own `dynamic: true` are rendered as leaves — no further lazy loading occurs for them.

**`onLoadChildren` must return the child array**: The event handler receives the expanded node object (with its `id`, `name`, depth, and all original data fields). Return a flat array of child objects — each child must include a `parentId` matching the expanded node's `id` so the Tree can connect them in flat format.

**Use `dynamic="{true}"` on the `Tree` to make every node lazily loadable**: Setting this prop at the component level applies dynamic loading to all nodes globally, without needing a `dynamic` field in the data. This is useful when you know every node may have children that need fetching.

**`spinnerDelay` suppresses the loading flash for fast responses**: The Tree shows a loading spinner immediately by default. Set `spinnerDelay="{400}"` (milliseconds) to delay the spinner so that instant or near-instant responses appear seamless.

**`autoLoadAfter` reloads a node's children when it is expanded again after being collapsed**: Set `autoLoadAfter="{3000}"` (milliseconds) on the `Tree` to automatically discard and re-fetch a node's children when the user collapses and then re-expands it after more than 3 seconds. This keeps data fresh without a full page refresh. You can also set it per node via an `autoLoadAfter` field in the node data (controlled by `autoLoadAfterField`).

**`markNodeLoaded(nodeId)` cleanly finishes a dynamic node**: Call this Tree API method after confirming a node is a leaf (for example, when the API returns an empty array). It removes the expand arrow and prevents the node from being re-expanded needlessly.

---

## See also

- [Pre-select a tree node on load](/docs/howto/pre-select-a-tree-node-on-load) — highlight the correct node automatically when the tree first renders
- [Configure tree data format and mapping](/docs/howto/configure-tree-data-format-and-mapping) — choose flat vs hierarchy format and map custom field names to the Tree's expected properties
- [Group items in List by a property](/docs/howto/group-items-in-list-by-a-property) — use `List` with `groupBy` for flat grouped data that does not require parent–child nesting
