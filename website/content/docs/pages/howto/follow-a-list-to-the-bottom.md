# Keep a list scrolled to the newest item

For a chat, log, or activity feed, you want the list pinned to the **bottom**
so the newest item stays in view as data is appended. Set
`scrollAnchor="bottom"` on the `List` — no scroll handling required.

```xmlui-pg copy display name="A feed that follows the bottom" height="320px"
<App var.messages="{Array.from({ length: 8 }).map((_, i) => ({ id: i, text: 'Message ' + i }))}">
  <Timer
    interval="1200"
    onTick="messages = messages.length < 40
      ? [...messages, { id: messages.length, text: 'Message ' + messages.length }]
      : messages" />
  <List id="feed" scrollAnchor="bottom" height="220px" data="{messages}">
    <property name="itemTemplate">
      <Card paddingVertical="$space-2">
        <Text value="{$item.text}" />
      </Card>
    </property>
  </List>
</App>
```

The `Timer` appends a message roughly once a second; because the `List` is
anchored to the bottom, the newest message stays visible instead of the view
staying frozen at the top.

**Jump to the newest item on demand** with the `scrollToBottom()` method — for
a "scroll to latest" button, or to snap back after the user has scrolled up:

```xmlui /scrollToBottom/
<Button label="Jump to latest" onClick="feed.scrollToBottom()" />
```

`List` also exposes `scrollToTop()`, `scrollToIndex(n)`, and `scrollToId(id)`
for scrolling to a specific place — e.g. `feed.scrollToId('item-42')` to bring
one item into view.

**Notes:**

- `scrollAnchor="bottom"` is the declarative way to *stay* at the bottom;
  `scrollToBottom()` is the imperative way to *go* there once. Use the anchor
  for a feed that should always track the newest item; use the method for a
  one-shot jump.
- Give the `List` a bounded height (here `height="220px"`, or `height="*"`
  inside a full-height layout — see
  [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout))
  so it scrolls within itself rather than growing the page.
