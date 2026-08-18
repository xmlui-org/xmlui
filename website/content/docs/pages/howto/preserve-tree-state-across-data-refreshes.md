# Preserve Tree state across data refreshes

Use `preserveStateOnNextDataRefresh()` before a backend mutation when the next `Tree` data refresh should keep the current view state.

When `Tree` is backed by a `DataSource`, a successful insert, update, or delete often ends with a refetch. By default, that refreshed `data` can reset the tree view. The one-shot API below tells the next refresh to reconcile the new rows with the current view: expanded nodes stay expanded when their IDs still exist, the scroll position is preserved unless you ask for a target, and inserts can scroll the first inserted node into view without flashing through an empty or reset tree.

```xmlui-pg copy display height="540px" /preserveStateOnNextDataRefresh/ /dataRefreshMode/ name="Tree refresh after insert, update, and delete"
---app display
<App
  var.selectedNode="{null}"
  var.lastAction="Ready"
  var.statusColors="{{
    Writing: { background: '#f59e0b', label: 'white' },
    Refreshing: { background: '#3b82f6', label: 'white' },
    Ready: { background: '#10b981', label: 'white' }
  }}">

  <DataSource
    id="projectNodes"
    url="/api/project-nodes"
    method="GET" />

  <APICall
    id="insertNode"
    method="post"
    url="/api/project-nodes"
    invalidates="{[]}"
    onSuccess="(node) => {
      selectedNode = node.id;
      lastAction = 'Inserted ' + node.name;
      projectNodes.refetch();
    }" />

  <APICall
    id="updateNode"
    method="put"
    url="/api/project-nodes/13"
    invalidates="{[]}"
    onSuccess="(node) => {
      lastAction = 'Updated ' + node.name + ' and kept it in view';
      projectNodes.refetch();
    }" />

  <APICall
    id="deleteNode"
    method="delete"
    url="/api/project-nodes/20"
    invalidates="{[]}"
    onSuccess="(node) => {
      selectedNode = selectedNode === node.id ? null : selectedNode;
      lastAction = 'Deleted ' + node.name;
      projectNodes.refetch();
    }" />

  <script>
    function addEngineeringTask() {
      projectTree.preserveStateOnNextDataRefresh({ operation: 'insert' });
      insertNode.execute();
    }

    function renameGateway() {
      projectTree.preserveStateOnNextDataRefresh({
        operation: 'update',
        scrollTarget: 13
      });
      updateNode.execute();
    }

    function removeVendorRenewals() {
      projectTree.preserveStateOnNextDataRefresh({ operation: 'delete' });
      deleteNode.execute();
    }
  </script>

  <VStack gap="$space-4">
    <HStack verticalAlignment="center" gap="$space-2">
      <Button
        label="Insert under Engineering"
        onClick="addEngineeringTask()" />
      <Button
        label="Update API gateway"
        onClick="renameGateway()" />
      <Button
        label="Delete vendor renewals"
        themeColor="attention"
        onClick="removeVendorRenewals()" />
      <SpaceFiller />
      <Badge
        value="Writing"
        colorMap="{statusColors}"
        when="{
          insertNode.inProgress || updateNode.inProgress 
            || deleteNode.inProgress}" 
      />
      <Badge
        value="Refreshing"
        colorMap="{statusColors}"
        when="{projectNodes.isRefetching}" />
      <Badge
        value="Ready"
        colorMap="{statusColors}"
        when="{
          !insertNode.inProgress && !updateNode.inProgress && 
            !deleteNode.inProgress && !projectNodes.isRefetching
        }" 
      />
    </HStack>

    <Text variant="secondary">{lastAction}</Text>

    <Tree
      id="projectTree"
      height="360px"
      data="{projectNodes}"
      dataRefreshMode="reset"
      defaultExpanded="{[1, 2, 3, 4, 6, 10, 21]}"
      selectedValue="{selectedNode}"
      onSelectionDidChange="({ newNode }) => selectedNode = newNode?.id ?? null">
      <property name="itemTemplate">
        <HStack 
          testId="tree-node-{$item.id}" 
          verticalAlignment="center" gap="$space-2"
        >
          <Icon name="{$item.hasChildren ? 'folder' : 'code'}" />
          <Text>{$item.name}</Text>
          <Badge value="changed" when="{$item.id === selectedNode}" />
        </HStack>
      </property>
    </Tree>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.nextNodeId = 25; $state.gatewayVersion = 1; $state.nodes = [{ id: 1, name: 'Acme Workspace', parentId: null }, { id: 2, name: 'Engineering', parentId: 1 }, { id: 3, name: 'Design', parentId: 1 }, { id: 4, name: 'Operations', parentId: 1 }, { id: 5, name: 'Frontend', parentId: 2 }, { id: 6, name: 'Backend', parentId: 2 }, { id: 7, name: 'QA', parentId: 2 }, { id: 8, name: 'Design Systems', parentId: 3 }, { id: 9, name: 'Research', parentId: 3 }, { id: 10, name: 'Facilities', parentId: 4 }, { id: 11, name: 'Release dashboard', parentId: 5 }, { id: 12, name: 'Component library', parentId: 5 }, { id: 13, name: 'API gateway v1', parentId: 6 }, { id: 14, name: 'Billing worker', parentId: 6 }, { id: 15, name: 'Regression suite', parentId: 7 }, { id: 16, name: 'Accessibility audit', parentId: 7 }, { id: 17, name: 'Token cleanup', parentId: 8 }, { id: 18, name: 'Interview notes', parentId: 9 }, { id: 19, name: 'Office move', parentId: 10 }, { id: 20, name: 'Vendor renewals', parentId: 10 }, { id: 21, name: 'Mobile app', parentId: 2 }, { id: 22, name: 'Navigation refresh', parentId: 21 }, { id: 23, name: 'Prototype review', parentId: 3 }, { id: 24, name: 'Security checklist', parentId: 4 }]",
  "operations": {
    "get-project-nodes": {
      "url": "/project-nodes",
      "method": "get",
      "handler": "$state.nodes.map(node => ({ ...node }))"
    },
    "insert-project-node": {
      "url": "/project-nodes",
      "method": "post",
      "handler": "const id = $state.nextNodeId++; const node = { id, name: 'New engineering task ' + id, parentId: 2 }; $state.nodes.push(node); return { ...node };"
    },
    "update-project-node": {
      "url": "/project-nodes/13",
      "method": "put",
      "handler": "$state.gatewayVersion++; const node = $state.nodes.find(node => node.id === 13); if (!node) { throw Error('Node not found'); } node.name = 'API gateway v' + $state.gatewayVersion; return { ...node };"
    },
    "delete-project-node": {
      "url": "/project-nodes/20",
      "method": "delete",
      "handler": "const node = $state.nodes.find(node => node.id === 20) || { id: 20, name: 'Vendor renewals' }; $state.nodes = $state.nodes.filter(node => node.id !== 20); return { ...node };"
    }
  }
}
```

## Key points

**Call the API before the refresh starts**: `projectTree.preserveStateOnNextDataRefresh(...)` marks only the next observed `data` refresh. In a real app, call it immediately before the mutation that will eventually refetch the tree data.

**`dataRefreshMode="reset"` keeps normal behavior by default**: The example leaves the Tree in reset mode, then opts into preservation for each insert, update, or delete. The API call automatically makes the next refresh behave like `preserve-state`.

**Insert intent can choose the viewport for you**: `{ operation: 'insert' }` compares the old and refreshed data, finds the first inserted node ID, and scrolls it into view only if it is outside the current visible area.

**Delete intent preserves scroll**: `{ operation: 'delete' }` keeps the scroll position because the deleted node may no longer exist as a valid target.

**Use `scrollTarget` when the operation has a known focus**: The update button passes `scrollTarget: 13`, so the refreshed API gateway row remains visible after the server returns the renamed node.

**Stable IDs are required**: Preservation works by matching refreshed source rows by `idField`. If your backend sends custom names such as `nodeId` or `parentNodeId`, set `idField` and `parentIdField` accordingly.

---

## See also

- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) - refetch after a successful mutation
- [Configure Tree data format and mapping](/docs/howto/configure-tree-data-format-and-mapping) - map backend fields to Tree IDs and parents
- [Lazy-load tree children on expand](/docs/howto/lazy-load-tree-children-on-expand) - fetch child nodes when a branch opens
- [Pre-select a tree node on load](/docs/howto/pre-select-a-tree-node-on-load) - control Tree selection with `selectedValue`
