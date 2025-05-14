%-DESC-START

See the [\`Page\` docs](./Page.mdx) for a short description.

Examples for both components can be found here.

### Using the Pages and Page components

The `Page` component has a property called `url`. This is the route associated with the `Page's` contents.
You can provide a link to this route to display a particular `Page`.
Currently, all navigation is done on the clientside.
No page is fetched from the server, thus the application operates as a [Single Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA).

```xmlui-pg copy {3-4, 7, 10} display name="Example: using Pages and Page" height="150px"
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

%-PROP-START defaultRoute

```xmlui-pg copy {6-13} display name="Example: defaultRoute" height="150px"
<App>
  <NavPanel>
    <NavLink label="Not Home" to="/not-home" icon="trash"/>
    <NavLink label="Home" to="/home" icon="home"/>
  </NavPanel>
  <Pages defaultRoute="/home">
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
