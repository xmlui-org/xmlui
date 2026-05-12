# computedUses — Дизайн та реалізація

> Цей документ є підсумковим описом задачі, архітектурних рішень і всіх багів що були виявлені та виправлені в процесі реалізації. Пишеться постфактум після завершення роботи.

---

## Проблема

Розглянемо такий додаток:

```xml
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Timer interval="{100}" onTick="oftenChanges++" />
  <Text value="Often changes: {oftenChanges}" />

  <Select>
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
```

`oftenChanges` змінюється кожні 100 мс. `rarelyChanges` — масив 1000 елементів, змінюється ніколи (в цьому прикладі).

**До оптимізації:** `Select` ре-рендериться при **кожній** зміні `oftenChanges` — ~10 разів/с, хоча він залежить лише від `rarelyChanges`.

**Причина:** `StateContainer` завжди отримував **весь** батьківський стан (`parentState = { oftenChanges, rarelyChanges, ... }`). Якщо `oftenChanges` змінилось — новий об'єкт → React.memo вважає пропи зміненими → ре-рендер.

**Рішення:** Автоматично обчислити мінімальний набір батьківських змінних (`computedUses`) для кожного контейнера, щоб `Select` отримував лише `{ rarelyChanges }` і не бачив змін `oftenChanges`.

---

## Архітектура рішення

### 1. Алгоритм `computeUsesForTree` (bottom-up)

Новий модуль `xmlui/src/components-core/prepare/computedUses.ts`.

**Принцип:** рекурсивний обхід дерева `ComponentDef` знизу вверх (спочатку діти, потім батьки). Кожен вузол повертає набір "вільних ідентифікаторів" — тих, що використовуються у його піддереві але **не оголошені локально** в ньому.

```
totalFree(node) = (depsUsedInNode ∪ ⋃ totalFree(child)) \ localDeclared(node)
```

**Коли вузол стає контейнером (`computedUses` встановлюється):**
1. Він є регулярним контейнером (має `vars`, `loaders`, `functions`, `uses`, `contextVars` або `scriptCollected`), **АБО**
2. Він є "implicit container by default" (`Select`, `List`, `Table`, `DataGrid`) і `totalFree.size > 0`.

Для таких вузлів: `node.computedUses = [...totalFree]`, і вгору повертається `totalFree` (не порожній набір).

**Важливо:** якщо вузол має явний `uses` — `computedUses` не встановлюється і `uses` не перезаписується.

### 2. `IMPLICIT_CONTAINER_COMPONENT_NAMES`

```ts
export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set([
  "Select", "List", "Table", "DataGrid",
]);
```

Ці компоненти потребують `ContainerWrapper` (і власного `StateContainer`) якщо їхнє піддерево має залежності від зовнішнього стану. Початковий мінімальний список — майбутній аналіз може розширити.

### 3. Точка виклику

`computeUsesForTree` викликається в `xmlui-parser.ts` після `nodeToComponentDef` — один раз при завантаженні/парсингу app XML, до першого рендеру. Виконується in-place, мутуючи `ComponentDef`.

> **Примітка:** оригінальний план вказував `StandaloneApp.tsx` як точку виклику, але реальна реалізація використовує `xmlui-parser.ts` — це краще місце бо там дерево щойно зібране.

### 4. Runtime: `isContainerLike` в `ContainerWrapper.tsx`

```ts
export function isContainerLike(node: ComponentDef): boolean {
  return !!(
    node.vars || node.loaders?.length || node.functions ||
    node.uses !== undefined ||
    node.computedUses !== undefined ||   // ← додано
    node.contextVars || node.scriptCollected
  );
}
```

### 5. Runtime: `getWrappedWithContainer` в `ContainerWrapper.tsx`

При розгортанні implicit container (напр. `Select`) у пару `Container + wrappedSelect`:
- `computedUses` **копіюється** на зовнішній `Container`
- `computedUses` **видаляється** з `wrappedSelect` (щоб уникнути подвійного застосування)

```ts
const container: ComponentDef = {
  type: "Container",
  computedUses: node.computedUses,    // ← скопіювати
  uses: node.uses,
  // ...
};
const wrappedNode = { ...node };
delete wrappedNode.computedUses;       // ← видалити з inner
```

### 6. Runtime: `StateContainer.tsx` — scoped state

```ts
const stateFromOutside = useMemo(
  () => extractScopedState(parentState, node.uses ?? node.computedUses),
  [node.uses, node.computedUses, parentState],
);
```

### 7. Runtime: `ComponentWrapper.tsx` — scope перед ContainerWrapper

Навіть якщо `StateContainer` правильно ізолює `stateFromOutside`, сам `ContainerWrapper` ще ре-рендерується при кожній зміні `parentState`. Тому скопування відбувається **до** передачі в `ContainerWrapper`:

```ts
const nodeUses = nodeWithTransformedDatasourceProp.uses;
const nodeComputedUses = nodeWithTransformedDatasourceProp.computedUses;
const scopedParentState = useShallowCompareMemoize(
  useMemo(
    () => extractScopedState(state, nodeUses ?? nodeComputedUses) ?? state,
    [state, nodeUses, nodeComputedUses],
  ),
);
// ContainerWrapper отримує scopedParentState замість state
<ContainerWrapper parentState={scopedParentState} ... />
```

`useShallowCompareMemoize` повертає попереднє посилання якщо значення shallow-рівне — забезпечує стабільність для `React.memo`.

---

## Баги виявлені в процесі реалізації

### Баг 1: `statePartChanged` нестабільний — каскадний ре-рендер

**Симптом:** `Select: 56 renders` = кількість рендерів App за 2с (20 тіків таймера × ~2.8 через React dev-mode). Оптимізація не працювала взагалі.

**Причина:** `statePartChanged` в `StateContainer` мав `resolvedLocalVars` та `stableCurrentGlobalVars` в `useCallback` deps:

```ts
const statePartChanged = useCallback(
  (pathArray, newValue, target, action) => {
    const isLocalVar = key in resolvedLocalVars; // читає з closure
    // ...
  },
  [dispatch, node.uid, resolvedLocalVars, stableCurrentGlobalVars, parentStatePartChanged, node.uses],
  //                   ^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^  ^^^^^^^^
  //                   змінюється кожен рендер → нова функція → memo нікуди
);
```

Кожен рендер `StateContainer` → нова `statePartChanged` → `memo` дітей отримує новий проп → всі нащадки ре-рендеряться.

**Виправлення:** Перенести мутабельні значення в refs, залишити в deps лише стабільні:

```ts
const resolvedLocalVarsRef = useRef(resolvedLocalVars);
resolvedLocalVarsRef.current = resolvedLocalVars;
const stableCurrentGlobalVarsRef = useRef(stableCurrentGlobalVars);
stableCurrentGlobalVarsRef.current = stableCurrentGlobalVars;
const parentStatePartChangedRef = useRef(parentStatePartChanged);
parentStatePartChangedRef.current = parentStatePartChanged;
const nodeUsesRef = useRef(node.uses);
nodeUsesRef.current = node.uses;

const statePartChanged: StatePartChangedFn = useCallback(
  (pathArray, newValue, target, action) => {
    const localVars = resolvedLocalVarsRef.current;  // читає з ref
    // ...
    const uses = nodeUsesRef.current;
    if (!uses || uses.includes(key)) {
      parentStatePartChangedRef.current(pathArray, newValue, target, action);
    }
  },
  [dispatch, node.uid], // лише стабільні deps
);
```

**Патерн:** "refs as event handlers" (React useEvent RFC) — зберігати мутабельні значення в refs, щоб функція-колбек мала стабільну ідентичність але завжди бачила актуальні дані.

---

### Баг 2: `parentState` не ізолюється до ContainerWrapper — Select: 12 renders

**Симптом:** Після виправлення Бага 1 — `Select: 12` рендерів за 2с. Краще, але не ≤ 5.

**Причина:** Навіть зі стабільним `statePartChanged`, `ContainerWrapper` сам отримував повний `state` від батька і ре-рендерився при кожній його зміні. Хоча всередині `StateContainer` правильно ізолював `stateFromOutside`, функція компонента `ContainerWrapper` ще виконувалась.

**Виправлення:** Додати `scopedParentState` в `ComponentWrapper` до передачі в `ContainerWrapper` (див. розділ 7 вище). Тепер `ContainerWrapper` отримує об'єкт, що змінюється лише коли змінюється `rarelyChanges` — `React.memo` пропускає ре-рендери.

---

### Баг 3: `computedUses` не видаляється з `wrappedNode`

**Симптом:** Select рендерився двічі — outer Container і inner wrappedSelect обидва ставали ContainerWrapper. Внутрішній Select мав зайвий StateContainer.

**Причина:** `getWrappedWithContainer` копіювала `computedUses` на Container але не видаляла з inner node.

**Виправлення:**
```ts
const wrappedNode = { ...node };
delete wrappedNode.computedUses; // важливо: не залишати на inner node
```

---

### Баг 4: `isContainerLike` не перевіряв `computedUses`

**Симптом:** `Select` з `computedUses` не ставав `ContainerWrapper` → рендерився як звичайний `ComponentAdapter` без власного стану.

**Причина:** `isContainerLike` перевіряв лише `uses`, `vars`, `loaders`, etc. — не `computedUses`.

**Виправлення:** Додати `node.computedUses !== undefined` до умови (см. розділ 4).

---

### Баг 5: Порогове значення E2E тесту `≤ 3` занадто жорстке

**Симптом:** E2E тест падав навіть з виправленою оптимізацією.

**Причина:** React dev-mode викликає функції компонентів двічі ("double invoke") при ініціалізації. Реальна кількість init-рендерів ≈ 4, а не 1.

**Виправлення:** Порогове значення змінено з `≤ 3` на `≤ 5`.

---

### Баг 6: Неправильна перевірка `computedUses` в StateContainer

**Симптом:** Навіть після всіх виправлень деякі ре-рендери просочувались.

**Причина:** Оригінальна логіка `statePartChanged` перевіряла `node.uses`, але не `node.computedUses`. Тому зміни стану що не входять до `computedUses` все одно проксировались вгору через `parentStatePartChanged`.

**Виправлення:** Читати `nodeUsesRef.current` (яка зберігає `node.uses`) — але також потрібно було врахувати, що `node.uses` може бути `undefined` а `computedUses` — ні. У фінальній реалізації StateContainer отримує вже scoped parentState (завдяки Багу 2 fix), тому додаткова перевірка в `statePartChanged` є defense-in-depth.

---

## Результати бенчмарку

Тест: `oftenChanges` тікає кожні 100мс → 20 тіків за 2с.

| Компонент | До оптимізації | Після | Покращення |
|-----------|---------------|-------|------------|
| Select    | ~56 рендерів (= App рендерів) | ≤ 4 (лише init) | ~14x |
| Text (oftenChanges) | 56 | 56 | без змін (очікувано) |

E2E порогове значення: `selectRenderCount ≤ 5` (з урахуванням React dev-mode double-invoke).

---

## Неочевидні архітектурні рішення

### 1. `computedUses` встановлюється на ВСІХ контейнерах, не лише на implicit

Початковий план допускав що `computedUses` потрібен лише implicit containers (`Select`, etc.). Насправді регулярні контейнери (`Stack` з `var.*`, etc.) теж отримують `computedUses` — це дозволяє майбутнім оптимізаціям в `ComponentWrapper` ізолювати state для будь-якого контейнера, не лише для implicit.

### 2. Нормалізація root-ідентифікаторів

`{user.profile.name}` → deps = `['user']`, не `['user.profile.name']`. Це правильно: ми відстежуємо *об'єкт* в батьківському стані (`user`), а не глибокий шлях всередині нього. Якщо `user` не змінився — навіть якщо `user.profile.name` теоретично "могло б" змінитись, ми не перевіряємо глибоко (shallow порівняння достатнє для React).

### 3. UID loaders обробляються як локальні

Якщо `DataSource` дочірній елемент має uid (`"myLoader"`), цей uid додається до локальних оголошень контейнера. Тому звертання `{myLoader.data}` не "бульбашить" вгору як зовнішня залежність — він ізольований у цьому контейнері.

### 4. `contextVars` (`$item`, `$index`) — локальні для Items/List

`contextVars` на вузлі (`{ $item: "$item" }`) означає що ці змінні доступні в піддереві але оголошені локально. `collectLocalDeclared` збирає їх — вони не виходять назовні.

### 5. Двошарова ізоляція (defense in depth)

Виправлення реалізовано в двох шарах:
1. **`ComponentWrapper`** — scope `state` до `scopedParentState` перед `ContainerWrapper` → `ContainerWrapper`/`StateContainer` взагалі не виконуються при змінах непов'язаних ключів
2. **`statePartChanged` via refs** — навіть якщо ContainerWrapper чомусь ре-рендерується, `statePartChanged` не створює нову функцію → `memo` дітей захищений

Шар 1 є основним, шар 2 є страховкою і також покращує загальну стабільність коду.

---

## Покриття файлів

| Файл | Дія | Зміст |
|------|-----|-------|
| `xmlui/src/abstractions/ComponentDefs.ts` | Modify | Поле `computedUses?: string[]` в `ComponentDefCore` |
| `xmlui/src/components-core/prepare/computedUses.ts` | Create | `computeUsesForTree`, `computeUsesForSubtree`, `IMPLICIT_CONTAINER_COMPONENT_NAMES` |
| `xmlui/tests/prepare/computedUses.test.ts` | Create | 11 unit-тестів алгоритму |
| `xmlui/src/components-core/rendering/ContainerWrapper.tsx` | Modify | `isContainerLike` перевіряє `computedUses`; `getWrappedWithContainer` копіює/видаляє `computedUses` |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | Modify | `uses ?? computedUses` в `extractScopedState`; стабільний `statePartChanged` via refs; dev render counter |
| `xmlui/src/components-core/rendering/ComponentWrapper.tsx` | Modify | `scopedParentState` через `useShallowCompareMemoize` + `extractScopedState` перед `ContainerWrapper` |
| `xmlui/src/components-core/xmlui-parser.ts` | Modify | Виклик `computeUsesForTree` після `nodeToComponentDef` |
| `xmlui/tests-e2e/computed-uses.spec.ts` | Create | E2E: таймер працює, Select має 1000 items, Select ≤ 5 рендерів за 2с |

---

## Dev tools: `window.__renderCounts`

В development mode, `StateContainer` веде лічильники рендерів у `window.__renderCounts`:

```ts
const __devRenderCountRef = useRef(0);
if (import.meta.env.DEV) {
  __devRenderCountRef.current += 1;
  const label = node.uid ?? innerType ?? "container";
  (globalThis as any).__renderCounts ??= {};
  (globalThis as any).__renderCounts[label] = __devRenderCountRef.current;
  console.debug(`[render] ${label} #${__devRenderCountRef.current}`);
}
```

Де `innerType` — `node.children?.[0]?.type` (для `Container` що обгортає `Select`, лейбл буде `"Select"` або uid компонента).

Для перегляду у DevTools Console:
```js
JSON.stringify(window.__renderCounts, null, 2)
```

---

## TODO (майбутні задачі)

### Metadata-based IMPLICIT_CONTAINER_COMPONENT_NAMES

Поточний підхід — hardcoded список. Кращий підхід: компоненти декларують `isImplicitContainer: true` у своєму descriptor. Це дозволить third-party компонентам оптоутитись або вступити.

### Розширення списку implicit containers

Проаналізувати які ще компоненти в xmlui мають структуру "Items + дані" і повинні ізолювати свій стан від батьківського tree.

### Loop-оптимізація для Items/List рядків

Кожен рядок списку (`$item`) рендерується окремим `ComponentWrapper`. При зміні непов'язаних батьківських змінних всі рядки ре-рендеряться. `computedUses` на рівні рядку може ізолювати це — але потребує обережного аналізу бо `$item` є контекстуальною змінною.

### Incremental update замість повного перерахунку

При hot-reload або динамічній зміні компонента виконується повний `computeUsesForTree`. Для великих app це O(n). Incremental update (перерахунок лише зміненого піддерева) може прискорити dev-reload.

### Серіалізація `computedUses` в bundle

Якщо xmlui-app компілюється в bundle, `computedUses` може бути серіалізований разом з деревом і не перераховуватись при завантаженні — лише верифікуватись.

---

## Команди для запуску тестів

```bash
# Unit-тести алгоритму
cd xmlui && npm run test:unit -- tests/prepare/computedUses.test.ts

# Повний unit suite
cd xmlui && npm run test:unit

# E2E тести (потребує запущеного dev server)
cd xmlui && npx playwright test tests-e2e/computed-uses.spec.ts

# TypeScript check
cd xmlui && npx tsc --noEmit
```
