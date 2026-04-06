# Deep-link to a tab or section

Read a query parameter on load to activate the correct tab so users can bookmark or share a direct link.

XMLUI makes `$queryParams` available as a reactive object. Bind the `activeTab` prop of `Tabs` to a query parameter value so that opening a URL like `?tab=1` immediately shows the second tab. When the user switches tabs manually, update the URL with `navigate()` to keep the address bar in sync.

```xmlui-pg copy display name="Deep-linkable Tabs via query parameter" height="240px"
---app display
<App var.currentTab="{Number($queryParams.tab ?? 0)}">
  <Tabs
    activeTab="{currentTab}"
    onDidChange="(index) => {
      currentTab = index;
      navigate($pathname, { queryParams: { tab: index }, replace: true })
    }"
  >
    <TabItem label="Overview">
      <VStack>
        <H4>Project Overview</H4>
        <Text>High-level summary of the project status and milestones.</Text>
      </VStack>
    </TabItem>
    <TabItem label="Members">
      <VStack>
        <H4>Team Members</H4>
        <Text>Alice, Bob, Carol, Dave — full team roster and roles.</Text>
      </VStack>
    </TabItem>
    <TabItem label="Settings">
      <VStack>
        <H4>Project Settings</H4>
        <Text>Notification preferences, access control, and integrations.</Text>
      </VStack>
    </TabItem>
  </Tabs>
</App>
```

## Key points

**`$queryParams` gives reactive access to the URL's query string**: The object is built from the current URL's search parameters. `$queryParams.tab` reads the `tab` parameter; if absent it is `undefined`, so use `?? 0` to default to the first tab.

**Bind `activeTab` to a variable derived from the query**: `activeTab="{currentTab}"` with `var.currentTab="{Number($queryParams.tab ?? 0)}"` makes the Tabs component open the correct tab as soon as the page loads — no `onActivated` or `Timer` needed.

**Update the URL when the user switches tabs**: Inside `onDidChange`, call `navigate($pathname, { queryParams: { tab: index }, replace: true })` to write the new tab index into the address bar. Using `replace: true` avoids polluting the browser's back-button history with every tab click.

**`$routeParams` works the same way for path-based deep links**: If your tab is part of the URL path (e.g. `/project/:section`), read `$routeParams.section` instead and map it to a tab index. This approach is better when each tab represents a distinct resource.

**`setActiveTabById(id)` gives named control over the active tab**: Instead of numeric indices, assign an `id` to each `TabItem` and call `tabs.setActiveTabById('settings')` from a `Link` click or a script block. This is more maintainable than index-based navigation when tabs are added or reordered.

---

## See also

- [Navigate programmatically](/docs/howto/navigate-programmatically) — use `navigate()` to update the URL without a `Link` click
- [Build nested page routes](/docs/howto/build-nested-page-routes) — use route-level pages instead of tabs for deeper URL hierarchies
- [Highlight the active nav link](/docs/howto/highlight-the-active-nav-link) — mark which sidebar link matches the current route
