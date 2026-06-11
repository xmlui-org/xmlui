%-DESC-START

Use `LiveRegion` for updates that are important but not represented by moving
focus, such as save results, background sync status, or validation summaries.

The live region itself is visually hidden. To verify the announcement, use a
screen reader; the visible text in the examples mirrors the same message.

```xmlui-pg copy display height="220px" name="Example: announce status changes"
<App>
  <Fragment var.statusMessage="Waiting for an update">
    <VStack>
      <Button
        label="Save"
        onClick="statusMessage = 'Settings saved'"
      />
      <Text>{statusMessage}</Text>
      <LiveRegion message="{statusMessage}" politeness="polite" />
    </VStack>
  </Fragment>
</App>
```

XMLUI also includes a shared global live region. Built-in notifications and
runtime errors use that global region automatically, so you only need
`LiveRegion` when your own component state needs a custom announcement.

For text-like visual components, you may not need to add a separate
`LiveRegion`. The `withLiveRegion` behavior can add a related hidden live
region to `Text`, `Heading`, `H1` through `H6`, `Badge`, `NoResult`, and
`ProgressBar`.

```xmlui-pg copy display height="220px" name="Example: withLiveRegion behavior"
<App>
  <Fragment var.statusMessage="Waiting for an update">
    <VStack>
      <Button
        label="Save"
        onClick="statusMessage = 'Settings saved'"
      />
      <Text withLiveRegion>{statusMessage}</Text>
    </VStack>
  </Fragment>
</App>
```

Use `liveRegionMessage` when the visible text is compact, generated from
complex children, or not descriptive enough for an announcement.

```xmlui-pg copy display height="220px" name="Example: custom live region message"
<App>
  <Fragment var.progress="{0.25}">
    <VStack>
      <Button
        label="Advance"
        onClick="progress = 0.75"
      />
      <ProgressBar
        value="{progress}"
        withLiveRegion
        liveRegionMessage="Upload is {Math.round(progress * 100)} percent complete"
      />
    </VStack>
  </Fragment>
</App>
```

%-DESC-END

`politeness="polite"` renders a `status` region and waits for a natural pause
before announcing the message. Use it for routine updates.

%-PROP-START politeness

```xmlui-pg copy display height="260px" name="Example: polite announcements"
<App>
  <Fragment var.statusMessage="">
    <VStack>
      <HStack>
        <Button
          label="Save"
          onClick="statusMessage = 'Settings saved'"
        />
        <Button
          label="Sync"
          onClick="statusMessage = 'Sync started'"
        />
      </HStack>

      <Text when="{statusMessage}">{statusMessage}</Text>
      <LiveRegion message="{statusMessage}" politeness="polite" />
    </VStack>
  </Fragment>
</App>
```

`politeness="assertive"` renders an `alert` region. Use it sparingly for
urgent updates that should interrupt the current announcement.

```xmlui-pg copy display height="260px" name="Example: assertive announcements"
<App>
  <Fragment var.errorMessage="">
    <VStack>
      <Button
        label="Submit"
        onClick="errorMessage = 'The order could not be submitted'"
      />

      <Text when="{errorMessage}" color="$color-danger-500">
        {errorMessage}
      </Text>
      <LiveRegion message="{errorMessage}" politeness="assertive" />
    </VStack>
  </Fragment>
</App>
```

%-PROP-END
