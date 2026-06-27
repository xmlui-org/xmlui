# Toggle multiple items with shared state

Hold the set of selected (or hidden) items in a single array that every consumer reads and writes, so all UI that depends on it stays in sync automatically.

The example below tracks which categories are *hidden*: a `<CategoryFilter>` user-defined component renders one checkbox per category and writes to a shared array; the article list reads from the same array and re-renders whenever it changes. Because the reactive array is the only source of truth, no event bus or callback wiring is needed.

The array is declared as a `global` because at least one of its consumers — the `<CategoryFilter>` user-defined component — sits below a user-defined-component boundary that subtree variables (`var.`) do not cross. If every consumer were a built-in descendant of a common ancestor, `var.hiddenCategories` on that ancestor would be enough. See [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) for the broader subtree-vs-global decision.

```xmlui-pg copy display name="Toggle categories to filter articles" height="600px"
---app display /hiddenCategories/
<App
  global.hiddenCategories="{[]}"
  var.articles="{[
    { id: 1, title: 'Understanding React Hooks', category: 'Technology' },
    { id: 2, title: 'Best Hiking Trails in Colorado', category: 'Outdoors' },
    { id: 3, title: 'New Jazz Album Reviews', category: 'Music' },
    { id: 4, title: 'Building REST APIs with Node', category: 'Technology' },
    { id: 5, title: 'Weekend Camping Essentials', category: 'Outdoors' },
    { id: 6, title: 'Live Concert Guide: February', category: 'Music' },
    { id: 7, title: 'CSS Grid Layout Patterns', category: 'Technology' },
    { id: 8, title: 'Mountain Biking for Beginners', category: 'Outdoors' },
    { id: 9, title: 'Classical Piano Performances', category: 'Music' },
    { id: 10, title: 'Local Farmers Market Schedule', category: 'Food' },
    { id: 11, title: 'Best Bakeries Downtown', category: 'Food' },
    { id: 12, title: 'TypeScript Migration Guide', category: 'Technology' }
  ]}">

  <CategoryFilter
    categories="{['Technology', 'Outdoors', 'Music', 'Food'].map(
      (name) => ({ 
          name: name, 
          count: articles.filter((a) => a.category === name).length 
      })
    )}" />

  <H2>Articles</H2>
  <Text variant="caption" color="$color-text-secondary">
    {articles.filter((a) => hiddenCategories.indexOf(a.category) === -1).length}
    of {articles.length} shown
  </Text>
  <List data="{articles.filter((a) => 
    hiddenCategories.indexOf(a.category) === -1)}"
    height="240px"
  >
    <Card gap="0">
      <H3>{$item.title}</H3>
      <Text fontStyle="italic">{$item.category}</Text>
    </Card>
  </List>
</App>
---comp display /hiddenCategories/
<Component name="CategoryFilter">
  <VStack gap="0">
    <H2>Categories</H2>
    <Text variant="caption" color="$color-text-secondary">
      Uncheck a category to hide its articles
    </Text>
    <Items data="{$props.categories}">
      <HStack gap="$space-tight" verticalAlignment="center">
        <Checkbox
          initialValue="{hiddenCategories.indexOf($item.name) === -1}"
          onClick="hiddenCategories = hiddenCategories.indexOf($item.name) >= 0
            ? hiddenCategories.filter((x) => x !== $item.name)
            : [...hiddenCategories, $item.name]"
        />
        <Text fontWeight="bold" width="$space-4" textAlign="right">{$item.count}</Text>
        <Text>{$item.name}</Text>
      </HStack>
    </Items>
  </VStack>
</Component>
```

## Key points

**Why a global, not a subtree variable**: `var.hiddenCategories` on `App` would not be visible inside `<CategoryFilter>` — subtree variables don't cross user-defined-component boundaries. Declaring the array as `global.hiddenCategories` makes it readable and writable from any component, including the filter checkboxes inside the user-defined component. The trigger to switch from subtree sharing to global is exactly this: at least one consumer lives below a user-defined-component boundary.

**Do not refetch after a toggle**: Assigning a new array to `hiddenCategories` triggers XMLUI reactivity immediately — the filtered article list and checkbox states both update in the same render. Refetching a `DataSource` after an optimistic update risks overwriting it with stale server data if the API call hasn't completed yet.

**Use `initialValue`, not `value`, on Checkbox**: `initialValue` sets the visual state on first render from the shared array. On subsequent clicks the checkbox toggles visually on its own; the `onClick` handler keeps `hiddenCategories` in sync for all other consumers.

**Replace the array on every toggle**: Instead of mutating the existing array, assign a new one using `filter` (to remove) or spread (`[...arr, item]`) to add. XMLUI detects the reference change and re-renders all dependents.

## Persisting to a server

In a real application, you'd also save the hidden categories to an API. Fire the API call without waiting for it — the optimistic update has already updated the UI:

```xmlui
<Checkbox
  initialValue="{hiddenCategories.indexOf($item.name) === -1}"
  onClick="
    hiddenCategories = hiddenCategories.indexOf($item.name) >= 0
      ? hiddenCategories.filter((x) => x !== $item.name)
      : [...hiddenCategories, $item.name];
    savePreferences.execute({ hidden: hiddenCategories });
  "
/>
```

Use `invalidates="{[]}"` on the `APICall` to prevent it from refetching DataSources that would overwrite your optimistic state.

---

## See also

- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — the broader subtree-vs-global decision, with the full set of trade-offs
- [Scoping](/docs/guides/scoping) — how `var.`, `global.`, and `Globals.xs` differ; why subtree variables don't cross user-defined-component boundaries
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — compute a filtered or derived value reactively from shared state
- [Buffer a reactive edit](/docs/howto/buffer-a-reactive-edit) — stage individual field edits before committing to state
