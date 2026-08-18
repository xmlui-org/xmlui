# Preserve collection state across data refreshes

Use `preserveStateOnNextDataRefresh()` before a backend mutation when the next `Tree`, `List`, or `Table` refresh should keep the user's current view state.

When a collection is backed by a `DataSource`, a successful insert, update, or delete often ends with a refetch. By default, that refreshed `data` can reset viewport state. The one-shot API below tells the next refresh to reconcile the new rows with the current view: matching IDs keep their preserved state, scroll position is preserved unless you ask for a target, and inserts can scroll the first inserted row into view without flashing through an empty or reset collection.

## Tree

```xmlui-pg copy display height="540px" /preserveStateOnNextDataRefresh/ /dataRefreshMode/ name="Tree refresh after insert, update, and delete" id="tree-refresh-after-insert-update-and-delete"
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
            || deleteNode.inProgress}" />
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
        }" />
    </HStack>

    <Text variant="secondary">{lastAction}</Text>

    <Tree
      id="projectTree"
      testId="project-tree"
      height="360px"
      data="{projectNodes}"
      dataRefreshMode="reset"
      defaultExpanded="{[1, 2, 3, 4, 6, 10, 21]}"
      selectedValue="{selectedNode}"
      onSelectionDidChange="({ newNode }) => selectedNode = newNode?.id ?? null">
      <property name="itemTemplate">
        <HStack
          testId="tree-node-{$item.id}"
          verticalAlignment="center"
          gap="$space-2">
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

## List

```xmlui-pg copy display height="500px" /preserveStateOnNextDataRefresh/ /dataRefreshMode/ name="List refresh after insert, update, and delete" id="list-refresh-after-insert-update-and-delete"
---app display
<App var.selectedTickets="" var.lastListAction="Ready">
  <DataSource
    id="tickets"
    url="/api/tickets"
    method="GET" />

  <APICall
    id="insertTicket"
    method="post"
    url="/api/tickets"
    invalidates="{[]}"
    onSuccess="(ticket) => {
      lastListAction = 'Inserted ' + ticket.title;
      tickets.refetch();
    }" />

  <APICall
    id="updateTicket"
    method="put"
    url="/api/tickets/ticket-18"
    invalidates="{[]}"
    onSuccess="(ticket) => {
      lastListAction = 'Updated ' + ticket.title + ' and kept it in view';
      tickets.refetch();
    }" />

  <APICall
    id="deleteTicket"
    method="delete"
    url="/api/tickets/ticket-28"
    invalidates="{[]}"
    onSuccess="(ticket) => {
      lastListAction = 'Deleted ' + ticket.title;
      tickets.refetch();
    }" />

  <script>
    function addTicket() {
      ticketList.preserveStateOnNextDataRefresh({ operation: 'insert' });
      insertTicket.execute();
    }

    function renameTicket() {
      ticketList.preserveStateOnNextDataRefresh({
        operation: 'update',
        scrollTarget: 'ticket-18'
      });
      updateTicket.execute();
    }

    function removeTicket() {
      ticketList.preserveStateOnNextDataRefresh({ operation: 'delete' });
      deleteTicket.execute();
    }
  </script>

  <VStack gap="$space-4">
    <HStack verticalAlignment="center" gap="$space-2">
      <Button label="Insert ticket" onClick="addTicket()" />
      <Button label="Update ticket 18" onClick="renameTicket()" />
      <Button label="Delete ticket 28" themeColor="attention" onClick="removeTicket()" />
    </HStack>

    <Text variant="secondary">{lastListAction}</Text>
    <Text>Selected tickets: {selectedTickets || "(none)"}</Text>

    <List
      id="ticketList"
      testId="ticket-list"
      height="300px"
      data="{tickets}"
      dataRefreshMode="reset"
      rowsSelectable="true"
      fixedItemSize="true"
      onSelectionDidChange="(items) => selectedTickets = items.map(item => item.id).join(', ')">
      <HStack height="36px" verticalAlignment="center" gap="$space-2">
        <Text>{$item.title}</Text>
        <Badge value="selected" when="{$isSelected}" />
        <SpaceFiller />
        <Text variant="secondary">{$item.owner}</Text>
      </HStack>
    </List>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.nextTicketId = 31; $state.ticketVersion = 1; $state.tickets = Array.from({ length: 30 }, (_, i) => ({ id: 'ticket-' + (i + 1), title: 'Ticket ' + (i + 1), owner: i % 2 === 0 ? 'Support' : 'Product' }))",
  "operations": {
    "get-tickets": {
      "url": "/tickets",
      "method": "get",
      "handler": "$state.tickets.map(ticket => ({ ...ticket }))"
    },
    "insert-ticket": {
      "url": "/tickets",
      "method": "post",
      "handler": "const id = 'ticket-' + $state.nextTicketId++; const ticket = { id, title: 'New ticket ' + id.split('-')[1], owner: 'Support' }; $state.tickets.push(ticket); return { ...ticket };"
    },
    "update-ticket": {
      "url": "/tickets/ticket-18",
      "method": "put",
      "handler": "$state.ticketVersion++; const ticket = $state.tickets.find(ticket => ticket.id === 'ticket-18'); if (!ticket) { throw Error('Ticket not found'); } ticket.title = 'Ticket 18 rev ' + $state.ticketVersion; return { ...ticket };"
    },
    "delete-ticket": {
      "url": "/tickets/ticket-28",
      "method": "delete",
      "handler": "const ticket = $state.tickets.find(ticket => ticket.id === 'ticket-28') || { id: 'ticket-28', title: 'Ticket 28' }; $state.tickets = $state.tickets.filter(ticket => ticket.id !== 'ticket-28'); return { ...ticket };"
    }
  }
}
```

## Table

```xmlui-pg copy display height="520px" /preserveStateOnNextDataRefresh/ /dataRefreshMode/ name="Table refresh after insert, update, and delete" id="table-refresh-after-insert-update-and-delete"
---app display
<App var.selectedOrders="" var.lastTableAction="Ready">
  <DataSource
    id="orders"
    url="/api/orders"
    method="GET" />

  <APICall
    id="insertOrder"
    method="post"
    url="/api/orders"
    invalidates="{[]}"
    onSuccess="(order) => {
      lastTableAction = 'Inserted ' + order.name;
      orders.refetch();
    }" />

  <APICall
    id="updateOrder"
    method="put"
    url="/api/orders/order-16"
    invalidates="{[]}"
    onSuccess="(order) => {
      lastTableAction = 'Updated ' + order.name + ' and kept it in view';
      orders.refetch();
    }" />

  <APICall
    id="deleteOrder"
    method="delete"
    url="/api/orders/order-18"
    invalidates="{[]}"
    onSuccess="(order) => {
      lastTableAction = 'Deleted ' + order.name;
      orders.refetch();
    }" />

  <script>
    function addOrder() {
      orderTable.preserveStateOnNextDataRefresh({ operation: 'insert' });
      insertOrder.execute();
    }

    function renameOrder() {
      orderTable.preserveStateOnNextDataRefresh({
        operation: 'update',
        scrollTarget: 'order-16'
      });
      updateOrder.execute();
    }

    function removeOrder() {
      orderTable.preserveStateOnNextDataRefresh({ operation: 'delete' });
      deleteOrder.execute();
    }
  </script>

  <VStack gap="$space-4">
    <HStack verticalAlignment="center" gap="$space-2">
      <Button label="Insert order" onClick="addOrder()" />
      <Button label="Update order 16" onClick="renameOrder()" />
      <Button label="Delete order 18" themeColor="attention" onClick="removeOrder()" />
    </HStack>

    <Text variant="secondary">{lastTableAction}</Text>
    <Text>Selected orders: {selectedOrders || "(none)"}</Text>

    <Table
      id="orderTable"
      testId="order-table"
      height="320px"
      data="{orders}"
      dataRefreshMode="reset"
      rowsSelectable="true"
      rowHeight="36"
      onSelectionDidChange="(items) => selectedOrders = items.map(item => item.id).join(', ')">
      <Column header="Order" bindTo="name" canSort="true" />
      <Column header="Owner" bindTo="owner" canSort="true" />
      <Column header="Status" bindTo="status" />
    </Table>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.nextOrderId = 25; $state.orderVersion = 1; $state.orders = Array.from({ length: 24 }, (_, i) => ({ id: 'order-' + (i + 1), name: 'Order ' + (i + 1), owner: i % 2 === 0 ? 'Field' : 'Finance', status: i % 3 === 0 ? 'Ready' : 'Queued' }))",
  "operations": {
    "get-orders": {
      "url": "/orders",
      "method": "get",
      "handler": "$state.orders.map(order => ({ ...order }))"
    },
    "insert-order": {
      "url": "/orders",
      "method": "post",
      "handler": "const id = 'order-' + $state.nextOrderId++; const order = { id, name: 'New order ' + id.split('-')[1], owner: 'Field', status: 'Ready' }; $state.orders.push(order); return { ...order };"
    },
    "update-order": {
      "url": "/orders/order-16",
      "method": "put",
      "handler": "$state.orderVersion++; const order = $state.orders.find(order => order.id === 'order-16'); if (!order) { throw Error('Order not found'); } order.name = 'Order 16 rev ' + $state.orderVersion; order.status = 'Ready'; return { ...order };"
    },
    "delete-order": {
      "url": "/orders/order-18",
      "method": "delete",
      "handler": "const order = $state.orders.find(order => order.id === 'order-18') || { id: 'order-18', name: 'Order 18' }; $state.orders = $state.orders.filter(order => order.id !== 'order-18'); return { ...order };"
    }
  }
}
```

## Key points

**Call the API before the refresh starts**: `preserveStateOnNextDataRefresh(...)` marks only the next observed `data` refresh. In a real app, call it immediately before the mutation that will eventually refetch the collection data.

**`dataRefreshMode="reset"` keeps normal behavior by default**: The examples leave each collection in reset mode, then opt into preservation for each insert, update, or delete. The API call automatically makes the next refresh behave like `preserve-state`.

**Insert intent can choose the viewport for you**: `{ operation: 'insert' }` compares the old and refreshed data, finds the first inserted source ID, and scrolls it into view only if it is outside the current visible area.

**Delete intent preserves scroll**: `{ operation: 'delete' }` keeps the scroll position because the deleted row may no longer exist as a valid target. `Table` also clamps pagination if a deletion removes the current page.

**Use `scrollTarget` when the operation has a known focus**: The update buttons pass explicit row IDs so the refreshed row remains visible after the backend returns the changed data.

**Stable IDs are required**: Preservation works by matching refreshed source rows by `idKey` for `List` and `Table`, or `idField` for `Tree`. Set those props when your backend uses custom identity field names.

Refresh animation is intentionally separate from preservation. The default behavior focuses on keeping data and state correct without adding layout motion; highlight-style row animation can be layered on later when your design calls for it.

---

## See also

- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) - refetch after a successful mutation
- [Control cache invalidation](/docs/howto/control-cache-invalidation) - restrict which DataSource caches refresh after a write
- [Configure Tree data format and mapping](/docs/howto/configure-tree-data-format-and-mapping) - map backend fields to Tree IDs and parents
- [Follow a List to the bottom](/docs/howto/follow-a-list-to-the-bottom) - keep chat-style feeds anchored to the latest item
