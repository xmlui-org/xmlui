# Visibility and Responsive Display

Every XMLUI component supports a `when` attribute that controls whether the component is rendered. Extending this, a family of responsive `when-*` attributes lets you show or hide components based on the current viewport size.

## The `when` attribute

`when` is not a visibility toggle — it controls whether XMLUI **processes the component at all**. When `when` evaluates to a falsy value, the component and every one of its nested children are skipped entirely: no rendering happens, no nodes are created, and no component lifecycle runs. The component simply does not exist on the page until `when` becomes truthy again.

This is distinct from merely hiding a component. A hidden-but-rendered component still occupies memory, its event handlers are still active, and it can still affect the layout of the surrounding elements. A component with `when="false"` has none of that overhead — XMLUI never touches it.

Set `when` to `false` (or any expression that evaluates falsy) to opt out of rendering:

```xmlui
<Text when="{user.isLoggedIn}">Welcome back!</Text>
```

When `when` is omitted or evaluates to `true`, the component renders normally.

```xmlui
<Spinner when="{isLoading}" />
<Text when="{!isLoading}">Data loaded.</Text>
```

### `when` and lifecycle events

`onInit` and `onCleanup` respond to `when` transitions. When `when` switches from `false` to `true`, `onInit` fires. When `when` switches from `true` to `false`, `onCleanup` fires. This lets you perform setup and teardown logic tied to a component's visibility.

```xmlui
<App var.showPanel="{false}">
  <Button label="Toggle panel" onClick="showPanel = !showPanel" />
  <Card
    when="{showPanel}"
    onInit="console.log('panel appeared')"
    onCleanup="console.log('panel removed')"
  >
    <Text>Panel content</Text>
  </Card>
</App>
```

## Responsive `when-*` attributes

The responsive variants follow a **mobile-first** (min-width) convention. Each attribute name is `when-` followed by a breakpoint name:

| Attribute | Applies from |
|-----------|-------------|
| `when-xs` | All screens (≥ 0 px) |
| `when-sm` | Small screens (≥ 576 px) |
| `when-md` | Medium screens (≥ 768 px) |
| `when-lg` | Large screens (≥ 992 px) |
| `when-xl` | Extra-large screens (≥ 1200 px) |
| `when-xxl` | Extra-extra-large screens (≥ 1400 px) |

### How the active value is resolved

At any given viewport width, XMLUI looks for the **most specific rule that applies**, by walking from the current breakpoint downward:

- At `md` it tries `when-md`, then `when-sm`, then `when-xs`.
- The first defined value wins.
- If no value matches (no rule at or below the current breakpoint), XMLUI falls back to the base `when` attribute — or `true` if `when` is also absent.

This means a lone responsive attribute acts as a **one-sided switch**. For example, `when-md="false"` hides the component at `md` and above while leaving it visible below `md` (the fallback is the base `when`, which defaults to visible).

### Examples

**Visible only from `md` upward:**

The component is visible at `md` and above. Below `md` the walk finds no responsive rule and falls back to the base `when` — here, `false`.

```xmlui
<Text when="false" when-md="true" value="Only on medium screens and above" />
```

**Hidden from `md` upward, visible below:**

```xmlui
<Text when-md="false" value="Hidden on medium screens and above" />
```

At `xs` and `sm` the walk finds no rule and falls back to the base `when` (absent = visible). At `md` and above, `when-md="false"` applies.

**Different content for small and large screens:**

```xmlui
<App>
  <Text when-md="false" value="Compact summary" />
  <Text when="false" when-md="true" value="Full detail view" />
</App>
```

**Visible only in a specific breakpoint range — `sm` through `lg`:**

```xmlui
<Text
  when="false"
  when-sm="true"
  when-xl="false"
  value="Only visible between sm and lg"
/>
```

- Below `sm`: falls back to `when=false` → hidden.
- `sm`–`xl`: `when-sm=true` applies → visible; until `xl` overrides with `false`.
- `xl` and above: `when-xl=false` applies → hidden.

### Combining responsive attributes with `when`

The base `when` is only consulted when the walk from the current breakpoint downward finds **no** matching responsive rule. Once any responsive rule applies, the base `when` is ignored for that breakpoint.

| `when` | `when-xs` | `when-md` | Result at `xs` | Result at `md` |
|--------|-----------|-----------|----------------|----------------|
| (absent) | (absent) | (absent) | visible | visible |
| `false` | (absent) | (absent) | hidden | hidden |
| — | `true` | (absent) | visible | visible (inherits `when-xs`) |
| — | `true` | `false` | visible | hidden |
| — | `false` | `true` | hidden | visible |
| `false` | (absent) | `true` | hidden | visible |
| `true` | (absent) | `false` | visible | hidden |
