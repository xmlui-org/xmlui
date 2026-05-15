# Handoff — Session 3 — 2026-05-14

Branch: `yurii/computedUses`

---

## Контекст

Йде відлагодження регресій, що виникли після впровадження `computedUses`-оптимізації.
191 тест падає. Головна ціль — знайти і виправити корінь проблеми.

---

## Що вже відомо

### 1. У Playground (`npm run dev`) — ВСЕ ПРАЦЮЄ

`$param` коректно передається через `MemoizedItem` → `StateContainer` → `Text`.

Логи в playground при кліку на кнопку:
```
[ModalDialog] renderDialog openParams= ['some_parameter']
[MemoizedItem] contextVars= {"$pathname":"/","$routeParams":{},...,"$param":"some_parameter","$params":["some_parameter"]}
[StateContainer] node.contextVars= {"...", "$param":"some_parameter",...} computedUses= undefined uses= undefined
[StateContainer] combinedState.$param= some_parameter
```

Висновок: сам механізм передачі `$param` через `contextVars` правильний.

### 2. У тестовому E2E-середовищі (INLINE_ALL build) — НЕ ПРАЦЮЄ

Тест `ModalDialog.spec.ts:23`:
- Snapshot після кліку: `generic: "null"` — `$param` = null, але елемент `textInModal` взагалі не знаходиться
- Помилка: `element(s) not found` при `getByTestId('textInModal')`

Знімок стану сторінки:
```yaml
- generic [ref=e2]:
  - button "open modal (imperative)" [active]
  - generic:
    - generic: "null"
```

### 3. Ключова відмінність між playground і тестовим середовищем

| | Playground | Test-bed |
|---|---|---|
| Режим | Vite dev (HMR) | `INLINE_ALL` production build |
| `computeUsesForTree` | викликається | викликається |
| `$param` у combinedState | ✓ `some_parameter` | ✗ `null` |
| Dialog відображається | ✓ | ✗ / не знайдено |

### 4. Поточний стан тимчасових логів

Додані логи у (треба прибрати перед commit):
- `xmlui/src/components/ModalDialog/ModalDialog.tsx` — лог `openParams`
- `xmlui/src/components/container-helpers.tsx` — лог `contextVars`
- `xmlui/src/components-core/rendering/StateContainer.tsx` — логи `node.contextVars` і `combinedState.$param`

---

## Гіпотеза

Різниця між playground і test-bed полягає не в логіці `computedUses` безпосередньо, а в **тому як `initTestBed` будує дерево компонентів**:

1. `initTestBed` передає рядок XMLUI-розмітки як аргумент
2. Ця розмітка парситься і через `computeUsesForTree` обробляється
3. У виробничому білді (`INLINE_ALL`) компоненти мають іншу структуру вузлів (ComponentDef), ніж у dev-режимі

**Підозрюваний механізм:**

У `computeUsesInternal`, `ModalDialog` обробляється як **не-контейнер** (бо `node.contextVars` не виставлений на XML-вузлі, тільки в metadata). Тому `$param` з `Text{$param}` "виходить" назовні як free variable. Але коли `extractScopedState` обрізає батьківський стан для контейнера-батька, `$param` може пропасти.

**Альтернативна гіпотеза:**

У `INLINE_ALL` режимі ModalDialog node зустрічається під час парсингу разом з попередньо вбудованими дочірніми компонентами. `computeUsesForTree` запускається на цьому дереві і виставляє `computedUses` на якийсь вузол, який потім через `extractScopedState` не отримує `$param`.

---

## Що треба зробити далі

### Крок 1: Запустити E2E-тест з логами і зібрати console output

Тест-бед треба зібрати (`npm run build:xmlui-test-bed`) і запустити з увімкненими логами (вони вже є в коді). Але логи видно тільки в браузері, не в Playwright stdout. 

**Варіант A**: Запустити тест у headed режимі і вручну перевірити DevTools:
```bash
cd /Users/yurii/projects/nsoftware/xmlui-monorepo
PLAYWRIGHT_USE_DEV_SERVER=false npx playwright test xmlui/src/components/ModalDialog/ModalDialog.spec.ts:23 --headed
```

**Варіант B**: Додати логи до snapshot/error-context через `page.evaluate`:
У файлі `xmlui/src/components/ModalDialog/ModalDialog.spec.ts` після кліку додати:
```typescript
const logs = await page.evaluate(() => (window as any).__debugLogs ?? []);
console.log('DEBUG LOGS:', logs);
```
І замінити `console.log` в логах на push в `window.__debugLogs`.

### Крок 2: Перевірити чи є `computedUses` на вузлах в тестовому середовищі

Додати в `StateContainer.tsx` лог для ВСІх контейнерів (не тільки з `$param`):
```typescript
console.log('[SC]', (node as any).children?.[0]?.type ?? node.type, 
  'computedUses=', node.computedUses, 
  'contextVars=', JSON.stringify(node.contextVars));
```
Це покаже яке `computedUses` встановлено на контейнері що обгортає ModalDialog.

### Крок 3: Перевірити чи `renderDialog` взагалі викликається

У тестовому середовищі модальне вікно може не відкриватись взагалі (хоча кнопка натиснута). Якщо `[ModalDialog] renderDialog openParams=` не з'явиться в логах — проблема в тому що `modal.open()` не спрацьовує.

Можлива причина: `modal` (API компонента) не зареєстрований в батьківському контейнері, тому виклик `modal.open('PARAM_VALUE')` не призводить до нічого.

**Перевірка**: Додати лог в `registerComponentApi`:
```typescript
// в StateContainer.tsx або ContainerWrapper.tsx
console.log('[registerComponentApi]', String(componentUid), Object.keys(api));
```

### Крок 4: Якщо проблема в `registerComponentApi`

Якщо `modal` API не реєструється коректно, причина може бути в `computedUses` на батьківському контейнері (Fragment або тестовий root), який обрізає `modal` зі свого стану.

Перевірити `extractScopedState`:
- Якщо Fragment або root отримав `computedUses` без `modal` в списку → `modal.open()` не знайде API
- `computeUsesInternal` повинен propagate `modal` як escapingUID, а батьківський контейнер повинен додати його до `localDeclared`

---

## Файли що стосуються проблеми

| Файл | Роль |
|------|------|
| `xmlui/src/components-core/optimization/computedUses.ts` | Алгоритм `computeUsesForTree` — головний підозрюваний |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | `extractScopedState` + `combinedState` |
| `xmlui/src/components-core/rendering/ContainerWrapper.tsx` | `getWrappedWithContainer` |
| `xmlui/src/components-core/rendering/ContainerUtils.ts` | `extractScopedState` function |
| `xmlui/src/components/ModalDialog/ModalDialog.tsx` | Renderer з MemoizedItem + openParams |
| `xmlui/src/components/container-helpers.tsx` | `MemoizedItem` component |
| `xmlui/src/testing/fixtures.ts` | `initTestBed` — як будується тестове дерево |

---

## Як запускати тести

```bash
# Зібрати test-bed:
cd /Users/yurii/projects/nsoftware/xmlui-monorepo/xmlui
npm run build:xmlui-test-bed

# Запустити один тест:
cd /Users/yurii/projects/nsoftware/xmlui-monorepo
PLAYWRIGHT_USE_DEV_SERVER=false npx playwright test xmlui/src/components/ModalDialog/ModalDialog.spec.ts:23

# Запустити з headed браузером (для DevTools):
PLAYWRIGHT_USE_DEV_SERVER=false npx playwright test xmlui/src/components/ModalDialog/ModalDialog.spec.ts:23 --headed

# Запустити всі ModalDialog тести:
PLAYWRIGHT_USE_DEV_SERVER=false npx playwright test xmlui/src/components/ModalDialog/ModalDialog.spec.ts
```

---

## Тимчасові зміни що треба прибрати перед commit

- `ModalDialog.tsx` — `console.log('[ModalDialog] renderDialog openParams='...)`
- `container-helpers.tsx` — `console.log('[MemoizedItem] contextVars='...)`
- `StateContainer.tsx` — два `console.log` блоки для `$param`/`$item`
- `playground/src/Main.xmlui` — тестовий приклад (повернути `<StandalonePlayground />`)
