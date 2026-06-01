# `computedUses` — Optimization Architecture Overview

This document describes the mechanisms that XMLUI uses to avoid unnecessary component re-renders. It is written at an architectural level — without implementation details.

---

## 1. The Problem

By default, React re-renders the entire subtree whenever the parent component's state changes. In an XMLUI application, this means that even the smallest change (e.g., a timer tick) could re-render dozens of components that don't actually display anything new.

```xml
<App var.tick="{0}" var.items="{loadItems()}">
  <Timer interval="{100}" onTick="tick++" />
  <Text value="Tick: {tick}" />

  <!-- A heavy table with thousands of rows.
       It only reads items — but without optimization
       it will re-render 10 times per second along with tick. -->
  <Table data="{items}" />
</App>
```

**Optimization Goal:** Automatically determine which specific variables each component depends on and re-render it only when "its" specific variable has changed.

---

## 2. Two Narrowing Channels

XMLUI distinguishes between two independent types of variables and narrows each separately:

| Channel | What is narrowed | Result |
|---|---|---|
| `computedUses` | Local state of the parent component | Component does not re-render on changes to "other" parent vars |
| `computedGlobalUses` | Variables from `Globals.xs` | Component does not re-render on changes to "other" global vars |

### 2.1 `computedUses` — Narrowing Parent State

```xml
<App var.tick="{0}" var.items="{loadItems()}">
  <Timer interval="{100}" onTick="tick++" />
  <Text value="Tick: {tick}" />

  <!-- computedUses = ["items"]
       Re-renders only when items changes, not tick. -->
  <Table data="{items}" />
</App>
```

### 2.2 `computedGlobalUses` — Narrowing Global Variables

```xml
<!-- Globals.xs -->
var.sortBy = "name"
var.view   = "table"
var.events = {}
```

```xml
<!-- FilesPage.xmlui -->
<Fragment>
  <!-- computedGlobalUses = ["sortBy"]
       Does not re-render when view or events change. -->
  <Table sortBy="{sortBy}" data="{fileEntries}" />

  <!-- computedGlobalUses = ["view"]
       Does not re-render when sortBy or events change. -->
  <TileGrid when="{view === 'icons'}" data="{fileEntries}" />
</Fragment>
```

---

## 3. How Dependencies are Determined — Static Analysis

The framework analyzes the markup **once during loading** (before the first render), traversing the component tree bottom-up. For each container component, it gathers the minimal list of variables it actually depends on.

### 3.1 What is Analyzed

- Prop values: `data="{items}"`, `when="{view === 'table'}"`
- Event handlers: `onClick="doSort()"`, `onLoaded="(d) => { files = d; }"`
- The component's own vars and their initializer expressions
- Functions in `.xs` files and `<script>` blocks — **recursively** (if a function calls another local function, the analyzer enters it as well)

### 3.2 What is Filtered and Not Included in Dependencies

| What | Example | Why |
|---|---|---|
| JS Standard | `Math.round()`, `JSON.stringify()`, `Array.from()` | Never part of the XMLUI state |
| Browser Globals | `window.location`, `document.title` | Not part of the component state |
| Framework Utilities | `Actions`, `toast`, `navigate`, `Log` | Built into the scope of all expressions |
| Lexical Variables | `$item`, `$index`, `$context` | Injected by the framework in iterators |
| Component's Own Vars | `var.x` declared in the component itself | Local, doesn't come from above |

```xml
<List data="{items}">
  <!-- $item and $index are lexical, not dependencies on the parent -->
  <Text value="{$index}: {$item.name}" />
  <!-- JSON is a standard JS function, not state -->
  <Text value="{JSON.stringify($item)}" />
</List>
```

---

## 4. Heavy Components — Automatic Wrapping

Components like `Table`, `Select`, `List`, `TileGrid`, `Tree`, `DataGrid` are marked as "heavy". If such a component reads parent variables, the framework **automatically** wraps it in an isolating container with `computedUses`. If it reads nothing, isolation is not needed, and no extra wrapper is created.

```xml
<App var.filter="{''}" var.theme="{'light'}">

  <!-- Reads filter → automatically receives computedUses=["filter"].
       Does not re-render when theme changes. -->
  <Select data="{filteredItems(filter)}" />

  <!-- Reads nothing from parent → no wrapper is created. -->
  <Select>
    <Option value="a" />
    <Option value="b" />
  </Select>

</App>
```

---

## 5. Analyzing Functions in `.xs` Files

When logic is expressed not in the markup but in `.xs` / `<script>` functions, the analyzer **enters the bodies of these functions** and extracts real dependencies from there.

```js
// FilesView.xmlui.xs
function rowClass(item) {
  // Reads the global catalogSelection — the analyzer sees this
  return item.id === catalogSelection.activeId ? 'selected' : '';
}
```

```xml
<!-- FilesView.xmlui -->
<Fragment>            <!-- ← owner of the rowClass function -->
  <Table>
    <Column cellRenderer="{(item) => rowClass(item)}" />
  </Table>
</Fragment>
```

`Fragment`, as the owner of `rowClass`, will receive `computedGlobalUses = ["catalogSelection"]` — correctly, because the analyzer recursively traversed the function body.

Recursion is safe: if function `A` calls `B`, and `B` calls `A` again (mutual recursion), a "visited nodes" mechanism prevents an infinite loop.

---

## 6. UID Escaping Mechanism

When a component declares an `id`, it registers its API with the **nearest** owner container. During narrowing, the framework ensures that this UID always remains accessible to those who reference it.

```xml
<App>
  <Fragment var.x="{0}">   <!-- a container, but not an explicit owner -->
    <Select id="mySelect" />

    <!-- mySelect.value — a reference to a neighbor's API.
         The framework will automatically include "mySelect" in the Fragment's computedUses,
         so Select.value does not disappear from the narrowed state. -->
    <Button
      label="{mySelect.value}"
      onClick="submit(mySelect.value)"
    />
  </Fragment>
</App>
```

---

## 7. How Narrowing Protects Event Handlers

Narrowing only affects **rendering**: what the component displays. But an event handler can write to any variable, even one that isn't displayed.

```xml
<Fragment var.counter="{0}">
  <!-- counter is in computedUses, the component displays it -->
  <Text value="{counter}" />

  <!-- hidden is NOT in computedUses (the component doesn't read it),
       but writing to it will still work correctly -->
  <Button onClick="hidden = Date.now()" />
</Fragment>
```

The framework passes the full state to handlers via a stable ref — therefore, writing to a "non-narrowed" variable always reaches its target but does not trigger unnecessary renders.

---

## 8. Current Limitations

Narrowing is disabled conservatively in several situations where the analyzer cannot **reliably** establish dependencies:

### 8.1 A Heavy Component Calls a Parent Component's Function

The analyzer knows which globals the `rowClass` function reads in its owner (`Fragment`). However, `Table` is heavy and forms a separate container — it only receives the **name** of the function, without its dependency list. Therefore, `Table` remains conservative (without `computedGlobalUses`).

```xml
<Fragment>             <!-- owner of rowClass — knows it reads catalogSelection ✅ -->
  <script>
    function rowClass(item) { return item.id === catalogSelection.activeId ? 'sel' : ''; }
  </script>

  <!-- Table is heavy, sees only the name "rowClass", doesn't know about catalogSelection.
       Global narrowing for Table is disabled. ❌ -->
  <Table>
    <Column cellRenderer="{(item) => rowClass(item)}" />
  </Table>
</Fragment>
```

**Planned:** Pass the list of global dependencies of a function along with its name so that `Table` receives `computedGlobalUses = ["catalogSelection"]` automatically.

### 8.2 Function Imported from Another `.xs` File

If a component calls a function imported from a neighboring `.xs`, the analyzer does not enter that file and does not see which globals it reads internally. Narrowing is disabled.

```xml
<Fragment>
  <script>
    import { publishEvent } from "../shared.xs";
  </script>

  <!-- publishEvent reads events — but the analyzer doesn't know about it.
       Global narrowing for Fragment is disabled. ❌ -->
  <Button onClick="publishEvent('file:deleted', item)" />
</Fragment>
```

**Planned:** Resolve `.xs` imports during analysis and extract dependencies from the bodies of imported functions.

### 8.3 Global Functions from `Globals.xs` are Always Passed in Full

Functions declared in `Globals.xs` are always included in the narrowed globals object — even if a specific component does not call them. Variables, however, are narrowed correctly.

**Planned:** Track exactly which global functions the component calls and pass only those.

---

## 9. Analysis Execution Order

```
1. Vite plugin (build / dev-server) — first pass
   Analyzes each .xmlui file immediately after parsing.
   Globals.xs is not yet known → computedGlobalUses is not yet set.

2. StandaloneApp (loading in the browser) — authoritative pass
   .xs code-behind functions and the known Globals.xs are attached.
   computedUses and computedGlobalUses are calculated finally — BEFORE the first render.

3. (If needed) After resolving imports — if .xs files were loaded asynchronously,
   dependencies are recalculated once more before a full render.
```

The authoritative pass overwrites the result of the first, so the final result is always correct.

---

## 10. Brief Summary

| Mechanism | What it does |
|---|---|
| `computedUses` | Narrows local parent state — component doesn't see "other" vars |
| `computedGlobalUses` | Narrows global variables — component doesn't react to "other" globals |
| Automatic wrapping of heavy components | `Table`/`Select`/`List`, etc., receive isolation without explicit `uses` |
| Analysis of `.xs` functions (recursive) | Dependencies are extracted even from deeply nested calls |
| UID Escaping | Narrowing does not "cut off" a component from its neighbors' APIs |
| Full state in handlers | Writing to any variable always works, even if it's not in `computedUses` |
