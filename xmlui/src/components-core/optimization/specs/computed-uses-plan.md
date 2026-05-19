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

Новий модуль `xmlui/src/components-core/optimization/computedUses.ts`.

**Принцип:** рекурсивний обхід дерева `ComponentDef` знизу вверх (спочатку діти, потім батьки). Кожен вузол повертає набір "вільних ідентифікаторів" — тих, що використовуються у його піддереві але **не оголошені локально** в ньому.

```
parentDependencies(node) = (depsUsedInNode ∪ ⋃ parentDependencies(child)) \ localDeclared(node)
```

**Коли вузол стає контейнером (`computedUses` встановлюється):**
1. Він є регулярним контейнером (має `vars`, `loaders`, `functions`, `uses`, `contextVars` або `scriptCollected`), **АБО**
2. Він є "implicit container by default" (`Select`, `List`, `Table`, `DataGrid`) і `parentDependencies.size > 0`.

Для таких вузлів: `node.computedUses = [...parentDependencies]`, і вгору повертається `parentDependencies` (не порожній набір).

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

### Баг 7: `computedUses = []` ламає неявні контейнери — `{mySelect.value}` порожній

**Симптом:** Після вибору опції у `<Select id="mySelect">` — `{mySelect.value}` у сусідньому `Text` показує порожній рядок. Падають усі тести що перевіряють значення Select через uid.

**Причина:** Тест-wrapper `initTestBed` обгортає кожну розмітку в `<Fragment var.testState="{null}">`. Цей Fragment є контейнером (має `vars`) з `parentDependencies = {}`. Алгоритм встановлював `computedUses = []` (порожній масив). Порожній масив — **falsy is false**, тобто `node.computedUses = []` є truthy і `isContainerLike` повертає true — навіть коли в цьому немає потреби. Але головне: `extractScopedState(state, [])` повертає `{}`, повністю ізолюючи Fragment від батьківського стейту. Через це:

1. ComponentWrapper для Fragment-wrapper передає `scopedParentState = {}` до ContainerWrapper
2. StateContainer Fragment має `stateFromOutside = {}` — порожній!
3. Fragment є `isImplicit = true` → `dispatch = parentDispatch` (App-рівня) → `COMPONENT_STATE_CHANGED` від Select іде до App, але Fragment не бачить App-стейт
4. `{mySelect.value}` у Text не може прочитати значення — воно в App-стейті, а Fragment ізольований

**Виправлення:** Встановлювати `computedUses` тільки коли `parentDependencies.size > 0`. Порожній `computedUses = []` семантично еквівалентний явному `uses = []` (повна ізоляція) і ламає неявні контейнери що мають отримувати повний батьківський стан.

```ts
if (node.uses === undefined && parentDependencies.size > 0) {  // додано: && parentDependencies.size > 0
  node.computedUses = Array.from(parentDependencies);
}
```

**Слід мати на увазі:** `computedUses = []` (порожній масив) і `computedUses = undefined` — це НЕ одне і те ж. Порожній масив через `extractScopedState` означає "ізолювати весь батьківський стан", що ламає неявні контейнери. Тому `computedUses` слід встановлювати лише коли є що декларувати.

---

### Баг 8: Дочірні UIDs (`id=`) не були в `localDeclared` — `{mySelect.value}` порожній

**Симптом:** `{mySelect.value}` у `Text` що є сусідом `<Select id="mySelect">` завжди показував порожній рядок.

**Причина:** При runtime дочірній компонент з `id="mySelect"` викликає `registerComponentApi` → API реєструється у найближчому ancestor-`StateContainer`. Тому uid дочірнього компонента є **локально власним** для контейнера-батька. Але алгоритм `computeUsesInternal` не знав про це і додавав `mySelect` до `parentDependencies` → `computedUses = ["mySelect"]` → `extractScopedState(state, ["mySelect"]) = {}` (батьківський стейт не має `mySelect`) → ізоляція.

**Виправлення:** Алгоритм повертає кортеж `[freeVars, escapingUIDs]`. Non-container вузол передає свій uid і UIDs своїх нащадків (через non-container intermediaries) як `escapingUIDs` вгору. Батьківський контейнер отримує ці UIDs і додає до `localDeclared` через `processChildList`.

---

### Баг 9: Дочірні UIDs через non-container intermediary не "спливали"

**Симптом:** `<Stack var.x><VStack><Select id="mySelect"/></VStack><Text>{mySelect.value}</Text></Stack>` — `{mySelect.value}` порожній, хоча `VStack` не є контейнером.

**Причина:** Попередній фікс (Баг 8) додавав uid лише **прямих** дітей. При runtime `registerComponentApi` проходить крізь `ComponentAdapter` (non-container) прозоро — uid реєструється в найближчому ancestor-контейнері, не в intermediary. Але алгоритм не моделював цю прозорість.

**Виправлення:** `computeUsesInternal` повертає `escapingUIDs` для non-container вузлів: `{own uid} ∪ {child escapingUIDs}`. Контейнер-вузол захоплює все — назовні виходить лише `{own uid}`. Ланцюг може бути довільної глибини.

**Слід мати на увазі:** будь-який вузол без `vars`/`loaders`/`functions`/`contextVars`/`scriptCollected`/`uses` є "UID-прозорим" — його власний uid і всі descendant UIDs (що не захоплені проміжними контейнерами) "спливають" до найближчого ancestor-контейнера.

---

### Баг 10: `$item` (contextVar) витікав з Items → Select ставав implicit container

**Симптом:** `<Select id="mySelect"><Items contextVar="$item" data="{someData}"><Option value="{$item.value}"/></Items></Select>` — після вибору опції `{mySelect.value}` у сусідньому `Text` залишався порожнім.

**Причина:** `contextVars` ключі (`$item`, `$index`, etc.) не були в `localDeclared` Items. Тому `$item` витікав як вільна змінна з Items → Select мав `parentDependencies = {"$item"}` → ставав implicit container → `computedUses = ["$item"]` → `getWrappedWithContainer` огортав Select в outer Container з `computedUses = ["$item"]` → `extractScopedState(fragmentState, ["$item"]) = {}` (Fragment не має `$item`).

При цьому внутрішній `wrappedSelect` мав `uid = undefined` (він видаляється), тому всі `updateState({value: "Zero"})` диспетчились з `uid = Symbol(undefined)` → `Symbol(undefined).description = undefined` → не відображалось як рядкова властивість у `mergeComponentApis` → `{mySelect.value}` ніколи не оновлювалось.

**Виправлення:** `contextVars` ключі додаються до `localDeclared` на початку `computeUsesInternal`. Вони є локально наданими фреймворком — не зовнішніми залежностями.

**Слід мати на увазі:** `contextVars` на вузлі (`{ $item: "$item" }`) означають що ці ідентифікатори **впроваджені фреймворком** у піддерево цього вузла при runtime. Вони не надходять з батьківського scope — тому мають бути в `localDeclared`, а не в `computedUses`.

---

### Баг 11: JavaScript built-in globals (`JSON`, `Math`, тощо) витікали в `computedUses`

**Симптом:** Тест-wrapper `initTestBed` завжди приводив до падіння тестів навіть після виправлення Бага 7. `{mySelect.value}` показував порожній рядок у всіх тестах що використовували static `<Option>`.

**Причина:** `initTestBed` додає маркерний текст:
```xml
<Text value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
```
`collectVariableDependencies` повертає всі ідентифікатори включно зі стандартними глобальними об'єктами JS: `testState` і `JSON`. `testState` — локальна змінна Fragment, фільтрується. Але `JSON` — JavaScript built-in — виходив як вільна змінна → Fragment отримував `computedUses = ["JSON"]` → `extractScopedState(appRootState, ["JSON"]) = {}` (app state не має `JSON`) → `stateFromOutside = {}` → Fragment ізольований.

**Виправлення:** Куратований набір `JS_STDLIB_GLOBALS` що містить ECMAScript standard globals та universally-available platform globals:
```ts
const isBuiltinGlobal = (name: string): boolean => JS_STDLIB_GLOBALS.has(name);

for (const d of usedHere)
  if (!localDeclared.has(d) && !isBuiltinGlobal(d)) parentDependencies.add(d);
```

**Чому НЕ `name in globalThis`:** `globalThis` у браузерах містить сотні legacy DOM/BOM властивостей (`window.external`, `window.screen`, `window.status`, `window.frames` тощо) — XMLUI developer може законно назвати свою змінну `external` або `screen`, і вони б помилково відфільтрувались. Наприклад, `jsdom` (тестове середовище Vitest) виставляє `window.external` → `"external" in globalThis = true` → тест що перевіряє змінну `{external}` ламається.

**Слід мати на увазі:** `JS_STDLIB_GLOBALS` охоплює ECMAScript-стандартні globals та universally-available globals (доступні і в браузері і в Node.js). Він **не** включає browser-only legacy (`window.external`, `window.screen`) або Node.js-only (`process`, `require`), що могли б бути іменами XMLUI vars. При появі нових ECMAScript globals (наприклад, `Temporal` вже в наборі) треба додавати їх вручну.

---

### Баг 12 (виявлений у myworkdrive): транзитивні виклики функцій в implicit containers — `navigateTo` не в скоупі

**Симптом:** `SharesTableView.xmlui` визначає `function handleNameClick(item) { if (item.webClientEnabled) navigateTo(item); }` та використовує `<Table id="sharesTable">`. При кліку на share виникала помилка:
```
TypeError: Cannot read properties of undefined (reading 'call')
at evalFunctionInvocationAsync (eval-tree-async.ts:592)
```
Функція `handleNameClick` знаходилась, але `navigateTo` (яку вона викликає) — `undefined`.

**Причина:** `Table` стає implicit container через `IMPLICIT_CONTAINER_COMPONENT_NAMES`. Алгоритм встановлював `computedUses = ['$props', '$item', 'handleNameClick']` — лише те, що **напряму** згадується в шаблоні. `navigateTo` використовується лише **всередині тіла функції** `handleNameClick` — не в шаблонному виразі — тому не потрапляла до `parentDependencies` таблиці. При runtime `extractScopedState(parentState, ['$props', '$item', 'handleNameClick'])` → `navigateTo` відсутня в скоупі → виклик `navigateTo(item)` → TypeError.

**Виправлення:** `computeUsesInternal` отримує параметр `parentFunctionNames: Set<string>` — набір імен функцій що декларовані у батьківському scope. Якщо в `parentDependencies` є хоч одна функція з `parentFunctionNames`, до `computedUses` включаються **всі** батьківські функції:

```ts
const needsParentFunction = parentFunctionNames.size > 0 &&
  [...parentDependencies].some(d => parentFunctionNames.has(d));
const computedUsesSet = needsParentFunction
  ? new Set([...parentDependencies, ...parentFunctionNames])
  : parentDependencies;
node.computedUses = Array.from(computedUsesSet);
```

Функції є **не-реактивними** — включення зайвих функцій у `computedUses` ніколи не спричиняє ре-рендерів, але запобігає runtime TypeError.

**Слід мати на увазі:** `parentFunctionNames` передається лише від відомих контейнерів (з `vars`/`loaders`/`functions`/`scriptCollected`/`contextVars`). Non-container-вузол успадковує `parentFunctionNames` від предка (scope не змінюється).

---

### Баг 13 (виявлений у myworkdrive): `Object.keys(node.scriptCollected)` → структурні ключі замість імен функцій

**Симптом:** після виправлення Бага 12, `navigateTo` все одно не потрапляла до `computedUses`. У логах: `Table sharesTable [implicitDefault] -> ['$props', '$item', 'handleNameClick']` — без `navigateTo`. Також у `computedUses` деяких `Table` потрапляли рядки `'vars'`, `'functions'`, `'moduleErrors'`, `'hasInvalidStatements'`.

**Причина:** `CollectedDeclarations` (тип `scriptCollected`) має структуру:
```ts
type CollectedDeclarations = {
  vars: Record<string, CodeDeclaration>;
  functions: Record<string, CodeDeclaration>;   // ← реальні функції тут
  moduleErrors?: ModuleErrors;
  hasInvalidStatements?: boolean;
};
```
Код використовував `Object.keys(node.scriptCollected)` — це повертало **структурні ключі об'єкта**: `['vars', 'functions', 'moduleErrors', 'hasInvalidStatements']`, а не реальні імена функцій. Ті ж самі ключі потрапляли і в `localDeclared`, і в `nodeFunctionNames`.

Це породжувало три дефекти одночасно:
1. `navigateTo` не була в `nodeFunctionNames` батьківського компонента → Баг 12 fix не спрацьовував
2. Рядки `'vars'`, `'functions'`, etc. потрапляли до `localDeclared` → певні реальні ідентифікатори з цими іменами помилково ігнорувались
3. Структурні ключі потрапляли до `computedUses` implicit containers (наприклад, `linksTable` → `['...', 'vars', 'functions', 'moduleErrors', 'hasInvalidStatements']`)

**Виправлення:** завжди звертатися до `scriptCollected.functions` та `scriptCollected.vars` напряму:

```ts
// було:
for (const k of Object.keys(sc)) localDeclared.add(k);
// ...
new Set([...Object.keys(node.scriptCollected ?? {})])

// стало:
for (const k of Object.keys(sc.functions ?? {})) localDeclared.add(k);
for (const k of Object.keys(sc.vars ?? {})) localDeclared.add(k);
// ...
new Set([...Object.keys(node.scriptCollected?.functions ?? {})])
```

**Слід мати на увазі:** `CollectedDeclarations` — це не плоска мапа `{name → fn}`, а **вкладений об'єкт** з полями `vars`, `functions`, `moduleErrors`, `hasInvalidStatements`. Будь-який код що обходить `scriptCollected` через `Object.keys(sc)` насправді обходить ці чотири структурні ключі, а не вміст. Правильно — `Object.keys(sc.functions ?? {})` і `Object.keys(sc.vars ?? {})`.

---

### Баг 14 (виявлений у myworkdrive): порожні `vars: {}` / `functions: {}` з мержу `StandaloneApp` створювали хибні контейнери

**Симптом:** Компоненти без жодних власних змінних (наприклад, `AppPages` — лише `<Stack>` з пропом `mediaSize`) ставали контейнерами і отримували `computedUses = ['mediaSize']`. Це ізолювало їх дочірні компоненти від батьківського стану.

**Причина:** `StandaloneApp.tsx` при мержі code-behind завжди створює порожні об'єкти:
```ts
const componentWithCodeBehind = {
  ...compound,
  component: {
    ...compound.component,
    vars: {                        // ← завжди об'єкт, навіть якщо порожній
      ...compound.component?.vars,
      ...componentCodeBehind?.vars,
    },
    functions: componentCodeBehind?.functions,  // ← може бути {}
  },
};
```
Порожній об'єкт `{}` є **truthy** у JavaScript. `isKnownContainer` і `isRegularContainer` перевіряли `node.vars` / `node.functions` без перевірки що об'єкт непорожній → кожен compound component з code-behind (навіть без реальних vars) ставав контейнером.

**Виправлення:** перевіряти **непустоту** через `Object.keys(...).length > 0`:

```ts
// було:
const isKnownContainer = !!(node.vars || node.functions || ...);

// стало:
const isKnownContainer = !!(
  (node.vars && Object.keys(node.vars).length > 0) ||
  (node.functions && Object.keys(node.functions).length > 0) ||
  ...
);
```

Аналогічно для `isRegularContainer`.

**Слід мати на увазі:** ця перевірка актуальна лише для `vars` і `functions`. Для `scriptCollected` (навіть порожній) достатньо перевірки на truthiness — якщо вузол має `scriptCollected`, він **вже є** відомим контейнером бо означає що мав `<script>` або `.xs` файл. Аналогічно для `contextVars`, `uses`, `loaders`.

---

### Баг 15 (виявлений у myworkdrive): `computedUses` звужував стан для компонентів з `scriptCollected` — функції `.xs` файлів бачили `undefined`

**Симптом (реальний додаток myworkdrive):** Після введення фічі компонент `FoldersTree` перестав відображатись у сайдбарі. При кліку на share ("Documents") виникала помилка типу "function is not a function" — аналогічна до тої, що трапляється коли функції не імпортовані в `.xs` файлі.

**Причина:** Алгоритм встановлював `computedUses` для **будь-якого** regular container — включаючи компоненти зі `scriptCollected` (тобто ті, що мають `.xs` файли або `<script>` теги). Звуження `stateFromOutside = extractScopedState(parentState, computedUses)` визначалось виключно на основі аналізу шаблонних виразів.

Але **тіла функцій у `.xs` файлах НЕ скануються** алгоритмом. Ці функції можуть звертатись до будь-яких глобальних змінних стану. В результаті:

| Компонент | `computedUses` (аналіз шаблону) | Реально потрібно функціям `.xs` |
|-----------|--------------------------------|--------------------------------|
| `FoldersTree` | `['events']` | + `fileClipboard`, `catalogSelection` (через `copyOrCut`) |
| `DesktopNameCell` | `['selectMode']` | + все що потрібно `handleItemClick` (через `emitEvent`) |
| `FilesPage` | `['events', 'drives', 'catalogSelection', ...]` | + `pendingFileSelection`, `serverConfig`, ... |
| `SharesPage` | `['drives', 'view']` | + `events` в `publishEvents` |

Функції отримували `undefined` замість реальних значень → runtime помилки або некоректна поведінка.

**Виправлення:** Пропускати звуження `computedUses` для вузлів зі `scriptCollected`:

```ts
// було:
if (node.uses === undefined && parentDependencies.size > 0) {
  node.computedUses = Array.from(parentDependencies);
}

// стало:
if (node.uses === undefined && parentDependencies.size > 0 && !node.scriptCollected) {
  node.computedUses = Array.from(parentDependencies);
}
```

**Чому це безпечно:** `scriptCollected` є **лише** у user-defined компонентів (`.xs` файли / `<script>` теги в `.xmlui`). Вбудовані компоненти (`Select`, `Table`, `List`, `DataGrid`) не мають `scriptCollected` — для них оптимізація залишається. Аналогічно, `VStack var.x="{...}"` (лише `vars`, без скрипту) — теж безпечний для звуження.

**Слід мати на увазі:** оптимізація `computedUses` для компонентів зі `scriptCollected` можлива лише якщо алгоритм скануватиме і тіла функцій `.xs` файлів — що вимагає AST-аналізу imorted функцій та відстеження транзитивних залежностей. Це складне завдання (транзитивні залежності через `import { fn } from 'shared.xs'`) і відкладається як майбутня оптимізація (див. TODO).

**⚠️ Неповнота цього фіксу:** Баг 15 відключив звуження для самого вузла зі `scriptCollected`. Але `nextDisableNarrowing` — прапорець що передається **дітям** — перевіряв лише `!!node.scriptCollected`, ігноруючи компоненти з code-behind через `node.functions`. Це породило окремий Баг 16 (див. нижче).

---

### Баг 16 (виявлений у myworkdrive): `var.` декларації на `<Component>` невидимі в event handlers дітей — `nextDisableNarrowing` не враховував `node.functions`

**Симптом:** У компоненті `PageToolbar` (тільки `.xmlui.xs` code-behind, без `<script>` тегу) змінна `var.selectAllIndeterminate="{false}"` оголошена на кореневому `<Component>` тезі. В дочірньому `ChangeListener` спроба запису `selectAllIndeterminate = false` давала помилку: `Left value variable "selectAllIndeterminate" not found`.

**Причина:** Два різних шляхи потрапляння скриптів на вузол:

| Джерело | Де зберігається на вузлі | Встановлюється коли |
|---------|--------------------------|---------------------|
| `<script>` тег в `.xmlui` | `node.scriptCollected` | під час парсингу в `transform.ts` |
| Зовнішній `.xmlui.xs` файл | `node.functions` | під час merge в `StandaloneApp.tsx` (рядки 733–746) |

`nextDisableNarrowing` контролює чи будуть звужені **діти** поточного вузла:

```ts
// було: перевіряє лише <script> тег
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected;
```

Компоненти з тільки `.xs` файлом мають `scriptCollected === undefined` → `nextDisableNarrowing = false` → алгоритм звужував `ChangeListener` до `computedUses = ['events']` (лише те що видно в шаблоні) → `selectAllIndeterminate` відрізалась.

**Виправлення:**

```ts
// стало: перевіряє обидва шляхи
const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected || hasCodeBehind;
```

**Чому `node.functions` відповідає саме code-behind:** Вбудовані компоненти (`Select`, etc.) реалізовані в TypeScript — вони ніколи не мають `node.functions` зі `.xs`. Тільки user-defined compound components отримують `functions` з `StandaloneApp` merge. Тому перевірка `node.functions.length > 0` є надійним індикатором наявності code-behind.

**Слід мати на увазі:** `isKnownContainer` вже коректно перевіряв обидва канали (і `scriptCollected`, і `functions`), але `nextDisableNarrowing` відставав. Після фіксу обидва місця синхронізовані.

### Баг 17 (виявлений у e2e тестах): runtime context vars (`$param`, `$item`, `$row`, тощо) витікали в `parentDependencies`

**Симптом:** E2E тести для `ModalDialog` (та інших компонентів що використовують `$param`, `$item`, `$row`, `$data`, `$checked`, `$context`, `$this`) падали коли `COMPUTED_USES_ENABLED = true`. При `COMPUTED_USES_ENABLED = false` — всі тести проходили. Конкретно: `ModalDialog` не відкривався після `modalDialog.open({ msg: "Hello" })`.

**Причина:** Runtime context vars (`$param`, `$item`, `$rowKey`, тощо) **не є ключами батьківського стану** — вони впроваджуються фреймворком безпосередньо у дочірній контекст під час рендеру (наприклад, `ModalDialog.open()` впроваджує `$param`; `Items` впроваджує `$item`). Ці змінні **не оголошені** у `contextVars` самого вузла (на відміну від `$item` у `Items`, де `contextVars: { $item: ... }` заповнений на самому Items-вузлі).

Якщо дочірній вузол (наприклад `Text` всередині `ModalDialog`) містить `{$param.msg}`, алгоритм не знаходить `$param` ні в `localDeclared` вузла, ні в `isBuiltinGlobal` → `$param` потрапляє до `parentDependencies` → `computedUses = ['$param']` встановлюється на ModalDialog → `extractScopedState(parentState, ['$param'])` повертає `{}` (бо `$param` ніколи не є ключем батьківського `parentState`) → `stateFromOutside = {}` → ModalDialog отримує порожній стан → не може відкритись.

**Виправлення, підхід 1 (відхилений):** явний allowlist всіх runtime context vars у `XMLUI_RUNTIME_CONTEXT_VARS = new Set(['$param', '$item', ...])`. Проблема: потребує постійної синхронізації при появі нових context vars.

**Виправлення, підхід 2 (прийнятий):** всі `$`-ідентифікатори за визначенням є або runtime context vars, або роутерними змінними. Роутерних змінних що справді живуть у `parentState` — лише чотири: `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo`. Тому:

```ts
// routing-state.ts — єдиний авторитет
export const ROUTING_STATE_KEYS = new Set([
  "$pathname", "$routeParams", "$queryParams", "$linkInfo",
]);

// computedUses.ts
import { ROUTING_STATE_KEYS } from "../state/routing-state";
const isRuntimeContextVar = (name: string): boolean =>
  name.startsWith("$") && !ROUTING_STATE_KEYS.has(name);

for (const d of usedHere)
  if (!localDeclared.has(d) && !isBuiltinGlobal(d) && !isRuntimeContextVar(d))
    parentDependencies.add(d);
```

**Слід мати на увазі:** `ROUTING_STATE_KEYS` визначений у `routing-state.ts` — поруч з `useRoutingParams()` що є єдиним місцем де ці ключі реально записуються у state. При додаванні нової роутерної змінної треба оновити лише один файл. Всі інші `$`-ідентифікатори (`$param`, `$item`, `$row`, нові майбутні) автоматично фільтруються без жодних змін в `computedUses.ts`.

### Баг 18 (виявлений у тестовому додатку): `computedUses` звужував eval-context event handlers — запис у батьківські змінні кидав `"variable not found in scope"`

**Симптом:** Будь-який event handler у компоненті з `computedUses` що намагався присвоїти **батьківську змінну не з `computedUses`** — кидав:
```
Error: Left value variable (selectedItem) not found in the scope.
```
Наприклад: `<List items="{items}" onSelectionDidChange="(sel) => selectedItem = sel[0]">` де `selectedItem` — `var.` на рівні App, `items` — в `computedUses` List.

**Причина (повний ланцюг):**
1. `ComponentWrapper`: `scopedParentState = extractScopedState(state, computedUses)` → `{items: ...}` (без `selectedItem`)
2. `ContainerWrapper` → `StateContainer` отримують вже звужений `parentState = {items}`
3. `StateContainer` → `Container`: `componentState = resolvedCombinedState` побудований поверх звуженого `stateFromOutside` → також без `selectedItem`
4. `Container.stateRef = useRef(componentState)` → без `selectedItem`
5. `getComponentStateClone()` → Proxy над `stateRef.current` → без `selectedItem`
6. `evalContext.localContext` → без `selectedItem`
7. Eval engine (`getIdentifierScope`): шукає `selectedItem` в block scopes → `localContext` → `appContext` → **`globalThis`** → не знаходить → `evalAssignmentCore` кидає помилку

`statePartChanged` **ніколи не викликався** — помилка кидалась до того як Proxy SET міг записати зміну.

**Ключовий момент:** `parentState` в `StateContainer` — вже звужений (ComponentWrapper звузив його до передачі в ContainerWrapper). Тому передавати `fullParentState = StateContainer.parentState` безглуздо — він вже вузький. Потрібно пробрасувати `ComponentWrapper.state` (до звуження).

**Виправлення:** Пробросити повний (незвужений) `state` з `ComponentWrapper` через ланцюг аж до `Container.stateRef` як **`MutableRefObject`** (не value-prop). Звуження залишається для рендерингу (`parentState = scopedParentState`), event handlers отримують доступ до повного стану через стабільний ref.

**Чому ref, а не value-prop:** Якщо передати `fullParentState={state}` як звичайний prop, то при кожному тіку `oftenChanges` `state` змінюється → `ContainerWrapper.memo` бачить новий `fullParentState` → Select перерендеровується попри стабільний `scopedParentState`. Оптимізація повністю defeated (34 рендери замість ≤ 5). MutableRefObject стабільний як React prop — `memo` не реагує на зміну `.current`.

```typescript
// ComponentWrapper.tsx — створює стабільний ref, оновлює .current під час render:
const fullParentStateRef = useRef<Record<string, any> | undefined>(undefined);
fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;

<ContainerWrapper
  parentState={scopedParentState}      // ← звужений, для рендерингу
  fullParentStateRef={fullParentStateRef}  // ← стабільний ref, для event handlers
  ...
/>

// ContainerWrapper.tsx → StateContainer.tsx — Props + деструктуризація + threading:
fullParentStateRef?: MutableRefObject<ContainerState | undefined>;

// Container.tsx — читає .current при побудові stateRef:
const fullParentState = fullParentStateRef?.current;
const stateRef = useRef(
  fullParentState ? { ...fullParentState, ...componentState } : componentState,
);
useIsomorphicLayoutEffect(() => {
  const fp = fullParentStateRef?.current;
  stateRef.current = fp ? { ...fp, ...componentState } : componentState;
}, [componentState, fullParentStateRef]); // fullParentStateRef стабільний → ефект = [componentState]
```

Тепер `selectedItem` присутній у `stateRef.current` → `getComponentStateClone()` → Proxy SET спрацьовує → `changes.push(...)` → `statePartChanged("selectedItem", value)` → бабблінг до батьківського StateContainer → dispatch → стан оновлено ✓

**Результат:** всі 58 регресій усунено. Повний тест-сьют: **9593/9596 passed (176 files)** (3 не-failures: 2 skipped + 1 todo).

---

### Баг 19 (виявлений у e2e тестах): `computedUses=["$context"]` на App ізолював компонент від `registerComponentApi` батька

**Симптом:** E2E тести `open-a-context-menu-on-right-click.spec.ts` (6 тестів) падали при `COMPUTED_USES_ENABLED=true`. `ContextMenu.openAt(event, data)` не відкривав меню. Додаток в myworkdrive працював нормально (там `computedUses` на App не встановлювався).

**Причина (виявлена через логи `[registerApi]`):**

Дерево розмітки:
```xml
<App>
  <ContextMenu id="projectMenu">...</ContextMenu>
  <Items data="{projects}">
    <Card onContextMenu="(e) => projectMenu.openAt(e, $item)">
```

Аналізатор `computeUsesInternal` знаходив `$context` у обробниках `MenuItem.onClick`. `ContextMenu` не є контейнером (немає `vars`/`loaders`/`contextVars` в XML-вузлі). Тому `$context` бульбашив через ContextMenu → App. App отримував `parentDependencies = {"$context"}` → `computedUses = ["$context"]`.

При runtime: `extractScopedState(Theme#root_state, ["$context"])` → `{}` (бо `$context` ще немає в стані до першого `openAt`). App отримував `stateFromOutside = {}` замість повного стану Theme#root. ContextMenu реєстрував свій API (`projectMenu`) в Theme#root через `registerComponentApi`. App його не бачив. Card не знаходив `projectMenu` → `TypeError: projectMenu.openAt is not a function`.

Це підтверджено логами:
```
[stateFromOutside] App: computedUses=["$context"] parentState.keys=[] kept=[] DROPPED=[]
[registerApi] key="projectMenu" → storing in container "Theme#root"
[stateRef] Card: hasProjectMenu=false  ← НІКОЛИ не true
```

**Виправлення:** guard для встановлення `computedUses` змінено з `parentDependencies.size > 0` на `nonDynamicParentDeps.size > 0`.

```ts
// Було:
if (node.uses === undefined && parentDependencies.size > 0 && safeToNarrow) {
// Стало:
if (node.uses === undefined && nonDynamicParentDeps.size > 0 && safeToNarrow) {
```

Тепер `computedUses` встановлюється лише коли є реальні (не-dynamic) залежності від батьківського стану. Якщо єдина залежність — `$context` (або інша `PARENT_STATE_DYNAMIC_VARS`), вузол не звужується і отримує повний стан батька. Якщо є реальні deps + `$context` — `$context` все одно включається до `computedUses` для реактивності (контейнер ре-рендериться при `openAt`).

**Чому в myworkdrive не було цього бага:** у Vite/StandaloneApp режимі `computedUses` для App не встановлювався — іншою причиною (можливо, App мав `functions` через code-behind або `disableNarrowing` спрацьовував).

**Файл:** `xmlui/src/components-core/optimization/computedUses.ts`

**Слід мати на увазі:** `PARENT_STATE_DYNAMIC_VARS` (`$context` тощо) — це не просто "runtime context vars". Вони справді живуть в батьківському стані (ContextMenu.openAt диспетчить `$context` через `statePartChanged`). Але їх початкове значення — `undefined`. Якщо контейнер звужується тільки до `$context`, він ізолює себе від усіх інших ключів батьківського стану включно з компонентними APIs що реєструються через `registerComponentApi`.

---

### Баг 20 (виявлений у Group B, `Table.spec.ts` "refreshOn Property"): LHS присвоєнь у event handlers не враховувалися в `computedUses`

**Симптом:** Тести `Table.spec.ts › refreshOn Property` (3 тести) падали з `Expected: "1", Received: null`. У браузерних логах:

```
[xmlui] Left value variable (testState) not found in the scope.
```

XML тестового кейсу:
```xml
<VStack var.parentValue="1">
  <Table data="{[{id: 1, name: 'Row A' }]}" refreshOn="{parentValue}">
    <Column header="Name">
      <Text onClick="testState = parentValue">{$item.name}</Text>
    </Column>
  </Table>
</VStack>
```

`testState` живе в кореневому Fragment'і test bed'а як `var.testState="{null}"`. Очікувано: обробник `Text.onClick` пише в нього з cell-области Table.

**Корінь:** `collectVariableDependencies` (у [visitors.ts](../../script-runner/visitors.ts)) при відвідуванні `T_ASSIGNMENT_EXPRESSION` повертав залежності тільки правої частини (`program.expr`), повністю ігноруючи ліву (`program.leftValue`):

```ts
case T_ASSIGNMENT_EXPRESSION:
  return collectDependencies(program.expr, program, "right");
```

Тому для `testState = parentValue` аналіз бачив лише `parentValue` — як RHS-вираз. `testState` ніколи не потрапляв у вільні змінні Text → Column → Table.

Table як implicit container отримував `computedUses = ["parentValue"]`. Runtime narrowing у `ComponentWrapper`:
```
extractScopedState(state, ["parentValue"]) → {parentValue: 1}
```

Cell handler виконувався у scope, де `testState` був відсутній. `evalAssignmentCore` ([eval-tree-common.ts](../../script-runner/eval-tree-common.ts):438):
```ts
if (leftScope === globalThis && !(leftIndex in leftScope)) {
  throw new Error(`Left value variable (${leftIndex}) not found in the scope.`);
}
```

**Виправлення (двоетапне):**

**Етап 1 — opt-in параметр у `collectVariableDependencies`:**

Додано опціональний параметр `options.includeAssignmentTargets`. Коли `true` — `T_ASSIGNMENT_EXPRESSION` обходить **обидві** сторони присвоєння. За замовчуванням `false`, щоб не зламати reactive dependency tracking (якщо `x = expr` додає `x` до своїх deps, то запис у `x` тригерить повторне виконання → нескінченний цикл).

```ts
case T_ASSIGNMENT_EXPRESSION:
  return options.includeAssignmentTargets
    ? collectDependencies(program.leftValue, program, "left").concat(
        collectDependencies(program.expr, program, "right"),
      )
    : collectDependencies(program.expr, program, "right");
```

`computedUses` аналізатор передає `includeAssignmentTargets: true`, бо движок вимагає LHS у scope.

**Етап 2 — розділення `reads` vs `all` deps у `computedUses`:**

Перша спроба (просто `includeAssignmentTargets: true`) ламала тест `Select › clear button triggers didChange event` (`<Select onDidChange="testState = 'changed'">`). LHS `testState` потрапляв у `parentDependencies` Select → `isImplicitDefault` тригерився → Select обгортався зайвим `StateContainer`. Це ламало внутрішню логіку clearable Select.

Тому `depsOfValue` і `depsOfRecord` тепер повертають **дві множини**:
- `all` = reads + assignment targets → у `node.computedUses` (для resolve scope)
- `reads` = тільки праві сторони і member-access roots → у `nonDynamicReadDeps`, що керує:
  - `isImplicitDefault` (промоція до implicit container)
  - умова `if (... nonDynamicReadDeps.size > 0 ...)` для встановлення `computedUses`

```ts
const isImplicitDefault =
  IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && nonDynamicReadDeps.size > 0;
```

`parentDependencies` далі містить і записи, і читання — щоб коли контейнер таки створюється (через `isKnownContainer` або через `isImplicitDefault` від справжніх читань), `computedUses` включав ВСІ ідентифікатори, потрібні в scope.

**Чому розділення коректне:**

- Write-only target має бути **у scope** (інакше `evalAssignmentCore` кине помилку).
- Але write-only target **НЕ потребує** re-render trigger: коли значення змінюється — лише сам handler його змінив; це не реактивне читання, на яке треба перерендерити контейнер.

Таким чином:
- Table з `onClick="testState = parentValue"`: `reads = {parentValue}` (з refreshOn та з RHS), `all = {parentValue, testState}`. `isImplicitDefault = true` (через `parentValue`). `computedUses = ["parentValue", "testState"]`. ✓
- Select з `onDidChange="testState = 'changed'"`: `reads = {}`, `all = {testState}`. `isImplicitDefault = false` → Select **НЕ** обгортається StateContainer'ом, обробник виконується в parent scope, де `testState` природно доступний. ✓

**Файли:**
- `xmlui/src/components-core/script-runner/visitors.ts` — параметр `includeAssignmentTargets`
- `xmlui/src/components-core/optimization/computedUses.ts` — `depsOfValue`/`depsOfRecord` повертають `{all, reads}`; `computeUsesInternal` тримає паралельні множини `parentDependencies`/`parentDependenciesReads`; повертає tuple `[allDeps, escapingUIDs, readDeps]`.

**Слід мати на увазі:**
1. Інші виклики `collectVariableDependencies` (reactive deps у `useVars`, `valueExtractor` тощо) і далі НЕ передають `includeAssignmentTargets`. Це навмисно — реактивна підписка не повинна реагувати на власні записи.
2. Compound assignment (`+=`, `*=` тощо) автоматично коректний: і LHS, і RHS враховуються в `all` (LHS-як-вираз все одно зчитується для compound операції).
3. Member-access присвоєння (`obj.field = val`) працює: `traverseMemberAccessChain` витягає root `obj`, який має бути в scope для зчитування. Це покривалося і RHS-only обходом раніше у частині кейсів, тепер послідовно з обома сторонами.

---

### Баг 21 (виявлений у Group C, `DataSource.spec.ts` onFetch): `$queryParams` у `onFetch` конфліктував з роутерним `$queryParams` у `computedUses`

**Симптом:** E2E `handler can use $url, $method and $queryParams context vars` — `ds.value` порожній при `COMPUTED_USES_ENABLED=true`.

**Причина:** 
1. `$url` / `$method` вже фільтруються як `isRuntimeContextVar`, але `$queryParams` входить до `ROUTING_STATE_KEYS` → не фільтрується → `onFetch` додає `$queryParams` до `parentDependencies` вузла → предок (наприклад, тестовий `Fragment`) отримує `computedUses` з роутерним ключем → звуження стану / merge з handler `context` ламає інжектовані fetch-параметри.
2. Під час побудови дерева (до рендерингу) вузол все ще має тип `"DataSource"`, а не `"DataLoader"`, тому перевірка `node.type === "DataLoader"` ігнорувала такі вузли.
3. Просто робити `usedHere.delete(d)` було небезпечно, оскільки це могло видалити справжню залежність `$queryParams` (якщо вона використовувалася, наприклад, у `url="{$queryParams.q}"`), що ламало б реактивність лоадера.

**Виправлення:** 
1. Змінено перевірку типу: `node.type === "DataLoader" || node.type === "DataSource"`.
2. Вдосконалено збір залежностей: подія `fetch` вилучається з `events` перед викликом `addRecord(eventsWithoutFetch)`. Потім її залежності аналізуються окремо і додаються до `usedHere` ТІЛЬКИ якщо вони НЕ входять до `DATA_FETCH_HANDLER_INJECTED_KEYS`. Це зберігає справжні залежності, якщо вони з'явилися з інших пропертій (наприклад, `url`).
3. У `event-handlers.ts`: `refreshStateRef` завжди оновлює `stateRef` з `componentStateRef` коли немає `fullParentStateRef`; `getComponentStateClone` робить `Object.assign(poj, context)` після `cloneDeep(originalState)`.

**Файли:** `computedUses.ts`, `event-handlers.ts`, `tests/components-core/optimization/computedUses.test.ts`.

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

### 3. UID loaders обробляються як локальні — лише через `processChildList`

Якщо `DataSource` дочірній елемент має uid (`"myLoader"`), цей uid додається до локальних оголошень контейнера. Тому звертання `{myLoader.data}` не "бульбашить" вгору як зовнішня залежність — він ізольований у цьому контейнері.

**Слід мати на увазі:** uid лоадера має ЄДИНУ точку авторитету — `processChildList(node.loaders)`. Не слід попередньо додавати uid лоадерів до `localDeclared` до виклику `processChildList`. Попереднє seeding створює подвійну авторитетність: uid буде позначений "локально власним" беззаперечно, що приховує випадок коли лоадер сам є контейнером (має `vars` тощо) і його власний uid повинен вийти нагору до батьківського контейнера через механізм `escapingUIDs`.

### 4. `uses !== undefined` — це повноцінний StateContainer, не лише підписка

`<Fragment uses="['x']">` — це не легковажна «підписка» на змінну `x`. При runtime цей вузол розгортається в повноцінний `StateContainer`. Дочірні компоненти викликають `registerComponentApi` ВСЕРЕДИНІ нього, а не у будь-якого предка.

**Слід мати на увазі:** механізм UID-escaping в `computeUsesInternal` зобов'язаний трактувати будь-який вузол з `uses !== undefined` як контейнер — точно так само як вузол з `vars`. Якщо вузол з `uses` проваливається до non-container гілки, дочірні UIDs помилково виходять до дідуся, розширюючи його `computedUses` і спричиняючи зайві ре-рендери. Умова `isRegularContainer` в `computeUsesInternal` тому явно включає `node.uses !== undefined`.

### 5. Вузли без контейнерних ознак є UID-прозорими (bubbling)

`VStack`, `HStack`, `Fragment` (без `vars`/`loaders`/etc.) не мають `StateContainer` при runtime. Дочірні UIDs «бульбашать» крізь них вгору до найближчого предка-контейнера.

**Слід мати на увазі:** це не помилка — це задуманий механізм. `computeUsesInternal` для non-container вузла повертає власний uid + всі `childEscapingUIDs` у кортежі `[freeVars, escapingUIDs]`. Контейнер-предок отримує ці UIDs через `processChildList`, додає їх до `localDeclared`, і вони не потрапляють до його `computedUses`. Ланцюг може бути довільної глибини (3+ рівні прозорих intermediaries).

**Слід також мати на увазі:** власний uid контейнера (наприклад, `<Stack uid="innerStack" var.x="{0}"`) виходить до БАТЬКІВСЬКОГО контейнера — не до себе. При runtime контейнер реєструє свій API у батьківському `StateContainer`, тому батько не потребує цього uid у власному `computedUses` — він потрапляє до `localDeclared` батька через `escapingUIDs`.

### 6. `contextVars` (`$item`, `$index`) — локальні для Items/List

`contextVars` на вузлі (`{ $item: "$item" }`) означає що ці змінні доступні в піддереві але оголошені локально. `localDeclared` збирає їх — вони не виходять назовні.

**Слід мати на увазі:** відсутність `contextVars` ключів у `localDeclared` призводить до того що `$item` витікає крізь Items → вгору до Select → Select отримує `parentDependencies = {"$item"}` → стає implicit container → `computedUses = ["$item"]` → Select огортається в outer `Container` → `extractScopedState(parentState, ["$item"]) = {}` → внутрішній wrappedSelect отримує `uid = undefined` → всі `updateState` від компонента-рендера диспетчаться з анонімним `Symbol(undefined)` → значення не прокидається у `mergeComponentApis` як рядкова властивість → `{mySelect.value}` ніколи не оновлюється.

### 8. JavaScript built-in globals ніколи не є залежностями app state

`collectVariableDependencies` не фільтрує стандартні JS globals. Вираз `{JSON.stringify(x)}` поверне `["JSON", "x"]` як залежності. Але `JSON` ніколи не зберігається в app state → `extractScopedState(state, ["JSON"]) = {}` → ізоляція.

**Слід мати на увазі:** набір `JS_STDLIB_GLOBALS` охоплює ECMAScript standard + universally-available globals. Bare `name in globalThis` не підходить бо браузер виставляє сотні legacy `window.*` властивостей (`external`, `screen`, `status`, тощо) що можуть збігатись з іменами XMLUI vars. При появі нових ECMAScript globals треба додавати їх до набору.

### 11. Framework globals (`toast`, `Actions.callApi`) і screen-size vars — не в `JS_STDLIB_GLOBALS`

Framework globals (`toast`, `Actions.callApi`, etc.) та змінні розміру екрану (`$mediaSize`, `$breakpoint`) **не додаються** до `JS_STDLIB_GLOBALS`, і правильно з'являються у `computedUses` якщо зустрічаються у виразах. Ось чому це безпечно:

**Framework globals** (`toast`, `Actions`) резолвяться з `localContext` або `appContext` фреймворку (evaluator шукає там раніше ніж у `globalThis`). Вони потрапляють у `computedUses`, але оскільки їх немає у `parentState`, `extractScopedState` просто їх пропускає. Стабільні функції — ніколи не змінюються → не викликають зайвих ре-рендерів. Компонент знаходить їх через `localContext` при виконанні.

**Screen-size змінні** (`$mediaSize`, тощо) надходять через `routingParams` або `stableCurrentGlobalVars`, що додаються до `combinedState` **незалежно** від `stateFromOutside`. Тому навіть якщо вони в `computedUses` і відсутні у `parentState` — вони доступні через окремий канал.

**Слід мати на увазі:** ці globals не потрапляють до `JS_STDLIB_GLOBALS` навмисно — так підтримується простота набору (лише JS стандарт). Якщо framework global дійсно лежить у `parentState` (наприклад, app-level global var що рідко змінюється), то його присутність у `computedUses` є **коректною** — компонент правомірно залежить від нього.

### 12. Компоненти з code-behind виключені зі звуження `computedUses` (і їх діти теж)

User-defined компоненти з `<script>` тегом (`node.scriptCollected`) або зовнішнім `.xs` файлом (`node.functions` непорожній) **не отримують** `computedUses`, і їхнє піддерево також не звужується. Причина: алгоритм аналізує лише шаблонні вирази, але функції у code-behind можуть звертатися до **будь-яких** глобальних змінних стану — включаючи ті, що взагалі не згадуються в шаблоні.

Реалізовано через `nextDisableNarrowing`:
```ts
const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected || hasCodeBehind;
```

**Слід мати на увазі:** вбудовані XMLUI компоненти (`Select`, `Table`, `List`, `DataGrid`) не мають ні `scriptCollected`, ні `functions` з code-behind — вони реалізовані у TypeScript. Тому `computedUses` для них встановлюється коректно. Компоненти лише з `vars` (наприклад, `VStack var.x="{...}"`) теж — звуження для них безпечне.

Звуження для code-behind компонентів потребує AST-аналізу тіл функцій та транзитивного відстеження залежностей через `import` ланцюжки. Це нетривіальна задача, що відкладена на майбутнє (див. TODO).

### 13. `CollectedDeclarations` — вкладений об'єкт, не плоска мапа

`node.scriptCollected` має тип `CollectedDeclarations`:
```ts
type CollectedDeclarations = {
  vars: Record<string, CodeDeclaration>;
  functions: Record<string, CodeDeclaration>;
  moduleErrors?: ModuleErrors;
  hasInvalidStatements?: boolean;
};
```
Будь-який код що ітерує `Object.keys(node.scriptCollected)` насправді отримує структурні ключі `['vars', 'functions', 'moduleErrors', 'hasInvalidStatements']`, а не імена функцій/змінних. Правильно — `Object.keys(node.scriptCollected.functions ?? {})` і `Object.keys(node.scriptCollected.vars ?? {})`.

### 14. Порожні `vars: {}` / `functions: {}` з мержу `StandaloneApp` — truthy, але не контейнер

`StandaloneApp.tsx` при мержі code-behind завжди встановлює `vars: { ...a, ...b }` і `functions: codeBehind?.functions`. Коли code-behind відсутній або порожній, результат — `{}` (порожній об'єкт). Порожній об'єкт truthy в JavaScript. Перевірки виду `isRegularContainer = !!(node.vars || node.functions || ...)` хибно вважали кожен compound component контейнером.

**Слід мати на увазі:** завжди перевіряти `node.vars && Object.keys(node.vars).length > 0` (аналогічно для `functions`). Для `scriptCollected`, `contextVars`, `uses`, `loaders` — перевірка на truthiness коректна, бо пустих об'єктів там не буває.

### 15. Runtime context vars (`$param`, `$item`, тощо) — не ключі батьківського стану, фільтруються через `isRuntimeContextVar`

Всі XMLUI `$`-ідентифікатори поділяються на дві категорії:

| Категорія | Приклади | Де живуть | Потрапляють у `computedUses`? |
|-----------|----------|-----------|-------------------------------|
| **Router state vars** | `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo` | Ключі `parentState` (Layer 6, `useRoutingParams`) | ✅ Так — коректні залежності |
| **Runtime context vars** | `$param`, `$item`, `$row`, `$rowKey`, `$data`, `$context`, `$this`, `$checked` | Впроваджуються фреймворком у дочірній контекст під час рендеру | ❌ Ні — не є ключами `parentState` |

Runtime context vars **не оголошуються у `contextVars`** самого компонента-споживача — вони просто доступні у виразах дітей як контекст. Тому алгоритм не може знайти їх у `localDeclared` і без фільтрації вони витікають у `parentDependencies`.

Фільтрація реалізована через `isRuntimeContextVar(name)` — перевіряє `name.startsWith("$") && !ROUTING_STATE_KEYS.has(name)`. `ROUTING_STATE_KEYS` (єдиний allowlist) живе у `routing-state.ts` поруч з `useRoutingParams()`.

**Слід мати на увазі:** якщо у майбутньому додається нова роутерна змінна (наприклад, `$hash`), треба додати її до `ROUTING_STATE_KEYS` у `routing-state.ts`. Нові runtime context vars (нові `$`-ідентифікатори що впроваджуються фреймворком у дочірній контекст) фільтруються автоматично без змін у `computedUses.ts`.

### 9. Тришарова ізоляція (defense in depth)

Виправлення реалізовано в трьох шарах:
1. **`ComponentWrapper` — `scopedParentState`** — scope `state` до `scopedParentState` перед `ContainerWrapper` → `ContainerWrapper`/`StateContainer` взагалі не виконуються при змінах непов'язаних ключів. Основний шар.
2. **`statePartChanged` via refs** — навіть якщо `ContainerWrapper` чомусь ре-рендерується, `statePartChanged` не створює нову функцію → `memo` дітей захищений. Страховка + загальна стабільність коду.
3. **`fullParentStateRef` як `MutableRefObject`** — повний батьківський стан для event handler scope передається як стабільний ref, а не value-prop → `ContainerWrapper/StateContainer/Container.memo` не реагують на зміну `.current` → оптимізація не defeated навіть коли повний state змінюється часто.

### 10. `mergeComponentApis` і Symbol ключі — механізм передачі API від дочірніх компонентів

При runtime `registerComponentApi(uid, api)` викликається з `uid = Symbol("mySelect")`. `ComponentAdapter` зберігає `{ [sym]: api }` у `componentApis`. `mergeComponentApis` виконує таке перетворення:

1. `ret = { ...componentState }` — spread ігнорує Symbol ключі
2. For each Symbol у `componentState`: `ret[sym.description] = componentState[sym]` — рядковий ключ з опису символу
3. For each Symbol у `componentApis`: `ret[sym.description] = { ...ret[sym.description], ...api }` — merge з рядковим ключем; `ret[sym] = { ...api }` — також Symbol ключ

**Слід мати на увазі:** `combinedState` використовує spread (`{ ...mergedWithVars }`) який ігнорує Symbol ключі. Тому `state[Symbol("mySelect")]` у `ComponentAdapter` завжди `undefined` — рядковий ключ `state["mySelect"]` використовується для `{mySelect.value}` у Text. При цьому компонент-рендер (SelectReact) отримує `rendererContext.state = state[uid]` = `state[Symbol]` = `{}` — це нормально, бо SelectReact читає власний стан через `useState`, а не через `rendererContext.state`.

Якщо `wrappedNode.uid` видалено (як у `getWrappedWithContainer`), `uid = Symbol(undefined)`. `Symbol(undefined).description = undefined` → `mergeComponentApis` ігнорує цей Symbol при побудові рядкових ключів → значення компонента ніколи не з'являється як `"mySelect"` у state → `{mySelect.value}` завжди порожній.

---

## Покриття файлів

| Файл | Дія | Зміст |
|------|-----|-------|
| `xmlui/src/abstractions/ComponentDefs.ts` | Modify | Поле `computedUses?: string[]` в `ComponentDefCore` |
| `xmlui/src/components-core/optimization/computedUses.ts` | Create + Fix | `computeUsesForTree`, кортеж `[freeVars, escapingUIDs]`, `IMPLICIT_CONTAINER_COMPONENT_NAMES`, `JS_BUILTIN_GLOBALS`; `contextVars` в `localDeclared`; `parentDependencies.size > 0` guard; `parentFunctionNames` parameter; `Object.keys(sc.functions)` замість `Object.keys(sc)`; empty-object guard для `vars`/`functions`; `isRuntimeContextVar` + `ROUTING_STATE_KEYS` import |
| `xmlui/src/components-core/state/routing-state.ts` | Modify | Додано `export const ROUTING_STATE_KEYS` — єдиний авторитетний список роутерних `$`-змінних що живуть у parent state |
| `xmlui/tests/components-core/optimization/computedUses.test.ts` | Create | unit-тести: базові випадки, UID-escaping (прямі/grandchild/non-container chain/uses-container), contextVars, JSON built-in, initTestBed exact markup, `isRuntimeContextVar` фільтр, function-free narrowing |
| `xmlui/src/components-core/rendering/ContainerWrapper.tsx` | Modify | `isContainerLike` перевіряє `computedUses`; `getWrappedWithContainer` копіює/видаляє `computedUses`; prop `fullParentStateRef?: MutableRefObject` (threading для event handler scope) |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | Modify | `uses ?? computedUses` в `extractScopedState`; стабільний `statePartChanged` via refs (`[dispatch, node.uid]`); dev render counter (`__renderCounts`); prop `fullParentStateRef` threading |
| `xmlui/src/components-core/rendering/ComponentWrapper.tsx` | Modify | `scopedParentState` через `useShallowCompareMemoize + extractScopedState` перед `ContainerWrapper`; `fullParentStateRef = useRef()` оновлюється під час render, передається як стабільний ref (не value-prop) |
| `xmlui/src/components-core/rendering/Container.tsx` | Modify | Prop `fullParentStateRef?: MutableRefObject`; `stateRef` мержить `{...fullParentStateRef.current, ...componentState}` лише коли `componentState` змінюється — ref стабільний, memo не інвалідується |
| `xmlui/src/components-core/xmlui-parser.ts` | Modify | Виклик `computeUsesForTree` після `nodeToComponentDef` |
| `xmlui/tests-e2e/computed-uses.spec.ts` | Create | E2E: 5 секцій — regression (var. declarations, event handler write to non-computedUses var), optimization (Select ≤ 5 renders, wrapper, function-free Select with script) |

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

### Ліниве клонування стейту в Event Handlers (Proxy замість cloneDeep)

**Проблема:** В `xmlui/src/components-core/container/event-handlers.ts` функція `getComponentStateClone` робить глибоке клонування (`cloneDeep`) всього контейнерного стану при першому виклику івенту після кожної зміни стейту. Для великих даних (наприклад, масиви `DataSource` з тисячами записів) це може займати 50–100 мс, викликаючи візуальні "гальма" (input lag) при швидких подіях (наприклад, скрол, драг або часті кліки). Ми частково вирішили це додавши кешування на основі ідентичності посилання `stateRef.current`.

**Можливе рішення (Ідеальне):** Замість `cloneDeep` використовувати `Proxy` для `originalState`.
*   Читання (GET) повинні працювати прозоро (zero-cost).
*   При спробі запису (SET) створювати локальну копію (copy-on-write, подібно до того, як працює `immer.js`).
*   Це прибере O(N) оверхед на клонування і зробить виконання івентів майже миттєвим, незалежно від розміру стейту.

### Оптимізація парсингу івентів (AST Caching) — ВИКОНАНО ✅
Для зменшення навантаження при обході дерева (`computeUsesForTree`) у модулі впроваджено `astCache` (Map) для кешування результатів парсингу рядкових івентів (`onClick="flag = true"`). Це значно зменшує час ініціалізації при наявності повторюваних івентів.

### Metadata-based IMPLICIT_CONTAINER_COMPONENT_NAMES

Поточний підхід — hardcoded список. Кращий підхід: компоненти декларують `isImplicitContainer: true` у своєму descriptor. Це дозволить third-party компонентам оптоутитись або вступити.

### Розширення списку implicit containers

Проаналізувати які ще компоненти в xmlui мають структуру "Items + дані" і повинні ізолювати свій стан від батьківського tree.

### Loop-оптимізація для Items/List рядків

Кожен рядок списку (`$item`) рендерується окремим `ComponentWrapper`. При зміні непов'язаних батьківських змінних всі рядки ре-рендеряться. `computedUses` на рівні рядку може ізолювати це — але потребує обережного аналізу бо `$item` є контекстуальною змінною.

### Incremental update замість повного перерахунку

При hot-reload або динамічній зміні компонента виконується повний `computeUsesForTree`. Для великих app це O(n). Incremental update (перерахунок лише зміненого піддерева) може прискорити dev-reload.

### Оптимізація `computedUses` для компонентів з code-behind (`.xs` файли / `<script>` теги)

Наразі user-defined компоненти з code-behind повністю виключені зі звуження — вони та їхні діти отримують повний батьківський стан. Це коректно, але залишає потенційну оптимізацію на столі.

**Що потрібно для реалізації:**
1. AST-аналіз тіл функцій у `.xs` файлах та `scriptCollected` — збирати ідентифікатори що читаються/пишуться у функціях (не лише у шаблонних виразах).
2. Транзитивне відстеження залежностей через `import`: якщо `FoldersTree` імпортує `{ copyOrCut }` з `shared.xs`, і `copyOrCut` всередині читає `fileClipboard` та `catalogSelection` — ці змінні мають попасти до `parentDependencies` `FoldersTree`.
3. Обробка взаємних імпортів та циклічних залежностей між `.xs` файлами.

**Складність:** транзитивний аналіз через import-граф потребує повного AST дерева всіх `.xs` файлів, що значно ускладнює реалізацію і уповільнює час збірки. Можливий компроміс: аналізувати лише **прямі** тіла функцій (без транзитивних імпортів) і довіряти що imported функції завжди знаходять потрібні змінні через `localContext` (що вірно для framework globals).

### Серіалізація `computedUses` в bundle

Якщо xmlui-app компілюється в bundle, `computedUses` може бути серіалізований разом з деревом і не перераховуватись при завантаженні — лише верифікуватись.

### Відновлення оптимізації для контейнерів з only-dynamic-var залежностями (Баг 19 trade-off)

**Проблема:** Фікс Бага 19 ввів `nonDynamicParentDeps.size > 0` як guard для встановлення `computedUses`. Якщо контейнер залежить ЛИШЕ від `PARENT_STATE_DYNAMIC_VARS` (наприклад, лише від `$context`), `computedUses` взагалі не встановлюється — контейнер отримує повний батьківський стан при кожному ре-рендері. Це коректно, але гірше оптимізовано.

**Приклад втраченої оптимізації:**
```xml
<App>
  <ContextMenu id="projectMenu">...</ContextMenu>
  <SomeContainer>
    <!-- читає лише $context, нічого іншого зі стану батька -->
    <Text value="{$context.name}" />
  </SomeContainer>
</App>
```
Ідеально: `SomeContainer.computedUses = ["$context", "projectMenu"]` (або хоча б `["$context"]`).
Реально: `computedUses` не встановлюється → повний стан.

**Чому так складно:**
1. `$context` живе в батьківському StateContainer (наприклад Theme#root), але його початкове значення — `undefined`. `extractScopedState(state, ["$context"])` повертає `{}` поки `openAt` не викликано. Тому `computedUses = ["$context"]` ізолює контейнер від усіх інших ключів (включно з API сусідів типу `projectMenu`).
2. Щоб включити `"projectMenu"` до `computedUses` разом із `"$context"`, алгоритм мав би знати, що `projectMenu` — це API що реєструється в тому ж батьківському контейнері. Але статичний аналіз лише бачить що `projectMenu` виходить з піддерева (escapingUID → localDeclared) і вважає його "локально owned". Дізнатись, що в runtime він опиниться у БІЛЬШ далекому предку (Theme#root) неможливо без знання runtime topology.

**Можливі підходи для майбутнього:**
- **Підхід A — late fixup**: після `computeUsesInternal` зробити ще один pass, що для кожного контейнера з `computedUses` перевіряє, чи є в батьківському дереві UIDs (escapingUIDs), які цей контейнер використовує. Включити їх в `computedUses` явно. Потребує зберігати `escapingUIDs` в `ComponentDef` під час першого pass.
- **Підхід B — `extractScopedState` fallback**: якщо `extractScopedState(parentState, computedUses)` не містить жодного ключа (тобто все що запитувалось ще не в стані), повернути `parentState` цілком. Але це runtime зміна і може замаскувати інші проблеми.
- **Підхід C — кеш "previous non-empty"**: `stateFromOutside` зберігає останній непустий результат і використовує його поки новий не з'явиться. Складно при cold-start.
- **Підхід D — explicit `$context` marker**: замість `PARENT_STATE_DYNAMIC_VARS`-фільтрації використовувати окремий механізм: контейнер що читає `$context` і НІЧОГО іншого отримує `computedUses = ["$context"]` + спеціальний прапор `computedUsesIncludeFullOnEmpty: true`, що в `StateContainer` означає "fallback to full state if scoped is empty".

---

## Команди для запуску тестів

```bash
# Unit-тести алгоритму
cd xmlui && npm run test:unit -- tests/components-core/optimization/computedUses.test.ts

# Повний unit suite
cd xmlui && npm run test:unit

# E2E тести computedUses (потребує запущеного dev server на порту 3211)
cd xmlui && npm run test:e2e -- tests-e2e/computed-uses.spec.ts --project xmlui-nonsmoke

# TypeScript check
cd xmlui && npx tsc --noEmit
```
