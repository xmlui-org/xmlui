# План виправлення тестів — гілка yurii/computedUses
**Дата:** 2026-05-15  
**Гілка:** `yurii/computedUses`  
**Помилки:** 58 тестів у 11 групах (A,D–M) — зменшилось з 191 (B,C повністю виправлено)  

**Стратегія:** Спочатку корінна причина → поетапне виправлення груп

---

## Контекст

Оптимізація `computedUses` була введена в цій гілці. Вона додає алгоритм часу парсингу (`computeUsesInternal`), який звужує, до яких ключів батьківського стану підписується кожен контейнер, зменшуючи непотрібні повторні рендери.

Ключові зміни, які взаємодіють із 191 помилками:

| Файл | Зміна | Ризик |
|------|--------|------|
| `computedUses.ts` | Новий алгоритм встановлює `node.computedUses` при завантаженні | Може надто звузити стан, відрізаючи змінні, які потрібні компонентам |
| `StateContainer.tsx` | `stateFromOutside` тепер використовує `node.computedUses` | Якщо computedUses неправильний, stateFromOutside неправильний |
| `StateContainer.tsx` | deps useCallback `statePartChanged`: 7 → 2 (на основі ref) | Малоймовірно спричинить помилки — refs оновлюються синхронно під час рендеру |
| `ComponentWrapper.tsx` | `scopedParentState` обертає весь стан у shallow-memo | Може пригнічувати повторні рендери, коли `uses`/`computedUses` не визначено |
| `StateContainer.tsx` | 2 debug `console.log` ще в прод коді | Шум; видалити в фінальному очищенні |

Прапор `COMPUTED_USES_ENABLED` (у `computedUses.ts`) вимикає алгоритм, коли `false`.
**Має бути `true` для всіх діагностичних і фаз виправлення.**

---

## Методологія

Кожна фаза дотримується цього циклу:

```
1. Я надаю  → розмітку XMLUI playground + список рядків логів для додавання до фреймворку
2. Ви запускаєте → playground, повертаєте повний вивід консолі
3. Я аналізую → формулюю гіпотезу, пропоную виправлення коду
4. Ви застосовуєте → виправлення у вихідних файлах
5. Ви запускаєте → групу тестів для цієї фази
6. Результат → якщо зелений: наступна фаза | якщо червоний: інша ітерація логів
```

Корінні причини підтверджуються спостереженням за конвеєром рендерингу, а не лише міркуванням
про вихідний код.

---

## Фаза 0 — Діагностика між групами

**Мета:** Визначити, чи мають групи A–M спільну корінну причину чи незалежні причини.

**Передумова:** Встановіть `COMPUTED_USES_ENABLED = true` у `computedUses.ts`.  
Без цього `computedUses` ніколи не встановлюється, і логи `[CU]` не виробляють вивід.

### Сценарії

Три окремі запуски playground (ті самі додавання логів, різна розмітка кожного разу).
Зберіть і поверніть вивід консолі від усіх трьох запусків разом.

| ID | Група | Сценарій | Що ми спостерігаємо |
|----|-------|----------|---------------------|
| S1 | A — контекстні змінні | `ModalDialog` відкритий із `$param` | Чи доходить `$param` до стану дочірнього елемента модального вікна? |
| S2 | B — bindTo | `TextBox` із `bindTo` + відображенням `$data` | Чи оновлюється `$data` після введення? |
| S3 | E — List | `List` із `$item`, посиланням у дочірньому `Select` | Чи присутній `$item` у computedUses Select? |

**Примітка до S2:** `$data` тече через механізм контексту Form, а не через звуження батьківського стану. Логи `[CU]` і `[SC:in]` не покажуть `$data`. Якщо S2 зазнає невдачі, йому потрібна окрема діагностична фаза, спрямована на шлях відправки Form/bindTo.

**Примітка до S3:** `$item` — це `contextVar`, ін’єктований `Items` — це НЕ ключ батьківського стану. `[SC:in]` правильно покаже, що `$item` відсутній у батьківському стані (це очікувано). Релевантне питання для S3 — чи встановлює `[CU]` правильний (непорожній) `computedUses` на Select, і чи не видаляє `extractScopedState` дані, які потрібні Select.

### Додавання логів

**Спочатку використовуйте існуючі логи.** `StateContainer.tsx` вже має:
- Рядок 171: логи `node.contextVars`, `node.computedUses`, `node.uses` для вузлів `$param`/`$item`
- Рядок 360: логи `combinedState.$param` для вузлів `$param`/`$item`

Додайте **2 нових рядки логів** (існуючі покривають combinedState для S1):

**Точка `[CU]`** у `computedUses.ts`, прямо після `node.computedUses = Array.from(computedUsesSet)`:
```typescript
console.log('[CU] SET', node.type, node.uid ?? '', '=', JSON.stringify(node.computedUses));
```
Фільтр: шукайте рядки, де `node.type` відповідає компоненту під тестуванням (наприклад, `Select`, `Container`).

**Точка `[SC:in]`** у `StateContainer.tsx`, прямо після обчислення `stateFromOutside` (після блоку `useShallowCompareMemoize`):
```typescript
console.log('[SC:in]', node.type, node.uid ?? '', 'keys=', Object.keys(stateFromOutside ?? {}));
```
Фільтр: шукайте контейнер, що обертає невдалий компонент — перевірте, чи присутні очікувані ключі батьківського стану.

### Що шукати

| Паттерн у логах | Діагноз |
|-----------------|-----------|
| `[CU] SET Select = ['a']` але Select потрібен ключ `b` | `computedUses` надто звужує — помилка алгоритму |
| `[SC:in] Container keys=[]` коли батько має багато ключів | Порожній `computedUses` встановлено неправильно |
| Line-360 shows `combinedState.$param= undefined` | `$param` lost before it reaches children |
| Line-171 shows `computedUses= ['x']` but modal needs `$param` | Modal container narrowed incorrectly |
| All 3 scenarios show same missing-key pattern | Shared root cause → go to Phase 1 |
| Scenarios show different patterns | Independent causes → skip Phase 1, go directly to Phase 2 |

### Decision gate

- **Single shared pattern across all 3 runs** → Phase 1 (fix shared cause first)
- **Different patterns** → Phase 1 skipped, proceed directly to Phase 2

---

## Phase 1 — Shared Root Cause Fix (conditional)

Only executed if Phase 0 reveals a single shared cause.

**Most likely candidates based on diff analysis:**

**Candidate A — `computedUses` over-narrowing**  
Algorithm sets narrow `computedUses` that excludes keys containers legitimately need
from parent state. This would explain failures across all groups that rely on parent
state (A, B, C, E, F, G, J, M).  
Fix: correct `computeUsesInternal` — ensure containers that wrap components needing
full parent state are not narrowed (e.g. if `isKnownContainer` misclassifies them).

**Candidate B — `scopedParentState` shallow-memo in ComponentWrapper**  
`useShallowCompareMemoize(useMemo(...))` runs for every component — even those where
`uses`/`computedUses` are `undefined` (i.e. full state should pass through unchanged).
A shallow comparison may incorrectly return a stale state reference if a nested object
is mutated in place rather than replaced.  
Fix: only apply shallow-memo when `uses` or `computedUses` is actually defined:
```typescript
const scopedParentState = (nodeUses ?? nodeComputedUses)
  ? useShallowCompareMemoize(useMemo(() => extractScopedState(...), [...]))
  : state;
```

**Verification after Phase 1:**
Run full test suite → record new baseline count.
If count drops significantly → proceed to Phase 2.
If count barely drops → candidate was wrong → re-run Phase 0 with additional log points.

---

## Phase 2 — Groups A + B (Context Variables + bindTo)

**Dependencies:** Phase 0 complete; Phase 1 applied if applicable.

**Group A — Context variable propagation**  
Failing vars: `$param`, `$params`, `$context`, `$item`, `$row`, `$data`, `$this`.  
Affected components: APICall, ModalDialog, ContextMenu, List, Table, Queue, Toast, Checkbox.

**Group B — bindTo / $data synchronization**  
Affected: 16 input components (TextBox, Select, Checkbox, DatePicker, …).  
Note: `$data` flows through the Form context mechanism, independent of `computedUses`.
If Group B failures persist after Phase 1, they need a separate log session targeting
the Form/bindTo dispatch path.

**Verification:**
```bash
npx playwright test --grep "\\$param|\\$context|\\$item|\\$row|\\$data|\\$this|bindTo" --reporter=list
```

---

## Phase 3 — Groups C + D (APICall)

**Dependencies:** Groups A + B passing (most APICall context vars are subset of Group A).

**Group C — APICall core**  
Notifications, `execute()` params, `mockExecute` context variables.  
Most failures expected to self-heal once Group A is fixed.

**Group D — APICall deferred mode**  
Polling, cancellation, status updates.  
Async state machine — may be independent from context-var issues.
If failures remain after Phase 2, needs separate log session focusing on polling dispatch.

**Verification:**
```bash
npx playwright test xmlui/src/components/APICall --reporter=list
```

---

## Phase 4 — Groups E + F + G (Selection, Table, Modal)

**Dependencies:** Groups A + B passing.

**Group E — List selection**  
`selectionDidChange`, `rowDoubleClick`, `selectAll`, `getSelectedIds`, keyboard shortcuts.

**Group F — Table**  
Context menu `$context`/`$row`, `refreshOn` closure, copy action.

**Group G — Modal / Form / Navigation**  
Nested context propagation, `willNavigate`, `didNavigate`, modal focus.

These groups depend heavily on context-var propagation (Group A). Verify first —
most failures are expected to self-heal after Phase 2.

**Verification:**
```bash
npx playwright test xmlui/src/components/List xmlui/src/components/Table \
  xmlui/src/components/Form xmlui/src/components/App --reporter=list
```

---

## Phase 5 — Groups H + I (Tree + refreshOn)

**Dependencies:** None — likely independent from context-var issues.

**Group H — Tree async loading**  
`setAutoLoadAfter()`, `setDynamic()`, loaded-state tracking, load errors.  
May be related to async timing in `statePartChanged`, not `computedUses`.

**Group I — refreshOn regressions**  
TileGrid + Table `refreshOn` closure update / stale handler.  
Potentially caused by `statePartChanged` ref change making refresh callback captured
at the wrong render cycle. Needs dedicated log session if not self-healing.

**Verification:**
```bash
npx playwright test xmlui/src/components/Tree --reporter=list
npx playwright test --grep "refreshOn|TileGrid" --reporter=list
```

---

## Phase 6 — Group J (Toast / Queue / Option)

**Dependencies:** Groups A + B passing (`$param` in toast, context vars in queue).

Most failures expected to self-heal after Phase 2. Verify first.

**Verification:**
```bash
npx playwright test xmlui/src/components/Toast xmlui/src/components/Queue \
  xmlui/src/components/Option --reporter=list
```

---

## Phase 7 — Groups K + L + M (E2E + Extensions)

**Dependencies:** All unit-level groups (A–J) passing.

**Group K — E2E examples**  
Context menus, modals, deferred API, table selection, background queues.  
Almost entirely downstream — expected to self-heal once A–J pass.

**Group L — Extensions**  
TableSelect (crm-blocks), Gauge (didChange), TiptapEditor (getMarkdown).  
Investigate individually only if they don't self-heal after K.

**Group M — Regressions / infrastructure**  
Compound component `$this`, cleanup/init AppState, context double-resolution.  
May need a dedicated log session if they don't self-heal after Group A fix.

**Verification:**
```bash
npx playwright test xmlui/tests-e2e --reporter=list
```

---

## Final Cleanup (after all phases pass)

1. Remove both debug `console.log` from `StateContainer.tsx` (lines 171 and 360)
2. Remove render-count profiler block from `StateContainer.tsx` (`__renderCounts`, `__resetRenderCounts`, `__topRenderCounts`)
3. Set `COMPUTED_USES_ENABLED = true` — the flag stays as a dev/test tool; default must be `true`
4. Remove `[CU]` and `[SC:in]` log lines added during diagnosis
5. Run full test suite — confirm green baseline

---

## Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Diagnosis | ✅ done | Confirmed `scopedParentState` over-narrowing as root cause |
| Phase 1 — Shared fix | ✅ done | `scopedParentState` conditional skip applied; 191→58 |
| Phase 2 — Groups A + B | ✅ done | B fully fixed; A: 2 remaining (`$queryParams`) |
| Phase 3 — Groups C + D | partial | C: ✅ fixed; D: 9 remaining (deferred polling) |
| Phase 4 — Groups E + F + G | pending | E: 5, F: 1, G: 9 remaining |
| Phase 5 — Groups H + I | pending | H: 6, I: 3 remaining |
| Phase 6 — Group J | pending | J: 3 remaining (Queue templates) |
| Phase 7 — Groups K + L + M | pending | K: 16, L: 2, M: 2 remaining |
| Cleanup | pending | |
