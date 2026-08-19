# Keep Tree data stable during DataSource refetch

Avoid passing an empty fallback array to a `Tree` while its `DataSource` is refetching.

`dataRefreshMode="preserve-state"` preserves state across data changes, but it cannot help if the data expression itself turns a temporary loading value into a real empty tree. The common antipattern is `data="{source.value || []}"`: when the `DataSource` starts a fresh load, `source.value` may briefly be `undefined`, so the `Tree` receives `[]` and renders as empty before the new response arrives.

## Antipattern: empty fallback becomes empty data

In this version, expand the Engineering node and then click **Refresh from backend**. The query parameter changes, the `DataSource` enters a new load, and `projectNodes.value || []` gives the `Tree` an empty array during the wait.

```xmlui-pg display height="500px" /projectNodes.value/ /dataRefreshMode/ name="Antipattern: Tree receives empty data while refetching"
---app display
<App
  var.refreshToken="{1}"
  var.lastAction="Ready"
  var.statusColors="{{
    Loading: { background: '#f59e0b', label: 'white' },
    Ready: { background: '#10b981', label: 'white' }
  }}">
  <DataSource
    id="projectNodes"
    url="/api/project-nodes"
    queryParams="{{ refreshToken }}"
    method="GET"
    onLoaded="() => lastAction = 'Loaded version ' + refreshToken" />

  <script>
    function projectTreeData(nodes) {
      return nodes.map(node => ({ ...node }));
    }
  </script>

  <VStack gap="$space-4">
    <HStack verticalAlignment="center" gap="$space-2">
      <Button
        label="Refresh from backend"
        enabled="{!projectNodes.inProgress}"
        onClick="refreshToken = refreshToken + 1" />
      <Badge
        value="{projectNodes.inProgress ? 'Loading' : 'Ready'}"
        colorMap="{statusColors}" />
    </HStack>

    <Text variant="secondary">{lastAction}</Text>

    <Tree
      id="projectTree"
      testId="unstable-project-tree"
      height="300px"
      data="{projectTreeData(projectNodes.value || [])}"
      dataFormat="flat"
      dataRefreshMode="preserve-state"
      defaultExpanded="none">
      <property name="itemTemplate">
        <HStack
          testId="tree-node-{$item.id}"
          verticalAlignment="center"
          gap="$space-2">
          <Icon name="{$item.hasChildren ? 'folder' : 'code'}" />
          <Text>{$item.name}</Text>
        </HStack>
      </property>
    </Tree>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.nodes = [{ id: 1, name: 'Acme Workspace', parentId: null }, { id: 2, name: 'Engineering', parentId: 1 }, { id: 3, name: 'Design', parentId: 1 }, { id: 4, name: 'Operations', parentId: 1 }, { id: 5, name: 'Frontend', parentId: 2 }, { id: 6, name: 'Backend', parentId: 2 }, { id: 7, name: 'QA', parentId: 2 }, { id: 8, name: 'Design Systems', parentId: 3 }, { id: 9, name: 'Research', parentId: 3 }, { id: 10, name: 'Facilities', parentId: 4 }, { id: 11, name: 'Release dashboard', parentId: 5 }, { id: 12, name: 'Component library', parentId: 5 }, { id: 13, name: 'API gateway', parentId: 6 }, { id: 14, name: 'Billing worker', parentId: 6 }]",
  "operations": {
    "get-project-nodes": {
      "url": "/project-nodes",
      "method": "get",
      "handler": "delay(800); return $state.nodes.map(node => ({ ...node, name: node.id === 13 ? 'API gateway v' + $queryParams.refreshToken : node.name }));"
    }
  }
}
```

## Pattern: keep the last successful data

Keep a component variable for the latest successful response, update it from `onLoaded`, and bind the `Tree` to that variable. During a refetch, the old tree data remains available, so the tree stays mounted and its expanded state has a stable data set to reconcile against.

```xmlui-pg copy display height="500px" /cachedNodes/ /onLoaded/ /dataRefreshMode/ name="Pattern: Tree uses the last successful DataSource value"
---app display
<App
  var.refreshToken="{1}"
  var.cachedNodes="{[]}"
  var.lastAction="Ready"
  var.statusColors="{{
    Loading: { background: '#f59e0b', label: 'white' },
    Ready: { background: '#10b981', label: 'white' }
  }}">
  <DataSource
    id="projectNodes"
    url="/api/project-nodes"
    queryParams="{{ refreshToken }}"
    method="GET"
    onLoaded="(data) => {
      cachedNodes = data || [];
      lastAction = 'Loaded version ' + refreshToken;
    }" />

  <script>
    function projectTreeData(nodes) {
      return nodes.map(node => ({ ...node }));
    }
  </script>

  <VStack gap="$space-4">
    <HStack verticalAlignment="center" gap="$space-2">
      <Button
        label="Refresh from backend"
        enabled="{!projectNodes.inProgress}"
        onClick="refreshToken = refreshToken + 1" />
      <Badge
        value="{projectNodes.inProgress ? 'Loading' : 'Ready'}"
        colorMap="{statusColors}" />
    </HStack>

    <Text variant="secondary">{lastAction}</Text>

    <Text
      when="{projectNodes.loaded && !projectNodes.inProgress && cachedNodes.length === 0}"
      variant="secondary">
      No project nodes.
    </Text>

    <Tree
      id="projectTree"
      testId="stable-project-tree"
      height="300px"
      when="{cachedNodes.length > 0}"
      data="{projectTreeData(cachedNodes)}"
      dataFormat="flat"
      dataRefreshMode="preserve-state"
      defaultExpanded="none">
      <property name="itemTemplate">
        <HStack
          testId="tree-node-{$item.id}"
          verticalAlignment="center"
          gap="$space-2">
          <Icon name="{$item.hasChildren ? 'folder' : 'code'}" />
          <Text>{$item.name}</Text>
        </HStack>
      </property>
    </Tree>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.nodes = [{ id: 1, name: 'Acme Workspace', parentId: null }, { id: 2, name: 'Engineering', parentId: 1 }, { id: 3, name: 'Design', parentId: 1 }, { id: 4, name: 'Operations', parentId: 1 }, { id: 5, name: 'Frontend', parentId: 2 }, { id: 6, name: 'Backend', parentId: 2 }, { id: 7, name: 'QA', parentId: 2 }, { id: 8, name: 'Design Systems', parentId: 3 }, { id: 9, name: 'Research', parentId: 3 }, { id: 10, name: 'Facilities', parentId: 4 }, { id: 11, name: 'Release dashboard', parentId: 5 }, { id: 12, name: 'Component library', parentId: 5 }, { id: 13, name: 'API gateway', parentId: 6 }, { id: 14, name: 'Billing worker', parentId: 6 }]",
  "operations": {
    "get-project-nodes": {
      "url": "/project-nodes",
      "method": "get",
      "handler": "delay(800); return $state.nodes.map(node => ({ ...node, name: node.id === 13 ? 'API gateway v' + $queryParams.refreshToken : node.name }));"
    }
  }
}
```

## Key points

**Do not turn loading into empty data**: `source.value || []` is convenient for simple display, but it is risky for stateful collections. During a new load it can look like the backend returned an empty tree.

**Cache only successful responses**: `onLoaded` runs when new data arrives. Updating `cachedNodes` there means the Tree keeps rendering the last known good data while the next request is in flight.

**Use `loaded` and `inProgress` for empty states**: Show the empty message only when the source has loaded, is not currently loading, and the cached array is genuinely empty.

**Keep stable IDs**: `preserve-state` matches nodes by ID. If your backend uses a field other than `id`, set `idField` and keep `selectedValue` in the same ID space.

---

## See also

- [Preserve collection state across data refreshes](/docs/howto/preserve-tree-state-across-data-refreshes) - keep Tree, List, and Table viewport state after insert, update, and delete operations
- [Use fetched data safely in `when`](/docs/howto/use-fetched-data-safely-in-when) - separate loading state from data checks
- [Configure tree data format and mapping](/docs/howto/configure-tree-data-format-and-mapping) - choose flat vs hierarchy data and map custom field names
