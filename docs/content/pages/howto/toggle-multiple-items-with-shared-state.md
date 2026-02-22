# Toggle multiple items in a list with shared state

When users toggle checkboxes in a list and each toggle accumulates into a shared array (e.g., hiding sources, selecting categories), use a global variable for the shared state and update it optimistically on each click. Don't refetch the DataSource after each toggle — the refetch can overwrite your optimistic update before the API call completes.

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
      (name) => ({ name: name, count: articles.filter((a) => a.category === name).length })
    )}" />

  <H2>Articles</H2>
  <Text variant="caption" color="$color-text-secondary">
    {articles.filter((a) => hiddenCategories.indexOf(a.category) === -1).length} of {articles.length} shown
  </Text>
  <Items data="{articles.filter((a) => hiddenCategories.indexOf(a.category) === -1)}">
    <Card padding="$space-2" marginBottom="$space-1">
      <VStack gap="$space-0">
        <Text fontWeight="bold">{$item.title}</Text>
        <Text fontSize="$fontSize-xs" fontStyle="italic" color="$color-text-tertiary">{$item.category}</Text>
      </VStack>
    </Card>
  </Items>
</App>
---comp display /hiddenCategories/
<Component name="CategoryFilter">
  <VStack gap="$space-2" padding="$space-4">
    <H2>Categories</H2>
    <Text variant="caption" color="$color-text-secondary">
      Uncheck a category to hide its articles
    </Text>
    <Items data="{$props.categories}">
      <HStack gap="$space-2" verticalAlignment="center">
        <Checkbox
          initialValue="{hiddenCategories.indexOf($item.name) === -1}"
          onClick="hiddenCategories = hiddenCategories.indexOf($item.name) >= 0
            ? hiddenCategories.filter((x) => x !== $item.name)
            : [...hiddenCategories, $item.name]"
        />
        <Text fontWeight="bold" width="30px" textAlign="right">{$item.count}</Text>
        <Text>{$item.name}</Text>
      </HStack>
    </Items>
  </VStack>
</Component>
```

The key points:

- **`hiddenCategories` is a global variable** declared with `global.hiddenCategories` on the App. The `CategoryFilter` component reads and writes it directly — no prop drilling needed. This differs from the [optimistic UI pattern](update-ui-optimistically) where each item has independent local state.

- **No DataSource refetch after toggle.** Assigning to `hiddenCategories` is enough to trigger XMLUI's reactivity — the filtered articles list and checkbox states both update immediately. Refetching after an optimistic update risks overwriting it with stale server data (the API call may not have completed yet).

- **Checkbox without `readOnly`.** A `readOnly` checkbox only changes visually when its `initialValue` expression is re-evaluated during a re-render. Without a DataSource refetch or other trigger, that re-render may not happen. Omitting `readOnly` lets the checkbox toggle visually on click, independent of re-render timing.

- **`initialValue` drives the initial state.** On first render, each checkbox reads from the `hiddenCategories` array. On subsequent clicks, the checkbox toggles visually on its own, and the `onClick` handler keeps `hiddenCategories` in sync for the filtered list.

## Persisting to a server

In a real application, you'd also save the hidden categories to an API. Fire the API call without waiting for it — the optimistic update has already updated the UI:

```xml
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
