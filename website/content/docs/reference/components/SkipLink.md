# SkipLink [#skiplink]

`SkipLink` renders a keyboard-first link that jumps directly to the main content region. It stays visually hidden until focused.

Use `SkipLink` near the start of a page or app shell, before repeated
navigation. Keyboard users tab to it first, activate it, and move directly to
the page's main content region.

To try the example, focus the preview and press `Tab`. The skip link appears
only while focused. Press `Enter` to move focus to the main content.

```xmlui-pg copy display height="320px" name="Example: skip repeated navigation"
<App>
  <SkipLink target="main" />
  <HStack height="260px">
    <NavPanel>
      <NavLink label="Dashboard" to="/" />
      <NavLink label="Orders" to="/orders" />
    </NavPanel>

    <main id="main" tabindex="-1">
      <VStack padding="$space-4">
        <H1>Orders</H1>
        <Text>Keyboard focus lands here when the skip link is activated.</Text>
      </VStack>
    </main>
  </HStack>
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

The id of the element to focus and scroll to.

```xmlui-pg copy display height="260px" name="Example: custom target"
<App>
  <SkipLink target="report-content" label="Skip report filters" />

  <VStack>
    <HStack>
      <Button label="Filter" />
      <Button label="Export" />
    </HStack>

    <main id="report-content" tabindex="-1">
      <H2>Revenue report</H2>
      <Text>The report content starts here.</Text>
    </main>
  </VStack>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
