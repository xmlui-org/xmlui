# Make NavPanel width responsive

You can use `width-navPanel-App` to control the width of `NavPanel` according to [mediaSize](/docs/globals#mediasize).

You can use the same `mediaSize` global variable to hide labels and show only icons.

```xmlui-pg name="Shrink the window to see the NavPanel respond"
---app display
<Theme width-navPanel-App="{mediaSize.sizeIndex <= 1 ? '4rem' : '10rem'}" >
  <App
    layout="vertical">
    <NavPanel>
      <NavLink
        label="{mediaSize.sizeIndex <= 1 ? '' : 'Home'}"
        to="/"
        icon="home"
        tooltip="Home" />
      <NavLink
        label="{mediaSize.sizeIndex <= 1 ? '' : 'Compose'}"
        to="/compose"
        icon="plus"
        tooltip="Compose" />
      <NavLink
        label="{mediaSize.sizeIndex <= 1 ? '' : 'Notifications'}"
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
```

