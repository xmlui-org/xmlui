# Announce text changes with withLiveRegion

Set `withLiveRegion` on supported text-like components when their displayed value changes and should also be announced.

Use this behavior when the component already owns the message the user needs. Instead of adding a separate `LiveRegion` beside it, bind the displayed value and let XMLUI create the hidden announcement region for that component.

```xmlui-pg copy display height="280px" name="Announce changing text" id="announce-changing-text"
---app display
<App>
  <Fragment var.syncStatus="Waiting" var.pending="{2}">
    <VStack gap="$space-3">
      <HStack>
        <Button
          label="Start sync"
          onClick="syncStatus = 'Sync in progress'"
        />
        <Button
          label="Finish sync"
          onClick="syncStatus = 'Sync complete'; pending = 0"
        />
      </HStack>

      <Text withLiveRegion>{syncStatus}</Text>
      <Badge
        value="{pending}"
        withLiveRegion
        liveRegionMessage="{pending} pending approvals"
      />
    </VStack>
  </Fragment>
</App>
```

To check the example with assistive technology, start a screen reader and click the buttons. The changing `Text` and `Badge` values are also written to hidden polite live regions.

## Key points

**Use `withLiveRegion` when the visible component is the announcement**: It works well for changing status text, headings, badges, empty states, and progress values.

**Use `liveRegionMessage` when the visible value is too short**: A badge that shows `2` is visually useful, but `2 pending approvals` is a better announcement.

**Use `liveRegionPoliteness="assertive"` sparingly**: The default polite behavior is right for most status changes. Reserve assertive announcements for urgent failures.

**Supported components**: `Text`, `Heading`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `Badge`, `NoResult`, and `ProgressBar`.

---

## See also

- [LiveRegion component](/docs/reference/components/LiveRegion) — explicit live regions and behavior properties
- [Behaviors](/docs/behaviors) — the Live Region behavior in the behavior reference
- [Announce status changes with LiveRegion](/docs/howto/announce-status-changes-with-liveregion) — use a standalone live region when the message is separate from the visual component
