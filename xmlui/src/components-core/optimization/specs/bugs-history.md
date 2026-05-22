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

### Баг 22 (виявлений у Group E, `delay-a-datasource-until-another-datasource-is-ready.spec.ts`): локальні параметри arrow-функцій витікали в `computedUses` через гілку `T_FUNCTION_INVOCATION_EXPRESSION`

**Симптом:** E2E тести Group E падали — Select з `when="{userOptions.length > 0}"` ніколи не ставав видимим. Перший DataSource робив запит, отримував 200 OK, але `users_for_ds_dependency.loaded` ніколи не передавалось у стан App: state, що бачили діти App, було звужено до `["departments"]`, де `departments` — це **параметр arrow-функції** у `onLoaded`, а не змінна батьківського стану.

XML тестового кейсу (фрагмент):
```xml
<DataSource id="departments_with_ds_dependency"
  onLoaded="(departments) => {
    userOptions = users_for_ds_dependency.value.map(user => {
      const department = departments.find(d => d.id === user.departmentId);
      return { id: user.id, label: user.name + ' (' + department.name + ')' };
    });
  }" />
```

`departments` — параметр arrow-функції. Скоуп-аналіз у `visitors.ts` коректно обробляє `T_ARROW_EXPRESSION` (заштовхує блок, декларує args, обробляє тіло, попує блок). Лookup через `T_IDENTIFIER` і `traverseMemberAccessChain` дивиться `getIdentifierScope` і фільтрує block-локальні імена. Але гілка `T_FUNCTION_INVOCATION_EXPRESSION` (для `caller.member(...)` де `caller.obj` — це `T_IDENTIFIER`) ОБХОДИЛА цю перевірку — і прямо штовхала `caller.obj.name` у `uncDeps` без `getIdentifierScope`:

```ts
// xmlui/src/components-core/script-runner/visitors.ts
if (caller.obj.type === T_IDENTIFIER) {
  if (typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) === "function") {
    uncDeps.push(`${caller.obj.name}.${caller.member}`);
  } else {
    uncDeps.push(`${caller.obj.name}`); // ← block-локальний `departments` витікав сюди
  }
}
```

Для `departments.find(d => ...)` це означало: `departments` (LOCAL block param) → бульбашка вгору як free var → `App.computedUses = ["departments"]` → `extractScopedState(parentState, ["departments"])` повертав `{}` (немає такого ключа) → App втрачав ВЕСЬ свій стан, включно з API дочірнього `<DataSource id="users_for_ds_dependency">` → `users_for_ds_dependency.loaded` завжди `undefined` → другий DataSource ніколи не запускався.

**Виправлення:** додано `getIdentifierScope` лookup перед push:

```ts
// xmlui/src/components-core/script-runner/visitors.ts
if (caller.obj.type === T_IDENTIFIER) {
  // Respect block scope: a function call like `param.method(...)` where
  // `param` is a locally declared identifier (arrow-fn parameter,
  // const/let in the current scope, etc.) is NOT a parent-state
  // dependency. Skip it to avoid polluting computedUses with names
  // that don't live in the parent container.
  const callerScope = getIdentifierScope(caller.obj, evalContext, thread);
  if (callerScope.type !== "block") {
    if (typeof get(referenceTrackedApis, `${caller.obj.name}.${caller.member}`) === "function") {
      uncDeps.push(`${caller.obj.name}.${caller.member}`);
    } else {
      uncDeps.push(`${caller.obj.name}`);
    }
  }
}
```

**Чому це безпечно:**
1. Тільки одна гілка коду `T_FUNCTION_INVOCATION_EXPRESSION` для `T_IDENTIFIER`-caller тепер симетрично використовує scope-чек, як і сусідні гілки `T_MEMBER_ACCESS_EXPRESSION` (через `traverseMemberAccessChain`) і `T_IDENTIFIER` (інший switch case).
2. `getIdentifierScope` уже інстанціюється — оверхеду немає; ми лише читаємо результат.
3. Reactive dependency tracking (інший виклик `collectVariableDependencies` без `includeAssignmentTargets`) також виграє: метод-виклик на локальному ідентифікаторі не повинен викликати реактивний ре-рендер.

**Слід мати на увазі:** інші місця, що вручну штовхають імена в deps, мають бути перевірені на той же шаблон. Наразі це єдина гілка, що обходила scope-aware lookup. Симетричний випадок з `T_CALCULATED_MEMBER_ACCESS_EXPRESSION` (`arr[expr]`) у функції-виклику передає об'єкт у рекурсивний `collectDependencies`, який вже коректно фільтрує локальні.

**Файли:** `xmlui/src/components-core/script-runner/visitors.ts` (1 hunk: scope-guard before push у `T_FUNCTION_INVOCATION_EXPRESSION`).

---

### Баг 23 (виявлений у Group D, `cancel-a-deferred-api-operation.spec.ts`): implicit containers ізолювали дочірні APIs через розбіжність static vs runtime власника

**Симптом:** Е2Е тести Group D падали — кнопки "Cancel" залишалися в неправильному стані (`enabled`). Причина була у тому, що обробники бачили `exportJob = undefined`, хоча в XML він був оголошений поруч:
```xml
<Fragment var.testState>
  <APICall id="exportJob" ... />
  <Button enabled="{exportJob.inProgress}" ... />
</Fragment>
```

**Причина:** 
1. **Runtime семантика:** "Implicit container" (вузол з `vars`/`loaders`, але БЕЗ явного `uses`) у XMLUI делегує виклик `registerComponentApi` батьку. Тобто API дочірніх компонентів (`exportJob`) реально потрапляє у стан батьківського контейнера, а не самого імпліцитного контейнера.
2. **Статичний аналіз (помилка):** Алгоритм вважав, що БУДЬ-ЯКИЙ контейнер (включно з імпліцитним) є власником дочірніх UIDs. Він додавав `exportJob` до `localDeclared` імпліцитного контейнера і, відповідно, **фільтрував** його з `parentDependencies`.
3. **Результат:** Коли якась інша залежність (наприклад, `toast`) тригерила створення `computedUses` для імпліцитного контейнера, цей список НЕ містив `exportJob`.
4. **Наслідок:** `extractScopedState(parentState, ["toast"])` ВИКИДАВ `exportJob` зі стейту. Кнопка всередині контейнера бачила `exportJob = undefined`.

**Виправлення:**
1. Введено поняття **Explicit Owner** (`isExplicitOwner`): це або вузол типу `Container`, або будь-який вузол з явно визначеним `uses`. Тільки такі вузли по-справжньому захоплюють дочірні APIs у свій стан у рантаймі.
2. **Пропагація UIDs:** Імпліцитні контейнери тепер не вважають дочірні UIDs "локально оголошеними". Ці UIDs продовжують "спливати" (`escapingUIDs`) до найближчого явного власника.
3. **Включення у `computedUses`:** Якщо для імпліцитного контейнера створюється `computedUses` (через інші залежності), ми ПРИМУСОВО додаємо туди всі UIDs дітей, що спливають (`childEscapingUIDs`). Оскільки в рантаймі вони живуть у батьківському стані, вони МАЮТЬ бути в списку дозволених ключів, щоб не бути відфільтрованими при звуженні стейту.

**Файли:** `computedUses.ts`, `tests/components-core/optimization/computedUses.test.ts`.

---

### Баг 24 (виявлений у Group J, `compound-component.spec.ts` "var initialized with `$queryParams` ..."): тіло compound компонента залишалось зі **застарілим** `computedUses` після runtime-розпакування у `CompoundComponent`

**Симптом:** Усередині user-defined компонента (`<Component name="FilteredView" var.selectedFilter="{$queryParams.filter ? $queryParams.filter : 'all'}">  <Text>{selectedFilter}</Text></Component>`) `Text` показував порожнечу/`null` після SPA-навігації або прямого URL-завантаження `/#/?filter=hello`. Очікувалось — `"hello"`. Знімок DOM (Playwright `error-context`) показував літерал `"null"`. З вимкненим `COMPUTED_USES_ENABLED` обидва тести проходили.

**Причина (повний ланцюг):**
1. **Boot phase** (`StandaloneApp.tsx:753`) викликає `computeUsesForTree(compDef.component)` для тіла кожного compound-визначення. На цей момент `vars` (включно з `selectedFilter`) ще ВСЕРЕДИНІ `compDef.component`. Алгоритм коректно додає `selectedFilter` до `localDeclared` і будує `compDef.component.computedUses = ["$queryParams"]` (тільки зовнішні залежності, без власних vars — це задумано).
2. **Runtime** `CompoundComponent.tsx` для кожного `<FilteredView />` створює новий обгортковий `Container`:
   ```ts
   const { loaders, vars, functions, scriptError, ...rest } = compound;
   return {
     type: "Container",
     vars,                  // ← vars переїжджають на ОБГОРТКУ
     uses: globalKeys,
     children: [rest],      // ← тіло без vars стає дитиною
   };
   ```
   Але `rest` через spread зберігає `compound.computedUses = ["$queryParams"]`.
3. Тепер `rest` за `isContainerLike` визнається контейнером (`hasComputedUses === true`), тому `ComponentWrapper`/`StateContainer` для нього викликає `extractScopedState(parentState, rest.computedUses)`.
4. `parentState` для `rest` — це `combinedState` обгорткового `Container` (включає `selectedFilter: "hello"` з резолвлених `vars` + `$queryParams` з `routingParams`).
5. `extractScopedState(combinedState, ["$queryParams"])` повертає `{ $queryParams: ... }` — **`selectedFilter` ВТРАЧЕНО**, бо його немає в `uses`.
6. `Text` бачить `selectedFilter = undefined` → рендерить порожнечу/`null`.

**Чому з вимкненим `COMPUTED_USES_ENABLED` все працювало:** `computeUsesForTree` достроково виходить, `compound.computedUses` не встановлюється, `rest.computedUses === undefined` → `extractScopedState` повертає повний `parentState`, `selectedFilter` залишається видимим.

**Чому статичний результат правильний в ізоляції, але неправильний після runtime-розпакування:** `computedUses` рахується ВІДНОСНО ієрархії, що існує під час аналізу. Коли `CompoundComponent` міняє ієрархію в рантаймі (переносить vars з тіла на обгортку), `computedUses` тіла стає семантично застарілим: те, що було `localDeclared` тоді, тепер є зовнішньою залежністю.

**Виправлення:** У destructure в `CompoundComponent.tsx` додати `computedUses: _staleComputedUses` — щоб `...rest` НЕ ніс цей застарілий список. Без `computedUses` і без `uses` тіло `rest` стає stateless (`isContainerLike → false`), не створює свій `StateContainer`, і `Text` читає `selectedFilter` напряму зі state обгорткового `Container` через `ComponentAdapter`.

```ts
// xmlui/src/components-core/CompoundComponent.tsx
const {
  loaders, vars, functions, scriptError,
  computedUses: _staleComputedUses,  // ← новий destructure
  ...rest
} = compound;
```

**Альтернативи розглянуті і відкинуті:**
- *Перерахувати computedUses на новій ієрархії в рантаймі* — складніше, повторює статичний аналіз, не дає виграшу: rest після зняття vars не має власних залежностей, які б потребували окремого StateContainer.
- *Не запускати computeUsesForTree для `compDef.component`* — втрачаємо оптимізацію для вкладених контейнерів усередині compound body (наприклад `<Select>` всередині).
- *Завжди включати vars-keys у computedUses тіла* — порушує семантику: ці vars є локальними з точки зору самого аналізу, не повинні бути в `computedUses`.

**Файли:** `xmlui/src/components-core/CompoundComponent.tsx`, `xmlui/tests/components-core/optimization/computedUses.test.ts` (inline describe `"Бaг 24 — stale computedUses after CompoundComponent restructure"`, 4 кейси), `xmlui/tests-e2e/computed-uses.spec.ts` (секція 7 — мінімальні e2e репро без залежності від роутингу), `xmlui/tests-e2e/compound-component.spec.ts:722,759` (e2e регресія на оригінальному $queryParams-сценарії).

**Загальний урок (для майбутніх рефакторів):** Будь-який код, який РЕСТРУКТУРУЄ дерево компонентів між boot-time аналізом і runtime рендерингом, мусить ВРАХОВУВАТИ всі похідні від цього дерева властивості (`computedUses`, можливо в майбутньому інші статичні анотації). Spread (`...rest`) безпечний для незмінених піддерев, але небезпечний для метаданих, які залежали від попередньої структури. Сформульовано як інваріант — див. розділ «Неочевидні архітектурні рішення → 22. Інваріант: runtime restructure інвалідовує статичний `computedUses`».

---

### Баг 26 (виявлений у Group N + Group O, `Select.spec.ts` + `Table.spec.ts`): Mandatory Shielding ламав `syncWithVar` і clearable/multiSelect Select

**Симптом:** Після впровадження Mandatory Shielding (комміт `e50613830`) e2e regress: 21 тест (15 у `Select.spec.ts`, 6 у `Table.spec.ts`).

- **Group O (Table `syncWithVar`):** `Table syncWithVar="syncState"` усередині `<Fragment var.syncState="{{}}">`. Очікувано — клік чекбоксом записує `{selectedIds:[1]}` у `syncState`, відображення `JSON.stringify(syncState)` оновлюється. Реально — display залишався `"{}"`.
- **Group N (Select):** 15 тестів `Select.spec.ts` (multiSelect, groupBy, clearable, valueTemplate, ungrouped headers). Після вибору опції тригер не показував badge з обраним label. Деякі тести (`clear button triggers didChange event`) падали з `Target page, context or browser has been closed` — браузер падав, бо internal state Select виявлявся неконсистентним.

**Корінь:** Mandatory Shielding безумовно загортав heavy-компоненти у власний `StateContainer` навіть без read-deps, ставлячи `computedUses = []`:

1. **Table:** Render-time код `Table.tsx:723` робить `extractValue(`{${syncVarName}}`)`. Через `computedUses=[]` звужений parent state — `{}`, тому `extractValue("{syncState}")` повертає `undefined`. Перевірка `if (currentSyncVarValue != null)` обриває створення `syncAdapter`. Запис у `syncState` не відбувається.
2. **Select:** Той же фіх Бaг 20 явно фіксує: загортання Select у `StateContainer` (коли немає read-deps) ламає внутрішню логіку clearable/multiSelect. Mandatory Shielding скасовує цей фікс — додає `StateContainer`-щит до Select зі статичним вмістом, відновлюючи Бaг 20 у новій формі.

**Чому з вимкненим `COMPUTED_USES_ENABLED` все працювало:** алгоритм рано виходить, `computedUses` не встановлюється на Select/Table, обидва компоненти лишаються "голими" в межах батьківського `Fragment`. `extractValue("{syncState}")` бачить повний `combinedState` Fragment, Table-adapter створюється і пише в `syncState`. Select-internals працюють без додаткового щита.

**Виправлення:** Відкат Mandatory Shielding у `computedUses.ts`:

```ts
// Було (Mandatory Shielding):
const isImplicitDefault = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type);
const isContainer = isKnownContainer || (isImplicitDefault && (nonDynamicReadDeps.size > 0 || isImplicitDefault));
// ...
if (node.uses === undefined && (nonDynamicReadDeps.size > 0 || isImplicitDefault) && safeToNarrow) { ... }

// Стало (доjon-state, повернуто до Бaг 20-eri):
const isImplicitDefault = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && nonDynamicReadDeps.size > 0;
const isContainer = isKnownContainer || isImplicitDefault;
// ...
if (node.uses === undefined && nonDynamicReadDeps.size > 0 && safeToNarrow) { ... }
```

Bug 25 (Symbol UID-фільтр) залишено — це не залежить від Mandatory Shielding.

**Альтернативи розглянуті і відкинуті:**
- *Додати `syncWithVar` як спеціальну залежність у `computedUses`:* фіксує лише Group O. Group N (Select) ламається з іншої причини — внутрішня логіка clearable/multiSelect не сумісна із загортанням у `StateContainer` без read-deps.
- *Виправити Select internals для роботи з `computedUses=[]`:* потребує глибокого реінжинірінгу `useSelectionContext`/popover-механізму. Бaг 20 показав, що це не тривіальна задача, і без runtime-діагностики ризик нових регресій високий.
- *Залишити Mandatory Shielding лише для Table:* нелогічно — той самий механізм ламає різні речі в обох компонентах. Чистіший підхід — повернутися на доjon-Mandatory логіку.

**Наслідки:** Повністю статичні Select/List/Table/DataGrid знову ре-рендеряться при кожному тіку батьківського state. Це відповідає поведінці до 2026-05-21 PM run (0 failed) і не блокує користувацькі сценарії — реальні застосунки майже завжди мають `data={...}` як read-dep, який природно тригерить promotion.

**Файли:**
- `xmlui/src/components-core/optimization/computedUses.ts` — revert isImplicitDefault/narrowing-guard
- `xmlui/tests/components-core/optimization/computedUses.test.ts` — оновлено 4 unit-тести "(Mandatory Shielding)"
- `xmlui/tests-e2e/computed-uses.spec.ts` — `test.skip` для render-count тесту static Select

**Слід мати на увазі (TODO):** Майбутній не-narrowing щит для статичних heavy-компонентів (наприклад, `React.memo`-обгортка без `StateContainer`) має бути ортогональним до `extractScopedState`, щоб уникнути повторення цього конфлікту.

---

### Баг 27 (виявлений у Group P, `Checkbox.spec.ts` "Custom inputTemplate"): `extractScopedState` фільтрував Symbol-ключові записи при наявності `computedUses`

**Симптом:** `Checkbox` з `inputTemplate` та зовнішнім сусідом, що посилається на `$checked` (наприклад `<Button label="{$checked}"/>` поряд з `<Checkbox>`), — Toggle невпинно залишався в стані `false` незалежно від користувацької взаємодії. useEffect на Toggle правильно викликав `updateState({value: true})`, але наступна фаза narrowing дискардувала це оновлення.

Коректна поведінка: Toggle отримує та зберігає новий `value=true`, `$checked` обчислюється як `true`, `inputRenderer({$checked: true})` рендерить правильно.

**Причина (повний ланцюг):**

1. Button (сусід Checkbox) містить `label="{$checked}"`. Оптимізатор бачить `$checked` як вільну змінну на рівні батьківського контейнера (Fragment) і додає `$checked` до `parentDependencies` Fragment → `computedUses=["$checked"]`. (Це коректно — `$checked` це ім'я впроваджене Checkbox, не сусідом.)

2. `extractScopedState(parentState, ["$checked"])` у `ComponentWrapper` для Fragment звужує батьківський стан. String-branch `if (key in parentState)` — нічого не додає (бо `parentState` ніколи не має `$checked` як string-ключ). Symbol-branch міст:
   ```ts
   for (const sym of Object.getOwnPropertySymbols(parentState)) {
     if (sym.description && usesSet.has(sym.description)) {  // ← помилка тут
       picked[sym] = (parentState as any)[sym];
     }
   }
   ```
   Checkbox-ін стан зберігається під `Symbol(checkbox-uid)`. Символ має `description = "checkbox-uid"` (або порожній/undefined, якщо uid не встановлений). `usesSet = {"$checked"}`, тому `usesSet.has("checkbox-uid") = false`. Symbol **відкидається**.

3. `ComponentAdapter` для Checkbox: `state: state[uid] || EMPTY_OBJECT`. Без Checkbox-слайса в state — `state[uid] = EMPTY_OBJECT`.

4. `wrapComponent` у Checkbox-렌더러: `props.value = state.value` → `undefined`.

5. Toggle отримує `value={undefined}`, викликає `transformToLegitValue(undefined) = false`, рендерить `"false"` у innerTemplate. Initial `useEffect` записує `updateState({value: true})` → зміна стану → Checkbox перерендериться.

6. **Но́:** ComponentAdapter перерендериться з тим самим звуженим `state={...}` (без Checkbox-слайса), `props.value = undefined` знову, Toggle знову рендериться як `"false"` → нескінченний цикл без convergence.

**Чому простіші тести (846/857/870) вже проходили:** Без зовнішнього посилання на `$checked`, жоден батьківський контейнер ніколи не отримував `computedUses` зі `$checked`. Fragment мав `computedUses = undefined` → `extractScopedState` повертав повний `parentState` (line 153: `if (!uses) return parentState`) → Symbol-фільтр ніколи не активувався.

**Виправлення:** [ContainerUtils.ts:extractScopedState](../../src/components-core/rendering/ContainerUtils.ts) — зберігати ВСІ Symbol-ключі без фільтрування:

```ts
// Було:
for (const sym of Object.getOwnPropertySymbols(parentState)) {
  if (sym.description && usesSet.has(sym.description)) {
    picked[sym] = (parentState as any)[sym];
  }
}

// Стало:
for (const sym of Object.getOwnPropertySymbols(parentState)) {
  picked[sym] = (parentState as any)[sym];
}
```

Symbols — це внутрішній стан компонента (зареєстровані через `registerComponentApi`), не зовнішні subscribable імена. Реактивне звуження string-ключів залишається без змін. Symbols завжди зберігаються, тому що вони ніколи не є частиною consumer-facing `uses`.

**Регресійний тест:** [tests/components-core/optimization/computedUses.test.ts](../../tests/components-core/optimization/computedUses.test.ts) → describe block `"extractScopedState preserves Symbol-keyed component state across narrowing"`:

```ts
it("Symbols are kept even when their description is NOT in `uses`", () => {
  const childA = Symbol("childA");
  const childB = Symbol("");
  const childC = Symbol(undefined);
  const parentState: any = {
    known: 1,
    ignored: 2,
    [childA]: { value: true },
    [childB]: { value: true },
    [childC]: { value: true },
  };
  const picked = extractScopedState(parentState, ["known"]) as any;
  expect(Object.keys(picked)).toEqual(["known"]);
  expect(childA in picked).toBe(true);
  expect(childB in picked).toBe(true);
  expect(childC in picked).toBe(true);
  expect(picked[childA]).toEqual({ value: true });
});
```

**Регресійні перевірки:** 114/114 `Checkbox.spec.ts`; 95/95 `computedUses` unit tests; 479/479 більша E2E suite (RadioGroup, Form, Tabs, List) — усі pass.

**Слід мати на увазі:** `Symbol(uid)` запис добавляється в стан через `mergeComponentApis` (див. [rendering/ComponentAdapter.tsx](../../src/components-core/rendering/ComponentAdapter.tsx)). Компонент реєструє свій API раз на mount через `registerComponentApi({focus, setValue, ...})`, батьківський StateContainer це зберігає під обома `{stringKey: api, [Symbol(uid)]: api}`. Динамічне фільтрування Symbols за description порушує це дублювання та ламає Proxy-доступ до компонентного слайса у `state[uid]`. Це особливо критично для wrapped компонентів (Toggle, Input, Select-렌더러) що динамічно оновлюють `value` через `updateState`.

**Файли:** `xmlui/src/components-core/rendering/ContainerUtils.ts`, `xmlui/tests/components-core/optimization/computedUses.test.ts`.
