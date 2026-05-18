# Code Review: гілка `yurii/computedUses` vs `main`

> Дата аналізу: 2026-05-15  
> Дата оновлення: 2026-05-16 (позначено статус виправлень)  
> Порівняння: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD  
> Обсяг: 48 комітів, ~3360 рядків змін у production-коді  
> Фокус: performance regressions, reference-identity issues, критичні баги, дублювання

---

## 🔴 Performance regressions

### ✅ P1 (MEDIUM): зайвий `{...spread}` на кожному рендері в Container — **ВИПРАВЛЕНО**

`xmlui/src/components-core/rendering/Container.tsx:154`

```tsx
const stateRef = useRef(
  fullParentState ? { ...fullParentState, ...componentState } : componentState,
);
```

**Проблема:** `useRef(initial)` використовує свій аргумент лише на першому рендері, але JavaScript обчислює цей аргумент на кожному рендері. Тобто на кожному рендері `Container` створює і одразу викидає об'єкт `{ ...fullParentState, ...componentState }`. Коли `fullParentState` має 50–100 ключів — це не безкоштовно.

До цієї гілки було просто `useRef(componentState)` (без spread). Це регресія для всіх контейнерів, де `computedUses` активований (бо для тих, де `fullParentState === undefined`, spread не відбувається).

**Застосований фікс — cheap lazy init:**
```tsx
const stateRef = useRef<Record<string, any>>(componentState);
// layout effect виконує merge перед paint
```
Layout effect у `useIsomorphicLayoutEffect` виконує `{ ...fp, ...componentState }` перед першим paint — merge відбувається рівно один раз, не на кожному рендері.

---

### ✅ P2 (LOW-MED): `useShallowCompareMemoize` запускається навіть коли скоупінгу немає — **ВИПРАВЛЕНО**

`xmlui/src/components-core/utils/hooks.tsx:179`

```tsx
const scopedParentState = useShallowCompareMemoize(
  useMemo(
    () => extractScopedState(state, nodeUses ?? nodeComputedUses) ?? state,
    [state, nodeUses, nodeComputedUses],
  ),
);
```

Запускається для **кожного** `ComponentWrapper`, навіть коли `nodeUses` і `nodeComputedUses` обидва `undefined`. У цьому випадку:
- `extractScopedState` повертає `state` без змін (O(1))
- але `useShallowCompareMemoize` робив **O(N) shallowCompare** на `state` кожен рендер

Для дерева з 200 ComponentWrapper × 50 ключів стейту = 10 000 порівнянь на тік. Раніше цього коду взагалі не було.

**Застосований фікс — reference-identity fast-path:**
```tsx
// value !== ref.current guard skips O(N) shallowCompare when the same object is passed
if (value !== ref.current && !shallowCompare(value, ref.current)) {
  ref.current = value;
  signalRef.current++;
}
```
Коли `extractScopedState` повертає те саме посилання `state` (найпоширеніший кейс без скоупінгу), `value === ref.current` → shallowCompare повністю пропускається.

---

### P3 (LOW): подвійна робота `extractScopedState`

`ComponentWrapper` обрізає state до `scopedParentState`, передає його як `parentState` у `StateContainer`, який **знову** запускає `extractScopedState(parentState, node.uses ?? node.computedUses)` на вже обрізаному стейті:

`xmlui/src/components-core/rendering/StateContainer.tsx:166-170`

Через мемоізацію в типовому циклі (де `parentState` стабільний) ця подвійна робота не виконується — memo повертає попередній ref. Але при кожній справжній зміні скоупленого зрізу — обидва виклики запускаються. Дріб'язок, але архітектурно надлишково.

---

## 🟠 Reference-identity / props vs refs

### R1 (✅ зроблено правильно): `fullParentStateRef`, `statePartChanged`

- `xmlui/src/components-core/rendering/ComponentWrapper.tsx:105-106` — `MutableRefObject` замість value-prop. Правильно.
- `xmlui/src/components-core/rendering/StateContainer.tsx:439-447` — `resolvedLocalVarsRef`, `stableCurrentGlobalVarsRef`, `parentStatePartChangedRef`, `nodeUsesRef` стабілізують `statePartChanged`. Deps зменшилися з 7 до `[dispatch, node.uid]`. Правильно.

---

### R2 (⚠️ note): render-phase мутація рефа

`xmlui/src/components-core/rendering/ComponentWrapper.tsx:106`

```tsx
fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;
```

Side-effect під час рендеру. React 18 strict mode подвоює рендер — присвоєння ідемпотентне, ОК. Concurrent rendering може перервати рендер — на retry присвоюється те саме (бо `state` приходить такий самий). Для поточного React 18 — безпечно. Але React документація позначає render-phase side effects як "avoid", бо може несподівано поводитись у майбутньому з React Cache / Server Components.

---

### R3 (📝 minor): dev-only лічильник рендерів мутує `globalThis` в рендері

`xmlui/src/components-core/rendering/StateContainer.tsx` — секція DEV-ONLY RENDER-COUNT PROFILER:

```tsx
if (process.env.NODE_ENV === "development") {
  renderCountRef.current += 1;
  (globalThis as any).__renderCounts[label] = renderCountRef.current;
}
```

У strict mode React подвоює кількість рендерів → лічильник у 2× завищений. Прод не зачіпає (`process.env.NODE_ENV === "development"` — мертвий код у prod build).

---

## 🟥 Потенційні баги

### B1 (⚠️ subtle): стале значення `fullParentState` у Container, якщо memo заблокував рендер

`stateRef.current` оновлюється в layout effect (`Container.tsx:157-160`) тільки коли `Container` ре-рендериться. Якщо `computedUses` працює (Container memo'd і **не** ре-рендериться при тіку `oftenChanges`), то `stateRef.current.oftenChanges` лишається старим.

**Сценарій:** event handler у Select **читає** `oftenChanges` → бачить старе значення.

Це коректно **тільки якщо** статичний аналіз гарантовано вловлює всі READ-доступи. `gatherIdentifiers` (`visitors.ts:425-440`) — fallback walk без scope tracking: param-імена функцій теж туди потрапляють (false positives → надмірне підписання, не баг). Але є випадки, де static analysis **пропустить**: динамічний доступ (`state[key]`), computed property names, eval-подібні конструкції. У таких випадках handler читатиме застаріле значення тихо — **silent staleness bug**.

**Рекомендація:** документувати в specs, що `fullParentStateRef` — write-only safety net (reads через нього можуть бути stale). Або додати invalidation: прямо перед eval оновлювати stateRef з найсвіжіших рефів:
```tsx
// у runCodeAsync/runCodeSync перед виконанням коду:
stateRef.current = { ...fullParentStateRef.current, ...componentStateRef.current };
```

---

### ✅ B2 (⚠️): дві різні дефініції "контейнер" — розбіжність runtime vs static analysis — **ВИПРАВЛЕНО**

Runtime, `ContainerWrapper.tsx:65-72`, `isContainerLike`:
```ts
return !!(node.loaders || node.vars || node.uses || node.computedUses || node.contextVars || node.functions || node.scriptCollected);
```

Static analysis, `computedUses.ts`, `isKnownContainer`:
```ts
const isKnownContainer = !!(
  (node.vars && Object.keys(node.vars).length > 0) ||
  (node.loaders && node.loaders.length > 0) ||
  (node.functions && Object.keys(node.functions).length > 0) ||
  node.uses !== undefined ||
  node.contextVars ||
  node.scriptCollected
);
```

**Різниця:** `node.vars = {}` (порожній об'єкт) → runtime каже "контейнер", static analysis каже "ні". Це навмисний фікс для синтетичних `{}` зі StandaloneApp merge (порожній merge не робить компонент "справжнім" контейнером). Але створювало **архітектурну невідповідність**.

**Застосований фікс — єдина функція `isContainerLike` у `ContainerUtils.ts`:**

```ts
// ContainerUtils.ts — single source of truth
export function isContainerLike(node, options = {}) {
  if (node.type === "Container") return true;
  const { strict = false, ignoreComputedUses = false } = options;
  // strict=true: empty vars/loaders/functions do NOT count as container
  // ignoreComputedUses=true: used by the analyser itself (avoids chicken-and-egg)
  ...
}
```

- `ContainerWrapper.tsx` → `isContainerLike(node)` (non-strict, runtime semantics, backwards compatible)
- `computedUses.ts` → `isContainerLike(node, { strict: true, ignoreComputedUses: true })` (strict, no empty-object false-positives)
- Локальні дублікати `isKnownContainer` та `isRegularContainer` у `computedUses.ts` видалено.

---

### B3 (📝): in-place мутація `computedUses` — питання shared ComponentDef

`computeUsesForTree` мутує `node.computedUses` в дереві in-place. Викликається в `xmlui-parser.ts:58` та `StandaloneApp.tsx:722, 750`. Якщо HMR перезавантажує файл і повторно парсить — нове дерево, нові обчислення, ОК. Але якщо десь зберігається ref на старий `ComponentDef` і він повторно проходить через `computeUsesForTree`, старий `computedUses` перезаписується. Конкретного бага зараз немає, але in-place мутація імпортованого об'єкта — pattern, який легко робить shared state issue в майбутньому.

---

## 🧹 Брудний код / дублювання

### ✅ D1 (⚠️ HIGH): дві дефініції "контейнер" — **ВИПРАВЛЕНО** (див. B2)

Найбільший technical debt цієї гілки. Усунуто разом із B2 — єдина функція в `ContainerUtils.ts`.

---

### D2 (✅ виправлено): `depsOfValue` був у двох файлах

`depsOfValue` спочатку дублювався в `collectComponentDefGraph.ts` і потрібний у `computedUses.ts`. У процесі гілки витягнули в `visitors.ts` як іменований export, з `collectComponentDefGraph.ts` видалили. Добре.

---

### D3 (📝): `_savedVarDefs` / `_savedFunctionDefs` — implicit coupling через нетиповані поля

`ContainerWrapper.tsx:234-235` пише:
```ts
if (node.vars) wrappedNode._savedVarDefs = node.vars;
if (node.functions) wrappedNode._savedFunctionDefs = node.functions;
```

`ModalDialog.tsx:158-159` читає:
```tsx
vars={(node as any)._savedVarDefs}
functions={(node as any)._savedFunctionDefs}
```

Прив'язка через underscore-convention + `as any` cast без типізації. Працює, але крихка. Краще — окремий інтерфейс або weak map.

---

### D4 (📝): `ROUTING_STATE_KEYS` — ручний hardcode без compile-time enforcement

`xmlui/src/components-core/state/routing-state.ts:43-48`:
```ts
export const ROUTING_STATE_KEYS = new Set(["$pathname", "$routeParams", "$queryParams", "$linkInfo"]);
```

Якщо `useRoutingParams` додасть новий ключ (наприклад `$searchParams`) — цей Set треба оновити вручну, без compile-time enforcement. Краще деривувати з реального типу або з об'єкту, який повертає хук.

---

### D5 (📝): `JS_STDLIB_GLOBALS` — ручний список ECMAScript-глобалів

50+ імен вручну у `computedUses.ts`. Стабільний список, але новий ECMAScript-глобал (наприклад майбутній `RegExp.escape`) — додавати вручну. Прийнятний trade-off, але не ідеал.

---

### D6 (📝): `gatherIdentifiers` fallback без scope tracking

`xmlui/src/components-core/script-runner/visitors.ts:425-440`

Fallback walk колектить **всі** Identifier-ноди без відстеження scope. `(item) => item.x` дає `{item}` як dep — якщо `item` ще й parent var — контейнер зайво підписується. Не помилка коректності, але **тиха деоптимізація**. Краще логувати в dev-mode, щоб помітити коли `collectVariableDependencies` падає і fallback активується.

---

## 📊 Підсумок

| # | Місце | Проблема | Статус |
|---|---|---|---|
| P1 | `Container.tsx:154` | Wasted O(N) spread на кожному рендері через `useRef(arg)` | ✅ **Виправлено** |
| P2 | `hooks.tsx:179` | O(N) shallowCompare для всіх вузлів без скоупінгу | ✅ **Виправлено** |
| P3 | `ComponentWrapper` + `StateContainer` | Подвійний `extractScopedState` | 🔵 Низький пріоритет, не виправлено |
| R2 | `ComponentWrapper.tsx:106` | Render-phase ref mutation | 📝 Note (React 18 OK, не виправляється) |
| R3 | `StateContainer.tsx` dev profiler | Strict mode подвоює лічильник | 📝 Note (dev only, не критично) |
| B1 | `Container.tsx:161` | Stale `fullParentState` у memo'd Container при READ через dynamic access | ⚠️ Не виправлено — потребує документування |
| B2 | `ContainerWrapper.tsx` vs `computedUses.ts` | Два визначення "контейнер" з різними правилами | ✅ **Виправлено** — єдина `isContainerLike` в `ContainerUtils.ts` |
| B3 | `computedUses.ts` / `StandaloneApp.tsx` | In-place мутація `computedUses` на shared дереві | 📝 Note — потенційний майбутній ризик |
| D1 | = B2 | — | ✅ **Виправлено** разом із B2 |
| D3 | `ContainerWrapper.tsx` ↔ `ModalDialog.tsx` | `_savedVarDefs` без типізації | 🔵 Minor, не виправлено |
| D4 | `routing-state.ts:43` | `ROUTING_STATE_KEYS` ручний hardcode | 🔵 Minor, не виправлено |
| D5 | `computedUses.ts` | `JS_STDLIB_GLOBALS` ручний список | 🔵 Minor, не виправлено |
| D6 | `visitors.ts:425` | `gatherIdentifiers` fallback без scope | 🔵 Minor, не виправлено |

---

## Пріоритет дій

1. ✅ ~~**Негайно:** `Container.tsx` — lazy init для уникнення зайвого spread на кожному рендері~~
2. ✅ ~~**Незабаром:** fast-path `value === ref.current` у `useShallowCompareMemoize` (`hooks.tsx`)~~
3. ✅ ~~**Незабаром:** об'єднати `isContainerLike` (runtime) та `isKnownContainer` (static) в одну функцію~~
4. ⚠️ **Залишається:** B1 — задокументувати що `fullParentStateRef` є write-only safety net; reads через dynamic access (`state[key]`, computed property names) можуть бачити stale значення у memo'd Container
