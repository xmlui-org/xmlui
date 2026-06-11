# SkipLink [#skiplink]

`SkipLink` renders a keyboard-first link that jumps directly to the main content region. It stays visually hidden until focused.

Use `SkipLink` near the start of a page or app shell, before repeated
navigation. Keyboard users tab to it first, activate it, and move directly to
the page's main content region.

This helps people who navigate with a keyboard, switch device, or screen reader
avoid traversing the same header and navigation links on every route. The link
is visually hidden until it receives keyboard focus, so it does not add visual
noise for pointer users, but it remains the first useful escape hatch in the tab
order. When activated, it moves focus to a meaningful control or focusable
element in the active page.

To try the example, open it in the playground, switch the preview to full
screen, focus the page, and press `Tab`. The skip link appears only while
focused. Press `Enter` to move focus to the active page's first field. The
embedded documentation preview is too constrained for this example.

```xmlui-pg copy display height="420px" name="Example: skip repeated navigation"
---app display
<App layout="horizontal" scrollWholePage="false">
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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `label` [#label]

> [!DEF]  default: **"Skip to main content"**

The accessible text shown when the skip link receives focus.

### `target` [#target]

> [!DEF]  default: **"main"**

The DOM id, XMLUI component id, or test id of the element to focus and scroll to.

```xmlui-pg copy display height="260px" name="Example: custom target"
<App>
  <SkipLink target="report-export" label="Skip report filters" />

  <VStack>
    <HStack>
      <Button label="Filter" />
      <Button label="Export" />
    </HStack>

    <VStack padding="$space-4" gap="$space-3">
      <H2>Revenue report</H2>
      <Text>The report content starts here.</Text>
      <Button id="report-export" label="Export report" />
    </VStack>
  </VStack>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
