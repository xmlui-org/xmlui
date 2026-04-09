# Communicate between sibling components

Place a shared variable on a common ancestor so two components that are not parent–child can both read and write it.

XMLUI variables declared on a container element are accessible to every descendant. When two sibling components need to share state — for example a filter panel and a results list — declare the shared variable on their common parent (`App`, a layout container, or a custom component). Both siblings read the same variable, and whichever one writes to it triggers a re-render of the other automatically.

```xmlui-pg copy display name="Shared filter state between siblings"
---app display /selectedTag/
<App var.selectedTag="all" var.allSelected="{selectedTag === 'all'}">
  <HStack>

    <!-- Filter panel (sibling A): writes to selectedTag -->
    <Card width="160px" padding="$space-3">
      <Text variant="strong">Filter by tag</Text>
      <RadioGroup
        initialValue="{selectedTag}"
        onDidChange="(v) => selectedTag = v">
        <Option value="all" label="All" />
        <Option value="ui" label="UI" />
        <Option value="data" label="Data" />
        <Option value="layout" label="Layout" />
      </RadioGroup>
    </Card>

    <!-- Article list (sibling B): reads selectedTag -->
    <VStack gap="$gap-tight">
      <Text variant="strong">Articles</Text>
      <Text when="{allSelected || selectedTag === 'ui'}">
        Build a search bar — UI
      </Text>
      <Text when="{allSelected || selectedTag === 'data'}">
        Paginate API results — Data
      </Text>
      <Text when="{allSelected || selectedTag === 'layout'}">
        Create a responsive grid — Layout
      </Text>
      <Text when="{allSelected || selectedTag === 'ui'}">
        Show a confirmation dialog — UI
      </Text>
      <Text when="{allSelected || selectedTag === 'data'}">
        Cache API responses — Data
      </Text>
    </VStack>

  </HStack>
</App>
```

## Key points

**Declare the shared variable on the closest common ancestor**: Use `var.name="value"` on the element that contains both siblings — typically `App`, a layout element, or a custom component. In this example `var.selectedTag="all"` on `App` gives the filter panel and the article list access to the same value.

**A variable can hold a reactive expression**: `var.allSelected="{selectedTag === 'all'}"` declares a variable whose value is recomputed every time `selectedTag` changes. This is an inline derived boolean — equivalent to writing `selectedTag === 'all'` in every `when` attribute, but named once and reused throughout the template.

**Writes from one sibling re-render the other automatically**: When the filter panel sets `selectedTag`, every expression that reads it — including the derived `allSelected` — re-evaluates immediately. No event bus or callback wiring is required.

**Use `global.name` to share across the full App subtree**: Declaring `global.selectedTag` on `App` makes the variable accessible deep in any nested custom component, not just direct children.

**`ChangeListener` is the right tool for side-effects, not data sharing**: If sibling B needs to *react with code* (call an API, show a toast) rather than just read a value, attach a `ChangeListener` to the shared variable on sibling B's side. For plain UI synchronization, a shared variable and expression binding is simpler.

---

## See also

- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — combine variables into a derived expression
- [Toggle multiple items with shared state](/docs/howto/toggle-multiple-items-with-shared-state) — use a shared array as a multi-selection filter
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — run side-effects when a shared variable changes
