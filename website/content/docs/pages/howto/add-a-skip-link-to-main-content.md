# Add a skip link to main content

Place `SkipLink` before repeated navigation so keyboard users can move directly to the page's main content.

Long app shells often put navigation before the content on every page. A sighted mouse user can ignore that repeated region, but a keyboard user would otherwise tab through it again and again. `SkipLink` stays visually hidden until it receives focus, then activates like a normal link and moves focus to the target content area.

The effect is easiest to see in a real browser-sized app. Open the example in the playground, switch the preview to full screen, focus the page, then press `Tab`. The skip link appears at the top of the viewport. Press `Enter` and focus moves past the navigation into the active page's first field. The embedded documentation preview is too constrained for this example.

```xmlui-pg copy display height="420px" name="Skip repeated navigation" id="skip-repeated-navigation"
---app display
<App layout="horizontal" scrollWholePage="false">
  <AppHeader>
    <property name="logoTemplate">
      <Text variant="strong">Ops Console</Text>
    </property>
  </AppHeader>

  <SkipLink
    target="{$pathname === '/orders' ? 'orders-search' : 'dashboard-filter'}"
    label="Skip to main content"
  />

  <NavPanel>
    <NavLink label="Dashboard" to="/" icon="home" />
    <NavLink label="Orders" to="/orders" icon="list" />
  </NavPanel>

  <Pages fallbackPath="/">
    <Page url="/">
      <VStack padding="$space-6" gap="$space-4">
        <H1>Dashboard</H1>
        <Text>Use the skip link to move past the navigation and land here.</Text>
        <TextBox
          id="dashboard-filter"
          label="Filter dashboard cards"
          placeholder="Try typing after skipping"
        />
      </VStack>
    </Page>

    <Page url="/orders">
      <VStack padding="$space-6" gap="$space-4">
        <H1>Orders</H1>
        <Text>On this route the same skip link lands on the orders search field.</Text>
        <TextBox
          id="orders-search"
          label="Search orders"
          placeholder="Order number or customer"
        />
        <HStack wrapContent>
          <Button label="Create order" />
          <Button label="Export orders" variant="outlined" />
        </HStack>
      </VStack>
    </Page>
  </Pages>
</App>
```

To try the route-aware target, click **Orders**, press `Tab` until the skip link is focused, then press `Enter`. Focus lands in **Search orders** instead of the dashboard field.

## Key points

**Put `SkipLink` near the start of the app shell**: Place it before `NavPanel` so it is the first keyboard stop before repeated navigation.

**Keep `NavPanel` and `Pages` as direct `App` children**: `NavPanel` is an app slot, not something to wrap in an `HStack`. `Pages` owns routed content, and each `Page` represents a separate route such as `/` or `/orders`.

**Point `target` at the active page's first useful focus target**: In a routed app, bind `target` to `$pathname` when different pages have different first fields. A `TextBox`, `Button`, or other naturally focusable control works without extra attributes.

**Use a generic label when the target changes by route**: `label="Skip to main content"` stays accurate on both Dashboard and Orders because the target expression follows the current route.

---

## See also

- [SkipLink component](/docs/reference/components/SkipLink) — properties and component examples
- [Customize Link focus & decoration](/docs/howto/customize-link-focus-and-decoration) — make keyboard focus indicators easier to see
- [Make NavPanel width responsive](/docs/howto/make-navpanel-width-responsive) — adapt repeated navigation to smaller screens
