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

**Choose subtree sharing or global sharing — pick the smallest scope that works**:

*Subtree-shared* (`var.` on a common ancestor, as in the example above) is the right default. The state belongs to *this view* — a filter applied here, a tab selected on this page, a draft being edited in this dialog. Lifecycle is tied to the ancestor: when the ancestor unmounts, the variable is gone. Visible to built-in descendants directly, but **not** to user-defined components nested deeper unless passed as a prop.

*Global* (`global.selectedTag` on App root, or a top-level declaration in `Globals.xs`) is for app-wide state — current user, theme mode, feature flags, anything that should be read from inside arbitrary user-defined components without prop-threading. Lifecycle is the app's lifetime; the value persists across navigation.

The practical trigger to switch from subtree to global: when at least one consumer is a user-defined component nested below the common ancestor. Subtree variables don't cross user-defined-component boundaries; globals do.

**Why not always use globals?** They're appealing because they're simpler — one rule, no scoping ladder. But:

- *Multiple instances couple.* A component used in two places at once shares its global state across both — typing in one instance mutates the other. Subtree vars give each instance its own state.
- *Names collide.* Globals share a flat namespace; two unrelated features can't both use `selectedTag`. Names grow longer the larger the app gets.
- *State goes stale across navigation.* Globals persist for the app's lifetime; subtree vars reset when the ancestor unmounts (usually what you want for view-local state).
- *You can't tell where a name came from.* Subtree scope is bounded — trace upward in a few files. Globals require app-wide grep.
- *Globals are an API surface.* Renaming one updates every consumer; renaming a subtree var only touches local consumers.

See [Scoping › Global variables](/docs/guides/scoping#global-variables) for the full mechanics.

**`ChangeListener` is the right tool for side-effects, not data sharing**: If sibling B needs to *react with code* (call an API, show a toast) rather than just read a value, attach a `ChangeListener` to the shared variable on sibling B's side. For plain UI synchronization, a shared variable and expression binding is simpler.

---

## See also

- [Scoping](/docs/guides/scoping) — how subtree variables and globals differ; the rules for `var.`, `global.`, and `Globals.xs`
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — combine variables into a derived expression
- [Toggle multiple items with shared state](/docs/howto/toggle-multiple-items-with-shared-state) — use a shared array as a multi-selection filter
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — run side-effects when a shared variable changes
