# Clean up when a panel closes

Use `onUnmount` on the component that owns a visible panel to run synchronous cleanup when that panel leaves the displayed tree.

`onUnmount` is the paired lifecycle event for `onMount`. It fires when a component is removed by a `when` transition or by a parent being torn down. This makes it a good fit for small, immediate cleanup: clear a local selection, record that a panel closed, stop reading from a synchronous browser primitive, or reset state that belongs only to the visible section.

```xmlui-pg copy display name="Clean up a conditional details panel" id="clean-up-a-conditional-details-panel"
---app display /onUnmount/
<App
  var.showDetails="{true}"
  var.lifecycleStatus="Details panel is open"
  var.closeCount="{0}"
>
  <VStack padding="$space-4" gap="$space-3">
    <HStack gap="$space-2">
      <Button
        label="Show details"
        enabled="{!showDetails}"
        onClick="showDetails = true"
      />
      <Button
        label="Hide details"
        enabled="{showDetails}"
        onClick="showDetails = false"
      />
    </HStack>

    <Card
      when="{showDetails}"
      padding="$space-3"
      onMount="lifecycleStatus = 'Details panel is open'"
      onUnmount="
        closeCount++;
        lifecycleStatus = 'Details panel cleanup ran';
      "
    >
      <Text variant="strong">Customer details</Text>
      <Text>Temporary panel state belongs here.</Text>
    </Card>

    <Text>Status: {lifecycleStatus}</Text>
    <Text>Cleanup runs: {closeCount}</Text>
  </VStack>
</App>
```

## Key points

**`onUnmount` runs when the component leaves the displayed tree**: In the example, clicking **Hide details** changes `showDetails` to `false`, so the `Card` unmounts and its cleanup handler runs.

**Cleanup should be synchronous**: `onUnmount` runs during teardown. Use it for immediate state changes and synchronous cleanup. If cleanup has to wait for a server call or storage write, use `onBeforeDispose` on a container instead.

**Pair setup and teardown on the same owner**: Put `onMount` and `onUnmount` on the component that owns the resource. That keeps the lifecycle close to the visible section it describes.

**Reopening starts a new lifecycle cycle**: When the panel is shown again, `onMount` runs again. Ordinary re-renders while the panel stays visible do not fire either lifecycle handler.

---

## See also

- [Run a one-time action on page load](/docs/howto/run-a-one-time-action-on-page-load) — run setup when a component appears
- [Save work before a page or panel closes](/docs/howto/save-work-before-a-page-or-panel-closes) — use `onBeforeDispose` for async cleanup
- [Managed Lifecycle Vocabulary](/docs/managed-react/managed-lifecycle-vocabulary) — full lifecycle model
