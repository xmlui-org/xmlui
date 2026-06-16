# Show section fallback from a loader error

Use a loader's structured `error` state to replace a data-dependent section with fallback UI.

When a section cannot render useful content without data, keep the primary content and fallback content mutually exclusive. The fallback can read `error.category`, `error.code`, and `error.data` to show a clear message and useful diagnostics.

```xmlui-pg copy display name="Render fallback UI from a failed orders load" id="render-fallback-ui-from-a-failed-orders-load"
---app display /orders.error.category/
<App var.mode="idle">
  <VStack padding="$space-4" gap="$space-3">
    <Button
      label="Load recent orders"
      when="{mode === 'idle'}"
      onClick="mode = 'fail'"
    />

    <DataSource
      id="orders"
      url="/api/orders/recent?mode={mode}"
      when="{mode !== 'idle'}"
    />

    <Card when="{mode === 'fail' && orders.error}" padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">Orders are unavailable</Text>
        <Text>Category: {orders.error.category}</Text>
        <Text>Code: {orders.error.code}</Text>
        <Text>Status: {orders.error.data.statusCode}</Text>
        <Button label="Load cached orders" onClick="mode = 'cached'" />
      </VStack>
    </Card>

    <Card when="{mode === 'cached' && orders.value}" padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">Cached orders loaded</Text>
        <Text>Orders: {orders.value.length}</Text>
      </VStack>
    </Card>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "get-orders": {
      "url": "/orders/recent",
      "method": "get",
      "queryParamTypes": {
        "mode": "string"
      },
      "handler": "if ($queryParams.mode === 'fail') { throw Errors.HttpError(503, { message: 'Orders service unavailable' }); } return [{ id: 1, total: 42 }, { id: 2, total: 86 }];"
    }
  }
}
```

## Key points

**Start the load from an explicit action**: The first button makes it clear which user action triggers the loader and the resulting fallback.

**Use fallback UI for section-level recovery**: Replace the whole failed section instead of showing partial content that depends on missing data.

**Show structured diagnostics**: `category` explains the kind of failure; `code` and `data.statusCode` help support teams identify the backend response.

**Offer a recovery action when one exists**: The example switches to cached data. In a real app this might refetch, open a support drawer, or navigate to a setup page.

**Use `Fallback` for declarative boundaries when available**: The `Fallback` component provides an error-template boundary for failed descendants. This explicit pattern is useful when you want direct control over the loader state and recovery action.

---

## See also

- [Branch on structured loader errors](/docs/howto/branch-on-structured-loader-errors) — inline category-specific messages
- [Retry retryable loader errors](/docs/howto/retry-retryable-loader-errors) — show retry only when retrying can recover
- [Structured Exception Model](/docs/managed-react/structured-exception-model) — fallback and error propagation concepts
