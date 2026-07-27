# Pin a toolbar above a bounded scroll region

Keep a find toolbar, filter bar, or header pinned above a scrolling body inside
a bounded region — an expander, a panel, a detail view — using `dock`, not
`StickyBox`, and without double-wrapping a component that already scrolls.

The whole-page case (a header that stays put while the page scrolls) is covered
by [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout).
This how-to is about the *bounded* case: a toolbar that must stay fixed at the
top of one region while only that region's content scrolls under it — the row
you expand in a search-results list, a card, a dialog section.

The pattern is two siblings inside a height-bounded `Stack`: the toolbar docked
to the top, the body a `ScrollViewer` (or bounded `VStack`) that fills the rest.
The toolbar is a **sibling of** the scroller, never a child of it, so it cannot
scroll.

```xmlui-pg copy display name="Filter toolbar pinned above a scrolling body" height="360px"
---app display
<App
  scrollWholePage="false"
  var.query=""
  var.lines="{Array.from({ length: 40 }).map((_, i) => 'Matching line ' + (i + 1))}">
  <Stack height="300px" gap="0" borderWidth="1px" borderColor="$color-surface-200">
    <HStack
      dock="top"
      padding="$space-2 $space-3"
      gap="$space-2"
      verticalAlignment="center"
      backgroundColor="$color-surface-100"
      borderBottom="1px solid $color-surface-200">
      <TextBox
        placeholder="Filter these lines…"
        width="220px"
        value="{query}"
        onDidChange="value => query = value" />
      <SpaceFiller />
      <Text variant="secondary">
        {lines.filter(l => query === '' || l.toLowerCase().includes(query.toLowerCase())).length} / {lines.length}
      </Text>
    </HStack>
    <ScrollViewer dock="stretch">
      <VStack padding="$space-3" gap="$space-2">
        <Items data="{lines.filter(l => query === '' || l.toLowerCase().includes(query.toLowerCase()))}">
          <Text value="{$item}" />
        </Items>
      </VStack>
    </ScrollViewer>
  </Stack>
</App>
```

Type in the box: the body filters and the match count updates, while the
toolbar stays put. It holds because the `ScrollViewer` — not the page, and not
the outer `Stack` — is the single scroll container in the region, and the
toolbar sits outside it. The toolbar controls the body (the `query` variable
drives the `Items` `data`); it never scrolls with it.

Match-to-match *navigation and highlighting* — jumping between hits, drawing a
`<mark>` on the matched text inside rendered content — is a separate concern
from this layout; see the note under "Do not reach for `StickyBox`" and the
Markdown highlight how-to. This example keeps the toolbar honest with live
filtering, which is enough to prove the layout.

## Key points

**The bounded parent must own a height.** `dock="stretch"` fills the space left
over after the docked toolbar, but only if the parent `Stack` has an explicit
height (`height="300px"`, `height="100%"`, or `height="*"` from a parent that
itself is bounded). Without it the `Stack` collapses to content height, nothing
is "left over" to scroll, and the whole region grows instead — pushing the
toolbar up with the page. This is the most common reason a docked toolbar
"won't hold."

**One scroller per region.** The toolbar and the body are siblings; the body is
the only thing with overflow. Putting the toolbar *inside* the `ScrollViewer`,
or giving both the toolbar's row and the body their own overflow, reintroduces
the problem. Pick the single element that scrolls and dock everything else
around it.

**Do not double-wrap a component that already scrolls.** This is the trap that
looks like a framework bug and isn't. If a reusable component already owns its
one bounded scroll region internally (this pattern, a `List` with a bounded
height, a `ScrollViewer`), it renders correctly *on its own*. Wrapping it in
*another* overflow container gives the region two nested scroll containers. The
outer one becomes the scroll context, and the "pinned" toolbar inside the
component now rides the **outer** scroll — it drifts off the top exactly as if
it were never pinned:

```xmlui
<!-- BROKEN: CommitDetail already scrolls internally; this adds a second scroller -->
<VStack maxHeight="420px" overflowY="auto">
  <CommitDetail sha="{$item.sha}" />
</VStack>
```

```xmlui
<!-- HOLDS: let the component own its single bounded scroll region -->
<CommitDetail sha="{$item.sha}" />
```

The fix is almost always to **delete the wrapper**, not to add positioning to
the toolbar. A component that scrolls correctly in one place does not need help
to scroll correctly in another — it needs to not be fought.

**Diagnose by differencing, not by theory.** When a component's toolbar holds in
one place (its own tab, a standalone page) but drifts in another (a search-result
expander, a dialog), do not reach for the scroll internals. Put the two
embeddings side by side and find the single structural difference between them.
It is nearly always an extra container — a `maxHeight`, an `overflowY`, a wrapper
added "to bound the height" — in the embedding that drifts. Remove that
difference before changing anything inside the component.

**Do not reach for `StickyBox` here.** `StickyBox` finds its scroll container by
walking the DOM at runtime (see the [StickyBox reference](/docs/reference/components/StickyBox)).
That works when the scroll container is unambiguous — app-level or page-level
chrome, where the page itself is the one scroller. In a bounded, nested region
the container it discovers is ambiguous, and its runtime pinning ends up
fighting exactly the kind of wrapper described above. For a toolbar over a
bounded body, the `dock` pattern is self-contained: its correctness depends only
on this `Stack` and its two children, not on what encloses them. Reserve
`StickyBox` for a persistent app-level bar (a "Save changes" action row that
stays visible over the whole page) and use `dock` for everything bounded.

---

**See also**
- [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout) — the whole-page header/footer + single scrolling body case
- [Dock elements to panel edges](/docs/howto/dock-elements-to-panel-edges) — `dock="top"` / `dock="stretch"` / `dock="bottom"` layout reference
- [ScrollViewer component](/docs/reference/components/ScrollViewer) — the bounded scroll container
- [StickyBox component](/docs/reference/components/StickyBox) — when a runtime-pinned, app-level bar is actually what you want
- [Stack component](/docs/reference/components/Stack) — `dock` prop and DockPanel layout
