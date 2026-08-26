%-DESC-START

**When to use.** `StickyBox` fits app- and page-level chrome whose scroll
container is the page itself — a persistent navigation bar, or a "Save changes"
bar pinned to the bottom of the viewport.

For a header or toolbar that stays visible over a **bounded or nested** scroll
region (an expander, a card, a dialog body), use the `dock` layout pattern
instead — see
[Pin a toolbar above a bounded scroll region](/docs/howto/pin-a-toolbar-above-a-bounded-scroll-region).
`StickyBox` discovers its scroll container at runtime and writes a
document-global scroll offset, so its effect is non-local and it does not
compose reliably inside a nested scroll area.

> [!NOTE]
> `StickyBox` is built on
> [`react-sticky-el`](https://github.com/gm0t/react-sticky-el), which has a
> known defect under React `StrictMode`
> ([react-sticky-el #82](https://github.com/gm0t/react-sticky-el/issues/82)).

%-DESC-END

%-PROP-START to

```xmlui-pg copy display name="Example: to" height="200px"
<App>
  <StickyBox to="top">
    This part of the UI sticks to the top
  </StickyBox>
  <Stack backgroundColor="red" height="80px" width="100%" />
  <Stack backgroundColor="green" height="80px" width="100%" />
  <Stack backgroundColor="blue" height="80px" width="100%" />
</App>
```

%-PROP-END
