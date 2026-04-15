# Run a one-time action on page load

Use a `Timer` with `once="true"` to execute initialization logic exactly once as soon as the app renders.

A `Timer` with `once="true"` fires its `onTick` handler a single time, then stops automatically. Setting `initialDelay` adds a short pause before the first (and only) tick, letting the rest of the UI settle before the action runs. For data-driven initialization, you can alternatively react to a `DataSource` finishing its first load.

```xmlui-pg copy display name="One-time page load action"
---app display /shown/ /delayedMessage/
<App var.shown="{false}" var.delayedMessage="">
  <Timer once="true" initialDelay="{500}" onTick="() => {
    shown = true;
    delayedMessage = 'Page fully initialized at ' + new Date().toLocaleTimeString();
  }" />

  <VStack padding="$space-4" gap="$space-3">
    <Text variant="h5">Dashboard</Text>
    <Text>Welcome! The page has loaded.</Text>

    <Card when="{shown}" padding="$space-3">
      <HStack gap="$space-2">
        <Icon name="check" />
        <Text variant="strong">{delayedMessage}</Text>
      </HStack>
    </Card>
    <Text variant="subtle" when="{!shown}">Initializing…</Text>
  </VStack>
</App>
```

## Key points

**`once="true"` fires exactly once, then stops**: The timer invokes `onTick` a single time and automatically disables itself. No guard variable is needed to prevent duplicate invocations.

**`initialDelay` sets a startup pause**: The first (and only) tick fires after the specified number of milliseconds. A small delay such as 500 ms lets the initial render and any synchronous data fetches complete before the action runs.

**Toggle `enabled` to re-run if needed**: Setting the timer's `enabled` prop back to `false` and then to `true` resets it, causing `onTick` to fire once more. This is useful for retrying initialization on demand.

**DataSource `onLoaded` is an alternative for data-driven init**: When the one-time action depends on fetched data, attach it to the `DataSource` component's `onLoaded` event instead — it fires after the initial fetch completes and receives the loaded data directly.

---

## See also

- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute values reactively without imperative initialization
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — run side-effects after a value settles
- [Throttle rapid value updates](/docs/howto/throttle-rapid-value-updates) — run an action at most once per time interval
