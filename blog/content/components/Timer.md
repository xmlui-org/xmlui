# Timer [#timer]

`Timer` is a non-visual component that fires events at regular intervals. It can be enabled or disabled and ensures that the timer event handler completes before firing the next event.

## Using Timer [#using-timer]

The following sample demonstrates many aspects of the `Timer` component. Use the switches and the buttons to observe how the component works.

```xmlui-pg display copy name="Using Timer"
<App var.count="{0}">
  <Text>
    Count: {count} | Timer is {timer.isPaused() ? 'paused' : 'running'}
  </Text>
  <Timer
    id="timer"
    initialDelay="2000"
    interval="200"
    onTick="count++;"
    enabled="{enable.value}"
    once="{once.value}" />
  <Switch id="enable" label="Enable Timer" initialValue="true" />
  <Switch id="once" label="Run Once" initialValue="{false}" />
  <HStack>
    <Button onClick="timer.pause()" enabled="{!timer.isPaused()}">
      Pause
    </Button>
    <Button onClick="timer.resume()" enabled="{timer.isPaused()}">
      Resume
    </Button>
  </HStack>
</App>
```

## Properties [#properties]

### `enabled` (default: true) [#enabled-default-true]

Whether the timer is enabled and should fire events.

### `initialDelay` (default: 0) [#initialdelay-default-0]

The delay in milliseconds before the first timer event.

### `interval` (default: 1000) [#interval-default-1000]

The interval in milliseconds between timer events.

### `once` (default: false) [#once-default-false]

Whether the timer should stop after firing its first tick event.

## Events [#events]

### `tick` [#tick]

This event is triggered at each interval when the ${COMP} is enabled.

## Exposed Methods [#exposed-methods]

### `isPaused` [#ispaused]

Returns whether the timer is currently paused.

**Signature**: `isPaused(): boolean`

### `isRunning` [#isrunning]

Returns whether the timer is currently running (enabled and not paused).

**Signature**: `isRunning(): boolean`

### `pause` [#pause]

Pauses the timer. The timer can be resumed later from where it left off.

**Signature**: `pause()`

### `resume` [#resume]

Resumes a paused timer. If the timer is not paused, this method has no effect.

**Signature**: `resume()`

## Styling [#styling]

This component does not have any styles.
