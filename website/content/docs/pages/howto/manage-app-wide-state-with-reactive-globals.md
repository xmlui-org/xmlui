# Manage app-wide state with reactive globals

Declare a `global` on the app root; any component — however deeply nested —
reads and writes it by name, with no prop-drilling and no `AppState`.

> [!NOTE]
> This is the current pattern for app-wide shared state. The
> [`AppState`](/docs/reference/components/AppState) component is **deprecated**;
> the [Migrating from AppState](#migrating-from-appstate) section below shows the
> one-to-one equivalent.

## One global, read and written anywhere

A `global` declared on the `App` root is visible everywhere in the app.
`SessionBar` (a user-defined component) reads it; `ThemeToggle` writes it; the
read updates automatically:

```xmlui-pg copy display name="One global, read and written anywhere" height="220px"
---app display
<App global.session="{ { user: 'Ada', theme: 'light' } }">
  <VStack gap="$space-3" padding="$space-3">
    <SessionBar />
    <ThemeToggle />
  </VStack>
</App>

<Component name="SessionBar">
  <HStack verticalAlignment="center" gap="$space-2">
    <Text variant="strong">{session.user}</Text>
    <Text variant="secondary">theme: {session.theme}</Text>
  </HStack>
</Component>

<Component name="ThemeToggle">
  <Button
    label="Toggle theme"
    onClick="session = { ...session, theme: session.theme === 'light' ? 'dark' : 'light' }" />
</Component>
```

Neither component receives `session` as a prop. `ThemeToggle` reassigns it, and
every reader — here `SessionBar`, in a real app any number of them — re-renders.
Reassign the whole object (`{ ...session, theme }`) rather than mutating a field,
so the change is a new value the reactive engine can see.

Declare globals in one of two places only: the root element of `Main.xmlui`
(with `global.` or a `<global>` tag), or as top-level declarations in a
`Globals.xs` code-behind file. They **cannot** be declared inside a user-defined
component file.

## `var.` on an ancestor vs a `global`

Reach for a `global` only when the state is genuinely app-wide. If the state
belongs to *one view*, put a `var.` on the closest common ancestor instead — it
is scoped, resets when that subtree unmounts, and won't collide with anything
elsewhere.

- **Subtree** (`var.` on a common ancestor) — a filter applied on this page, a
  tab selected in this dialog. The right default. See
  [Communicate between sibling components](/docs/howto/communicate-between-sibling-components).
- **Global** (`global.` on the app root) — current user, theme, feature flags:
  anything read from inside arbitrary user-defined components without
  prop-threading, that should persist across navigation.

The practical trigger to go global: at least one consumer is a user-defined
component nested below the common ancestor. Subtree `var.`s don't cross
user-defined-component boundaries; globals do. [Scoping](/docs/guides/scoping)
has the full mechanics and the reasons not to reach for globals by default
(instances couple, names collide, state goes stale across navigation).

## Migrating from AppState

`AppState` stored a bucket and mutated it through `update()`. A `global` holds
the same object and is updated by plain assignment:

```xmlui
<!-- Legacy: AppState -->
<App>
  <AppState id="settings" bucket="settings" initialValue="{ { theme: 'light' } }" />
  <Button label="Dark" onClick="settings.update({ theme: 'dark' })" />
  <Text>{settings.value.theme}</Text>
</App>
```

```xmlui
<!-- Current: reactive global -->
<App global.settings="{ { theme: 'light' } }">
  <Button label="Dark" onClick="settings = { ...settings, theme: 'dark' }" />
  <Text>{settings.theme}</Text>
</App>
```

The mapping:

| AppState | reactive global |
| --- | --- |
| `<AppState bucket="settings" initialValue="{…}" />` | `global.settings="{…}"` on the `App` root |
| read `settings.value.theme` | read `settings.theme` |
| write `settings.update({ theme: 'dark' })` | `settings = { ...settings, theme: 'dark' }` |
| `settings.appendToList('ids', id)` | `settings = { ...settings, ids: [...settings.ids, id] }` |

## Key points

**Declare globals only on the app root or in `Globals.xs`.** A `global.` on a
nested element or inside a user-defined component file is an error.

**Reassign, don't mutate.** Write a new object (`{ ...state, field: value }`) so
the reactive engine sees a new value. Mutating a field in place may not trigger
readers.

**Prefer the smallest scope that works.** A `var.` on a common ancestor is the
default; go global only when a nested user-defined component must read or write
the state, or it must outlive the view.

---

## See also

- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — subtree sharing with `var.` on a common ancestor
- [Toggle multiple items with shared state](/docs/howto/toggle-multiple-items-with-shared-state) — a shared array as a multi-selection filter
- [Keep per-item state in a loop](/docs/howto/keep-per-item-state-in-a-loop) — per-row state inside `Items`/`List`
- [Scoping](/docs/guides/scoping) — the full rules for `var.`, `global.`, and `Globals.xs`
- [AppState component](/docs/reference/components/AppState) — the deprecated component this pattern replaces
