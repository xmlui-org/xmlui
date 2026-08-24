# Cancel a DataSource request

Use `cancel()` on a `DataSource` when the current fetch is no longer useful.

Searches, filters, and dashboards often start a request that the user immediately replaces with another action. Calling `cancel()` aborts the in-flight fetch, sets `inProgress` to `false`, and fires `onCancel` instead of `onError`.

```xmlui-pg copy display name="Cancel a slow DataSource request" height="420px"
---app display {4-17,28-34}
<App var.message="'Loading orders...'" var.isLoading="{true}">
  <VStack gap="$space-4" padding="$space-4">
    <DataSource
      id="orders"
      url="/api/orders"
      onFetch="() => {
        delay(2000);
        if ($abortSignal.aborted) return [];
        return [
          { id: 1001, customer: 'Ada Lovelace', total: '$240.00' },
          { id: 1002, customer: 'Grace Hopper', total: '$180.00' }
        ];
      }"
      onLoaded="() => { isLoading = false; message = 'Orders loaded'; }"
      onCancel="(reason) => { 
        isLoading = false; 
        message = 'Request cancelled: ' + reason; 
      }"
      onError="() => { isLoading = false; message = 'Request failed'; }"
    />

    <Text variant="title">Orders</Text>
    <Text>
      {isLoading ? 'Loading orders...' : message}
    </Text>

    <HStack gap="$space-2">
      <Button
        label="Refresh"
        icon="refresh"
        onClick="isLoading = true; message = 'Loading orders...'; orders.refetch()"
        enabled="{!isLoading}"
        themeColor="primary"
      />
      <Button
        label="Cancel request"
        icon="close"
        onClick="orders.cancel('user')"
        enabled="{isLoading}"
        variant="outlined"
      />
    </HStack>

    <Text when="{orders.cancelled && !isLoading}" color="$color-warning">
      Last cancellation reason: {orders.lastCancelReason}
    </Text>

    <Items data="{orders.value}">
      <Card>
        <HStack>
          <Text>{$item.customer}</Text>
          <SpaceFiller />
          <Text fontWeight="600">{$item.total}</Text>
        </HStack>
      </Card>
    </Items>
  </VStack>
</App>
```

## Key points

**`cancel(reason)` aborts the current fetch**: The method returns `true` when there was an active operation to cancel, or `false` when the `DataSource` was already idle.

**`onCancel` is separate from `onError`**: User cancellation is not treated as a failed request. Use `onCancel` for status messages, cleanup, or analytics.

**Previous data stays available**: Cancelling a refresh does not clear the last successful `value`. This keeps the UI stable while the user changes their mind.

**Use `$abortSignal` in custom fetch handlers**: When you replace the default fetch with `onFetch`, check `$abortSignal.aborted` during long-running custom work so the handler can stop gracefully.

---

## See also

- [DataSource component](/docs/reference/components/DataSource) - fetch data and expose loader state
- [Cancel an API call](/docs/howto/cancel-an-api-call) - cancel a user-triggered mutation
- [Prevent undefined requests in chained DataSources](/docs/howto/prevent-undefined-requests-in-chained-datasources) - avoid requests before inputs are ready
