%-DESC-START

`ChangeListener` watches for changes in values and fires a handler in response. It supports two timing strategies:

- **Throttling**: Use `throttleWaitInMs` when you want **periodic updates** during rapid changes — fires immediately, then at most once per interval. Good for progress tracking or scroll events.
- **Debouncing**: Use `debounceWaitInMs` when you want to **wait for silence** — fires only after the value stops changing for the specified duration. Ideal for search-as-you-type or auto-save.

| Aspect | Throttle | Debounce |
|--------|----------|----------|
| Fires on first change? | Yes | No — waits for silence |
| Fires during rapid changes? | Yes, at most once per interval | No — timer resets each time |
| Fires after last change? | Only if interval expires | Yes, always |
| Best for | Continuous monitoring at a set rate | Waiting for user to finish |

> **Rule of precedence:** When both `debounceWaitInMs` and `throttleWaitInMs` are set, debounce takes precedence.

**Key features:**
- **Value monitoring**: Watches any expression, variable, or component property for changes
- **Previous/new values**: Access both old and new values in change handlers
- **Reactive patterns**: Coordinates between components or triggers side effects

%-DESC-END

%-PROP-START listenTo

The following sample demonstrates using this property. Every time the user clicks the button, a counter is incremented. The `ChangeListener` component watches the counter's value. Whenever it changes, the component fires the `didChange` event, which stores whether the new counter value is even into the `isEven` variable.

```xmlui-pg copy display name="Example: listenTo"
<App var.counter="{0}" var.isEven="{false}">
  <Button label="Increment counter" onClick="{counter++}" />
  <ChangeListener
    listenTo="{counter}"
    onDidChange="isEven = counter % 2 == 0" />
  <Text>Counter is {counter} which {isEven? "is": "isn't"} even.</Text>
</App>
```

%-PROP-END

%-PROP-START throttleWaitInMs

Use `throttleWaitInMs` when you want to **limit how frequently** the handler fires while a value is changing continuously. Throttle guarantees the handler runs at most once per interval — it fires immediately on the first change and then again at most once per `throttleWaitInMs` milliseconds for as long as changes keep coming.

**Good use cases for throttle:**
- Progress bars or live counters where you want regular updates at a controlled rate
- Reacting to window resize events or scroll position changes
- Any situation where intermediate values are still meaningful, but too many updates hurt performance

The following example works like the `listenTo` sample, but the user can switch between no throttling and a 3-second throttle. While throttling is active the counter increments on every click, but `isEven` only refreshes at most once per 3 seconds.

```xmlui-pg copy display name="Example: throttleWaitInMs"
<App var.counter="{0}" var.isEven="{false}" var.throttle="{0}">
  <HStack>
    <Button label="Increment counter" onClick="{counter++}" />
    <Button label="Set 3 sec throttling" onClick="throttle = 3000" />
    <Button label="Reset throttling" onClick="throttle = 0" />
  </HStack>

  <ChangeListener
    listenTo="{counter}"
    throttleWaitInMs="{throttle}"
    onDidChange="isEven = counter % 2 == 0" />
  <Text>Counter is {counter} which {isEven? "is": "isn't"} even.</Text>
</App>
```

%-PROP-END

%-PROP-START debounceWaitInMs

Use `debounceWaitInMs` when you want the handler to fire **only after the value has stopped changing** for a given period. Every new change resets the timer, so the handler runs once — after the last change — when things go quiet.

**Good use cases for debounce:**
- Search-as-you-type: wait until the user stops typing before sending a query
- Auto-saving a form: only persist when the user pauses, not on every keystroke
- Any situation where only the final settled value matters, not the intermediate ones

The following sample lets you compare different debounce wait times for a search input. Type in the text box and observe that the "Searching for" text only updates after you stop typing for the chosen duration.

```xmlui-pg copy display name="Example: debounceWaitInMs"
<App var.searchFor="(empty)">
  <RadioGroup
    id="debounceTime"
    initialValue="400"
    label="Choose debounce wait time"
    orientation="horizontal"
  >
    <Option value="0">0ms</Option>
    <Option value="400">400ms</Option>
    <Option value="800">800ms</Option>
  </RadioGroup>
  <TextBox id="searchBox" label="Search" />
  <H3>
    Searching for: {searchFor}
  </H3>

  <ChangeListener
    listenTo="{searchBox.value}"
    debounceWaitInMs="{debounceTime.value}"
    onDidChange="(change) => searchFor = change.newValue"
  />
</App>
```

%-PROP-END

%-EVENT-START didChange

This event is fired when the component observes a value change (within the specified throttling interval). Define the event handler that responds to that change (as the previous samples demonstrate).

The event argument is an object with `prevValue` and `newValue` properties that (as their name suggests) contain the previous and the new values.

```xmlui-pg copy display name="Example: prevValue and newValue"
<App var.counter="{0}">
  <Button label="Increment counter" onClick="{counter++}" />
  <ChangeListener
    listenTo="{counter}"
    onDidChange="(change) => 
      changeLog.setValue('prev: ' + change.prevValue + ' new: ' + change.newValue)"
  />
  <TextArea id="changeLog" />
</App>
```

%-EVENT-END
