# Push a footer to the bottom

Use the Footer slot in App, or SpaceFiller between main content and footer so the footer stays at the viewport bottom.

A terms-of-service page has short content that does not fill the viewport height. The page footer must always appear at the bottom of the window, never immediately after the last paragraph. Place a `<Footer>` as a direct child of `<App>` — the framework pins it to the bottom automatically regardless of content height.

The pinned-to-bottom effect is most visible on a tall page. The embedded preview below has a fixed height so the gap between content and footer is small. Click **Open in Playground** (the external-link icon on the code panel) to see the same example at full viewport height — the empty space between the last paragraph and the footer expands to fill the window.

```xmlui-pg display name="Footer pinned to bottom" height="350px"
---app display copy
<App scrollWholePage="false">
  <Pages>
    <Page url="/">
      <VStack>
        <H3>Terms of Service</H3>
        <Text>
          By using Project Hub you agree to these terms. We may update them at any
          time. Continued use of the service constitutes acceptance.
        </Text>
        <Text>
          All content you create remains your property. We retain the right to
          display it to you and to other users you have granted access.
        </Text>
      </VStack>
    </Page>
  </Pages>
  <Footer>
    <Text>© 2025 Project Hub</Text>
    <SpaceFiller />
    <Link label="Privacy" to="/" />
    <Link label="Contact" to="/" />
  </Footer>
</App>
```

## Key points

**`<Footer>` inside `<App>` is the primary approach**: Place `<Footer>` as a direct child of `<App>`. The framework docks it to the bottom automatically — no `SpaceFiller` or explicit height arithmetic needed:

```xmlui
<App>
  <Pages>
    <Page url="/">…main content…</Page>
  </Pages>
  <Footer>
    <Text>© 2025 Acme</Text>
    <SpaceFiller />
    <Link label="Privacy" to="/" />
  </Footer>
</App>
```

**`SpaceFiller` for pages outside the `App` shell**: When rendering a standalone page without the full `App` shell, use `SpaceFiller` inside a `VStack` to push a footer row to the bottom. `SpaceFiller` grows to fill all unused flex space, forcing the row after it to the far end of the container:

```xmlui
<VStack minHeight="100vh">
  <H3>Main content</H3>
  <Text>…</Text>
  <SpaceFiller />                          <!-- absorbs unused height -->
  <HStack>© 2025 Acme</HStack>            <!-- stays at the bottom -->
</VStack>
```

**`minHeight="100vh"` is essential for the `SpaceFiller` pattern**: The container must be at least the full viewport height so there is unused space for `SpaceFiller` to grow into. Without it the `VStack` collapses to content height and the footer follows immediately after the last paragraph.

**`dock="bottom"` as a DockPanel alternative**: In a `Stack` using DockPanel mode (any child has a `dock` prop), assign `dock="bottom"` to the footer element. No `SpaceFiller` needed, but the parent requires an explicit `height`:

```xmlui
<Stack height="100vh">
  <VStack dock="stretch">…content…</VStack>
  <HStack dock="bottom">© 2025 Acme</HStack>
</Stack>
```

**`SpaceFiller` inside `Footer` pushes items apart**: `Footer` is a full-width horizontal container, so `SpaceFiller` has unused space to expand into and pushes the items that follow it to the far right. Do **not** wrap the children in an inner `HStack` — `HStack` sizes to its content, leaving no space for `SpaceFiller` to grow into.

---

**See also**
- [SpaceFiller component](/docs/reference/components/SpaceFiller) — behaviour in VStack and HStack
- [Stack component](/docs/reference/components/Stack) — dock layout mode
- [App component](/docs/reference/components/App) — `<Footer>` slot
- [Layout Properties](/docs/styles-and-themes/layout-props) — `minHeight` and height units
