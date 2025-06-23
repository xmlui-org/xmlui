%-DESC-START

**Key features:**
- **Value monitoring**: Watches any expression, variable, or component property for changes
- **Throttling support**: Prevents excessive triggering with `throttleWaitInMs` for rapid changes
- **Previous/new values**: Access both old and new values in the change handler
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

The following example works like the previous one (in the `listen` prop's description). However, the user can reset or set the throttling time to 3 seconds. You can observe that while the throttling time is 3 seconds, the counter increments on every click, but `isEven` only refreshes once within 3 seconds.

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

%-EVENT-START didChange

This event is fired when the component observes a value change (within the specified throttling interval). Define the event handler that responds to that change (as the previous samples demonstrate).

The event argument is an object with `prevValue` and `newValue` properties that (as their name suggests) contain the previous and the new values.

%-EVENT-END
