%-DESC-START

**Key features:**

- **Route coordination**: Automatically displays the correct Page based on current URL and navigation
- **Default route handling**: Sets the initial page shown when the application loads
- **Client-side routing**: Manages navigation without page refreshes or server requests

### Using the Pages and Page components

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

%-DESC-END

%-PROP-START fallbackPath

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

%-PROP-END

%-PROP-START restoreScrollOnBack

When enabled, navigating back via the browser's back button will restore the scroll position to where the user was before navigating away. This provides a better user experience when browsing through pages with long content.

```xmlui-pg copy display name="Example: restoreScrollOnBack" height="300px"
<App>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="Long Page" to="/long" icon="file"/>
  </NavPanel>
  <Pages restoreScrollOnBack="true">
    <Page url="/">
      <Text>Navigate to the long page, scroll down, then use the browser back button.</Text>
    </Page>
    <Page url="/long">
      <VStack>
        <Text>Scroll down and then use browser back button...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>...</Text>
        <Text>Bottom of page</Text>
      </VStack>
    </Page>
  </Pages>
</App>
```

%-PROP-END
