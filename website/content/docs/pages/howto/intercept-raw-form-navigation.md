# Intercept raw form navigation

Enable external navigation interception when same-origin raw HTML forms should still pass through XMLUI routing guards.

XMLUI components such as `Link`, `NavLink`, and `Button onClick="navigate(...)"` already use the router. Raw same-origin GET forms are browser navigation by default, so opt in to interception when CMS content or embedded HTML should be defended too.

```xmlui-pg copy display name="Route a raw GET form through willNavigate" id="route-a-raw-get-form-through-willnavigate" height="380px"
---app display /\$pathname/ /lastCheck/
<App
  scrollWholePage="false"
  var.lastCheck="not checked"
  onWillNavigate="(to) => {
    lastCheck = 'checked ' + to;
  }">
  <Pages>
    <Page url="/">
      <VStack gap="$space-3">
        <Text variant="strong">Raw navigation</Text>
        <Text>Guard status: {lastCheck}</Text>

        <form action="/raw-report" method="get">
          <button type="submit">Submit raw form</button>
        </form>
      </VStack>
    </Page>

    <Page url="/raw-report">
      <VStack gap="$space-2">
        <Text variant="strong">Raw report</Text>
        <Text>Guard status: {lastCheck}</Text>
        <Text>The form submission went through XMLUI navigation.</Text>
        <Button label="Back home" onClick="navigate('/')" />
      </VStack>
    </Page>
  </Pages>
</App>
---config
{
  "xmluiConfig": {
    "interceptExternalNavigation": true
  }
}
```

## Key points

**Opt in with `interceptExternalNavigation`**: Put `"interceptExternalNavigation": true` under `xmluiConfig` when raw same-origin anchors or GET forms should route through XMLUI.

**Interception respects normal browser escape hatches**: Cross-origin destinations, modifier-key clicks, non-GET forms, downloads, non-`_self` targets, and `data-xmlui-bypass-router` are not intercepted.

**Use it for raw HTML boundaries**: Prefer XMLUI `Link`, `NavLink`, and `navigate()` in your own markup. Interception is for content you do not fully control, such as CMS fragments or embedded HTML.

**Guards see intercepted navigation**: The example's `willNavigate` handler records the raw form destination before XMLUI renders the target page.

---

## See also

- [Protect a page with a route guard](/docs/howto/protect-a-page-with-a-route-guard) — use page-level guards for protected routes
- [Navigate programmatically](/docs/howto/navigate-programmatically) — route from event handlers without raw HTML
- [Defended Routing](/docs/managed-react/defended-routing) — external navigation interception rules
