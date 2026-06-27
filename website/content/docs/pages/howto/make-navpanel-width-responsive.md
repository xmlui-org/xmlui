# Make NavPanel width responsive

Use `width-navPanel-App` and `mediaSize.sizeIndex` to shrink the nav panel on small screens and collapse labels to icon-only links.

On narrow viewports there is not enough room for a full-width nav panel with text labels. By reading `mediaSize.sizeIndex` you can switch the panel width and strip the labels at the same breakpoints — no CSS media queries, no JavaScript observers.

The responsive effect only becomes visible when you can resize the browser window. Click **Open in Playground** (the external-link icon on the code panel) to open the example in the full playground, then drag the browser window narrower and wider to watch the panel shrink and the labels disappear.

```xmlui-pg copy display name="Shrink the window to see the NavPanel respond" height="300px"
---app display
<Theme width-navPanel-App="{mediaSize.sizeIndex <= 1 ? '6rem' : '18rem'}" >
  <App
    layout="vertical">
    <NavPanel>
      <NavLink
        label="{mediaSize.sizeIndex <= 1 ? null : 'Home'}"
        to="/"
        icon="home"
        tooltip="Home" />
      <NavLink
        label="{mediaSize.sizeIndex <= 1 ? null : 'Compose'}"
        to="/compose"
        icon="plus"
        tooltip="Compose" />
      <NavLink
        label="{mediaSize.sizeIndex <= 1 ? null : 'Notifications'}"
        to="/notifications"
        icon="info"
        tooltip="Notifications" />
    </NavPanel>
    <Pages>
      <Page url="/">
        Home
      </Page>
      <Page url="/notifications">
        Notifications
      </Page>
      <Page url="/compose">
        Compose
      </Page>
    </Pages>
  </App>
</Theme>
---desc
Open this example in the full playground, then resize the browser window.
At desktop width (`sizeIndex >= 2`) the nav panel is `18rem` wide and shows labelled links.
Narrow the window below the landscape-phone breakpoint (`sizeIndex <= 1`) and the panel shrinks to `6rem`, labels disappear, and only the icons remain — with tooltips still visible on hover.
```

## Key points

**`mediaSize.sizeIndex` is a numeric breakpoint index**: The global `mediaSize` object exposes a `sizeIndex` integer that maps the current viewport width to a tier:

| `sizeIndex` | `size` | Breakpoint |
|-------------|--------|------------|
| `0` | `xs` | Phone (portrait) |
| `1` | `sm` | Landscape phone |
| `2` | `md` | Tablet |
| `3` | `lg` | Desktop |
| `4` | `xl` | Large desktop |
| `5` | `xxl` | Extra-large desktop |

Comparing against a number is more concise than chaining boolean flags like `mediaSize.phone || mediaSize.landscapePhone`.

**`<= 1` targets phone and landscape-phone screens**: Index 0 is portrait phone, index 1 is landscape phone. Using `<= 1` collapses the panel on both orientations and shows the full panel from tablet (`2`) upward. Adjust the threshold to suit your design — use `<= 2` to also collapse on tablets.

**`width-navPanel-App` is a theme variable on `App`**: Wrap `App` in a `Theme` and set `width-navPanel-App` to a reactive expression. Because the expression references `mediaSize.sizeIndex`, it re-evaluates automatically whenever the viewport is resized — no event handler needed.

**Strip labels by returning `null`**: Setting `label="{null}"` on a `NavLink` removes the label entirely while keeping the icon and `tooltip`. The tooltip remains visible on hover, so icon-only links stay accessible.

**`tooltip` keeps icon-only links discoverable**: When labels are hidden, always provide a `tooltip` on each `NavLink`. The tooltip appears on hover and gives screen readers a fallback description of the link target.

---

## See also

- [Collapse the nav panel on mobile](/docs/howto/collapse-the-nav-panel-on-mobile) — fully hide the nav panel behind a toggle button on small screens
- [Make NavPanel width responsive](/docs/globals#mediasize) — `mediaSize` global reference
- [Show a slide-in settings drawer](/docs/howto/show-a-slide-in-settings-drawer) — an alternative slide-in navigation pattern

