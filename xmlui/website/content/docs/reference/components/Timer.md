# Timer [#timer]

`Timer` is a non-visual component that fires events at regular intervals. It can be enabled or disabled and ensures that the timer event handler completes before firing the next event.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `enabled` [#enabled]

> [!DEF]  default: **true**

Whether the timer is enabled and should fire events.

### `initialDelay` [#initialdelay]

> [!DEF]  default: **0**

The delay in milliseconds before the first timer event.

### `interval` [#interval]

> [!DEF]  default: **1000**

The interval in milliseconds between timer events.

### `once` [#once]

> [!DEF]  default: **false**

Whether the timer should stop after firing its first tick event.

## Events [#events]

### `tick` [#tick]

This event is triggered at each interval when the Timer is enabled.

**Signature**: `tick(): void`

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
