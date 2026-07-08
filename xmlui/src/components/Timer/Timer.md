%-DESC-START

## Using Timer

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

%-DESC-END

