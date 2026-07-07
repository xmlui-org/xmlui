# Retry a failed API call

Detect an error on `APICall`, show a retry button, and call `execute()` again.

Network requests fail — servers time out, Wi-Fi drops, rate limits kick in. When an `APICall` fails, its `onError` event fires and its `lastError` property holds the failure details. You can present a retry button that calls `execute()` a second time without re-mounting  the component.

```xmlui-pg copy display name="Retry a flaky API call"
---app display /retries/ {12-19}
<App var.retries="{0}">
  <APICall
    id="saveRecord"
    method="post"
    url="/api/records"
    body="{{ name: 'New record' }}"
    onSuccess="() => retries = 0"
    completedNotificationMessage="Record saved!"
  />

  <VStack gap="$space-4" padding="$space-4">
    <Button
      label="Save record"
      onClick="saveRecord.execute()"
      enabled="{!saveRecord.inProgress}"
      themeColor="primary"
    />

    <Card when="{saveRecord.lastError}" padding="$space-3">
      <VStack gap="$space-2">
        <HStack gap="$space-2" verticalAlignment="center">
          <Icon name="warning" />
          <Text themeColor="error">Request failed</Text>
        </HStack>
        <Text variant="caption">Attempts: {retries}</Text>
        <Button
          label="Retry"
          onClick="retries++; saveRecord.execute()"
          themeColor="attention"
          size="sm"
        />
      </VStack>
    </Card>

    <Text when="{saveRecord.loaded}" themeColor="success">
      Record created successfully.
    </Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.attempts = 0",
  "operations": {
    "create-record": {
      "url": "/records",
      "method": "post",
      "handler": "$state.attempts++; if ($state.attempts % 3 !== 0) { throw Error('Server error — try again'); } return { id: $state.attempts, name: $requestBody.name }"
    }
  }
}
```

The mock API fails two out of every three calls, so click **Save record** and then **Retry** until the third attempt succeeds.

## Key points

**`lastError` reveals the most recent failure**: After a failed `execute()`, `lastError` holds the error object. Use it with `when="{saveRecord.lastError}"` to conditionally show an error panel.

**`execute()` can be called repeatedly**: Each call fires a fresh request. There is no built-in retry limit — your markup decides how many times to retry and when to stop.

**`onSuccess` resets the error automatically**: When a subsequent `execute()` succeeds, `lastError` is cleared and `loaded` becomes `true`. Use `onSuccess` to reset any local retry counters.

**`inProgress` prevents double-clicks**: Bind the button's `enabled` prop to `{!saveRecord.inProgress}` so users cannot fire overlapping requests while one is in flight.

---

## See also

- [Track a long-running server task](/docs/howto/handle-background-operations) — use a Queue for async processing with progress feedback
- [Poll an API at regular intervals](/docs/howto/poll-an-api-at-regular-intervals) — automatic re-fetching on a timer
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — refresh caches after a successful mutation
