# Run a one-time action on page load

Use `onMount` on `App` (or any component) to run initialization logic once when that component mounts.

`onMount` is a built-in lifecycle event available on every XMLUI component. The handler runs once per mount — no guard variable, no `Timer`, no helper. For setup that should fire as soon as the app starts, attach `onMount` to `<App>`.

The older `onInit` name still works as a compatibility alias for `onMount`, but new code should prefer `onMount`.

```xmlui-pg copy display name="One-time page load action"
---app display /onMount/
<App
  var.loadedAt=""
  onMount="loadedAt = formatTime(getDate())"
>
  <VStack padding="$space-4" gap="$space-3">
    <Text variant="h5">Dashboard</Text>
    <Text>Welcome! The page has loaded.</Text>

    <Card when="{loadedAt}" padding="$space-3">
      <HStack gap="$space-2">
        <Icon name="check" />
        <Text variant="strong">Page initialized at {loadedAt}</Text>
      </HStack>
    </Card>
  </VStack>
</App>
```

## Key points

**`onMount` runs once per mount**: The handler fires when the component enters the displayed XMLUI tree. It does not re-fire on ordinary re-renders. If the component is removed and later mounted again, it fires again.

**`onMount` is available on every component**: It's a core lifecycle event, not specific to `App`. Attach it to a `Card`, `VStack`, `Form`, or any other component when the action should fire as that subtree mounts. See [Core properties › Lifecycle](/docs/core-properties#lifecycle-onmount-and-onunmount) for the full lifecycle treatment, including how `when` transitions can re-fire `onMount` on remount.

**Pair with `onUnmount` for setup/teardown**: When the mount action allocates a resource (e.g., starts an interval, subscribes to a channel), use `onUnmount` on the same component to release it when the component unmounts.

**`Timer once="true"` for a delayed one-time action**: When init must run after a known delay — e.g., to defer non-critical setup until the rest of the UI has settled — use a `Timer` with `once="true"` and `initialDelay`:

```xmlui
<Timer once="true" initialDelay="{500}" onTick="() => runDelayedInit()" />
```

For "as soon as the page loads," prefer `onMount`. The `Timer` form is for cases where the delay itself is the point.

**`DataSource onLoaded` for data-driven init**: When the one-time action depends on fetched data, attach it to a `DataSource`'s `onLoaded` event instead — it fires after the initial fetch completes and receives the loaded data directly.

---

## See also

- [Core properties › Lifecycle](/docs/core-properties#lifecycle-onmount-and-onunmount) — full reference for the lifecycle events
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute values reactively without imperative initialization
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — run side-effects after a value settles
