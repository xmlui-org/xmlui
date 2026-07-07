# Rerun a lifecycle effect when a value changes

Use the non-visual `Lifecycle` component with `keyValue` when a side effect should be torn down and restarted whenever a specific value changes.

This is the XMLUI equivalent of a React effect with a dependency array. The component runs `onMount` once when it appears. When `keyValue` changes, it runs `onUnmount` for the old cycle and then `onMount` for the new cycle. Use this for small side effects that do not fit a more specific managed component such as `DataSource`, `APICall`, `Timer`, `WebSocket`, or `EventSource`.

```xmlui-pg copy display name="Re-arm a side effect when the active room changes" id="re-arm-a-side-effect-when-the-active-room-changes"
---app display /Lifecycle/
<App
  var.activeRoom="Support"
  var.mountCount="{0}"
  var.unmountCount="{0}"
  var.status=""
>
  <VStack padding="$space-4" gap="$space-3">
    <HStack gap="$space-2">
      <Button
        label="Support"
        enabled="{activeRoom !== 'Support'}"
        onClick="activeRoom = 'Support'"
      />
      <Button
        label="Sales"
        enabled="{activeRoom !== 'Sales'}"
        onClick="activeRoom = 'Sales'"
      />
    </HStack>

    <Lifecycle
      keyValue="{activeRoom}"
      onMount="
        mountCount++;
        status = 'Listening to ' + activeRoom;
      "
      onUnmount="unmountCount++"
    />

    <Text>Active room: {activeRoom}</Text>
    <Text>Status: {status}</Text>
    <Text>Mounts: {mountCount}</Text>
    <Text>Unmounts: {unmountCount}</Text>
  </VStack>
</App>
```

## Key points

**`keyValue` controls the lifecycle cycle**: The first render fires `onMount`. Changing `activeRoom` from **Support** to **Sales** fires `onUnmount` for the previous cycle and then `onMount` for the new one.

**Use `Lifecycle` only for side effects**: It renders nothing. Keep visible UI in normal components, and use `Lifecycle` to attach behavior to the current value.

**Prefer specific managed components when they match**: Use `DataSource` for cached reads, `APICall` for triggered writes, `Timer` for scheduled ticks, and push components for streams. `Lifecycle` is for the leftover "run this when this part of the UI becomes active" cases.

**Keep `onUnmount` synchronous**: If the teardown must await an API call or another async operation, move that work to a container's `onBeforeDispose` hook.

---

## See also

- [Clean up when a panel closes](/docs/howto/clean-up-when-a-panel-closes) — use `onUnmount` on a visible component
- [Chain a refetch after a write](/docs/howto/chain-a-refetch) — use managed API/data components when the side effect is data loading
- [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary) — how `Lifecycle keyValue` maps to mount/unmount cycles
