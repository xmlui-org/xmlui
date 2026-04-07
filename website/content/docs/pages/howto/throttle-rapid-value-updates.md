# Throttle rapid value updates

Use `ChangeListener` with `throttleWaitInMs` to process a rapidly-changing value at most once per time interval.

Throttling guarantees that your handler fires immediately on the first change and then no more than once per interval, even if the source changes hundreds of times in between. This is ideal for live search-as-you-type, scroll or resize tracking, or any scenario where you want *some* updates during a burst rather than waiting for the burst to end (which is what debouncing does instead).

```xmlui-pg copy display name="Throttled live search"
---app display /searchTerm/ /throttledTerm/ /changeCount/ /updateCount/
<App 
  var.searchTerm="" 
  var.throttledTerm="" 
  var.changeCount="{0}"
  var.updateCount="{0}"
>
  <ChangeListener
    listenTo="{searchTerm}"
    throttleWaitInMs="{500}"
    onDidChange="({newValue}) => {
      throttledTerm = newValue;
      updateCount = updateCount + 1;
    }"
  />

  <VStack padding="$space-4" gap="$space-3">
    <TextBox
      label="Search (type quickly)"
      value="{searchTerm}"
      onDidChange="(v) => {searchTerm = v; changeCount++}"
      placeholder="Type to search…"
    />

    <Card padding="$space-3">
      <VStack gap="$space-1">
        <HStack>
          <Text>Raw input:</Text>
          <Text variant="strong">{searchTerm || '(empty)'}</Text>
        </HStack>
        <HStack>
          <Text>Last throttled value:</Text>
          <Text variant="strong">{throttledTerm || '(none yet)'}</Text>
        </HStack>
        <HStack>
          <Text>Input changed:</Text>
          <Text variant="strong">{changeCount} time(s)</Text>
        </HStack>
        <HStack>
          <Text>Handler fired:</Text>
          <Text variant="strong">{updateCount} time(s)</Text>
        </HStack>
      </VStack>
    </Card>
  </VStack>
</App>
```

## Key points

**Throttle fires immediately, then at most once per interval**: The handler runs on the very first change, then is suppressed until the interval elapses, then fires again if the value changed — even while typing is still in progress. Debounce, by contrast, waits for the value to *stop* changing. In the example above, `changeCount` increments on every keystroke while `updateCount` only increments when the throttled listener fires — type quickly and you'll see the gap between them grow.

**Choose throttle when you want progress updates during a burst**: Use `throttleWaitInMs` for live search suggestions, scroll-position tracking, or progress bars — cases where users benefit from seeing intermediate results. Use `debounceWaitInMs` when only the final settled value matters (e.g., before calling an expensive API).

**`onDidChange` receives `{prevValue, newValue}`**: Destructure only what you need — `({newValue}) => { throttledTerm = newValue; }`. The previous value is useful when you need to compute a delta between ticks.

**`ChangeListener` does not fire on initial mount**: If you need to initialize state with the current value, set the variable's default directly on `var.name`. The listener only reacts to subsequent changes.

**Setting both `throttleWaitInMs` and `debounceWaitInMs` is not recommended**: When both are set, debounce takes precedence and throttle is ignored. Pick one strategy per listener.

---

## See also

- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — wait for a value to settle before acting
- [React to button click, not keystrokes](/docs/howto/react-to-button-click-not-keystrokes) — defer action until the user explicitly submits
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute values inline without a listener
