# Run a one-time action on page load

Use `onInit` on `App` (or any component) to run initialization logic exactly once when the page mounts.

`onInit` is a built-in lifecycle event available on every xmlui component. The handler runs the first time the component is rendered, then never again — no guard variable, no `Timer`, no helper. For setup that should fire as soon as the app starts, attach `onInit` to `<App>`.

```xmlui-pg copy display name="One-time page load action"
---app display /onInit/
<App
  var.loadedAt=""
  onInit="loadedAt = new Date().toLocaleTimeString()"
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

**`onInit` runs exactly once when the component mounts**: The handler fires the first time the component is rendered. xmlui guarantees a single invocation — no guard variable is needed.

**`onInit` is available on every component**: It's a core lifecycle event, not specific to `App`. Attach it to a `Card`, `VStack`, `Form`, or any other component when the action should fire as that subtree mounts. See [Core properties › onInit and onCleanup](/docs/guides/core-properties#oninit-and-oncleanup) for the full lifecycle treatment, including how `when` transitions can re-fire `onInit` on remount.

**Pair with `onCleanup` for setup/teardown**: When the init action allocates a resource (e.g., starts an interval, subscribes to a channel), use `onCleanup` on the same component to release it when the component unmounts.

**`Timer once="true"` for a delayed one-time action**: When init must run after a known delay — e.g., to defer non-critical setup until the rest of the UI has settled — use a `Timer` with `once="true"` and `initialDelay`:

```xmlui
<Timer once="true" initialDelay="{500}" onTick="() => runDelayedInit()" />
```

For "as soon as the page loads," prefer `onInit`. The `Timer` form is for cases where the delay itself is the point.

**`DataSource onLoaded` for data-driven init**: When the one-time action depends on fetched data, attach it to a `DataSource`'s `onLoaded` event instead — it fires after the initial fetch completes and receives the loaded data directly.

---

## See also

- [Core properties › onInit and onCleanup](/docs/guides/core-properties#oninit-and-oncleanup) — full reference for the lifecycle events
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute values reactively without imperative initialization
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — run side-effects after a value settles
