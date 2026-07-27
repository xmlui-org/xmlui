# Pin a toolbar above a bounded scroll region

Keep a find toolbar, filter bar, or header pinned above a scrolling body inside
a bounded region — an expander, a panel, a detail view — and stop it drifting
off the top as the body scrolls.

**Symptom → cause → fix.** A "pinned" toolbar drifts because the body is a
scroller that *defers* its scroll instead of *capping* it. The usual culprit is
a virtua `List` with no firm height: it hands its scroll to the nearest
scrolling ancestor (internally, `hasOutsideScroll`), so the whole region —
toolbar included — scrolls in that outer container. The fix is a body that
**caps** its own scroll, with the toolbar as a **sibling** of it, never a child.

A capping scroller has two equally correct spellings:

- a `ScrollViewer`, docked with `dock="stretch"` inside a height-bounded `Stack`, or
- a bounded `VStack` with a firm height and `overflowY="auto"`.

Both own their scroll locally; neither defers. Pick whichever reads better in the
surrounding code — they are the same remedy, not a lightweight and a heavyweight
option. This how-to shows both, then the traps that make a correct region drift
anyway.

The whole-page case (a header that stays put while the *page* scrolls) is a
different layout — see [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout).
This how-to is the *bounded* case: one region scrolls under a fixed toolbar — the
row you expand in a search-results list, a card, a dialog section.

## The dock spelling

The toolbar and the body are two siblings inside a height-bounded `Stack`: the
toolbar `dock="top"`, the body a `ScrollViewer dock="stretch"` that fills the
rest.

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

## The bounded-VStack spelling

The same region, spelled with a plain `VStack` body instead of a docked
`ScrollViewer`. The toolbar is the first child; the body is a second `VStack`
with `height="*"` (fill the leftover space) and `overflowY="auto"` (cap its own
scroll). No `dock`, identical behaviour — this is what most existing code uses:

```xmlui-pg copy display name="Same toolbar, bounded-VStack spelling" height="360px"
---app display
<App
  scrollWholePage="false"
  var.query=""
  var.lines="{Array.from({ length: 40 }).map((_, i) => 'Matching line ' + (i + 1))}">
  <VStack height="300px" gap="0" borderWidth="1px" borderColor="$color-surface-200">
    <HStack
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
      <Text
        variant="secondary"
        value="{lines.filter(l => query === '' || l.toLowerCase().includes(query.toLowerCase())).length + ' / ' + lines.length}" />
    </HStack>
    <VStack height="*" overflowY="auto" padding="$space-3" gap="$space-2">
      <Items data="{lines.filter(l => query === '' || l.toLowerCase().includes(query.toLowerCase()))}">
        <Text value="{$item}" />
      </Items>
    </VStack>
  </VStack>
</App>
```

Same result: the body caps its scroll, the toolbar is its sibling, nothing
drifts. `dock="stretch"` and `height="*"` + `overflowY="auto"` are two ways to
say "fill the leftover height and own the scroll there."

Match-to-match *navigation and highlighting* — jumping between hits, drawing a
`<mark>` on the matched text inside rendered content — is a separate concern
from this layout; see the note under "Do not reach for `StickyBox`" and the
Markdown highlight how-to. This example keeps the toolbar honest with live
filtering, which is enough to prove the layout.

## Key points

**Use a scroller that caps, not one that defers.** The body must own its scroll.
A `ScrollViewer` and a bounded `VStack` with `overflowY="auto"` both *cap* — the
scroll stops at the region. A virtua `List` with no firm height does the
opposite: it *defers*, handing its scroll to the nearest scrolling ancestor
(`hasOutsideScroll`), so the toolbar rides that outer scroll and drifts. If your
body is a `List`, give it a firm height (or move the toolbar outside the `List`'s
own scroll) — the point is a local, capping scroll, whichever component provides
it.

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
bounded body, a capping scroller is self-contained: its correctness depends only
on this region and its two children, not on what encloses them. Reserve
`StickyBox` for a persistent app-level bar (a "Save changes" action row that
stays visible over the whole page) and use a capping scroller for everything
bounded.

---

**See also**
- [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout) — the whole-page header/footer + single scrolling body case
- [Dock elements to panel edges](/docs/howto/dock-elements-to-panel-edges) — `dock="top"` / `dock="stretch"` / `dock="bottom"` layout reference
- [ScrollViewer component](/docs/reference/components/ScrollViewer) — the bounded scroll container
- [StickyBox component](/docs/reference/components/StickyBox) — when a runtime-pinned, app-level bar is actually what you want
- [Stack component](/docs/reference/components/Stack) — `dock` prop and DockPanel layout
