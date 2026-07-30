# Pin sticky content below the AppHeader

In a `*-sticky` App layout, the `AppHeader` is itself `position: sticky; top: 0`
inside the layout's scroll container. A `StickySection` (or `StickyBox`) at the
top of your content pins at the **same** `top: 0` — directly *behind* the opaque
header. It really is stuck — at the top of the scrollport, exactly where a
`top: 0` sticky element belongs — just hidden behind the header. The fix is to
pin it a header's-height lower.

## Pin below the header with `top`

Set `top="$height-AppHeader"` on the `StickySection`. Scroll the body: the toolbar
pins just under the header rather than behind it.

```xmlui-pg copy display name="StickySection pinned below the AppHeader" height="400px"
<App layout="vertical-sticky">
  <AppHeader>
    <Heading level="h4" value="My App" />
  </AppHeader>
  <StickySection stickTo="top" top="$height-AppHeader" backgroundColor="$backgroundColor" paddingVertical="$space-2">
    <Heading level="h5" value="Toolbar — pins below the header" />
  </StickySection>
  <VStack padding="$space-3" gap="$space-2">
    <Items data="{Array.from({ length: 40 }).map((_, i) => 'Scroll line ' + (i + 1))}">
      <Text value="{$item}" />
    </Items>
  </VStack>
</App>
```

`$height-AppHeader` is the theme variable the AppHeader's height is set from
(default `$space-14`); the framework already aligns siblings like the nav panel
to it, so it is correct from the first paint — no measuring, no load-time race.

## StickyBox can't be offset the same way

The offset works because `StickySection` uses plain CSS `position: sticky` — its
`top: 0` is a *class* rule, so your `top` prop (in the higher-priority `dynamic`
layer) overrides it. `StickyBox` is a different mechanism: it's built on
`react-sticky-el`, which positions the pinned element with an **inline** `top: 0`,
and an inline style beats any class. So the same markup with `StickyBox` and the
same offset pins the toolbar *behind* the header — scroll and watch it slide up and
disappear:

```xmlui-pg copy display name="StickyBox ignores the offset — occluded on scroll" height="400px"
<App layout="vertical-sticky">
  <AppHeader>
    <Heading level="h4" value="My App" />
  </AppHeader>
  <StickyBox to="top" top="$height-AppHeader" backgroundColor="$backgroundColor" paddingVertical="$space-2">
    <Heading level="h5" value="Toolbar (StickyBox) — hides behind the header" />
  </StickyBox>
  <VStack padding="$space-3" gap="$space-2">
    <Items data="{Array.from({ length: 40 }).map((_, i) => 'Scroll line ' + (i + 1))}">
      <Text value="{$item}" />
    </Items>
  </VStack>
</App>
```

Use `StickySection` for this pattern.

## Key points

**Without the offset, the collision is invisible.** Drop `top` and the section
still sticks — at `top: 0`, exactly under the header. Nothing appears broken in
the markup, and the stuck element is fully occluded, so it reads as "sticky
doesn't work." If a top-of-content sticky element seems to vanish on scroll under
a sticky AppHeader, this is why.

**`top` wins because of CSS layer order.** `top` is a universal layout prop; its
rule is emitted into XMLUI's `dynamic` CSS layer, which outranks the component's
built-in `top: 0` (a `components`-layer style). The layer order is
`reset, base, components, themes, dynamic`, so a `top` you set always beats the
default.

**Give the section a `backgroundColor`.** Without one, content scrolling beneath
shows through the pinned section. `backgroundColor="$backgroundColor"` matches the
app background.

**`StickyBox` can't be offset this way.** `StickyBox` is built on `react-sticky-el`,
which writes an inline `top: 0px` — an inline style no class-based prop can
override. For pinning below the AppHeader, use `StickySection`.

**Which to use — default to `StickySection`.** `StickySection` is CSS
`position: sticky`: local, offsettable, lightweight, and it *stacks* (when several
share a direction, only the nearest to the scroll position stays). Reach for
`StickyBox` only for whole-page, app-level chrome — or when an ancestor's
`overflow`/`transform` structurally breaks CSS sticky — accepting that it is
non-local, non-offsettable, and StrictMode-fragile. For a toolbar over a *bounded
or nested* region, use neither: see [Pin a toolbar above a bounded scroll region](/docs/howto/pin-a-toolbar-above-a-bounded-scroll-region)
(the `dock` pattern).

---

## See also

- [Make a sticky header in a scroll area](/docs/howto/make-a-sticky-header-in-a-scroll-area) — `StickySection` stacking within a bounded scroll region
- [Pin a toolbar above a bounded scroll region](/docs/howto/pin-a-toolbar-above-a-bounded-scroll-region) — the `dock` pattern for a toolbar over a nested scroller
- [StickyBox component](/docs/reference/components/StickyBox) — when a runtime-pinned, app-level bar is what you want (and its constraints)
