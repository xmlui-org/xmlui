# Fix: `var.` declarations on `<Component>` invisible in child event handlers

**Date:** 2026-05-13 → resolved 2026-05-14  
**Branch:** yurii/computedUses  
**Status:** FIXED

---

## Симптом

У user-defined компонентів, які мають **зовнішній `.xmlui.xs` code-behind файл** (з або без `<script>` тегу):

XML декларації `var.x="{expr}"` на елементі `<Component>` **не потрапляли** у `localContext` event handlers дочірніх контейнерів.

**Приклад:**

```xml
<Component
  name="PageToolbar"
  var.selectAllIndeterminate="{false}">
  ...
  <ChangeListener onChange="selectAllIndeterminate = false" />  <!-- ← ПОМИЛКА -->
</Component>
```

Помилка: `Left value variable "selectAllIndeterminate" not found`.

---

## Справжня причина

**Два різних шляхи для `scriptCollected` vs code-behind:**

`computeUsesInternal` (алгоритм звуження стану) відключав звуження для дітей через прапорець `nextDisableNarrowing`:

```typescript
// БУЛО (тільки <script> тег):
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected;
```

Але `scriptCollected` встановлюється ЛИШЕ коли є inline `<script>` тег в `.xmlui` файлі. Коли компонент має **тільки зовнішній `.xmlui.xs` файл**, `StandaloneApp.tsx` (рядки 733–746) записує функції напряму в `node.functions`:

```typescript
const componentWithCodeBehind = {
  ...compound,
  component: {
    ...compound.component,
    functions: componentCodeBehind?.functions,  // ← в functions, НЕ в scriptCollected!
  },
};
```

Результат: `node.scriptCollected === undefined`, `nextDisableNarrowing = false`, алгоритм звужував `computedUses` для дітей (наприклад, `ChangeListener`), відрізаючи `selectAllIndeterminate` від їхнього scope.

---

## Фікс

`xmlui/src/components-core/prepare/computedUses.ts`:

```typescript
// СТАЛО: перевіряємо і scriptCollected (<script> тег) і functions (code-behind .xs)
const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected || hasCodeBehind;
```

**Логіка:** якщо вузол має code-behind функції (будь-яким шляхом), їхні тіла можуть читати **будь-які** змінні стану батька — статичний аналіз шаблону не може це передбачити. Тому все піддерево отримує `disableNarrowing=true`.

---

## Архітектурні спостереження

### 1. Два канали потрапляння скриптів на вузол
| Джерело | Де зберігається | Коли |
|---------|-----------------|------|
| `<script>` тег в `.xmlui` | `node.scriptCollected` | під час парсингу в `transform.ts` |
| Зовнішній `.xmlui.xs` файл | `node.functions` | під час merge в `StandaloneApp.tsx` |

`isKnownContainer` правильно перевіряв обидва канали, але `nextDisableNarrowing` — лише перший.

### 2. `computedUses` звуження і code-behind несумісні
Алгоритм аналізує тільки шаблонні вирази в XML (props, vars, events). Тіла функцій у `.xs` файлах **не скануються**. Тому для будь-якого вузла з code-behind або `<script>` звуження стану для дітей небезпечне.

### 3. Звуження залишається для вбудованих компонентів
`Select`, `Table`, `List`, `DataGrid` — вбудовані компоненти, вони НІКОЛИ не мають `scriptCollected` або `functions` з code-behind. Тому оптимізація `computedUses` для них залишається повністю робочою.

### 4. `Fragment#- computedUses=[events]` — нормальна поведінка
В логах видно Fragment-и з `computedUses=['events']`. Це Fragment-и з дерева **entry point** (сторінки), не з внутрішнього дерева PageToolbar. Вони правомірно звужуються — не пов'язані з цим багом.

---

## TODO (майбутня оптимізація)

**Звуження для компонентів з code-behind** наразі повністю відключене через неможливість статичного аналізу тіл функцій. Щоб увімкнути його в майбутньому потрібно:

1. AST-аналіз тіл функцій у `.xs` файлах — збирати ідентифікатори що читаються/пишуться
2. Рекурсивне відстеження залежностей через `import` ланцюжки (`import { fn } from 'shared.xs'` де `fn` звертається до `serverConfig`)
3. Обробка циклічних залежностей між `.xs` файлами

Це нетривіальна задача — відкладена.

---

---

# Function-Free Child Narrowing

**Date:** 2026-05-14  
**Status:** IMPLEMENTED  
**Tests:** `tests/components-core/optimization/computedUses.test.ts`  
→ describe `"computeUsesForTree — function-free child narrowing"` (6 tests, all passing)

## Problem

`nextDisableNarrowing = true` propagated uniformly to **every descendant** of a node with
`<script>` or `.xs` code-behind.  This was correct for descendants that call those
functions, but over-blocked descendants that never call any function and only reference
reactive variables.

In real applications almost every user-defined component has a `<script>` or `.xs`, so
`computedUses` narrowing was effectively disabled for most of the component tree.

### Example

```xml
<Component name="DataView">
  <script>
    function loadData()      { fetchItems(apiUrl); }
    function handleSelect(x) { selectedItem = x; }
  </script>

  <!-- ① Only reads {items} — never calls any function -->
  <Select testId="items-select">
    <Items data="{items}">
      <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>

  <!-- ② Calls handleSelect -->
  <Button onClick="handleSelect($item)">Select</Button>
</Component>
```

Before: `Select` ① had no `computedUses` → re-rendered on every state change.  
After: `Select` ① gets `computedUses = ['items']` → skips re-renders for unrelated changes.

## Key Insight

`parentFunctionNames` is already threaded through `computeUsesInternal`.  After collecting
`parentDependencies` for a container we check:

```
dependsOnParentFunction = parentDependencies ∩ parentFunctionNames ≠ ∅
```

If empty → the container never calls any function with opaque bodies → safe to narrow.

### Critical distinction: own script vs inherited flag

A node with its **own** `<script>` / code-behind must still be blocked even if it doesn't
call parent functions — its own function bodies may read parent state vars not in the
template.  Only a node that **inherits** `nextDisableNarrowing=true` from an ancestor,
without having its own script, is safe when `dependsOnParentFunction = false`.

## Implementation

`src/components-core/optimization/computedUses.ts`:

```ts
// New variable — separates own-script from inherited flag
const ownHasScript = !!node.scriptCollected || hasCodeBehind;
const nextDisableNarrowing = disableNarrowing || ownHasScript;  // propagation unchanged

// ...child processing unchanged...

const dependsOnParentFunction = parentFunctionNames.size > 0 &&
  [...parentDependencies].some(d => parentFunctionNames.has(d));

// Safe to narrow when:
//   a) narrowing never disabled (original path), OR
//   b) narrowing disabled by an ancestor, but this node has no own script and
//      doesn't call any parent function — function bodies are irrelevant here
const safeToNarrow = !nextDisableNarrowing || (!ownHasScript && !dependsOnParentFunction);

if (node.uses === undefined && parentDependencies.size > 0 && safeToNarrow) {
  const computedUsesSet = dependsOnParentFunction
    ? new Set([...parentDependencies, ...parentFunctionNames])
    : parentDependencies;
  node.computedUses = Array.from(computedUsesSet);
}
```

## Safety Matrix

| Scenario | `ownHasScript` | `dependsOnParentFunction` | Narrowed? | Correct? |
|---|---|---|---|---|
| No script, reads only reactive vars | false | false | ✅ Yes | ✅ |
| No script, calls parent function | false | true | ❌ No | ✅ |
| Own `<script>`, reads parent var, no parent function call | true | false | ❌ No | ✅ own fns may read more |
| Own `<script>`, calls parent function | true | true | ❌ No | ✅ |
| Inherits disabled narrowing; fn also reads same var internally | false | false | ✅ Yes | ✅ template analysis of THIS node only matters |

## Where `<script>` Can Appear

`<script>` is hoisted to the root `ComponentDef` by `hoistScriptCollectedFromFragments`
in `transform.ts`.  After parsing, `scriptCollected` exists **only on the root component
node** — no nested `<Stack>`, `<Select>`, `<Button>` ever has it.  Therefore `ownHasScript`
is true only on the compound component root; all built-in children have `ownHasScript =
false` and benefit from the new optimization.

Exception: a `<script>` referencing `$item`/`$itemIndex` is not hoisted and stays on its
Fragment (iterative context).

## What Remains Unoptimized

Containers that call parent functions — their function bodies may read hidden state.
Full fix requires AST-level analysis of function bodies (call graphs, closures,
cross-file `.xs` imports) — a separate, higher-complexity effort.

---

## Пов'язані файли

| Файл | Роль |
|------|------|
| `xmlui/src/components-core/prepare/computedUses.ts` | Фікс: `hasCodeBehind` в `nextDisableNarrowing` |
| `xmlui/src/components-core/StandaloneApp.tsx` | Merge code-behind → `node.functions` (рядки 733–746, 753) |
| `myworkdrive/src/components/shared/PageToolbar.xmlui` | Компонент де баг проявлявся |
