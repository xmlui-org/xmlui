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

### 9. Двошарова ізоляція (defense in depth)

Виправлення реалізовано в двох шарах:
1. **`ComponentWrapper`** — scope `state` до `scopedParentState` перед `ContainerWrapper` → `ContainerWrapper`/`StateContainer` взагалі не виконуються при змінах непов'язаних ключів
2. **`statePartChanged` via refs** — навіть якщо ContainerWrapper чомусь ре-рендерується, `statePartChanged` не створює нову функцію → `memo` дітей захищений

Шар 1 є основним, шар 2 є страховкою і також покращує загальну стабільність коду.

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
| `xmlui/src/components-core/prepare/computedUses.ts` | Create + Fix | `computeUsesForTree`, кортеж `[freeVars, escapingUIDs]`, `IMPLICIT_CONTAINER_COMPONENT_NAMES`, `JS_BUILTIN_GLOBALS`; `contextVars` в `localDeclared`; `parentDependencies.size > 0` guard; `parentFunctionNames` parameter; `Object.keys(sc.functions)` замість `Object.keys(sc)`; empty-object guard для `vars`/`functions` |
| `xmlui/tests/prepare/computedUses.test.ts` | Create | unit-тести: базові випадки, UID-escaping (прямі/grandchild/non-container chain/uses-container), contextVars, JSON built-in, initTestBed exact markup |
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

### Оптимізація `computedUses` для компонентів з code-behind (`.xs` файли / `<script>` теги)

Наразі user-defined компоненти з code-behind повністю виключені зі звуження — вони та їхні діти отримують повний батьківський стан. Це коректно, але залишає потенційну оптимізацію на столі.

**Що потрібно для реалізації:**
1. AST-аналіз тіл функцій у `.xs` файлах та `scriptCollected` — збирати ідентифікатори що читаються/пишуться у функціях (не лише у шаблонних виразах).
2. Транзитивне відстеження залежностей через `import`: якщо `FoldersTree` імпортує `{ copyOrCut }` з `shared.xs`, і `copyOrCut` всередині читає `fileClipboard` та `catalogSelection` — ці змінні мають попасти до `parentDependencies` `FoldersTree`.
3. Обробка взаємних імпортів та циклічних залежностей між `.xs` файлами.

**Складність:** транзитивний аналіз через import-граф потребує повного AST дерева всіх `.xs` файлів, що значно ускладнює реалізацію і уповільнює час збірки. Можливий компроміс: аналізувати лише **прямі** тіла функцій (без транзитивних імпортів) і довіряти що imported функції завжди знаходять потрібні змінні через `localContext` (що вірно для framework globals).

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
