%-DESC-START

**Key features:**
- **Range selection**: Single value or dual-thumb range selection with configurable minimum separation
- **Step control**: Precise incremental selection with customizable step values
- **Value formatting**: Custom display formatting for current values and visual feedback

%-DESC-END

%-PROP-START initialValue

```xmlui-pg name="Slider"
<Slider initialValue="5" />
```

%-PROP-END

%-PROP-START minValue

```xmlui-pg name="Slider 2"
<Slider minValue="10" />
```

%-PROP-END

%-PROP-START maxValue

```xmlui-pg name="Slider 3"
<Slider maxValue="30" />
```

%-PROP-END
%-EVENT-START didCommit

This event fires once the user finishes an adjustment, while `didChange` fires on every step crossed during a drag. Use `didCommit` for work you do not want repeated mid-gesture — filtering a result set, fetching, recalculating — and keep `didChange` for the live readout.

```xmlui-pg name="Slider 4"
---app copy display name="Example: didCommit"
<App var.live="{[20, 60]}" var.committed="{[20, 60]}">
  <Slider
    initialValue="{[20, 60]}"
    minStepsBetweenThumbs="1"
    onDidChange="(val) => live = val"
    onDidCommit="(val) => committed = val" />
  <Text value="dragging: {live[0]} – {live[1]}" />
  <Text value="committed: {committed[0]} – {committed[1]}" />
</App>
---desc
Drag a thumb: the first line follows every step, the second updates only when you let go.
```

Three details worth knowing before you move expensive work here:

- **The two events are additive, not exclusive.** Adopting `didCommit` does not quiet `didChange` — it keeps firing per step, which is what lets a live readout follow the thumbs while the expensive work waits for the release. Move work *to* `didCommit`; do not drop `didChange`.
- Keyboard adjustments commit **per key-down, including auto-repeat** — holding an arrow key produces one commit per repeat, not one when the key is released. If a slider is realistically keyboard-driven, the commit handler may still need a debounce.
- The event follows values the app or the user asks for: a pointer release that actually moved the value, a keyboard adjustment, and the `setValue()` method. Re-seeding the component by changing `initialValue`, `minValue`, or `maxValue` fires neither `didCommit` nor `didChange`.

%-EVENT-END
