# Handle action errors on a component

Use a component-level `onError` when an action failure should be handled next to the control that caused it.

Every component can declare `onError`. If another handler on that component throws, XMLUI routes the failure to the local error handler and suppresses the default toast for that component. This is a good fit for retry buttons, inline status, and local recovery where global telemetry would be too broad.

```xmlui-pg copy display name="Handle a button action error locally" id="handle-a-button-action-error-locally"
---app display /onError/
<App
  var.shouldFail="{true}"
  var.status="Ready"
>
  <VStack padding="$space-4" gap="$space-3">
    <Button
      label="Run import"
      onClick="
        if (shouldFail) {
          throw Error('Import file is malformed');
        }
        status = 'Import completed';
      "
      onError="event => status = 'Action ' 
        + event.source + ' failed: ' 
        + event.error.message"
    />

    <Button
      label="Allow import"
      onClick="
        shouldFail = false;
        status = 'Ready';
      "
    />

    <Text>Status: {status}</Text>
  </VStack>
</App>
```

## Key points

**Local `onError` handles failures from the same component**: In the example, the `Run import` button owns both the risky `onClick` and the recovery `onError`.

**The event describes the failing phase**: For action handlers, `event.source` is `action`; `event.error.message` contains the thrown message.

**Use local handling for local recovery**: Keep form-row, panel, or button-specific failures near the interaction. Use `App onError` when the app needs central telemetry or a global status surface.

**Prefer structured API errors for server work**: For failed API requests, handle the `APICall` or loader error object and branch on its structured fields.

---

## See also

- [Collect global errors with App onError](/docs/howto/collect-global-errors-with-app-onerror) — app-wide telemetry and error buffering
- [Handle lifecycle errors with onError](/docs/howto/handle-lifecycle-errors-with-onerror) — local handling for mount/unmount failures
- [Structured Exception Model](/docs/managed-react/structured-exception-model) — how local and global error channels compose
