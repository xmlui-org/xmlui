# Deep-link to a tab or section

By default, `Tabs` is purely client-side state — refresh the page or share the URL and the recipient lands on the first tab. To make the active tab bookmarkable, two-way bind it to a `?tab=` query parameter: read `$queryParams.tab` on load to set `activeTab`, and call `navigate()` from `onDidChange` to write changes back when the user clicks a different tab. Either half alone is incomplete — read-only would let you land on the right tab but a click would silently desync the URL; write-only would update the URL but a refresh wouldn't restore the choice.

The example below shows the live URL above the tabs so you can watch the deep link update as you click. (The playground runs in an iframe, so the change won't appear in your browser's actual address bar — but in a real app it would.)

```xmlui-pg copy display name="Deep-linkable Tabs via query parameter" height="280px"
---app display /currentTab/ /\$queryParams/
<App var.currentTab="{Number($queryParams.tab ?? 0)}">
  <VStack gap="$space-2">
    <Text variant="caption">Current URL: ?tab={currentTab}</Text>
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
  </VStack>
</App>
```

## Key points

**`$queryParams` gives reactive access to the URL's query string**: `$queryParams.tab` reads the `tab` parameter; if absent it is `undefined`, so use `?? 0` to default to the first tab. The example coerces with `Number()` because query parameters are strings.

**Bind `activeTab` to a variable derived from the query**: `activeTab="{currentTab}"` with `var.currentTab="{Number($queryParams.tab ?? 0)}"` makes `Tabs` open the correct tab as soon as the page loads — no `onActivated` or `Timer` needed.

**Update the URL inside `onDidChange`**: Call `navigate($pathname, { queryParams: { tab: index }, replace: true })` to write the new tab index back. `replace: true` overwrites the current history entry instead of pushing a new one, so the browser's back button skips over tab clicks instead of stepping through every one.

**Prefer `setActiveTabById` for shareable links that survive reordering**: Index-based deep links like `?tab=1` break the moment someone reorders tabs — yesterday's "Members" link now opens Settings. For URLs you'll share publicly, give each `TabItem` an `id` and call `tabs.setActiveTabById($queryParams.tab)`. The example uses index for simplicity; production apps with stable shareable URLs should use string IDs.

---

## See also

- [Navigate programmatically](/docs/howto/navigate-programmatically) — use `navigate()` to update the URL without a `Link` click
- [Build nested page routes](/docs/howto/build-nested-page-routes) — use route-level pages instead of tabs for deeper URL hierarchies
- [Highlight the active nav link](/docs/howto/highlight-the-active-nav-link) — mark which sidebar link matches the current route
