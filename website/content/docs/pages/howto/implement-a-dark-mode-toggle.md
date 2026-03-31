# Implement a dark-mode toggle

Add ToneSwitch or ToneChangerButton, persist the choice with persistTheme, and handle tone-aware images.

Users expect to switch between light and dark modes. XMLUI provides `ToneSwitch` — a drop-in toggle that flips the active tone — and `App` properties to remember the choice across visits.

```xmlui-pg copy display name="Dark-mode toggle with ToneSwitch"
---app display
<App defaultTone="light" autoDetectTone="{true}">
  <AppHeader>
    <SpaceFiller />
    <ToneSwitch iconLight="sun" iconDark="moon" />
  </AppHeader>
  <VStack>
    <Card title="Dashboard" subtitle="Your analytics at a glance">
      <ProgressBar value="0.72" />
      <HStack>
        <Badge value="Active" />
        <Text variant="secondary">Last updated: today</Text>
      </HStack>
    </Card>
    <HStack>
      <Button label="Primary action" variant="solid" themeColor="primary" />
      <Button label="Secondary" variant="outlined" themeColor="secondary" />
      <Button label="Danger" variant="solid" themeColor="attention" />
    </HStack>
  </VStack>
</App>
```

## Key points

**`<ToneSwitch />`**: A ready-made [ToneSwitch](/docs/reference/components/ToneSwitch) control that toggles the active tone between `"light"` and `"dark"`. Place it anywhere — typically in the `<AppHeader>` — and it works immediately with no wiring:

```xmlui
<AppHeader>
  <SpaceFiller />
  <ToneSwitch />
</AppHeader>
```

**`iconLight` / `iconDark`**: Customize the icons displayed for each state. Defaults are `"sun"` and `"moon"`:

```xmlui
<ToneSwitch iconLight="sun" iconDark="moon" />
```

**`defaultTone` on [`<App>`](/docs/reference/components/App)**: Sets the initial tone before any user interaction. Accepts `"light"` or `"dark"`:

```xmlui
<App defaultTone="dark">
```

**`autoDetectTone`**: When set to `true`, the app follows the operating system's `prefers-color-scheme` setting on first load. Once the user clicks `ToneSwitch`, their explicit choice takes precedence:

```xmlui
<App autoDetectTone="{true}">
```

**Scoped dark sections with `<Theme tone="dark">`**: If you need a permanently dark region (for example a sidebar) without affecting the rest of the page, wrap that section in a `<Theme>` with an explicit `tone` attribute:

```xmlui
<Theme tone="dark">
  <VStack backgroundColor="$backgroundColor-primary">
    <Text>This section is always dark</Text>
  </VStack>
</Theme>
```

---

**See also**
- [ToneSwitch component](/docs/reference/components/ToneSwitch) — full API including `iconLight` and `iconDark`
- [App component](/docs/reference/components/App) — `defaultTone`, `autoDetectTone`, and `persistTheme`
- [Theme component](/docs/reference/components/Theme) — `tone` attribute for local dark/light sections
