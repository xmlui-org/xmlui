# Limit content width on large screens

Wrap content in a Stack with maxWidth and center it so text stays readable on ultrawide monitors.

A documentation page looks uncomfortably wide on ultrawide monitors — paragraph lines span the full browser width. Cap the readable column at 720 px and centre it so text stays comfortable on any screen without adding breakpoint logic.

```xmlui-pg copy display name="maxWidth centred reading column"
---app display
<App>
  <CVStack>
    <VStack maxWidth="480px">
      <H2>Project Architecture</H2>
      <Text variant="secondary">Updated March 2025</Text>
      <Text>
        The system is divided into three layers: presentation, business logic,
        and data access. Each layer communicates only with the layer immediately
        below it through well-defined interfaces.
      </Text>
      <Text>
        All external API calls are routed through a central gateway that handles
        authentication, rate-limiting, and request logging before forwarding
        requests to the appropriate service.
      </Text>
    </VStack>
  </CVStack>
</App>
```

## Key points

**`maxWidth` + `width="100%"`**: The element fills available width up to the cap and automatically shrinks on narrower viewports — no separate mobile override needed:

```xmlui
<VStack maxWidth="480px">
  <!-- comfortable on desktop, full-width on mobile -->
</VStack>
```

**Centering the constrained column**: Wrap in `CVStack` or `CHStack`, or set `marginHorizontal="auto"` directly on the element. Both centre it within a full-width parent:

```xmlui
<!-- option A: CHStack wrapper -->
<CHStack>
  <VStack maxWidth="480px">…</VStack>
</CHStack>

<!-- option B: auto margin -->
<VStack maxWidth="480px" marginHorizontal="auto">…</VStack>
```

**`paddingHorizontal` inside the block**: Adds gutters between the content and the `maxWidth` boundary so text does not sit flush against the edge on wide screens:

```xmlui
<VStack maxWidth="720px" width="100%" paddingHorizontal="$space-4">
  <Text>Content with breathing room on the sides</Text>
</VStack>
```

**`App layout="desktop"` removes built-in max-width constraints**: The desktop layout template is edge-to-edge by design. If you need a reading column inside a desktop-layout app, add your own `maxWidth` wrapper around the content area — the template will not add one for you.

**Desktop-only cap with `maxWidth-lg`**: Apply the constraint only up to large breakpoints so the layout stays full-width on mobile:

```xmlui
<VStack maxWidth-lg="480px" marginHorizontal-lg="auto">
  <!-- full width on mobile, capped and centred on desktop -->
</VStack>
```

---

**See also**
- [Stack component](/docs/reference/components/Stack) — `maxWidth`, `marginHorizontal`, and alignment props
- [CVStack component](/docs/reference/components/CVStack) — centering wrapper
- [Layout Properties](/docs/styles-and-themes/layout-props) — `maxWidth` and responsive breakpoint suffixes
- [App component](/docs/reference/components/App) — `layout="desktop"` and max-width behaviour
