# Style looped rows without a per-row Theme

To style every row of an `Items` or `List` loop, wrap the **whole loop** in one
`<Theme>` — not each row. A `<Theme>` inside the row template creates a full
theming context *per row*, and at a few hundred rows that cost is enough to
freeze the UI.

## Scope one Theme around the loop

The `<Theme>` establishes a single theming context; every looped descendant
inherits it. Here one `tone="dark"` themes all eight cards at once:

```xmlui-pg copy display name="One Theme around the whole loop" height="360px"
---app display
<App var.rows="{Array.from({ length: 8 }).map((_, i) => ({ id: i, name: 'Row ' + (i + 1) }))}">
  <Theme tone="dark">
    <List data="{rows}">
      <Card>
        <Text value="{$item.name}" />
      </Card>
    </List>
  </Theme>
</App>
```

The Theme sits *outside* the `List`, so it is instantiated once and its theme
variables cascade to all rows. Move that `<Theme>` inside the `<Card>` (into the
row template) and you get one theming context per row instead — same visual
result, very different cost.

## Key points

**One Theme around the loop is O(1); a Theme per row is O(rows × themes-per-row).**
A `<Theme>` in the row template instantiates a full theming context for every
rendered row. At scale this dominates render time — a couple hundred instances
can stall the main thread for seconds, even when the same page renders in
milliseconds server-side. Put the Theme above the loop.

**For per-item styling that has a direct prop, set the prop.** If you only need
a per-row `fontSize`, color, or variant that a component already exposes as a
prop (`<Text fontSize="…">`, `themeColor`, `variant`), set that prop in the row
template — don't wrap the row in a `<Theme>` to achieve it.

**App-wide tokens belong in the project theme file.** Values that apply across
the app go in the theme definition, not in markup `<Theme>` blocks — markup
Theme is for scoping a *section* to a different look.

---

## See also

- [Scope a theme to a card or section](/docs/howto/scope-a-theme-to-a-card-or-section) — the general pattern for restyling one subtree
- [Theme component](/docs/reference/components/Theme) — theme variables and `tone`
- [List component](/docs/reference/components/List) — the looped container used above
