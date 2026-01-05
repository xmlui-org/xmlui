# Pages [#pages]

`Pages` serves as the routing coordinator within an [App](/components/App), managing which [Page](/components/Page)  displays based on the current URL.

**Key features:**

- **Route coordination**: Automatically displays the correct Page based on current URL and navigation
- **Default route handling**: Sets the initial page shown when the application loads
- **Client-side routing**: Manages navigation without page refreshes or server requests

### Using the Pages and Page components [#using-the-pages-and-page-components]

The `Page` component has a property called `url`. This is the route associated with the `Page's` contents.
You can provide a link to this route to display a particular `Page`.
Currently, all navigation is done on the clientside.
No page is fetched from the server, thus the application operates as a [Single Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA).

```xmlui-pg copy {3-4, 7, 10} display name="Example: using Pages and Page" height="170px"
<App>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="Account" to="/account" icon="user"/>
  </NavPanel>
  <Pages>
    <Page url="/">
      <Text>Hello App!</Text>
    </Page>
    <Page url="/account">
      <Text>This is the account page.</Text>
    </Page>
  </Pages>
</App>
```

## Properties [#properties]

### `defaultScrollRestoration` (default: false) [#defaultscrollrestoration-default-false]

When set to true, the page scroll position is restored when navigating back via browser history.

### `fallbackPath` (default: "/") [#fallbackpath-default-]

The fallback path when the current URL does not match any of the paths of the pages.

```xmlui-pg copy {6-13} display name="Example: fallbackPath" height="170px"
<App>
  <NavPanel>
    <NavLink label="Not Home" to="/not-home" icon="trash"/>
    <NavLink label="Home" to="/home" icon="home"/>
  </NavPanel>
  <Pages fallbackPath="/home">
    <Page url="/not-home">
      <Text>This is not home...</Text>
    </Page>
    <Page url="/home">
      <Text>Hello App!</Text>
    </Page>
  </Pages>
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
| [gap](../styles-and-themes/common-units/#size)-Pages | $space-5 | $space-5 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Pages | $space-4 | $space-4 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Pages | $space-5 | $space-5 |
