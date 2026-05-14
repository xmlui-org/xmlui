# Fix: `var.` declarations on `<Component>` invisible in child event handlers

**Date:** 2026-05-13 → resolved 2026-05-14  
**Branch:** yurii/computedUses  
**Status:** FIXED

---

## Симптом

У user-defined компонентів, які мають **зовнішній `.xmlui.xs` code-behind файл** (з або без `<script>` тегу):

XML декларації `var.x="{expr}"` на елементі `<Component>` **не потрапляли** у `localContext` event handlers дочірніх контейнерів.

**Приклад:**

```xml
<Component
  name="PageToolbar"
  var.selectAllIndeterminate="{false}">
  ...
  <ChangeListener onChange="selectAllIndeterminate = false" />  <!-- ← ПОМИЛКА -->
</Component>
```

Помилка: `Left value variable "selectAllIndeterminate" not found`.

---

## Справжня причина

**Два різних шляхи для `scriptCollected` vs code-behind:**

`computeUsesInternal` (алгоритм звуження стану) відключав звуження для дітей через прапорець `nextDisableNarrowing`:

```typescript
// БУЛО (тільки <script> тег):
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected;
```

Але `scriptCollected` встановлюється ЛИШЕ коли є inline `<script>` тег в `.xmlui` файлі. Коли компонент має **тільки зовнішній `.xmlui.xs` файл**, `StandaloneApp.tsx` (рядки 733–746) записує функції напряму в `node.functions`:

```typescript
const componentWithCodeBehind = {
  ...compound,
  component: {
    ...compound.component,
    functions: componentCodeBehind?.functions,  // ← в functions, НЕ в scriptCollected!
  },
};
```

Результат: `node.scriptCollected === undefined`, `nextDisableNarrowing = false`, алгоритм звужував `computedUses` для дітей (наприклад, `ChangeListener`), відрізаючи `selectAllIndeterminate` від їхнього scope.

---

## Фікс

`xmlui/src/components-core/prepare/computedUses.ts`:

```typescript
// СТАЛО: перевіряємо і scriptCollected (<script> тег) і functions (code-behind .xs)
const hasCodeBehind = !!(node.functions && Object.keys(node.functions).length > 0);
const nextDisableNarrowing = disableNarrowing || !!node.scriptCollected || hasCodeBehind;
```

**Логіка:** якщо вузол має code-behind функції (будь-яким шляхом), їхні тіла можуть читати **будь-які** змінні стану батька — статичний аналіз шаблону не може це передбачити. Тому все піддерево отримує `disableNarrowing=true`.

---

## Архітектурні спостереження

### 1. Два канали потрапляння скриптів на вузол
| Джерело | Де зберігається | Коли |
|---------|-----------------|------|
| `<script>` тег в `.xmlui` | `node.scriptCollected` | під час парсингу в `transform.ts` |
| Зовнішній `.xmlui.xs` файл | `node.functions` | під час merge в `StandaloneApp.tsx` |

`isKnownContainer` правильно перевіряв обидва канали, але `nextDisableNarrowing` — лише перший.

### 2. `computedUses` звуження і code-behind несумісні
Алгоритм аналізує тільки шаблонні вирази в XML (props, vars, events). Тіла функцій у `.xs` файлах **не скануються**. Тому для будь-якого вузла з code-behind або `<script>` звуження стану для дітей небезпечне.

### 3. Звуження залишається для вбудованих компонентів
`Select`, `Table`, `List`, `DataGrid` — вбудовані компоненти, вони НІКОЛИ не мають `scriptCollected` або `functions` з code-behind. Тому оптимізація `computedUses` для них залишається повністю робочою.

### 4. `Fragment#- computedUses=[events]` — нормальна поведінка
В логах видно Fragment-и з `computedUses=['events']`. Це Fragment-и з дерева **entry point** (сторінки), не з внутрішнього дерева PageToolbar. Вони правомірно звужуються — не пов'язані з цим багом.

---

## TODO (майбутня оптимізація)

**Звуження для компонентів з code-behind** наразі повністю відключене через неможливість статичного аналізу тіл функцій. Щоб увімкнути його в майбутньому потрібно:

1. AST-аналіз тіл функцій у `.xs` файлах — збирати ідентифікатори що читаються/пишуться
2. Рекурсивне відстеження залежностей через `import` ланцюжки (`import { fn } from 'shared.xs'` де `fn` звертається до `serverConfig`)
3. Обробка циклічних залежностей між `.xs` файлами

Це нетривіальна задача — відкладена.

---

## Пов'язані файли

| Файл | Роль |
|------|------|
| `xmlui/src/components-core/prepare/computedUses.ts` | Фікс: `hasCodeBehind` в `nextDisableNarrowing` |
| `xmlui/src/components-core/StandaloneApp.tsx` | Merge code-behind → `node.functions` (рядки 733–746, 753) |
| `myworkdrive/src/components/shared/PageToolbar.xmlui` | Компонент де баг проявлявся |
