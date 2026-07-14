# Fill the viewport with one internal scroll region

By default an `App` grows with its content and the **whole page** scrolls. For
an app-like layout — a fixed header and/or footer with a single scrolling body
that fills the remaining height — you want the *body* to scroll, not the page.

Two pieces do it:

- `scrollWholePage="false"` on the `App` — the page no longer scrolls as a
  whole.
- `height="*"` on the child that should fill the leftover space — it takes all
  the height not used by the header/footer and scrolls **within itself**.

```xmlui-pg copy display name="Fixed header + footer, scrolling body" height="380px"
<App layout="vertical-sticky" scrollWholePage="false">
  <AppHeader>
    <Heading level="h4" value="Full-height layout" />
  </AppHeader>
  <List
    height="*"
    data="{Array.from({ length: 60 }).map((_, i) => ({ id: i, text: 'Row ' + i }))}">
    <property name="itemTemplate">
      <Card paddingVertical="$space-2">
        <Text value="{$item.text}" />
      </Card>
    </property>
  </List>
  <Footer>
    <Text value="The header and footer stay put; only the list scrolls." />
  </Footer>
</App>
```

The `height="*"` child becomes the **sole scroller**, so the page never grows
and the header/footer never scroll away.

**If the scrolling body isn't a `List`** (arbitrary content, a form, a diff),
wrap it in a bounded region so it — not the page — scrolls:

```xmlui /height="*"/ /overflowY="auto"/
<VStack height="*" overflowY="auto">
  <!-- long content -->
</VStack>
```

**Remove the default page padding** (so content sits flush under the header)
by overriding the `paddingVertical-Pages` theme variable for the content:

```xmlui /paddingVertical-Pages/
<Theme paddingVertical-Pages="0">
  <Pages> ... </Pages>
</Theme>
```

**Notes:**

- The `height="*"` "fill the remaining space" behavior flows through the
  layout, so a `List` (or a `height="*"` wrapper) inside a `Page` fills the
  viewport under a sticky `AppHeader`/`Footer`.
- Keep to **one** scroller in the region. Nesting a scrolling child inside a
  scrolling parent produces the classic double-scrollbar: pick the single
  element that should scroll and give it `height="*"` (or a bounded
  `maxHeight`), and let everything above/below it be fixed.
- Pair this with [Keep a list scrolled to the newest
  item](/docs/howto/follow-a-list-to-the-bottom) for a chat/log that fills the
  viewport and follows the bottom.
