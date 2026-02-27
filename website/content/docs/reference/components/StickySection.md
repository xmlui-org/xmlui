# StickySection [#stickysection]

`StickySection` is a container that keeps itself visible at the edge of the scrollable area while the user scrolls. When multiple `StickySection` components share the same `stickTo` direction and would all have scrolled out of view, only the last one (the one closest to the current scroll position) remains visible — earlier ones are hidden beneath it. This makes `StickySection` ideal for implementing scrollable content with persistent section headers or footers.

`StickySection` is a container that keeps itself visible at the edge of the scrollable area while the user scrolls. When multiple `StickySection` components share the same `stickTo` direction and would all have scrolled out of view, only the last one (the one closest to the current scroll position) remains visible — earlier ones are hidden beneath it. This makes `StickySection` ideal for implementing scrollable content with persistent section headers or footers.

**Key features:**
- **Sticky Positioning**: Keeps content visible at the top or bottom of a scrollable area.
- **Stacking Behavior**: Automatically manages multiple sticky sections, showing only the most relevant one.
- **Easy Integration**: Works inside any scrollable container, like `ScrollViewer`.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `stickTo` [#stickto]

> [!DEF]  default: **"top"**

Determines the edge of the visible area the section sticks to while scrolling. Use `"top"` to keep the section anchored to the top of the scrollable area and `"bottom"` to keep it anchored to the bottom.

Available values: `top` **(default)**, `bottom`

The `stickTo` property determines which edge the section sticks to.

**Sticking to the Top:**

Use `stickTo="top"` to create sticky headers.

```xmlui-pg copy display /stickTo="top"/ name="StickySection at the Top" height="400px"
<App scrollWholePage="false">
  <ScrollViewer backgroundColor="lightyellow" showScrollerFade="false">
    <Items data="{[1,2,3,4,5]}">
      <StickySection stickTo="top" backgroundColor="lightgreen">
        <H2>Item #{$item}</H2>
      </StickySection>
      <Items data="{[1,2,3,4,5]}">
        <Stack
          height="30px"
          backgroundColor="lightyellow"
        >
          <H4>
            Nested #{$item}
          </H4>
        </Stack>
      </Items>
    </Items>
  </ScrollViewer>
</App>
```

**Sticking to the Bottom:**

Use `stickTo="bottom"` to create sticky footers.

```xmlui-pg copy display /stickTo="bottom"/ name="StickySection at the Bottom" height="400px"
<App scrollWholePage="false">
  <ScrollViewer backgroundColor="lightyellow" showScrollerFade="false">
    <Items data="{[1,2,3,4,5]}">
      <StickySection stickTo="bottom" backgroundColor="lightgreen">
        <H2>Item #{$item}</H2>
      </StickySection>
      <Items data="{[1,2,3,4,5]}">
        <Stack
          height="30px"
          backgroundColor="lightyellow"
        >
          <H4>
            Nested #{$item}
          </H4>
        </Stack>
      </Items>
    </Items>
  </ScrollViewer>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| zIndex-StickySection | 1 | 1 |
