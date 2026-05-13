# GridLayout

`GridLayout` wraps [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) to provide a draggable, resizable dashboard grid. Items are positioned on an explicit column/row grid and can be rearranged by the user.

**Props:**
- `layout` -- array of `{ i, x, y, w, h }` objects positioning each child on the grid
- `columns` -- number of grid columns (default: 12)
- `rowHeight` -- pixel height per grid row (default: 60)
- `gap` -- gap between items; accepts CSS lengths or theme tokens like `$space-3` (default: "16px")
- `draggable` / `resizable` -- enable interaction (default: true)
- `compactType` -- "vertical", "horizontal", or null

Drag items to reposition. Drag the bottom-right handle to resize.

## Dashboard demo

```xmlui-pg id="dashboard-demo-b6cf"
---app display
<App>
  <GridLayout
    columns="{12}"
    rowHeight="{80}"
    gap="$space-3"
    layout="{[
      { i: '0', x: 0, y: 0, w: 6, h: 2 },
      { i: '1', x: 6, y: 0, w: 6, h: 2 },
      { i: '2', x: 0, y: 2, w: 4, h: 3 },
      { i: '3', x: 4, y: 2, w: 4, h: 3 },
      { i: '4', x: 8, y: 2, w: 4, h: 3 }
    ]}"
  >
    <Card padding="$space-3" backgroundColor="$color-primary-50">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Active Users</Text>
        <Text fontSize="2rem" fontWeight="bold" color="$color-primary">1,247</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">+12% from last week</Text>
      </VStack>
    </Card>
    <Card padding="$space-3" backgroundColor="$color-success-50">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Revenue</Text>
        <Text fontSize="2rem" fontWeight="bold" color="$color-success">$48,290</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">+8% from last month</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Recent Orders</Text>
        <Text>Order #1042 -- Processing</Text>
        <Text>Order #1041 -- Shipped</Text>
        <Text>Order #1040 -- Delivered</Text>
        <Text>Order #1039 -- Delivered</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Top Products</Text>
        <Text>Widget Pro -- 342 sold</Text>
        <Text>Gadget Plus -- 281 sold</Text>
        <Text>Thingamajig -- 198 sold</Text>
        <Text>Doohickey -- 156 sold</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Support Tickets</Text>
        <Text color="$color-danger">3 critical</Text>
        <Text color="$color-warn">7 pending</Text>
        <Text color="$color-success">42 resolved today</Text>
      </VStack>
    </Card>
  </GridLayout>
</App>
```
