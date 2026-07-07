# Add breadcrumb navigation

Define a reusable `Breadcrumbs` component and drop a `<Breadcrumbs ancestors="..." current="..." />` on every page so users can navigate back to any parent page.

XMLUI has no built-in breadcrumb — you compose one from `Link` and `Text`. Rather than copy-paste that pattern onto every page, factor it into a user-defined component that takes two props: `ancestors` (an array of clickable steps, each with a `label` and a `to`) and `current` (the label of the page you're on). Each page then names the construct in markup with `<Breadcrumbs ancestors="{[...]}" current="..." />`. For dynamic route segments, pass `$routeParams.slug` (or whatever the segment is called) as the `current` value — no hard-coded label needed.

```xmlui-pg copy display name="Breadcrumb bar from route segments" height="350px"
---comp display
<Component name="Breadcrumbs">
  <HStack verticalAlignment="center">
    <Items data="{$props.ancestors}">
      <Link to="{$item.to}" label="{$item.label}" />
      <Text variant="secondary">/</Text>
    </Items>
    <Text variant="secondary">{$props.current}</Text>
  </HStack>
</Component>
---app display
<App scrollWholePage="false">
  <Pages>
    <Page url="/">
      <VStack>
        <Breadcrumbs ancestors="{[]}" current="Home" />
        <Text>Welcome to the project hub. Navigate to a section below.</Text>
        <HStack>
          <Link to="/projects" label="Projects" />
          <Link to="/settings" label="Settings" />
        </HStack>
      </VStack>
    </Page>
    <Page url="/projects">
      <VStack>
        <Breadcrumbs
          ancestors="{[{ label: 'Home', to: '/' }]}"
          current="Projects" />
        <Text>All projects listed here.</Text>
        <HStack>
          <Link to="/projects/alpha" label="Project Alpha" />
          <Link to="/projects/beta" label="Project Beta" />
        </HStack>
      </VStack>
    </Page>
    <Page url="/projects/:slug">
      <VStack>
        <Breadcrumbs
          ancestors="{[
            { label: 'Home', to: '/' },
            { label: 'Projects', to: '/projects' }
          ]}"
          current="{$routeParams.slug}" />
        <Text fontWeight="bold">Project: {$routeParams.slug}</Text>
        <Text>Details for this project go here.</Text>
      </VStack>
    </Page>
    <Page url="/settings">
      <VStack>
        <Breadcrumbs
          ancestors="{[{ label: 'Home', to: '/' }]}"
          current="Settings" />
        <Text>Application settings.</Text>
      </VStack>
    </Page>
  </Pages>
</App>
```

## Key points

**Define `Breadcrumbs` once, use it everywhere**: A user-defined `<Component name="Breadcrumbs">` accepts `ancestors` and `current` and renders the trail. Each page emits `<Breadcrumbs ancestors="{[...]}" current="..." />`, naming the construct in markup so a reader can see at a glance where the breadcrumb is. Page bodies stay focused on page-specific content.

**Two props split clickable from current**: `ancestors` is the list of pages above the current one — each entry has a `label` and a `to`. `current` is the label of the page itself, rendered as plain non-clickable text after the loop. The split removes the need for any `when=` conditionals inside the component.

**Items renders Link + separator, then `current` follows**: Each iteration of `<Items data="{$props.ancestors}">` renders a `Link` and a `/` separator. After the loop, a single `<Text variant="secondary">{$props.current}</Text>` renders the current page. On the home page, `ancestors` is empty so `Items` produces nothing and only the current label appears — no extra logic needed.

**`$routeParams` fills in dynamic segments**: A route pattern like `/projects/:slug` makes `$routeParams.slug` available. Pass `current="{$routeParams.slug}"` so the breadcrumb shows the matched value (e.g. `alpha`) instead of a generic placeholder.

---

## See also

- [Build nested page routes](/docs/howto/build-nested-page-routes) — create the multi-level URL hierarchy that breadcrumbs navigate
- [Navigate programmatically](/docs/howto/navigate-programmatically) — use `navigate()` to move between pages from code instead of links
- [Highlight the active nav link](/docs/howto/highlight-the-active-nav-link) — visually indicate the current route in a sidebar menu
