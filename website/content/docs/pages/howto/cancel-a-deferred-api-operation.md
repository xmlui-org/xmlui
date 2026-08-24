# Cancel a deferred API operation

Use `cancel()` and `stopPolling()` on an `APICall` in deferred mode to let users abort a long-running server task.

Some operations — report generation, bulk imports, video encoding — take minutes, not milliseconds. `APICall`'s deferred mode polls a status endpoint until the server signals completion. But users should always be able to walk away. Call `stopPolling()` to stop only the client-side polling, or `cancel()` to cancel the active request/polling locally and send a cancellation request to the server when `cancelUrl` is configured.

```xmlui-pg copy display name="Cancel a long-running export" height="320px"
---app display {4-31,40-57}
<App
  var.message="'Ready to export'"
  var.showCancellation="{false}"
>
  <VStack gap="$space-4" padding="$space-4">
    <APICall
      id="exportJob"
      method="post"
      url="/api/exports"
      deferredMode="true"
      statusUrl="/api/exports/{$result.jobId}/status"
      pollingInterval="1000"
      maxPollingDuration="60000"
      completionCondition="{$statusData.status === 'done'}"
      errorCondition="{$statusData.status === 'failed'}"
      progressExtractor="{$statusData.progress}"
      cancelUrl="/api/exports/{$result.jobId}/cancel"
      cancelMethod="post"
      inProgressNotificationMessage="Export progress: {$progress}%"
      completedNotificationMessage="Export finished!"
      onSuccess="() => {
        message = 'Export accepted. Waiting for completion...';
      }"
      onPollingComplete="(finalStatus, reason) => {
        if (reason === 'completed') {
          message = 'Export complete.';
        } else if (reason === 'failed') {
          message = 'Export failed.';
        } else if (reason === 'timeout') {
          message = 'Export timed out.';
        }
      }"
      onCancel="(reason) => {
        showCancellation = true;
        message = 'Export cancelled: ' + reason;
        toast.error('Job cancelled');
      }"
      onError="() => {
        message = 'Export failed.';
      }"
      onTimeout="() => {
        message = 'Export timed out.';
      }"
    />

    <Text variant="title">Data Export</Text>
    <Text>{exportJob.inProgress ? 'Export running...' : message}</Text>

    <HStack gap="$space-2">
      <Button
        label="Start Export"
        onClick="
          showCancellation = false; 
          message = 'Export running...'; 
          exportJob.execute()
        "
        enabled="{!exportJob.inProgress}"
        themeColor="primary"
      />
      <Button
        label="Stop Polling"
        onClick="
          exportJob.stopPolling(); 
          showCancellation = false; message = 'Polling stopped'; 
          toast.error('Polling stopped')
        "
        enabled="{exportJob.inProgress}"
        variant="outlined"
      />
      <Button
        label="Cancel on Server"
        onClick="exportJob.cancel('user')"
        enabled="{exportJob.inProgress}"
        variant="outlined"
      />
    </HStack>

    <Text 
      when="{showCancellation && exportJob.cancelled && !exportJob.inProgress}" 
      color="$color-warning"
    >
      Last cancellation reason: {exportJob.lastCancelReason}
    </Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.jobs = {}",
  "operations": {
    "start-export": {
      "url": "/exports",
      "method": "post",
      "handler": "const jobId = 'job-' + Date.now(); $state.jobs[jobId] = { progress: 0, status: 'running', cancelled: false }; return { jobId: jobId }"
    },
    "get-status": {
      "url": "/exports/:jobId/status",
      "method": "get",
      "pathParamTypes": { "jobId": "string" },
      "handler": "const job = $state.jobs[$pathParams.jobId]; if (!job || job.cancelled) return { status: 'failed', progress: 0 }; job.progress = Math.min(100, job.progress + 15); if (job.progress >= 100) job.status = 'done'; return { status: job.status, progress: job.progress }"
    },
    "cancel-export": {
      "url": "/exports/:jobId/cancel",
      "method": "post",
      "pathParamTypes": { "jobId": "string" },
      "handler": "const job = $state.jobs[$pathParams.jobId]; if (job) { job.cancelled = true; job.status = 'failed'; } return { cancelled: true }"
    }
  }
}
```

## Key points

**`deferredMode` enables 202-style polling**: When the initial request returns, the APICall begins polling `statusUrl` at the configured `pollingInterval`. Use `completionCondition` and `errorCondition` to tell the framework when the task is finished or has failed.

**`stopPolling()` halts the client only**: The server task continues running. Use this when the user navigates away but the result will be consumed later (e.g., an inbox notification). Call `resumePolling()` to pick up where you left off.

**`cancel()` cancels local work and can notify the server**: It aborts the active request or status poll, stops future polling, and sends a request to `cancelUrl` when one is configured and the initial operation result is available. Use this when the server supports true cancellation — freeing resources rather than letting the task finish invisibly.

**Cancellation is not an error**: `onCancel` runs instead of `onError`, and `lastError` stays empty for user-initiated cancellation. Use `cancelled` and `lastCancelReason` when the UI needs to show cancellation state.

**`progressExtractor` drives a progress indicator**: The expression receives `$statusData` and should return a number from 0 to 100. Use `{$progress}` in `inProgressNotificationMessage` to show the value in a toast.

**`maxPollingDuration` prevents infinite polling**: After this many milliseconds the APICall stops polling and fires the `onTimeout` event. The default is 300 000 ms (5 minutes).

---

## See also

- [Track a long-running server task](/docs/howto/handle-background-operations) — Queue-based background processing
- [Cancel an API call](/docs/howto/cancel-an-api-call) — cancelling a non-deferred request
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handling failures and retrying
- [Invalidate related data after a write](/docs/howto/control-cache-invalidation) — refresh caches when the export finishes
