# Handoff — Session 4 (2026-05-15)

## Гілка
`yurii/computedUses`

## Що зроблено в цій сесії

### 1. Feature flag для вимкнення фічі
Додано `COMPUTED_USES_ENABLED` константу в `xmlui/src/components-core/optimization/computedUses.ts` (рядок ~44).
Коли `false` — `computeUsesForTree` та `computeUsesForSubtree` повертають одразу без обчислень.
Unit тести в `tests/components-core/optimization/computedUses.test.ts` пропускаються через `describe.skipIf(!COMPUTED_USES_ENABLED)`.
**Зараз встановлено `true`** (для діагностики Phase 0).

### 2. Специфікація плану виправлення 191 тестів
Файл: `xmlui/src/components-core/optimization/specs/2026-05-15-test-fix-plan-design.md`

Структура:
- **Phase 0** — Cross-group Diagnosis (зараз виконується)
- **Phase 1** — Shared Root Cause Fix (умовна)
- **Phase 2** — Groups A + B (context vars + bindTo)
- **Phase 3** — Groups C + D (APICall)
- **Phase 4** — Groups E + F + G (Selection, Table, Modal)
- **Phase 5** — Groups H + I (Tree + refreshOn)
- **Phase 6** — Group J (Toast/Queue/Option)
- **Phase 7** — Groups K + L + M (E2E + Extensions)

### 3. Debug логи додані (Phase 0)
У `computedUses.ts` після рядка `node.computedUses = Array.from(computedUsesSet)`:
```typescript
console.log('[CU] SET', node.type, node.uid ?? '', '=', JSON.stringify(node.computedUses));
```

У `StateContainer.tsx` після блоку `useShallowCompareMemoize` (stateFromOutside):
```typescript
console.log('[SC:in]', node.type, node.uid ?? '', 'uses=', node.uses, 'computedUses=', node.computedUses, 'keys=', Object.keys(stateFromOutside ?? {}));
```

Вже існуючі debug логи в `StateContainer.tsx` (рядки ~171, ~361) — НЕ видаляти, вони використовуються.
Вже існуючий debug log в `ModalDialog.tsx` та `container-helpers.tsx` — теж залишаються.

---

## Root Cause — ЗНАЙДЕНО (Phase 0 результати)

### Сценарій S1: ModalDialog + $param

**Тестова розмітка:**
```xml
<App var.result="{null}">
  <ModalDialog id="myModal" title="Test: {$param?.msg ?? 'NO PARAM'}">
    <Text testId="param-text">{$param?.msg ?? 'MISSING'}</Text>
  </ModalDialog>
  <Button onClick="myModal.open({ msg: 'hello' })">Open Modal</Button>
  <Text>{result}</Text>
</App>
```

**Результати по середовищах:**
| Середовище | Результат | computedUses на ModalDialog |
|---|---|---|
| MyWorkDrive (`myworkdrive/src/Main.xmlui`) | ✅ Працює | `undefined` |
| StandalonePlayground editor | ✅ Працює | невідомо |
| playground/src/Main.xmlui | ❌ Модал не відкривається | `['$param']` |

**Ключові логи з playground (зламаний):**
```
[CU] SET Fragment = ["events"]   ← єдине що встановлено з computedUses
[SC:in] Container root uses= [] computedUses= undefined keys= []
[SC:in] Container  uses= undefined computedUses= ['$param'] keys= []  ← ПРОБЛЕМА
```

### Причина баґу

1. Алгоритм `computeUsesInternal` бачить `{$param?.msg}` в title/children ModalDialog
2. `$param` не є у `localDeclared` → потрапляє в `parentDependencies`
3. `computedUses = ['$param']` встановлюється на контейнер ModalDialog
4. `extractScopedState({ result: null }, ['$param'])` → повертає `{}` (бо `$param` не є ключем App-стану)
5. ModalDialog container отримує порожній `stateFromOutside` → не може функціонувати

**`$param` — це runtime-injected context variable** (ін'єктується ModalDialog в дітей при відкритті), а НЕ ключ батьківського стану. Те саме стосується: `$item`, `$itemIndex`, `$row`, `$rowIndex`, `$rowKey`, `$context`, `$data`, `$this`, `$checked`, `$setChecked`, `$params`.

### Різниця між MyWorkDrive та playground

**Не завершено з'ясовувати.** Відомо що:
- `computeUsesForTree` викликається в двох місцях:
  - `xmlui-parser.ts:59` — для кожного compound component при парсингу
  - `StandaloneApp.tsx:722,753` — для root entry point І compound components
- В MyWorkDrive з тим самим markup ModalDialog отримує `computedUses= undefined`
- В playground/Main.xmlui той самий markup → ModalDialog отримує `computedUses= ['$param']`
- Гіпотеза: різниця може бути в тому як `contextVars` встановлюється на ModalDialog node (Vite plugin може виробляти інший ComponentDef ніж runtime parser), але **НЕ ПІДТВЕРДЖЕНО**

Зміни в `ModalDialog.tsx` та `container-helpers.tsx` — лише debug console.log (1 рядок кожен), не впливають на логіку.

---

## Запропонований фікс (НЕ застосований)

Додати в `computedUses.ts` набір XMLUI runtime context vars (аналогічно до `JS_STDLIB_GLOBALS`) і фільтрувати їх з `parentDependencies`:

```typescript
const XMLUI_RUNTIME_CONTEXT_VARS = new Set([
  '$param', '$params',
  '$item', '$itemIndex',
  '$row', '$rowIndex', '$rowKey',
  '$context',
  '$data',
  '$this',
  '$checked', '$setChecked',
]);
```

Застосувати у двох місцях де фільтруються `parentDependencies` (аналогічно до `isBuiltinGlobal`):
```typescript
for (const d of usedHere)
  if (!localDeclared.has(d) && !isBuiltinGlobal(d) && !XMLUI_RUNTIME_CONTEXT_VARS.has(d))
    parentDependencies.add(d);
for (const d of childDeps)
  if (!localDeclared.has(d) && !isBuiltinGlobal(d) && !XMLUI_RUNTIME_CONTEXT_VARS.has(d))
    parentDependencies.add(d);
```

**Застереження:** `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo` — це теж `$`-змінні але вони IS є в батьківському стані (їх видно в логах MyWorkDrive з 27 ключами). Тому не можна просто фільтрувати всі `$`-змінні.

---

## Що треба зробити далі

1. **З'ясувати** чому MyWorkDrive не встановлює `computedUses` на ModalDialog (необов'язково — можна переходити до фіксу)
2. **Застосувати фікс** — додати `XMLUI_RUNTIME_CONTEXT_VARS` в `computedUses.ts`
3. **Перевірити** що S1 (ModalDialog) тепер працює в playground/Main.xmlui
4. **Запустити S2** (TextBox + bindTo) і S3 (List + $item) — вони ще не тестувались
5. **Запустити unit тести** — `npm run test:unit`
6. **Запустити E2E тести** — для групи A+B
7. Якщо тести проходять → переходити до Phase 2 → Phase 3 і т.д.

---

## Важливі файли

| Файл | Роль |
|------|------|
| `xmlui/src/components-core/optimization/computedUses.ts` | Алгоритм + COMPUTED_USES_ENABLED flag + [CU] log |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | [SC:in] log + existing debug logs (171, 361) |
| `xmlui/src/components-core/optimization/specs/2026-05-15-test-fix-plan-design.md` | План виправлення по фазах |
| `xmlui/src/components-core/optimization/specs/failing-tests-triage.md` | Оригінальний трейдж 191 тестів |
| `xmlui/tests-e2e/computed-uses.spec.ts` | E2E тести самої фічі (всі 7 проходять) |
| `xmlui/tests/components-core/optimization/computedUses.test.ts` | Unit тести (пропускаються якщо flag=false) |

## Стан debug логів (треба прибрати після фіксу)
- `computedUses.ts` — `[CU] SET` log (додано в цій сесії)
- `StateContainer.tsx` — `[SC:in]` log (додано в цій сесії)
- `StateContainer.tsx` — рядки 171, 361 — existing debug logs (з попередніх сесій)
- `ModalDialog.tsx` — `[ModalDialog] renderDialog` log (з попередніх сесій)
- `container-helpers.tsx` — `[MemoizedItem] contextVars` log (з попередніх сесій)
- `StateContainer.tsx` — `__renderCounts` profiler block (з попередніх сесій)
