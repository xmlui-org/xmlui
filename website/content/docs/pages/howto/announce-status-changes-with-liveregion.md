# Announce status changes with LiveRegion

Use `LiveRegion` when a background or inline update should be announced to assistive technologies without moving focus.

Visible text is not always enough. If a user activates a button and focus stays on that button, screen readers may not automatically announce nearby status text. A live region gives XMLUI a hidden announcement target while keeping the visual layout exactly as it is.

```xmlui-pg copy display height="260px" name="Announce save status" id="announce-save-status"
---app display
<App>
  <Fragment var.statusMessage="No save attempted">
    <VStack gap="$space-3">
      <Button
        label="Save settings"
        onClick="statusMessage = 'Settings saved'"
      />

      <Text>{statusMessage}</Text>
      <LiveRegion message="{statusMessage}" politeness="polite" />
    </VStack>
  </Fragment>
</App>
```

To check the example with assistive technology, start a screen reader, click **Save settings**, and listen for the updated status announcement. The visible `Text` mirrors the same message for sighted users.

## Key points

**Use `LiveRegion` for important updates that do not move focus**: Save results, sync state, validation summaries, and background operation results are common cases.

**Keep the visible message and announced message aligned**: In most cases the visible `Text` and the `LiveRegion message` should use the same source variable.

**Prefer `politeness="polite"` for routine updates**: Polite announcements wait for a natural pause. Use `politeness="assertive"` only for urgent problems that should interrupt current speech.

**Do not add `LiveRegion` for toasts**: XMLUI's built-in toasts and runtime errors already announce through the shared global live region.

---

## See also

- [LiveRegion component](/docs/reference/components/LiveRegion) — explicit polite and assertive announcements
- [Announce text changes with withLiveRegion](/docs/howto/announce-text-changes-with-withliveregion) — attach the same pattern directly to supported text-like components
- [Show toast notifications from code](/docs/howto/show-toast-notifications-from-code) — visual notifications that XMLUI announces automatically
