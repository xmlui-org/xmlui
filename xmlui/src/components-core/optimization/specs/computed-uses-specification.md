# computedUses — Дизайн та реалізація

> Технічний дизайн-документ фічі `computedUses`. Описує поточну реалізацію, архітектурні рішення, інваріанти, підводні камені та напрями майбутньої оптимізації. Для повної хронології виявлених та виправлених багів у процесі реалізації — див. [bugs-history.md](./bugs-history.md).

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

## Mandatory Shielding (Обов'язкове екранування)

Для певних "важких" компонентів (`Select`, `List`, `Table`, `DataGrid`) оптимізація `computedUses` застосовується **завжди**, навіть якщо вони не мають явних залежностей від батьківського стану (тобто `parentDependencies` порожній).

**Причина:** Ці компоненти рендерять великі обсяги даних або складну розмітку. Наявність `StateContainer` (і відповідно `React.memo` межі) є критичною для продуктивності — вона захищає компонент від зайвих ре-рендерів при кожній зміні будь-якої змінної в `App` чи іншому батьківському контейнері.

**Реалізація:**
1. `isImplicitDefault` встановлюється в `true` для всіх компонентів з `IMPLICIT_CONTAINER_COMPONENT_NAMES`.
2. Встановлюється `node.computedUses = []` (або список ідентифікаторів, якщо вони є), що змушує `extractScopedState` повертати стабільний (зазвичай порожній) об'єкт, забезпечуючи ефективну роботу `React.memo`.

**Виправлена помилка при впровадженні:** Початкова версія умови помилково промоутила до контейнерів БУДЬ-ЯКИЙ компонент з залежностями. Це призводило до надмірного звуження стейту для простих лейаут-компонентів (як `HStack`), що ламало видимість API сусідніх компонентів у їхніх обробниках подій. Фінальна версія суворо обмежує безумовну промоцію лише списком `IMPLICIT_CONTAINER_COMPONENT_NAMES`.

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

**Слід також мати на увазі:** власний uid контейнера (наприклад, `<Stack uid="innerStack" var.x="{0}">`) виходить до БАТЬКІВСЬКОГО контейнера — не до себе. При runtime контейнер реєструє свій API у батьківському `StateContainer`, тому батько не потребує цього uid у власному `computedUses` — він потрапляє до `localDeclared` батька через `escapingUIDs`.

### 6. `contextVars` (`$item`, `$index`) — локальні для Items/List

`contextVars` на вузлі (`{ $item: "$item" }`) означає що ці змінні доступні в піддереві але оголошені локально. `localDeclared` збирає їх — вони не виходять назовні.

**Слід мати на увазі:** відсутність `contextVars` ключів у `localDeclared` призводить до того що `$item` витікає крізь Items → вгору до Select → Select отримує `parentDependencies = {"$item"}` → стає implicit container → `computedUses = ["$item"]` → Select огортається в outer `Container` → `extractScopedState(parentState, ["$item"]) = {}` → внутрішній wrappedSelect отримує `uid = undefined` → всі `updateState` від компонента-рендера диспетчаться з анонімним `Symbol(undefined)` → значення не прокидається у `mergeComponentApis` як рядкова властивість → `{mySelect.value}` ніколи не оновлюється.

### 7. Семантика `computedUses = []` проти `undefined`

`computedUses = []` (порожній масив) і `computedUses = undefined` — це НЕ одне і те ж. Порожній масив через `extractScopedState` означає "ізолювати весь батьківський стан", що ламає неявні контейнери. Тому `computedUses` слід встановлювати лише коли дійсно є що декларувати.

### 8. JavaScript built-in globals ніколи не є залежностями app state

`collectVariableDependencies` не фільтрує стандартні JS globals. Вираз `{JSON.stringify(x)}` поверне `["JSON", "x"]` як залежності. Але `JSON` ніколи не зберігається в app state → `extractScopedState(state, ["JSON"]) = {}` → ізоляція.

**Слід мати на увазі:** набір `JS_STDLIB_GLOBALS` охоплює ECMAScript standard + universally-available globals. Bare `name in globalThis` не підходить бо браузер виставляє сотні legacy `window.*` властивостей (`external`, `screen`, `status`, тощо) що можуть збігатись з іменами XMLUI vars. При появі нових ECMAScript globals треба додавати їх до набору.

### 9. Тришарова ізоляція (defense in depth)

Виправлення реалізовано в трьох шарах:
1. **`ComponentWrapper` — `scopedParentState`** — scope `state` до `scopedParentState` перед `ContainerWrapper` → `ContainerWrapper`/`StateContainer` взагалі не виконуються при змінах непов'язаних ключів. Основний шар.
2. **`statePartChanged` via refs** — навіть якщо `ContainerWrapper` чомусь ре-рендерується, `statePartChanged` не створює нову функцію → `memo` дітей захищений. Страховка + загальна стабільність коду.
3. **`fullParentStateRef` як `MutableRefObject`** — повний батьківський стан для event handler scope передається як стабільний ref, а не value-prop → `ContainerWrapper/StateContainer/Container.memo` не реагують на зміну `.current` → оптимізація не defeated навіть коли повний state змінюється часто.

### 10. `mergeComponentApis` і Symbol ключі — механізм передачі API від дочірніх компонентів

При runtime `registerComponentApi(uid, api)` викликається з `uid = Symbol("mySelect")`. `ComponentAdapter` зберігає `{ [sym]: api }` у `componentApis`. `mergeComponentApis` виконує перетворення.

**Слід мати на увазі:** `combinedState` використовує spread (`{ ...mergedWithVars }`) який ігнорує Symbol ключі. Тому `state[Symbol("mySelect")]` у `ComponentAdapter` завжди `undefined` — рядковий ключ `state["mySelect"]` використовується для `{mySelect.value}` у Text. Якщо `wrappedNode.uid` видалено (як у `getWrappedWithContainer`), `uid = Symbol(undefined)`. `Symbol(undefined).description = undefined` → `mergeComponentApis` ігнорує цей Symbol при побудові рядкових ключів → значення компонента ніколи не з'являється як `"mySelect"` у state → `{mySelect.value}` завжди порожній.

### 11. Framework globals (`toast`, `Actions.callApi`) і screen-size vars — не в `JS_STDLIB_GLOBALS`

> **⚠️ TECHNICAL DEBT (See `TODO - framework-globals-leak-proposal.md`)**
> Раніше вважалося, що протікання фреймворкових глобалів у `computedUses` є безпечним, оскільки вони стабільні і резолвляться через `localContext`. Проте з'ясувалося, що це викликає серйозний баг (Хибну промоцію). Компоненти типу `Select`, які використовують `Actions.callApi()` у своїх івентах, помилково ідентифікуються як такі, що мають external read dependencies. Це призводить до непотрібного загортання компонента у важкий `StateContainer`, що збільшує оверхед та ізолює внутрішній стан компонента (ламається clearable та value bubbling). Фреймворкові глобали **мають бути відфільтровані** так само, як JS-стандарти, але список повинен імпортуватися з реєстра глобалів (наприклад, з `AppContext`), а не хардкодитись в оптимізаторі.

Framework globals (`toast`, `Actions.callApi`, etc.) та змінні розміру екрану (`$mediaSize`, `$breakpoint`) **не додаються** до `JS_STDLIB_GLOBALS`, і опиняються у `computedUses` якщо зустрічаються у виразах.
**Screen-size змінні** (`$mediaSize`, тощо) надходять через `routingParams` або `stableCurrentGlobalVars`, що додаються до `combinedState` **незалежно** від `stateFromOutside`. Тому якщо вони в `computedUses`, вони доступні через окремий канал. Це безпечний і правильний кейс використання.

### 12. Компоненти з code-behind виключені зі звуження `computedUses` (і їх діти теж)

User-defined компоненти з `<script>` тегом (`node.scriptCollected`) або зовнішнім `.xs` файлом (`node.functions` непорожній) **не отримують** `computedUses`, і їхнє піддерево також не звужується. Причина: алгоритм аналізує лише шаблонні вирази, але функції у code-behind можуть звертатися до **будь-яких** глобальних змінних стану — включаючи ті, що взагалі не згадуються в шаблоні.

**Слід мати на увазі:** вбудовані XMLUI компоненти (`Select`, `Table`, `List`, `DataGrid`) не мають ні `scriptCollected`, ні `functions` з code-behind — вони реалізовані у TypeScript. Звуження для code-behind компонентів потребує AST-аналізу тіл функцій та транзитивного відстеження залежностей через `import` ланцюжки. Це нетривіальна задача, що відкладена на майбутнє (див. TODO).

### 13. Трансляція батьківських функцій (`parentFunctionNames`) та структури `CollectedDeclarations`

`parentFunctionNames` передається лише від відомих контейнерів. Non-container-вузли просто успадковують `parentFunctionNames` від предка (scope не змінюється). Сам по собі `scriptCollected` має структуру `CollectedDeclarations` з вкладеними об'єктами `vars` та `functions`, тому потрібно обходити `Object.keys(sc.functions ?? {})`, а не поверхневі структурні ключі (виду `['vars', 'functions', 'moduleErrors']`).

### 14. Truthiness для `vars`/`functions` проти `scriptCollected`

`StandaloneApp.tsx` при мержі code-behind завжди встановлює `vars: { ...a, ...b }` і `functions: codeBehind?.functions`. Коли code-behind відсутній або порожній, результат — `{}` (порожній об'єкт). Порожній об'єкт truthy в JavaScript. 
**Слід мати на увазі:** завжди перевіряти на непустоту (`Object.keys(...).length > 0`) для об'єктів `vars` і `functions`, що приходять з merge. Але для `scriptCollected` (навіть порожнього), `contextVars`, `uses` та `loaders` достатньо перевірки на truthiness — їхня наявність уже гарантує контейнерну природу.

### 15. Runtime Context Vars (`$param`, `$item`) проти Routing State

Роутерні змінні (`$pathname`, `$routeParams`, `$queryParams`, `$linkInfo`) визначаються в `routing-state.ts`, є ключами `parentState` і **коректно потрапляють у `computedUses`**.
Всі інші `$`-змінні (наприклад, `$param` від `ModalDialog`, `$row`, `$context`) є **runtime context variables**. Оскільки вони впроваджуються локально і не є ключами `parentState`, вони безумовно фільтруються аналізатором `computedUses` через `isRuntimeContextVar`. Інакше б вони призвели до `extractScopedState(state, ['$param']) === {}` (ізоляції).

### 16. Доступ Event Handlers до повного стану (`MutableRefObject`)

Звуження стану `parentState = scopedParentState` застосовується **лише для рендерингу**. Але для того щоб Event Handlers могли писати у змінні, які вони самі прямо не зчитують, використовується "проброс" повного (незвуженого) об'єкта `state` від `ComponentWrapper` аж до `Container.stateRef` у вигляді `MutableRefObject`. Reference-стабільність запобігає зайвим ре-рендерам, але дає Scope-відповідність для `evalAssignmentCore`.

### 17. Динамічні змінні батьківського стану (`PARENT_STATE_DYNAMIC_VARS`)

Змінні на кшталт `$context` фактично живуть у батьківському стані (`Context` відкриває меню, диспетчить `$context`), проте їх ініціальне значення — `undefined`. Якщо контейнер звужується *виключно* до таких залежностей (`nonDynamicReadDeps.size === 0`), він повністю ізолюється, втрачаючи доступ до компонентних APIs (видалених з `extractScopedState`). Відповідно, промоція до контейнера не тригериться суто від `$context`.

### 18. Відстеження LHS (Assignment Targets) та розділення на `reads` і `all`

`collectVariableDependencies` у контексті AST обробляє і Right-Hand Side (для читань), і Left-Hand Side (для scope). Це дає два набори: `reads` (тільки читання) для тригерування реактивності (і промоції `isImplicitDefault`) та `all` (читання і запис), що формують остаточний масив `computedUses` для Scope. Реактивна підписка в рендері ігнорує LHS (флаг `includeAssignmentTargets: false`), щоб не реагувати на власні записи.

### 19. Ізоляція ключів `DataLoader` (Data fetch)

Подія `fetch` має специфічний lifecycle і контекст під час виконання: змінні `$url`, `$method` та `$queryParams` у `onFetch` впроваджуються локально. Аналізатор фільтрує їх через `DATA_FETCH_HANDLER_INJECTED_KEYS`, щоб зберегти роутерний `$queryParams` поза `computedUses`.

### 20. Scope lookup у AST (Arrow Expressions і Functions)

Всі залежності у AST (в тому числі `T_FUNCTION_INVOCATION_EXPRESSION` типу `caller.member()`) повинні обов’язково перевірятися через `getIdentifierScope`, щоб імена параметрів локальних arrow-функцій не витікали у вільні змінні `parentDependencies`.

### 21. Патерн `refs as event handlers` (React useEvent)

Аналогічно до `useEvent` RFC, колбеки (наприклад, `statePartChanged`), що передаються вниз, запам'ятовують мутабельні залежності (`resolvedLocalVars`, `stableCurrentGlobalVars`) у `useRef`, а сам колбек має стабільну ідентичність `[dispatch, node.uid]`. Це запобігає каскадному ре-рендерингу.

### 22. Інваріант: runtime restructure інвалідовує статичний `computedUses` (узагальнення Бaг 24)

**Інваріант:** `computedUses` обчислюється статично проти ієрархії компонентів, що ІСНУВАЛА під час `computeUsesForTree`. Якщо runtime пізніше **реструктурує** дерево — переміщує `vars`/`loaders`/`functions`/`scriptCollected` між контейнерами, додає обгортковий контейнер, виносить піддерево в іншого батька — пов'язані `computedUses` стають **семантично застарілими** і мусять бути або (a) видалені з зачеплених вузлів, або (b) перерахувані на новій структурі.

**Чому це не «частковий випадок»:** статичний аналіз класифікує імена на `localDeclared` vs `freeRead` відносно конкретної позиції вузла в дереві. Будь-яка операція, що змінює цю позицію (або переміщує declarations всередину/назовні вузла), змінює правильну відповідь — а `computedUses` запам'ятовує стару.

**Поточні точки реструктуризації в кодовій базі:**
- `CompoundComponent.tsx` — обгортає тіло compound у новий `Container`, переносить `vars`/`loaders`/`functions`/`scriptCollected` на обгортку. → Бaг 24, виправлено strip-ом `computedUses` з destructure.
- (потенційно інші у майбутньому) — будь-який runtime helper, що формує новий `ComponentDef` з частин існуючого, мусить дотримуватись цього інваріанта.

**Як перевіряти при додаванні нового коду:** якщо ви робите `{ ...node, vars: newVars, children: [...] }` або deconstructure `compound` з spread, спитайте себе:
1. Чи переміщую я `vars`/`loaders`/`functions`/`scriptCollected` між батьком і дитиною?
2. Чи додаю/прибираю проміжний контейнер?
3. Чи переходить власність UID (`uid:`) до іншого власника?

Якщо так до будь-якого з пунктів — статичні `computedUses` зачеплених піддерев треба видалити (`delete node.computedUses` або через destructure `computedUses: _, ...rest`) АБО викликати `computeUsesForTree` повторно на новій структурі. Перший варіант простіший і безпечний (fallback на «повний parent state», без оптимізації); другий точніший але дорожчий.

**Пов'язані відкриті проблеми:** TODO-файл `TODO - implicit-containers-vs-rerenders.md` описує іншу форму «статичний аналіз vs runtime реальність» — там runtime-вибір про промоушн heavy-компонента в контейнер залежить від набору read-deps, який щойно був відфільтрований bug-fix фільтрами. Хоч причина інша, тема та сама: будь-яка взаємодія між статичним аналізом і runtime поведінкою має бути явним інваріантом, не неявним припущенням.

### 23. Статичні типи проти рантайм-реальності (Рядкові UIDs та Symbols)

У статичних TypeScript-визначеннях (як `ComponentDef`) `uid` зазвичай типізований як `string`. Однак під час виконання, зокрема в `ComponentAdapter` та при роботі з `mergeComponentApis`, система активно використовує унікальні `Symbol` для ідентифікації інстансів компонентів (наприклад, для запобігання колізій між компонентами з однаковим ID або для маркування внутрішніх структур).

Статичний аналізатор `computedUses` створювався з розрахунком на те, що він оперує `string`-ідентифікаторами, які фігурують у виразах. Але оскільки він також захоплює `escapingUIDs` з дерева для побудови локальних скоупів, в рантаймі він міг зіткнутися із `Symbol`. Це призводило до краху при спробі обробити `Symbol` стандартними масивними методами (як `Array.prototype.sort()`).

**Слід мати на увазі:** Під час розробки інструментів аналізу та трансформації (які запускаються як на етапі парсингу, так і під час рантайму або тестів) необхідно явно враховувати можливість змішаних типів (`string | symbol`) для системних ідентифікаторів, навіть якщо TypeScript-інтерфейс (через Type Assertions) каже, що там лише `string`. Усі колекції, що зберігають UIDs, повинні безпечно обробляти (або відфільтровувати) `Symbol`.

### 24. "Explicit Owner" — implicit контейнери не захоплюють дочірні UIDs у runtime

**Визначення Explicit Owner:** вузол є явним власником дочірніх APIs, якщо він типу `Container` АБО має явно визначений `uses !== undefined`. Тільки такі вузли справді захоплюють виклики `registerComponentApi` у свій `StateContainer` під час runtime.

**Implicit container** (вузол з `vars`/`loaders`, але БЕЗ явного `uses`) делегує `registerComponentApi` батьківському контейнеру. API дочірніх компонентів (наприклад, `<APICall id="exportJob">`) реально потрапляє у стан **найближчого explicit owner**, а не самого implicit контейнера.

**Наслідки для `computedUses`:**
1. Алгоритм **не** додає дочірні UIDs до `localDeclared` implicit контейнера — вони продовжують "спливати" (`escapingUIDs`) до найближчого explicit owner.
2. Якщо для implicit контейнера таки створюється `computedUses` (через інші залежності, наприклад, `toast`), алгоритм **примусово** включає туди всі `childEscapingUIDs`. Без цього `extractScopedState(parentState, ["toast"])` відрізав би `exportJob` зі стейту → компонент всередині бачив би `exportJob = undefined`.

**Приклад:**
```xml
<Fragment var.toast="...">
  <APICall id="exportJob" ... />
  <Button enabled="{exportJob.inProgress}" ... />
</Fragment>
```

Runtime: `exportJob` API реєструється у батька Fragment (explicit owner), а не в самому Fragment.
Статичний аналіз: `exportJob` — escapingUID з Fragment → Fragment не додає його до `localDeclared`.
Якщо `toast` тригерить `computedUses`, алгоритм автоматично розширює: `["toast", "exportJob"]`.

**Контраст з розділом 5 ("UID-прозорість"):**
- Non-container вузол (VStack без `vars`) — повністю прозорий: uid і дочірні UIDs бульбашать наскрізь.
- Implicit container (Fragment з `var.x`) — НЕ прозорий для рендерингу (має власний `StateContainer`), але і НЕ є explicit owner для UID-захоплення: дочірні `escapingUIDs` обходять його.

**Слід мати на увазі:** стан "implicit container, але не explicit owner" виникає саме через відсутність явного `uses`. Будь-який новий тип вузла з `vars` без `uses` потрапить в ту ж ситуацію: рендериться ізольовано, але дочірні APIs живуть у батьківському стані.

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
| `xmlui/tests-e2e/computed-uses.spec.ts` | Create | E2E: 7 секцій — regression (var. declarations, event handler write to non-computedUses var), optimization (Select ≤ 5 renders, wrapper, function-free Select with script), секція 6 — Бaг 19 ($context-only deps), секція 7 — Бaг 24 (stale computedUses after CompoundComponent restructure) |

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

### Відфільтрування фреймворкових глобалів (False Promotion)

**Проблема:** Раніше вважалося, що протікання фреймворкових глобалів (`toast`, `Actions.callApi`) у `computedUses` є безпечним (див. п. 11 Архітектурних рішень). Проте з'ясувалося, що це викликає серйозний баг: "Хибну промоцію". Компоненти типу `Select`, які використовують `Actions.callApi()` у своїх івентах, помилково ідентифікуються як такі, що мають external read dependencies (`nonDynamicReadDeps.size > 0`). Це призводить до непотрібного загортання компонента у важкий `StateContainer`, що збільшує React tree overhead та ізолює внутрішній стан компонента (ламається `clearable` та `value` bubbling).

**Можливе рішення:** Фреймворкові глобали **мають бути відфільтровані** так само, як JS-стандарти (`JS_STDLIB_GLOBALS`). Але оскільки список фреймворкових функцій динамічний, він повинен імпортуватися з реєстра глобалів (наприклад, `XMLUI_GLOBAL_NAMES` з `AppContext`), а не хардкодитись в оптимізаторі (щоб детальніше див. `TODO - framework-globals-leak-proposal.md`).

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
