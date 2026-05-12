# Специфікація: computedUses — автоматичне звуження батьківського стану для неявних контейнерів

**Дата:** 2026-05-11  
**Статус:** Затверджено, готово до реалізації  
**Гілка:** `yurii/computedUses`  
**Пов'язані документи:** `prepare-plan.md` (§2.2, Step 15), `dev-docs/guide/03-container-state.md`

---

## 1. Проблема

Неявний контейнер (implicit container) — будь-який вузол з `vars`, `loaders`, `functions` або `scriptCollected` — наразі отримує **весь** батьківський стан через `extractScopedState(parentState, undefined)`. Це означає, що якщо в батьку є змінна `oftenChanges`, яка оновлюється 10 разів на секунду, **кожен** неявний контейнер у дереві перерендерюється з тією ж частотою — навіть якщо він використовує тільки `rarelyChanges`.

### Приклад-сценарій (бенчмарк)

```xml
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Timer interval="{100}" onTick="oftenChanges++" />
  <Text>Often changes: {oftenChanges}</Text>
  <Select>
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
```

**Поточна поведінка:** `<Select>` не має `var.*` чи `uses`, тому `isContainerLike === false`. Він не є контейнером взагалі і рендериться при **кожній** зміні батька — 10 разів на секунду, хоча залежить лише від `rarelyChanges`.

**Цільова поведінка після реалізації:** алгоритм автоматично обчислює `computedUses = ['rarelyChanges']` для `<Select>`, і `extractScopedState` передає йому лише цю змінну. Таймер більше не викликає ре-рендер `<Select>`.

---

## 2. Рішення

### 2.1 Нове поле `computedUses` в `ComponentDefCore`

```ts
// abstractions/ComponentDefs.ts
interface ComponentDefCore {
  // ... існуючі поля ...
  
  /**
   * Автоматично обчислений мінімальний набір імен батьківського стану,
   * які реально використовуються в піддереві цього вузла.
   * Встановлюється алгоритмом computeUsesForTree() під час transform/boot.
   * Якщо node.uses визначено явно — computedUses ігнорується.
   */
  computedUses?: string[];
}
```

### 2.2 Алгоритм bottom-up обходу

Новий модуль `src/components-core/prepare/computedUses.ts`.

**Вхід:** корінь дерева `ComponentDef`  
**Вихід:** дерево з заповненими `computedUses` на всіх контейнерних вузлах (мутація in-place)

#### Псевдокод рекурсивного обходу

```
computeUsesForSubtree(node: ComponentDef) → Set<string>:

  1. Зібрати localDeclared:
     = keys(node.vars) ∪ keys(node.functions) ∪ keys(node.scriptCollected) ∪ {node.uid}

  2. Зібрати usedHere (вільні ідентифікатори прямих виразів вузла):
     - усі значення node.props (через parseParameterString + collectVariableDependencies)
     - значення node.vars (те саме)
     - node.events / node.api (через collectVariableDependencies на вже-парсованому AST)
     - node.when, node.responsiveWhen
     - TextNode-діти (рядкові значення)
     → тільки root-ідентифікатори: {a.b.c} → "a"

  3. Рекурсія по дітях (bottom-up):
     childFree = ∅
     для кожного child в (children ∪ loaders ∪ slots.*):
       childFree ∪= computeUsesForSubtree(child)
     (якщо дитина є контейнером, вона повертає свій computedUses —
      тобто "що мені потрібно від батька", і батько включає це у свій список)

  4. Загальна множина:
     totalFree = (usedHere ∪ childFree) \ localDeclared

  5. Визначення типу вузла:
     isRegularContainer = has(vars | loaders | functions | uses | contextVars | scriptCollected)
     // contextVars: встановлюється батьківськими компонентами (Items, DataSource),
     // тому такі вузли вже є контейнерами — не потребують computedUses
     isImplicitDefault  = IMPLICIT_CONTAINER_NAMES.has(node.type) && totalFree.size > 0
     isContainer = isRegularContainer || isImplicitDefault

  6. Якщо isContainer && node.uses === undefined:
     node.computedUses = [...totalFree]
     return new Set(node.computedUses)   ← батько включає це у свій список

  7. Якщо не контейнер:
     return totalFree                     ← бульбашимо вгору
```

**Важливо:** якщо `node.uses` вже визначено (explicit container) — `computedUses` не встановлюється і алгоритм не змінює поведінки для explicit-контейнерів.

### 2.3 Статична константа IMPLICIT_CONTAINER_COMPONENT_NAMES

```ts
// src/components-core/prepare/computedUses.ts

/**
 * Компоненти, які за замовчуванням стають контейнерами-ізоляторами,
 * якщо їхнє піддерево має залежності від батьківського стану.
 * Початковий список — мінімальний (A-варіант). Детальний аналіз
 * запланований окремою задачею (див. розділ 6).
 */
export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set([
  'Select',
  'List',
  'Table',
  'DataGrid',
]);
```

### 2.4 Зміна `extractScopedState` у `StateContainer`

```tsx
// src/components-core/rendering/StateContainer.tsx — рядок ~149

// До:
useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState])

// Після:
useMemo(
  () => extractScopedState(parentState, node.uses ?? node.computedUses),
  [node.uses, node.computedUses, parentState],
)
```

`node.uses` (явний) завжди має пріоритет. `node.computedUses` застосовується тільки якщо `uses === undefined`. Якщо обидва `undefined` — повертається весь батьківський стан (поточна поведінка, без регресій).

### 2.5 Точки виклику алгоритму

```
Vite-mode (пріоритет, максимальна швидкість старту):
  transform.ts → nodeToComponentDef() → computeUsesForTree(root)
  результат серіалізується в ComponentDef → нульова вартість при старті браузера

CDN / StandaloneApp-mode:
  parseXmlUiMarkup() або StandaloneApp.init() → computeUsesForTree(root)
  один раз при старті, не per-render
```

---

## 3. Тестовий додаток (бенчмарк)

### Файл: `playground/src/benchmark-computed-uses.xmlui`

```xml
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Timer interval="{100}" onTick="oftenChanges++" />
  <Text>Often changes: {oftenChanges}</Text>
  <Select>
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
```

### Консольна інструментація рендерів

Dev-only інструментація в `StateContainer.tsx`:

```tsx
// dev-only: лічильник рендерів
const renderCountRef = useRef(0);
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    renderCountRef.current += 1;
    const label = node.uid ?? node.type ?? 'anon';
    console.log(`[render] ${label} #${renderCountRef.current}`);
    // також накопичуємо в window для інспекції
    (window as any).__renderCounts ??= {};
    (window as any).__renderCounts[label] = renderCountRef.current;
  }
});
```

### Очікуваний результат бенчмарку

| Компонент | До (рендерів за 10 с) | Після |
|-----------|----------------------|-------|
| `App` (root) | ~100 | ~100 (норма — він має `oftenChanges`) |
| `Select` | ~100 | **~1** (тільки при mount / зміні `rarelyChanges`) |
| `Items` всередині Select | ~100 | **~1** |

---

## 4. Тест-стратегія

### 4.1 Unit-тести алгоритму

Файл: `xmlui/tests/prepare/computedUses.spec.ts`

| Сценарій | Що перевіряємо |
|----------|----------------|
| Проста залежність | `<Stack var.a="0"><Text>{b}</Text></Stack>` → `computedUses = ['b']`, не `['a']` |
| Локальна змінна не бульбашить | `var.x` у контейнері не потрапляє до `computedUses` батька |
| Глибока вкладеність | 3+ рівні implicit-контейнерів — кожен рівень має правильний набір |
| Member-access root | `{user.profile.name}` → `computedUses = ['user']`, не `['user.profile.name']` |
| `isImplicitContainerByDefault` + deps | `<Select>` з дітьми що залежать від `rarelyChanges` → отримує `computedUses` |
| `isImplicitContainerByDefault` + no deps | `<Select>` без жодних зовнішніх залежностей → `computedUses` не встановлюється |
| Explicit `uses` не перезаписується | якщо `node.uses` вже є — `computedUses` не додається |
| component-id у `computedUses` | `<TextBox id="t"/>...<Stack><Text>{t.value}</Text></Stack>` → `computedUses` містить `'t'` |
| appContext не бульбашить | `Actions`, `navigate`, `toast` — не потрапляють до `computedUses` |

### 4.2 Регресійні тести для StateContainer

Файл: `xmlui/tests/components/StateContainer.spec.tsx` (існуючий, розширити)

| Сценарій | Що перевіряємо |
|----------|----------------|
| Мутація implicit-контейнера | `STATE_PART_CHANGED` для змінної що НЕ в `computedUses` — бульбашить до власника |
| Мутація батька з `computedUses` | зміна змінної ЩО є в `computedUses` → дочірній контейнер оновлюється |
| Мутація батька без `computedUses` | зміна змінної що НЕ в `computedUses` → дочірній НЕ оновлюється |
| Fallback: обидва undefined | `uses === undefined && computedUses === undefined` → весь батьківський стан передається |
| Explicit `uses` має пріоритет | якщо `uses` є — `computedUses` ігнорується повністю |

### 4.3 E2E-тести (коректність)

Файл: `xmlui/tests-e2e/computed-uses.spec.ts`

| Сценарій | Що перевіряємо |
|----------|----------------|
| Select показує правильні дані | після зміни `rarelyChanges` список оновлюється |
| Таймер не викликає ре-рендер Select | через `window.__renderCounts` — Select рендериться ≤ 2 разів за 3 секунди таймера |
| Форма з полями | зміна одного поля не викликає ре-рендер незалежних полів |
| Existing containers не зламані | сторінки з явним `uses` та `var.*` — коректна поведінка |

---

## 5. Порядок реалізації

1. **`ComponentDefs.ts`** — додати поле `computedUses?: string[]`
2. **`computedUses.ts`** — реалізація алгоритму + `IMPLICIT_CONTAINER_COMPONENT_NAMES`
3. **Unit-тести алгоритму** — верифікація до інтеграції
4. **Інтеграція в `transform.ts`** — виклик після `nodeToComponentDef`
5. **Інтеграція для CDN-режиму** — виклик в `StandaloneApp` / `parseXmlUiMarkup`
6. **`StateContainer.tsx`** — `uses ?? computedUses`
7. **Консольна інструментація** — dev-only лічильник рендерів
8. **Тестовий додаток** — `playground/src/benchmark-computed-uses.xmlui`
9. **Регресійні тести** — `StateContainer.spec.tsx` розширити
10. **E2E-тести** — `computed-uses.spec.ts`
11. **Бенчмарк до/після** — зафіксувати в PR-описі

---

## 6. Запланований окремий аналіз: розширення `IMPLICIT_CONTAINER_COMPONENT_NAMES`

Початковий список (`Select`, `List`, `Table`, `DataGrid`) — мінімальний і безпечний. Потрібен окремий аналіз для включення в список таких компонентів:

- `Form`, `Tabs`, `Accordion`, `TreeView`
- Будь-який компонент з дочірнім `<Items>` або `<DataSource>`
- Можливий механізм: флаг `isImplicitContainerByDefault: true` при реєстрації компонента (замість статичної константи) — для підтримки user-defined components

Критерії включення: компонент є "важким" (дорогий рендеринг), типово містить ітераційні чи завантажувальні діти, ізоляція від зайвих рендерів є очевидним покращенням DX.

---

## 6.1. Запланований рефакторинг: замінити хардкод на метадані реєстрації

**Статус:** Заплановано (не входить у поточну задачу)

**Проблема:** `IMPLICIT_CONTAINER_COMPONENT_NAMES` — статична константа в парсері. Це означає:
- User-defined components не можуть скористатись оптимізацією
- Кожне додавання компонента до списку вимагає зміни коду парсера
- Парсер знає про конкретні компоненти — порушення розділення відповідальностей

**Рішення:** Додати флаг `isImplicitContainerByDefault: true` до метаданих реєстрації компонента у фреймворку. Парсер читатиме цей флаг з реєстру замість статичного списку.

### Орієнтовний API реєстрації

```ts
// При реєстрації компонента (наприклад, у defineComponent або registerComponent):
registerComponent("Select", SelectComponent, {
  isImplicitContainerByDefault: true,
  // ...інші метадані
});
```

### Зміни у `computedUses.ts`

```ts
// Замість:
export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set(["Select", "List", ...]);

// Після рефакторингу:
// computeUsesForSubtree отримує registry як параметр або через closure
function isImplicitContainerByDefault(type: string, registry: ComponentRegistry): boolean {
  return registry.getMetadata(type)?.isImplicitContainerByDefault === true;
}
```

### Інваріант: флаг активується тільки за наявності залежностей

**Важливо:** `isImplicitContainerByDefault: true` — лише дозвіл стати контейнером. Фактично вузол стає контейнером лише якщо `totalFree.size > 0` (є реальні зовнішні залежності в піддереві). Якщо у компонента немає дітей або всі залежності локальні — `computedUses` не встановлюється. Цей захист **обов'язково зберігати** при рефакторингу.

```ts
// При рефакторингу цей патерн має залишитись:
const isImplicitDefault =
  isImplicitContainerByDefault(node.type, registry) && totalFree.size > 0;
```

### Що це дає

- User-defined components можуть позначити себе як `isImplicitContainerByDefault: true`
- Список "важких" компонентів живе поруч з їхнім кодом, а не в парсері
- Спрощує додавання нових компонентів до оптимізації без зміни core

### Залежності

- Потрібно зрозуміти поточний механізм реєстрації компонентів у фреймворку
- Вирішити: передавати registry у `computeUsesForTree` як параметр, чи через DI/singleton
- Перехідний період: `IMPLICIT_CONTAINER_COMPONENT_NAMES` залишається як fallback поки всі компоненти не перейдуть на новий API

---

## 7. Ризики та застереження

| Ризик | Пом'якшення |
|-------|-------------|
| Семантична зміна: ім'я що не в `computedUses` більше не bubble через implicit-контейнер | Покрито регресійними тестами; задокументовано в upgrade notes |
| Помилка в алгоритмі → пропущена залежність → UI не оновлюється | Fallback: якщо `computedUses = []` — передається порожній об'єкт (поведінка `uses=[]`); краще «показати баг» ніж тихо сповільнити |
| `isImplicitContainerByDefault` на компоненті без дітей | Захищено умовою `totalFree.size > 0` |
| Vite-серіалізація: масив рядків не втрачається | `computedUses: string[]` — примітивний тип, серіалізується тривіально |

---

## 8. Що НЕ входить у цю задачу

- Loop-оптимізація (ізоляція рядків в `Items`/`List`) — окрема задача після аналізу бенчмарку
- Ідентифікаторна класифікація (§2.3 з prepare-plan.md)
- Pre-parse prop-виразів (§3)
- Будь-які інші кроки з prepare-plan.md
