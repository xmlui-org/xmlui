# Code Review: гілка `yurii/computedUses` vs `main`

> Дата аналізу: 2026-05-15  
> Дата оновлення: 2026-05-20 (очищено від повністю вирішених завдань)  
> Порівняння: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD  
> Фокус: performance regressions, reference-identity issues, критичні баги, дублювання

---

## 🔴 Performance regressions

### P3 (LOW): подвійна робота `extractScopedState`

`ComponentWrapper` обрізає state до `scopedParentState`, передає його як `parentState` у `StateContainer`, який **знову** запускає `extractScopedState(parentState, node.uses ?? node.computedUses)` на вже обрізаному стейті:

`xmlui/src/components-core/rendering/StateContainer.tsx:166-170`
`xmlui/src/components-core/rendering/ComponentWrapper.tsx:93-98`

Через мемоізацію в типовому циклі (де `parentState` стабільний) ця подвійна робота не виконується — memo повертає попередній ref. Але при кожній справжній зміні скоупленого зрізу — обидва виклики запускаються. Дріб'язок, але архітектурно надлишково.

---

## 🟠 Reference-identity / props vs refs

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

### B1 (✅ FIXED): стале значення `stateRef.current` у Container, якщо memo заблокував рендер

**Статус:** ВИРІШЕНО (2026-05-21). Додано `refreshStateRef()` у `createEventHandlers` (`event-handlers.ts`), який оновлює `stateRef.current` з `fullParentStateRef.current` безпосередньо перед виконанням будь-якого коду.

`stateRef.current` оновлювався в layout effect (`Container.tsx:165-168`) тільки коли `Container` ре-рендериться (змінюється identity `componentState`). Якщо `computedUses` працював (Container memo'd і **не** ре-рендерився при тіку `oftenChanges`), то `stateRef.current` лишався старим об'єктом, хоча `fullParentStateRef.current` міг мати нові дані.

**Сценарій:** event handler у Select (який всередині Container) **читав** `oftenChanges` через `stateRef.current` → бачив старе значення.

Це було коректно **тільки якщо** статичний аналіз гарантовано вловлював всі READ-доступи. Але були випадки, де static analysis міг **пропустити** (динамічний доступ `state[key]`, computed property names, eval-подібні конструкції). У таких випадках handler читав би застаріле значення — **silent staleness bug**.

**Виправлення:** додано invalidation: прямо перед eval оновлюється `stateRef.current` з найсвіжіших рефів через `refreshStateRef()`.

---

### B3 (📝): in-place мутація `computedUses` — питання shared ComponentDef

`computeUsesForTree` мутує `node.computedUses` в дереві in-place. Викликається в `xmlui-parser.ts:58` та `StandaloneApp.tsx`. Якщо десь зберігається ref на старий `ComponentDef` і він повторно проходить через обробку, старий `computedUses` перезаписується. Конкретного бага зараз немає, але in-place мутація імпортованого об'єкта — pattern, який може створити проблеми в майбутньому.

---

## 🧹 Брудний код / дублювання

### D3 (📝): `_savedVarDefs` / `_savedFunctionDefs` — implicit coupling через нетиповані поля

`ContainerWrapper.tsx:234-235` пише, а `ModalDialog.tsx:158-159` читає через `as any` cast. Прив'язка через underscore-convention + `as any` cast без типізації. Працює, але крихка. Краще — окремий інтерфейс або weak map.

---

### D4 (📝): `ROUTING_STATE_KEYS` — ручний hardcode без compile-time enforcement

`xmlui/src/components-core/state/routing-state.ts:43-48`. Якщо `useRoutingParams` додасть новий ключ — цей Set треба оновити вручну.

---

### D5 (📝): `JS_STDLIB_GLOBALS` — ручний список ECMAScript-глобалів

50+ імен вручну у `computedUses.ts`. Стабільний список, але не ідеал.

---

### D6 (📝): `gatherIdentifiers` fallback без scope tracking

`xmlui/src/components-core/script-runner/visitors.ts:425-440`. Fallback walk колектить **всі** Identifier-ноди без відстеження scope. Не помилка коректності, але **тиха деоптимізація**.

---

## 📊 Підсумок (Залишок завдань)

| # | Місце | Проблема | Статус |
|---|---|---|---|
| P3 | `ComponentWrapper` + `StateContainer` | Подвійний `extractScopedState` | 🔵 Низький пріоритет |
| R2 | `ComponentWrapper.tsx` | Render-phase ref mutation | 📝 Note (React 18 OK) |
| R3 | `StateContainer.tsx` dev profiler | Strict mode подвоює лічильник | 📝 Note (dev only) |
| B1 | `Container.tsx:167` | Stale `stateRef` у memo'd Container | ⚠️ Потребує виправлення (invalidation) |
| B3 | `computedUses.ts` | In-place мутація `computedUses` | 📝 Note |
| D3 | `ContainerWrapper.tsx` ↔ `ModalDialog.tsx` | `_savedVarDefs` без типізації | 🔵 Minor |
| D4 | `routing-state.ts:43` | `ROUTING_STATE_KEYS` hardcode | 🔵 Minor |
| D5 | `computedUses.ts` | `JS_STDLIB_GLOBALS` ручний список | 🔵 Minor |
| D6 | `visitors.ts:425` | `gatherIdentifiers` fallback без scope | 🔵 Minor |

---

## Пріоритет дій

1. ⚠️ **Важливо:** B1 — додати invalidation `stateRef.current` перед виконанням коду в обробниках подій, щоб уникнути читання застарілих даних у мемоізованих контейнерах.
2. 🔵 **Решта:** Рефакторинг P3, D3-D6 за можливості.
