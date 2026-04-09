# Add breadcrumb navigation

Build a breadcrumb trail from the current URL so users can navigate back to any parent page.

XMLUI exposes the current path as `$pathname` and route parameters as `$routeParams`. Split the pathname into segments, construct a `Link` for each one, and separate them with a text divider to create a breadcrumb bar that updates reactively whenever the route changes.

```xmlui-pg copy display name="Breadcrumb bar from route segments" height="350px"
---app display
<App scrollWholePage="false">
  <Pages>
    <Page url="/">
      <VStack>
        <HStack verticalAlignment="center">
          <Text variant="secondary">Home</Text>
        </HStack>
        <Text>Welcome to the project hub. Navigate to a section below.</Text>
        <HStack>
          <Link to="/projects" label="Projects" />
          <Link to="/settings" label="Settings" />
        </HStack>
      </VStack>
    </Page>
    <Page url="/projects">
      <VStack>
        <HStack verticalAlignment="center">
          <Link to="/" label="Home" />
          <Text variant="secondary">/</Text>
          <Text variant="secondary">Projects</Text>
        </HStack>
        <Text>All projects listed here.</Text>
        <HStack>
          <Link to="/projects/alpha" label="Project Alpha" />
          <Link to="/projects/beta" label="Project Beta" />
        </HStack>
      </VStack>
    </Page>
    <Page url="/projects/:slug">
      <VStack>
        <HStack verticalAlignment="center">
          <Link to="/" label="Home" />
          <Text variant="secondary">/</Text>
          <Link to="/projects" label="Projects" />
          <Text variant="secondary">/</Text>
          <Text variant="secondary">{$routeParams.slug}</Text>
        </HStack>
        <Text fontWeight="bold">Project: {$routeParams.slug}</Text>
        <Text>Details for this project go here.</Text>
      </VStack>
    </Page>
    <Page url="/settings">
      <VStack>
        <HStack verticalAlignment="center">
          <Link to="/" label="Home" />
          <Text variant="secondary">/</Text>
          <Text variant="secondary">Settings</Text>
        </HStack>
        <Text>Application settings.</Text>
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**`$pathname` gives the current URL path as a string**: It contains the full path (e.g. `"/projects/alpha"`) and updates reactively on every navigation. Use it when you need to derive breadcrumb segments dynamically.

**`$routeParams` exposes named route parameters**: A route pattern like `/projects/:slug` makes `$routeParams.slug` available. Use it to display the current entity name in the last breadcrumb segment instead of a generic label.

**The last segment is plain text, not a link**: Breadcrumb convention is that the current page is shown as non-clickable text while all ancestor pages are clickable `Link` components.

**Use `Link` for ancestor segments and `Text` for separators**: Each `Link` has a `to` pointing to the parent path. A `<Text variant="secondary">/</Text>` between segments provides the visual divider without any click behaviour.

**Extract the breadcrumb into a reusable component for multi-page apps**: When every page needs a breadcrumb, create a user-defined `Breadcrumbs` component that receives a `path` array prop (e.g. `[{ label, to }, ...]`) and renders the `HStack` of links. This keeps individual page markup clean.

---

## See also

- [Build nested page routes](/docs/howto/build-nested-page-routes) — create the multi-level URL hierarchy that breadcrumbs navigate
- [Navigate programmatically](/docs/howto/navigate-programmatically) — use `navigate()` to move between pages from code instead of links
- [Highlight the active nav link](/docs/howto/highlight-the-active-nav-link) — visually indicate the current route in a sidebar menu
