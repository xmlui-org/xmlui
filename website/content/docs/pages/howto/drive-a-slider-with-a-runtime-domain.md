# Drive a Slider whose min/max domain changes at runtime

Bind `minValue`, `maxValue`, and `initialValue` to the same derived data and let the Slider re-seed itself — do not reset it by calling `setValue`.

A range filter over fetched data has a domain that moves: the earliest and latest dates in a result set, the cheapest and most expensive item currently matching. Every time the underlying query changes, the slider's scale changes with it and the handles have to land somewhere sensible on the new scale.

`Slider` already does this. Its `initialValue` is not read once on mount — it re-applies whenever `initialValue`, `minValue`, or `maxValue` change, clamping the handles into the new domain. The re-seed fires no events, so it cannot disturb whatever state your `didChange` handler owns. Bind the props and the reset comes for free.

Switch datasets to watch the domain, the handles, and the readout move together.

```xmlui-pg copy display name="Switch the dataset to move the domain"
---app display /minValue="{domain[0]}"/ /maxValue="{domain[1]}"/ /initialValue="{domain}"/
<App
  var.dataset="q1"
  var.selection="{null}"
  var.readings="{{
    q1: [12, 18, 24, 31, 37, 44],
    q2: [140, 168, 195, 220, 244, 270]
  }}"
  var.current="{dataset === 'q1' ? readings.q1 : readings.q2}"
  var.domain="{[current[0], current[current.length - 1]]}">

  <HStack verticalAlignment="center" gap="$space-3">
    <Select
      width="200px"
      initialValue="q1"
      onDidChange="(v) => { dataset = v; selection = null }">
      <Option value="q1" label="Q1 (12 – 44)" />
      <Option value="q2" label="Q2 (140 – 270)" />
    </Select>
    <Text variant="secondary" value="domain: {domain[0]} – {domain[1]}" />
  </HStack>

  <Slider
    label="Range"
    minValue="{domain[0]}"
    maxValue="{domain[1]}"
    initialValue="{domain}"
    minStepsBetweenThumbs="{1}"
    onDidCommit="(val) => selection = val" />

  <Text
    when="{selection === null}"
    variant="secondary"
    value="No selection — the whole domain is in play." />
  <Text
    when="{selection !== null}"
    value="Selected {selection[0]} – {selection[1]}" />
</App>
```

## Key points

**`initialValue` re-applies when the domain changes**: the property is not a mount-time-only seed. Changing `initialValue`, `minValue`, or `maxValue` re-runs the seeding step, which clamps the handles into the new range. Binding all three to the same derived value is the whole pattern.

**The re-seed is silent**: it does not fire `didChange` or `didCommit`. That is what makes it safe to use as a reset — the handler that owns your filter state is not called, so the state you deliberately cleared stays cleared. Reset your own state alongside the domain change, as the example does with `selection = null`.

**Do not reset with `setValue`**: it is the obvious-looking alternative and it fails two ways at once. It clamps against the `minValue` / `maxValue` current *at the moment it is called*, so a debounced or deferred call races the new domain and can strand the handles on the old scale. And it fires `didChange` and `didCommit`, so it overwrites the filter state your handler owns — and re-runs whatever expensive work you moved to `didCommit`.

**Gate the slider on settled data**: derive the domain from data that has actually loaded. Seeding against a half-loaded or empty result set puts the handles somewhere arbitrary, and the re-seed will move them again when the real domain arrives. A `when` on the container, or a domain derived from a `DataSource`'s `loaded` state, is enough.

**Prefer `didCommit` for expensive work on a moving domain**: `didChange` fires on every step crossed while dragging, which on a filter means re-running the query per step. `didCommit` fires once when the handle is released.

---

## See also

- [Create a two-handle range slider](/docs/howto/create-a-two-handle-range-slider) — the static-domain case, and where `minStepsBetweenThumbs` and `valueFormat` are covered
- [Style Slider track, thumb, and range](/docs/howto/style-slider-track-thumb-and-range) — theming the control
- [Delay a DataSource until another is ready](/docs/howto/delay-a-datasource-until-another-datasource-is-ready) — gating on data that has actually loaded
