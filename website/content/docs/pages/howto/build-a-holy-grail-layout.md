# Build a holy-grail layout

Use App layout modes, NavPanel, Footer, and content area to create header + sidebar + content + footer.

The "holy grail" is the classic web shell: a persistent header spanning the full width, a left sidebar for navigation, a scrollable main content column, and a footer docked to the bottom. `<App layout="horizontal">` wires all four areas together with a single prop — no manual flex layout required.

```xmlui-pg copy display name="Holy-grail layout" height="450px"
---app display
<App layout="horizontal" scrollWholePage="false">
  <AppHeader>
    <property name="logoTemplate">
      <Text variant="strong">Project Hub</Text>
    </property>
  </AppHeader>
  <NavPanel>
    <NavLink label="Overview" to="/" icon="home" />
    <NavLink label="Projects" to="/projects" icon="component" />
    <NavLink label="Reports" to="/reports" icon="charts" />
  </NavPanel>
  <Pages>
    <Page url="/">
      <VStack>
        <H3>Overview</H3>
        <HStack wrapContent>
          <Card title="Active Projects" width="*">
            <Text>12 in progress</Text>
          </Card>
          <Card title="Team Members" width="*">
            <Text>24 contributors</Text>
          </Card>
        </HStack>
      </VStack>
    </Page>
    <Page url="/projects">
      <VStack>
        <H3>Projects</H3>
        <Text>All active projects are listed here.</Text>
      </VStack>
    </Page>
    <Page url="/reports">
      <VStack>
        <H3>Reports</H3>
        <Text>Monthly and quarterly reports appear here.</Text>
      </VStack>
    </Page>
  </Pages>
  <Footer>
    <CHStack paddingVertical="$space-2">© 2025 Project Hub</CHStack>
  </Footer>
</App>
```

## Key points

**`layout` prop on `<App>`**: Seven prebuilt templates control how `AppHeader`, `NavPanel`, and `Footer` are docked. `"horizontal"` places the nav panel to the left of a full-height content column, with the header spanning the full width above both:

| Value | Description |
|---|---|
| `"horizontal"` | Header top, left nav, content right |
| `"horizontal-sticky"` | Same, but header stays pinned while scrolling |
| `"condensed"` | Narrower left nav with icon-only mode |
| `"condensed-sticky"` | Condensed + sticky header |
| `"vertical"` | Full-width top nav, content below |
| `"vertical-sticky"` | Vertical + sticky header |
| `"desktop"` | Edge-to-edge, no padding, no max-width |

**`<AppHeader>`, `<NavPanel>`, `<Footer>`, and `<Pages>` are named slots**: Place them as direct children of `<App>`. The framework docks them automatically — no `dock` prop or explicit sizing needed. `Pages` is the content router: it hosts `Page` children and swaps the visible one as the URL changes:

```xmlui
<App layout="horizontal">
  <AppHeader>…</AppHeader>
  <NavPanel>…</NavPanel>
  <Pages>
    <Page url="/">…</Page>
    <Page url="/settings">…</Page>
  </Pages>
  <Footer>…</Footer>
</App>
```

**`Pages` and `Page` provide client-side routing**: `Pages` watches the current URL and renders the matching `Page`. Each `Page` declares a `url` prop that corresponds to a `NavLink`'s `to` prop. Navigation never causes a server round-trip. Use `fallbackPath` to redirect unknown URLs:

```xmlui
<Pages fallbackPath="/">
  <Page url="/">…overview content…</Page>
  <Page url="/projects">…project list…</Page>
  <Page url="/reports">…reports…</Page>
</Pages>
```

**Logo area via `logoTemplate`**: `<AppHeader>` exposes a `logoTemplate` named property for the top-left branding area. Anything placed there appears before the rest of the header content. Add `<NavPanelCollapseButton />` alongside it to give users a visible toggle for the side panel on narrow screens:

```xmlui
<AppHeader>
  <property name="logoTemplate">
    <Text variant="strong">Project Hub</Text>
  </property>
</AppHeader>
```

**`scrollWholePage="false"`**: Pins the header and footer and makes only the content area scroll independently. The default (`true`) scrolls the entire page, so the header scrolls off-screen on long pages.

**`<NavPanel>` auto-collapses on small screens**: On narrow viewports the panel hides behind a slide-in drawer. `<NavPanelCollapseButton />` inside `<AppHeader>` gives users a visible button to open and close it.

---

**See also**
- [App component](/docs/reference/components/App) — full `layout` prop reference and `scrollWholePage`
- [Pages component](/docs/reference/components/Pages) — routing container, `fallbackPath`
- [Page component](/docs/reference/components/Page) — `url` prop and route parameters
- [NavPanel component](/docs/reference/components/NavPanel) — scroll, width, and collapse behaviour
- [AppHeader component](/docs/reference/components/AppHeader) — `logoTemplate` and sticky mode
- [Footer component](/docs/reference/components/Footer) — footer slot in App
