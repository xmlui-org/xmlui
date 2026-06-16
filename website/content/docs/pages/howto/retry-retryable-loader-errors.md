# Retry retryable loader errors

Use a loader's structured `error.retryable` flag to decide whether to offer a retry action.

Server, network, and rate-limit failures are retryable by default. Validation, authorization, not-found, conflict, and user-cancelled failures are not. That means your UI can offer a retry button only when retrying has a reasonable chance to recover.

```xmlui-pg copy display name="Retry a retryable report load" id="retry-a-retryable-report-load"
---app display /report.error.retryable/
<App
  var.loadRequested="{false}"
  var.reloadKey="{0}"
  var.status="idle"
>
  <VStack padding="$space-4" gap="$space-3">
    <Button
      label="Load report"
      when="{status === 'idle'}"
      onClick="
        loadRequested = true;
        status = 'loading';
      "
    />

    <DataSource
      id="report"
      url="/api/reports/daily?reload={reloadKey}"
      when="{loadRequested}"
      onLoaded="status = 'loaded'"
      onError="status = 'failed'"
    />

    <Card when="{status === 'failed' && report.error}" padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">Report failed</Text>
        <Text>Category: {report.error.category}</Text>
        <Text>Retryable: {report.error.retryable}</Text>
        <Button
          label="Retry"
          when="{report.error.retryable}"
          onClick="
            status = 'loading';
            reloadKey++;
          "
        />
      </VStack>
    </Card>

    <Card when="{status === 'loaded' && report.value}" padding="$space-3">
      <VStack gap="$space-2">
        <Text variant="strong">Report loaded</Text>
        <Text>Loaded after {report.value.attempts} attempts.</Text>
      </VStack>
    </Card>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.reportAttempts = 0",
  "operations": {
    "get-report": {
      "url": "/reports/daily",
      "method": "get",
      "handler": "$state.reportAttempts++; if ($state.reportAttempts === 1) { throw Errors.HttpError(500, { message: 'Temporary report failure' }); } return { attempts: $state.reportAttempts, title: 'Daily report' };"
    }
  }
}
```

## Key points

**Read `error.retryable` instead of maintaining a status-code list**: XMLUI already maps HTTP and transport failures into retryable and non-retryable categories.

**Start the load from an explicit action**: The `Load report` button sets `loadRequested` to `true`, so the `DataSource` does not fire until the reader clicks it.

**Retry by changing a reactive input**: The retry button changes `reloadKey`, which changes the `DataSource` URL and triggers a fresh load.

**Keep non-retryable failures out of retry loops**: Authorization, validation, not-found, and conflict errors usually need user action or fresher data, not another identical request.

**Use `RetryPolicy` for transparent retries**: When your loader subtree should retry before any error UI appears, wrap it with `RetryPolicy`. Use this explicit pattern when users should decide whether to retry.

---

## See also

- [Branch on structured loader errors](/docs/howto/branch-on-structured-loader-errors) — decide what to show by category
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — manual retry for user-triggered mutations
- [Structured Exception Model](/docs/managed-react/structured-exception-model) — retry defaults and structured fields
