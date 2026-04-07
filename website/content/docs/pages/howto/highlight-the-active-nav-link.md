# Highlight the active nav link

Use `NavLink` to automatically indicate which route the user is on with zero manual state management.

`NavLink` compares its `to` prop against the current URL and applies an active visual indicator when they match. By default it uses prefix matching — `/settings` matches both `/settings` and `/settings/profile`. Add the `exact` attribute when you need the indicator to show only for an exact path match.

```xmlui-pg copy display name="NavLinks with active indicators" height="350px"
---app display
<App scrollWholePage="false">
  <NavPanel>
    <NavLink icon="home" label="Home" to="/" exact />
    <NavLink icon="folder" label="Projects" to="/projects" />
    <NavLink icon="users" label="Team" to="/team" />
    <NavLink icon="settings" label="Settings" to="/settings" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <VStack>
        <H3>Home</H3>
        <Text>
          The Home link uses exact matching — 
          it does not stay active when you navigate to /projects.
        </Text>
      </VStack>
    </Page>
    <Page url="/projects/*">
      <VStack>
        <H3>Projects</H3>
        <Text>
          Navigate deeper to see prefix matching in action.
        </Text>
        <Link to="/projects/alpha" label="Project Alpha" />
      </VStack>
    </Page>
    <Page url="/projects/:slug">
      <VStack>
        <H3>Project: {$routeParams.slug}</H3>
        <Text>
          The Projects nav link stays active because 
          /projects/:slug starts with /projects.
        </Text>
      </VStack>
    </Page>
    <Page url="/team">
      <VStack>
        <H3>Team</H3>
        <Text>Team roster.</Text>
      </VStack>
    </Page>
    <Page url="/settings">
      <VStack>
        <H3>Settings</H3>
        <Text>App settings.</Text>
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**`NavLink` activates automatically by comparing `to` with the current URL**: No `active` binding or manual route check is needed for the common case. The component reads the URL internally and toggles the visual indicator on its own.

**Prefix matching is the default**: A `NavLink` with `to="/projects"` stays active for `/projects`, `/projects/alpha`, and `/projects/alpha/tasks`. This is the expected behaviour for top-level section links in a sidebar.

**`exact` restricts to an exact path match**: The Home link (`to="/"`) should use `exact` — otherwise it matches every route because every path starts with `/`. Add `exact` whenever the link's `to` is a prefix of other routes.

**`noIndicator` hides the active marker while keeping the route logic**: Set `noIndicator` on a `NavLink` when you want route awareness (for `onClick` guards, conditional styling) but do not want the visible bar or underline.

**`displayActive="{false}"` disables active indication entirely**: Unlike `noIndicator` (which hides the visual indicator but preserves internal active state), `displayActive="{false}"` tells the component to ignore active state altogether — it never highlights, even on a matching route.

---

## See also

- [Collapse the nav panel on mobile](/docs/howto/collapse-the-nav-panel-on-mobile) — hide the nav panel on small screens and toggle it with a button
- [Build nested page routes](/docs/howto/build-nested-page-routes) — add sub-navigation links that highlight within a nested route
- [Add breadcrumb navigation](/docs/howto/add-breadcrumb-navigation) — provide a secondary active-route indicator alongside the sidebar
