# Hardcoded Brittle Spots in `computedUses.ts`

A catalog of places where the optimizer (`xmlui/src/components-core/optimization/computedUses.ts`) is currently coupled to specific string names. Each spot is a maintenance risk: adding a new component or renaming an existing concept can silently break the optimization without any compile-time error.

**Status after 2026-05-20 refactoring:**
Currently, there are **1** remaining hardcoded spots in `computedUses.ts`.

---

## 1. `IMPLICIT_CONTAINER_COMPONENT_NAMES`

```typescript
// computedUses.ts ~L64
export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", "Table", "DataGrid"]);
```

Used twice in `computeUsesInternal`:
- To add a component's own UID to `parentDependencies` so siblings can read its bubbled state.
- To decide `isImplicitDefault` (whether a component with free vars should be promoted to an implicit container).

### Risk
Every new component that should behave like `Select`/`List` (i.e., an internally-stateful
list-like component) must be manually added here. Omission means the component never gets
the narrowing optimization, silently degrading performance — no error is thrown.

### Proposed fix
Add `isImplicitContainerByDefault: true` to `createMetadata()`. The optimizer reads
this flag from the component registry instead of checking a hardcoded Set. The constant
`IMPLICIT_CONTAINER_COMPONENT_NAMES` can then be deleted.

---

## 2. `PARENT_STATE_DYNAMIC_VARS` / `$context` ✅ **RESOLVED**

```typescript
// computedUses.ts ~L164
const PARENT_STATE_DYNAMIC_VARS = new Set(["$context"]);
```

Ця змінна народжується як `undefined` до моменту першого `openAt()`, проте живе саме у глобальному/батьківському стейті (не плутати з locally injected Runtime Context Vars, як `$item`). 

**Чому тут присутній хардкод:**
Цей фільтр життєво необхідний для захисту **Легких Контейнерів (Regular Containers)**. Якщо звичайний компонент, що став контейнером завдяки власному `var.X`, використовує `{$context}`, алгоритм вважатиме `$context` зовнішньою залежністю. Без цього фільтру оптимізатор ізолює такий контейнер (бо інших зовнішніх залежностей може не бути), а оскільки `$context` на старті порожній, контейнер обрізає до себе *весь* батьківський стейт (`{}`). Як наслідок, він "осліпне" до API усіх сусідніх компонентів, що реєструються у батьківському дереві. Фільтр усуває `$context` з розрахунків `nonDynamicReadDeps`, дозволяючи такому компоненту отримати повний незвужений стейт.
*(Примітка: для важких компонентів цей фільтр скасовується, оскільки вони підвищуються до контейнерів завжди, і `$context` їм додається примусово для ввімкнення реактивності).*

### Risk
Any new component that writes a `$`-prefixed variable into the parent state via
implicit dispatch must be manually added here. Omission means that the optimizer
filters the variable out, the ancestor container becomes memo-blocked when it changes,
and the UI stops reacting to those state updates (the exact bug `$context` was added to fix).

### Proposed fix
**Lexical Scoping (Static Analysis of Scopes):** 
Замість хардкоду або маскування новими метаданими, необхідно навчити статичний аналізатор розпізнавати `$`-змінні "по-справжньому", як це роблять компілятори — за допомогою стеку областей видимості:
1. Запровадити механізм `injectedContextVars Stack` під час спадного обходу дерева `computeUsesInternal()`.
2. Компоненти на кшталт `List` або `Table` реєструватимуть свої локальні змінні (напр. `$item`, `$index`) у цьому стеку перед викликом обробки своїх `children`.
3. Стикаючись з будь-якою `$`-змінною всередині виразів, аналізатор має шукати її в цьому стеку локальних змінних.
   - Якщо її **знайдено**, змінна ігнорується (бо вона гарантовано створюється локально під час рендеру і її не треба брати ззовні).
   - Якщо її **НЕ знайдено** (як `$context`), аналізатор точно знає, що вона потрапляє сюди як глобальна/батьківська мутація стейту. Тоді вона записується в `computedUses`.
4. Впровадження цього механізму дозволяє повністю викинути хардкод `PARENT_STATE_DYNAMIC_VARS` (`$context`) та функцію `isRuntimeContextVar`. Всі існуючі та майбутні системні змінні розраховуватимуться автоматично та безпомилково (алгоритмічна складність перевірки в стеку на базі Set залишається O(1), без втрати швидкодії).

---

## 3. Loader type checks + `DATA_FETCH_HANDLER_INJECTED_KEYS` ✅ **RESOLVED**

```typescript
// computedUses.ts ~L292 & ~L315
const isDataLoader = node.type === "DataLoader" || node.type === "DataSource";
// ...
if (isDataLoader && key === "fetch" && raw != null) {
  // filter out DATA_FETCH_HANDLER_INJECTED_KEYS
}
```

```typescript
// computedUses.ts ~L172
const DATA_FETCH_HANDLER_INJECTED_KEYS = new Set([
  "$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams",
]);
```

This is the "Bug 21" workaround (fully detailed in `event-context-shadowing-proposal.md`).
The optimizer detects a specific component type *by name* and a specific event *by name*
to apply special filtering for locally injected variables that collide with global routes.

### Risk
- If `DataLoader` or `DataSource` is renamed, the guard silently stops working.
- If a new loader component (e.g., `GraphQLLoader`) also injects `$queryParams` into
  its handler, this workaround must be manually duplicated for that new type.
- If the event is renamed from `"fetch"` to anything else, the guard silently stops working.

### Proposed fix
**Lexical Scoping + Event Metadata:**
Це ідеально лягає в парадигму **Лексичного сканування**, запропоновану в пункті 2, і вирішує цю проблему автоматично:
- Слід додати поле `injectedVars: string[]` до `EventDescriptor` у метаданих компонента (оскільки ці змінні інжектяться лише в межах одного конкретного евента, як-от `onFetch`).
- Під час обходу AST конкретного обробника подій, аналізатор забирає `injectedVars` з метаданих і **кладе їх у свій стек локальних областей видимості (Lexical Scope Stack)**.
- Будь-які входження `$queryParams` чи `$requestBody` всередині коду цього обробника будуть знайдені в локальному стеку і успішно проігноровані оптимізатором. Жодної колізії з глобальним `$queryParams` роутера не виникне.
- Це дозволяє назавжди і безпечно видалити `DATA_FETCH_HANDLER_INJECTED_KEYS`, `isDataLoader` та хардкод перевірки події `key === "fetch"`.

---

## Summary

| # | Constant / Check | Risk if forgotten | Fix strategy |
|---|---|---|---|
| 1 | `IMPLICIT_CONTAINER_COMPONENT_NAMES` | New list-like component silently skips optimization | `isImplicitContainerByDefault` metadata flag |
| 2 | `PARENT_STATE_DYNAMIC_VARS` (`$context`) | New dispatch var stops triggering re-renders | Lexical Scoping stack in AST traversal |
| 3 | `isDataLoader` + `"fetch"` + injected keys | New loader gets no `$queryParams` protection | Lexical Scoping stack + `EventDescriptor.injectedVars` |

---

## Testing Strategy for Lexical Scoping Refactoring

To ensure the iterative implementation of Lexical Scoping remains regression-free, the testing plan must prioritize the following:

### 1. Critical Test Types
- **Unit Tests (`computedUses.test.ts`):** *Highest Priority.* Since `computedUses` is a pure static analyzer, we can construct virtual component metadata (`injectedVars: ['$queryParams']`) and verify the output arrays match expected dependencies without spinning up React.
- **E2E Tests:** *Second Priority.* Verifying the exact "Bug 21" scenario (a `DataLoader` that reads `$queryParams` inside `onFetch`) to ensure it does not re-render when global route params change, but **does** re-render if it references a valid parent state variable.
- **Extension Simulation:** Adding a mock standalone component in the unit tests that declares `injectedVars: ["$customToken"]` to prove the optimization works mechanically without hardcoded lists.

### 2. Highest Risk Scenarios (Regression Hotspots)
- **Scope Leakage (Missing Pops):** If the traversal does not properly `pop()` the stack after exiting an `onFetch` handler or a `List`, subsequent siblings will incorrectly inherit that local scope, hiding their legitimate global dependencies. Sibling separation is the #1 risk.
- **Deep Nesting & Shadowing:** A `DataLoader` nested inside a `List` nested inside another `List`. The stack must accurately handle multiple layers of `injectedVars` and shadow them cleanly over global scope.
- **Event Handler Context vs Parent Context:** Ensuring that `$context` (global) mixed with `$queryParams` (local to `onFetch`) inside the same event handler correctly ignores the latter but includes the former in `computedUses`.

