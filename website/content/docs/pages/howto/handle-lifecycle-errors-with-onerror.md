# Handle lifecycle errors with onError

Use `onError` on the component that owns a lifecycle handler when setup or cleanup can fail and the response should stay inside your UI.

Lifecycle handlers run through the same action pipeline as other XMLUI events. If `onMount` or `onUnmount` throws, `onError` receives a structured event with the lifecycle `source` and the thrown `error`. When you declare `onError`, XMLUI suppresses the default lifecycle error toast for that component, so your handler owns the visible response.

```xmlui-pg copy display name="Show a lifecycle setup error in the page" id="show-a-lifecycle-setup-error-in-the-page"
---app display /onError/
<App
  var.showListener="{false}"
  var.shouldFail="{true}"
  var.status="Listener closed"
>
  <VStack padding="$space-4" gap="$space-3">
    <HStack gap="$space-2">
      <Button
        label="Open listener"
        enabled="{!showListener}"
        onClick="showListener = true"
      />
      <Button
        label="Close listener"
        enabled="{showListener}"
        onClick="showListener = false"
      />
      <Button
        label="Allow success"
        onClick="
          shouldFail = false;
          showListener = false;
          status = 'Listener closed';
        "
      />
    </HStack>

    <Lifecycle
      when="{showListener}"
      onMount="
        if (shouldFail) {
          throw 'Connection unavailable';
        }
        status = 'Listener ready';
      "
      onUnmount="status = 'Listener closed'"
      onError="event => status = 'Lifecycle ' + event.source + ' failed: ' + event.error.message"
    />

    <Text>Status: {status}</Text>
  </VStack>
</App>
```

## Key points

**`onError` receives lifecycle failures as data**: The handler receives an event object. `event.source` tells you whether the failure came from `mount`, `unmount`, `beforeDispose`, or an action, and `event.error.message` gives you the message.

**Declare `onError` on the same owner**: Put it on the component whose lifecycle handler can fail. That keeps the fallback behavior close to the risky setup or cleanup.

**Use it for user-visible recovery**: Update status text, log diagnostics, enable a retry path, or route the failure to your app's own error surface. Without `onError`, XMLUI reports the lifecycle failure through the default error path.

**Do not hide expected states as exceptions**: If a missing value is normal, branch before doing the work. Reserve thrown errors for genuinely failed setup or cleanup.

---

## See also

- [Clean up when a panel closes](/docs/howto/clean-up-when-a-panel-closes) — pair lifecycle setup and cleanup
- [Rerun a lifecycle effect when a value changes](/docs/howto/rerun-a-lifecycle-effect-when-a-value-changes) — re-arm a lifecycle cycle with `keyValue`
- [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary) — full lifecycle model
