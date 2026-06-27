# Make a sticky header in a scroll area

Use StickyBox or StickySection inside a scrollable container to keep a header visible while scrolling.

A project report has four long sections. As the user scrolls, the header for the current section should stay visible at the top so readers always know where they are. `StickySection` handles the stacking logic — when multiple sections compete for the sticky slot, only the most recently scrolled-to header wins.

```xmlui-pg copy display name="Sticky section headers" height="350px"
---app display
<App scrollWholePage="false">
  <ScrollViewer height="*">
    <StickySection stickTo="top" backgroundColor="$color-primary-50">
      <H4 paddingVertical="$space-2">1 — Requirements</H4>
    </StickySection>
    <VStack paddingVertical="$space-3">
      <Text>Define the functional and non-functional requirements for the system.</Text>
      <Text>Each requirement must be testable, unambiguous, and traceable.</Text>
      <Text>Review with stakeholders before locking the scope.</Text>
    </VStack>
    <StickySection stickTo="top" backgroundColor="$color-primary-50">
      <H4 paddingVertical="$space-2">2 — Design</H4>
    </StickySection>
    <VStack paddingVertical="$space-3">
      <Text>Produce architecture diagrams, data models, and API contracts.</Text>
      <Text>Hold a design review with the team before implementation begins.</Text>
      <Text>Document decisions and rejected alternatives in an ADR log.</Text>
    </VStack>
    <StickySection stickTo="top" backgroundColor="$color-primary-50">
      <H4 paddingVertical="$space-2">3 — Implementation</H4>
    </StickySection>
    <VStack paddingVertical="$space-3">
      <Text>Follow the agreed coding standards and branch naming conventions.</Text>
      <Text>Write unit tests alongside each feature — aim for 80% line coverage.</Text>
      <Text>Submit pull requests with at least one peer review before merging.</Text>
    </VStack>
    <StickySection stickTo="top" backgroundColor="$color-primary-50">
      <H4 paddingVertical="$space-2">4 — Testing</H4>
    </StickySection>
    <VStack paddingVertical="$space-3">
      <Text>Run the full test suite in CI on every pull request to main.</Text>
      <Text>Perform exploratory testing on staging before each release.</Text>
      <Text>Log regressions and track them to resolution before go-live.</Text>
    </VStack>
  </ScrollViewer>
</App>
```

## Key points

**`StickySection` keeps the closest header pinned**: When multiple sections have scrolled out of view, only the most recently scrolled-to one remains visible at the top. Earlier headers yield the sticky slot as the next section scrolls in — the natural behaviour for a document outline:

```xmlui
<ScrollViewer>
  <StickySection stickTo="top">
    <H4>Section 1</H4>
  </StickySection>
  <!-- long content … -->
  <StickySection stickTo="top">
    <H4>Section 2</H4>
  </StickySection>
  <!-- long content … -->
</ScrollViewer>
```

**A scroll container with `height="*"` is required**: `StickySection` must be inside a `ScrollViewer` (or an element with `overflow: auto`). It does not work against the whole-page document scroll — always pair it with `scrollWholePage="false"` on the `<App>`. The `height="*"` star-sizing prop tells `ScrollViewer` to fill all available height in its parent, creating the bounded scroll area that `StickySection` needs to operate:

```xmlui
<App scrollWholePage="false">
  <ScrollViewer height="*">
    <StickySection stickTo="top">…</StickySection>
    <!-- content that scrolls while header sticks -->
  </ScrollViewer>
</App>
```

**`StickySection` vs `StickyBox`**: Use `StickyBox` when you need a permanently visible element that should never yield its pinned position — for example a "Save changes" action bar:

```xmlui
<StickyBox to="top">
  <HStack>
    <Text variant="strong">Unsaved changes</Text>
    <SpaceFiller />
    <Button label="Save" variant="solid" />
  </HStack>
</StickyBox>
```

**`stickTo="bottom"`**: Pins content to the bottom of the scroll container — useful for a sticky totals row at the bottom of a scrollable data section:

```xmlui
<StickySection stickTo="bottom">
  <HStack><Text variant="strong">Total: $4,200</Text></HStack>
</StickySection>
```

**Style the sticky header distinctly**: Give `StickySection` a `backgroundColor` so it visually separates from content sliding underneath it. Without a background the header is transparent and overlapping text shows through.

---

**See also**
- [StickySection component](/docs/reference/components/StickySection) — `stickTo` prop and stacking behaviour
- [StickyBox component](/docs/reference/components/StickyBox) — simpler always-on sticky positioning
- [ScrollViewer component](/docs/reference/components/ScrollViewer) — scroll container required for sticky content
- [App component](/docs/reference/components/App) — `scrollWholePage` prop
