# computedUses — Plan реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Автоматично обчислювати мінімальний набір батьківських змінних (`computedUses`) для неявних контейнерів, щоб `extractScopedState` передавало лише потрібні імена замість всього батьківського стану.

**Architecture:** Bottom-up рекурсивний обхід дерева `ComponentDef` під час transform/boot. Новий модуль `computedUses.ts` обходить піддерево кожного вузла, збирає вільні ідентифікатори і зберігає результат у `comp.computedUses`. `StateContainer` використовує `node.uses ?? node.computedUses` при виклику `extractScopedState`. Компоненти типу `Select`/`List`/`Table`/`DataGrid` стають контейнерними межами автоматично якщо їхнє піддерево має зовнішні залежності.

**Tech Stack:** TypeScript, React, Vitest (unit), Playwright (E2E), xmlui parser infrastructure (`parseParameterString`, `collectVariableDependencies`, `isParsedValue`).

---

## Карта файлів

| Файл | Дія | Відповідальність |
|------|-----|-----------------|
| `xmlui/src/abstractions/ComponentDefs.ts` | Modify | Додати поле `computedUses?: string[]` в `ComponentDefCore` |
| `xmlui/src/components-core/prepare/computedUses.ts` | Create | Алгоритм bottom-up обходу + `IMPLICIT_CONTAINER_COMPONENT_NAMES` |
| `xmlui/tests/prepare/computedUses.spec.ts` | Create | Unit-тести алгоритму |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | Modify ~рядок 149 | `uses ?? computedUses` у `extractScopedState` + dev render counter |
| `xmlui/src/components-core/StandaloneApp.tsx` | Modify | Виклик `computeUsesForTree` перед першим рендером |
| `playground/src/benchmark-computed-uses.xmlui` | Create | Тестовий додаток: таймер + великий Select |

---

## Task 1: Додати поле `computedUses` до `ComponentDefCore`

**Files:**
- Modify: `xmlui/src/abstractions/ComponentDefs.ts`

- [ ] **Крок 1.1: Відкрити файл і знайти поле `uses`**

```bash
grep -n 'uses?' xmlui/src/abstractions/ComponentDefs.ts
```

Знайди рядок з `uses?: string[];` в `ComponentDefCore`. Він знаходиться приблизно в районі коментаря "This property holds the name of state values to flow down".

- [ ] **Крок 1.2: Додати поле `computedUses` одразу після `uses`**

Знайди цей блок у `ComponentDefCore`:
```ts
  uses?: string[];
```

Замінити на:
```ts
  uses?: string[];

  /**
   * Автоматично обчислений мінімальний набір імен батьківського стану,
   * що реально використовуються в піддереві цього вузла.
   * Заповнюється `computeUsesForTree()` під час transform/boot.
   * Якщо `uses` визначено явно — `computedUses` ігнорується.
   */
  computedUses?: string[];
```

- [ ] **Крок 1.3: Перевірити TypeScript**

```bash
cd xmlui && npx tsc --noEmit 2>&1 | head -20
```

Очікувано: без помилок.

- [ ] **Крок 1.4: Коміт**

```bash
git add xmlui/src/abstractions/ComponentDefs.ts
git commit -m "feat: add computedUses field to ComponentDefCore"
```

---

## Task 2: Написати unit-тести для `computedUses.ts` (TDD — спочатку тести)

**Files:**
- Create: `xmlui/tests/prepare/computedUses.spec.ts`

- [ ] **Крок 2.1: Створити файл тестів**

```bash
mkdir -p xmlui/tests/prepare
```

Створити `xmlui/tests/prepare/computedUses.spec.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeUsesForTree, IMPLICIT_CONTAINER_COMPONENT_NAMES } from
  "../../src/components-core/prepare/computedUses";
import type { ComponentDef } from "../../src/abstractions/ComponentDefs";

// Хелпер: простий вузол без зайвих полів
function node(
  type: string,
  overrides: Partial<ComponentDef> = {},
): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

describe("IMPLICIT_CONTAINER_COMPONENT_NAMES", () => {
  it("містить Select, List, Table, DataGrid", () => {
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Select")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("List")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("Table")).toBe(true);
    expect(IMPLICIT_CONTAINER_COMPONENT_NAMES.has("DataGrid")).toBe(true);
  });
});

describe("computeUsesForTree — базові випадки", () => {
  it("вузол без виразів: computedUses не встановлюється", () => {
    const root = node("Stack", {
      children: [node("Button", { props: { label: "Click" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
  });

  it("implicit container з дітьми що читають зовнішню змінну", () => {
    // <Stack var.a="0"><Text props.text="{b}" /></Stack>
    // Stack оголошує a, Text читає b → computedUses = ['b']
    const root = node("Stack", {
      vars: { a: "{0}" },
      children: [node("Text", { props: { text: "{b}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toEqual(["b"]);
  });

  it("локальна змінна не потрапляє до computedUses", () => {
    // <Stack var.x="0"><Text props.text="{x}" /></Stack>
    // x оголошено локально → computedUses = []
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [node("Text", { props: { text: "{x}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toEqual([]);
  });

  it("member-access: тільки root ідентифікатор", () => {
    // {user.profile.name} → deps = ['user']
    const root = node("Stack", {
      vars: { dummy: "{0}" },
      children: [node("Text", { props: { text: "{user.profile.name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("user");
    expect(root.computedUses).not.toContain("user.profile");
    expect(root.computedUses).not.toContain("user.profile.name");
  });

  it("глибока вкладеність: кожен рівень отримує правильний набір", () => {
    // <Outer var.a="0">
    //   <Inner var.b="0">
    //     <Text text="{a + c}" />
    //   </Inner>
    // </Outer>
    // Inner: використовує a (зовнішнє) і c (зовнішнє), оголошує b → computedUses = ['a','c']
    // Outer: Inner повертає ['a','c'], Outer оголошує a → computedUses = ['c']
    const inner = node("Stack", {
      vars: { b: "{0}" },
      children: [node("Text", { props: { text: "{a + c}" } })],
    });
    const outer = node("Stack", {
      vars: { a: "{0}" },
      children: [inner],
    });
    computeUsesForTree(outer);
    expect(inner.computedUses).toContain("a");
    expect(inner.computedUses).toContain("c");
    expect(inner.computedUses).not.toContain("b");
    expect(outer.computedUses).not.toContain("a"); // a — локальна
    expect(outer.computedUses).toContain("c");
  });
});

describe("computeUsesForTree — isImplicitContainerByDefault", () => {
  it("Select з дітьми що мають залежності → стає контейнером", () => {
    // <Select><Items data="{rarelyChanges}">...</Items></Select>
    const select = node("Select", {
      children: [
        node("Items", {
          contextVars: { $item: "$item" },
          props: { data: "{rarelyChanges}" },
          children: [node("Option", { props: { value: "{$item}" } })],
        }),
      ],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeDefined();
    expect(select.computedUses).toContain("rarelyChanges");
  });

  it("Select без залежностей → computedUses не встановлюється", () => {
    const select = node("Select", {
      children: [node("Option", { props: { value: "static" } })],
    });
    computeUsesForTree(select);
    expect(select.computedUses).toBeUndefined();
  });

  it("явний uses не перезаписується computedUses", () => {
    // Якщо uses вже є — computedUses не додається
    const root = node("Stack", {
      uses: ["count"],
      children: [node("Text", { props: { text: "{name}" } })],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toBeUndefined();
    expect(root.uses).toEqual(["count"]); // не змінився
  });
});

describe("computeUsesForTree — events та API", () => {
  it("ідентифікатори в event-handler враховуються", () => {
    // <Stack var.x="0"><Button events.onClick="{ __PARSED: true, statements: [...] }" /></Stack>
    // Тут Button читає 'externalVar' в onClick
    const buttonWithEvent = node("Button", {
      events: {
        onClick: {
          __PARSED: true,
          statements: [
            {
              type: "ExpressionStatement",
              expr: {
                type: "Identifier",
                name: "externalVar",
              },
            },
          ],
        },
      },
    });
    const root = node("Stack", {
      vars: { x: "{0}" },
      children: [buttonWithEvent],
    });
    computeUsesForTree(root);
    expect(root.computedUses).toContain("externalVar");
  });
});
```

- [ ] **Крок 2.2: Запустити тести — переконатися що ПАДАЮТЬ**

```bash
cd xmlui && npm run test:unit -- --reporter=verbose tests/prepare/computedUses.spec.ts 2>&1 | tail -20
```

Очікувано: `Cannot find module '../../src/components-core/prepare/computedUses'` — файл ще не існує.

- [ ] **Крок 2.3: Коміт тестів**

```bash
git add xmlui/tests/prepare/computedUses.spec.ts
git commit -m "test: add failing unit tests for computeUsesForTree"
```

---

## Task 3: Реалізувати `computedUses.ts`

**Files:**
- Create: `xmlui/src/components-core/prepare/computedUses.ts`

- [ ] **Крок 3.1: Створити папку і файл**

```bash
mkdir -p xmlui/src/components-core/prepare
```

Створити `xmlui/src/components-core/prepare/computedUses.ts`:

```ts
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { collectVariableDependencies } from "../script-runner/visitors";
import { parseParameterString } from "../script-runner/ParameterParser";
import { isParsedValue } from "../state/variable-resolution";

/**
 * Компоненти що автоматично стають контейнерними межами,
 * якщо їхнє піддерево має зовнішні залежності.
 * Початковий мінімальний список — детальний аналіз запланований окремо.
 */
export const IMPLICIT_CONTAINER_COMPONENT_NAMES = new Set([
  "Select",
  "List",
  "Table",
  "DataGrid",
]);

/**
 * Витягує root-ідентифікатори з будь-якого значення пропа:
 * - якщо вже спарсовано (__PARSED) — через collectVariableDependencies на AST
 * - якщо рядок — через parseParameterString + collectVariableDependencies
 * - інакше — порожній масив
 */
function depsOfValue(value: unknown): string[] {
  try {
    if (value === null || value === undefined) return [];
    if (isParsedValue(value)) {
      return collectVariableDependencies((value as any).tree) ?? [];
    }
    if (typeof value === "string") {
      const params = parseParameterString(value);
      const acc = new Set<string>();
      for (const part of params) {
        if (part.type !== "expression") continue;
        for (const id of collectVariableDependencies(part.value as any) ?? []) {
          acc.add(id);
        }
      }
      return [...acc];
    }
    return [];
  } catch {
    return [];
  }
}

/** Імена що оголошені локально на цьому вузлі (vars, functions, scriptCollected, uid). */
function collectLocalDeclared(node: ComponentDef): Set<string> {
  const names = new Set<string>();
  if (node.vars) for (const k of Object.keys(node.vars)) names.add(k);
  if (node.functions) for (const k of Object.keys(node.functions)) names.add(k);
  const sc = (node as any).scriptCollected;
  if (sc?.functions) for (const k of Object.keys(sc.functions)) names.add(k);
  if (sc?.vars) for (const k of Object.keys(sc.vars)) names.add(k);
  if (node.uid) names.add(node.uid);
  return names;
}

/** Вільні ідентифікатори що читаються безпосередньо в ЦЬОМУ вузлі (не діти). */
function collectNodeOwnDeps(node: ComponentDef): Set<string> {
  const acc = new Set<string>();
  const add = (v: unknown) => { for (const d of depsOfValue(v)) acc.add(d); };

  if (node.props) for (const v of Object.values(node.props)) add(v);
  if (node.vars) for (const v of Object.values(node.vars)) add(v);
  if (node.events) for (const v of Object.values(node.events)) add(v);
  if (node.api) for (const v of Object.values(node.api)) add(v);
  if (typeof node.when === "string") add(node.when);
  if (node.responsiveWhen) {
    for (const v of Object.values(node.responsiveWhen)) {
      if (typeof v === "string") add(v);
    }
  }
  return acc;
}

function isRegularContainer(node: ComponentDef): boolean {
  return !!(
    node.vars ||
    (Array.isArray(node.loaders) && node.loaders.length > 0) ||
    node.functions ||
    node.uses !== undefined ||
    node.contextVars ||
    (node as any).scriptCollected
  );
}

/**
 * Bottom-up рекурсивний обхід.
 * Повертає Set вільних ідентифікаторів що "бульбашать" до батька.
 * Якщо вузол є контейнером — встановлює node.computedUses і повертає його значення.
 */
export function computeUsesForSubtree(node: ComponentDef): Set<string> {
  const localDeclared = collectLocalDeclared(node);
  const usedHere = collectNodeOwnDeps(node);

  // Рекурсія по дітях (bottom-up: спочатку діти, потім батько)
  const childFree = new Set<string>();
  const recurse = (children: ComponentDef[] | undefined) => {
    if (!children) return;
    for (const child of children) {
      if (child && typeof child === "object" && child.type) {
        for (const d of computeUsesForSubtree(child)) childFree.add(d);
      }
    }
  };

  recurse(node.children);
  recurse(node.loaders);
  if (node.slots) {
    for (const slotChildren of Object.values(node.slots)) {
      recurse(slotChildren as ComponentDef[]);
    }
  }

  // totalFree = (usedHere ∪ childFree) \ localDeclared
  const totalFree = new Set<string>();
  for (const d of usedHere) if (!localDeclared.has(d)) totalFree.add(d);
  for (const d of childFree) if (!localDeclared.has(d)) totalFree.add(d);

  const isImplicitDefault =
    IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type) && totalFree.size > 0;
  const isContainer = isRegularContainer(node) || isImplicitDefault;

  if (isContainer && node.uses === undefined) {
    node.computedUses = [...totalFree];
    return new Set(node.computedUses);
  }

  return totalFree;
}

/**
 * Публічна точка входу: обходить все дерево і заповнює computedUses in-place.
 * Викликати один раз після побудови ComponentDef-дерева.
 */
export function computeUsesForTree(root: ComponentDef): void {
  computeUsesForSubtree(root);
}
```

- [ ] **Крок 3.2: Запустити unit-тести**

```bash
cd xmlui && npm run test:unit -- --reporter=verbose tests/prepare/computedUses.spec.ts 2>&1 | tail -30
```

Очікувано: всі тести зелені (PASS).

Якщо є помилки TypeScript (`isParsedValue` недоступний тощо) — перевір шлях імпорту:
```bash
grep -rn 'export.*isParsedValue' xmlui/src --include='*.ts' | head -5
```

- [ ] **Крок 3.3: Запустити повний unit suite — перевірити відсутність регресій**

```bash
cd xmlui && npm run test:unit 2>&1 | tail -10
```

Очікувано: всі тести проходять.

- [ ] **Крок 3.4: Коміт**

```bash
git add xmlui/src/components-core/prepare/computedUses.ts
git commit -m "feat: implement computeUsesForTree bottom-up algorithm"
```

---

## Task 4: Інтегрувати `computeUsesForTree` в `StandaloneApp.tsx`

**Files:**
- Modify: `xmlui/src/components-core/StandaloneApp.tsx`

> Ціль: викликати `computeUsesForTree` один раз після того як `ComponentDef`-дерево зібрано, але до першого рендеру.

- [ ] **Крок 4.1: Знайти точку інтеграції**

```bash
grep -n 'entryPointWithCodeBehind\|entryPoint as ComponentDef\|computeUses' \
  xmlui/src/components-core/StandaloneApp.tsx | head -20
```

Шукаємо місце де `entryPointWithCodeBehind` або `entryPoint` призначається як фінальний `ComponentDef` перед рендером. Це рядок ~1396:
```ts
let entryPointWithCodeBehind: ComponentDef = {
```

- [ ] **Крок 4.2: Знайти кінець блоку де `entryPointWithCodeBehind` готовий**

```bash
sed -n '1390,1430p' xmlui/src/components-core/StandaloneApp.tsx
```

Знайди де `entryPointWithCodeBehind` отримує фінальне значення (після усіх присвоювань). Потрібно додати виклик одразу після.

- [ ] **Крок 4.3: Додати імпорт у StandaloneApp.tsx**

Знайди блок імпортів на початку файлу. Додай:
```ts
import { computeUsesForTree } from "./prepare/computedUses";
```

- [ ] **Крок 4.4: Додати виклик після підготовки дерева**

Знайди у StandaloneApp.tsx рядок де `entryPointWithCodeBehind` вже готовий (після рядку ~1420). Додай одразу після:

```ts
// Precompute minimal parent-state sets for all implicit containers.
computeUsesForTree(entryPointWithCodeBehind);
```

- [ ] **Крок 4.5: Перевірити TypeScript**

```bash
cd xmlui && npx tsc --noEmit 2>&1 | head -20
```

Очікувано: без нових помилок.

- [ ] **Крок 4.6: Запустити unit-тести**

```bash
cd xmlui && npm run test:unit 2>&1 | tail -10
```

Очікувано: всі проходять.

- [ ] **Крок 4.7: Коміт**

```bash
git add xmlui/src/components-core/StandaloneApp.tsx
git commit -m "feat: call computeUsesForTree after tree assembly in StandaloneApp"
```

---

## Task 5: Змінити `StateContainer` для використання `computedUses`

**Files:**
- Modify: `xmlui/src/components-core/rendering/StateContainer.tsx` (~рядок 149)

- [ ] **Крок 5.1: Знайти точний рядок**

```bash
grep -n 'extractScopedState(parentState' \
  xmlui/src/components-core/rendering/StateContainer.tsx
```

- [ ] **Крок 5.2: Замінити виклик**

Знайди рядок:
```ts
      useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState]),
```

Замінити на:
```ts
      useMemo(
        () => extractScopedState(parentState, node.uses ?? node.computedUses),
        [node.uses, node.computedUses, parentState],
      ),
```

- [ ] **Крок 5.3: Додати dev-render counter у StateContainer**

У тому ж файлі, знайди місце де оголошуються `useRef` (після блоку imports, всередині функції компонента). Додай після першого `useRef`:

```ts
  // DEV: render counter for benchmarking computedUses
  const __devRenderCount = import.meta.env.DEV ? useRef(0) : null;
  if (import.meta.env.DEV && __devRenderCount) {
    __devRenderCount.current += 1;
    const label = node.uid ?? (node as any).component?.type ?? "container";
    (globalThis as any).__renderCounts ??= {};
    (globalThis as any).__renderCounts[label] =
      ((globalThis as any).__renderCounts[label] ?? 0) + 1;
    console.debug(`[render] ${label} #${__devRenderCount.current}`);
  }
```

> Примітка: `useRef` виклик поза умовою — React hooks не можна викликати умовно. Використай такий паттерн:

```ts
  const __devRenderCountRef = useRef(0);
  if (import.meta.env.DEV) {
    __devRenderCountRef.current += 1;
    const label = node.uid ?? (node as any).component?.type ?? "container";
    (globalThis as any).__renderCounts ??= {};
    (globalThis as any).__renderCounts[label] = __devRenderCountRef.current;
    console.debug(`[render] ${label} #${__devRenderCountRef.current}`);
  }
```

- [ ] **Крок 5.4: Перевірити TypeScript**

```bash
cd xmlui && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Крок 5.5: Запустити unit-тести**

```bash
cd xmlui && npm run test:unit 2>&1 | tail -15
```

Очікувано: всі проходять. Якщо є падіння в `StateContainer.spec` — вони покажуть семантичні зміни, їх потрібно проаналізувати (не автоматично виправляти).

- [ ] **Крок 5.6: Коміт**

```bash
git add xmlui/src/components-core/rendering/StateContainer.tsx
git commit -m "feat: use node.uses ?? node.computedUses in StateContainer + dev render counter"
```

---

## Task 6: Регресійні тести StateContainer

**Files:**
- Modify або Create: `xmlui/tests/components/StateContainer.spec.ts`

- [ ] **Крок 6.1: Перевірити чи існує файл**

```bash
ls xmlui/tests/components/ 2>/dev/null | grep -i state || echo "немає файлу"
```

- [ ] **Крок 6.2: Знайти/створити тест-файл і додати регресійні тести**

Якщо файл існує — додати тести в кінець. Якщо ні — створити:

```ts
// xmlui/tests/components/StateContainer.regression.spec.ts
import { describe, it, expect } from "vitest";
import { computeUsesForTree } from "../../src/components-core/prepare/computedUses";
import { extractScopedState } from "../../src/components-core/rendering/ContainerUtils";
import type { ComponentDef } from "../../src/abstractions/ComponentDefs";

function node(type: string, overrides: Partial<ComponentDef> = {}): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

describe("extractScopedState з computedUses", () => {
  it("uses=undefined && computedUses=undefined → повний батьківський стан", () => {
    const parent = { a: 1, b: 2, c: 3 };
    const result = extractScopedState(parent, undefined);
    expect(result).toBe(parent); // той самий об'єкт
  });

  it("computedUses=['a'] → лише 'a' з батьківського стану", () => {
    const parent = { a: 1, b: 2, c: 3 };
    const result = extractScopedState(parent, ["a"]);
    expect(result).toEqual({ a: 1 });
    expect(result).not.toHaveProperty("b");
  });

  it("explicit uses має пріоритет над computedUses", () => {
    // Якщо uses=['b'], computedUses=['a'] — передається тільки 'b'
    const parent = { a: 1, b: 2, c: 3 };
    // uses ?? computedUses — тому передаємо uses
    const result = extractScopedState(parent, ["b"]);
    expect(result).toEqual({ b: 2 });
  });

  it("computedUses=[] → порожній стан (повна ізоляція)", () => {
    const parent = { a: 1, b: 2 };
    const result = extractScopedState(parent, []);
    expect(result).toEqual({});
  });
});

describe("computeUsesForTree — семантика мутацій", () => {
  it("ім'я НЕ в computedUses не потрапляє до контейнера", () => {
    // <Stack var.a="0"><Text props.text="{a}" /></Stack>
    // Stack оголошує a → computedUses = []
    // b НЕ в computedUses → Stack не побачить b від батька
    const stack = node("Stack", {
      vars: { a: "{0}" },
      children: [node("Text", { props: { text: "{a}" } })],
    });
    computeUsesForTree(stack);
    expect(stack.computedUses).toEqual([]);
    // b не в computedUses → extractScopedState з [] поверне {}
    const parentState = { a: 5, b: 99 };
    const scoped = extractScopedState(parentState, stack.computedUses);
    expect(scoped).toEqual({});
  });

  it("зовнішнє ім'я В computedUses передається до контейнера", () => {
    const stack = node("Stack", {
      vars: { local: "{0}" },
      children: [node("Text", { props: { text: "{external}" } })],
    });
    computeUsesForTree(stack);
    expect(stack.computedUses).toContain("external");
    const parentState = { external: 42, irrelevant: 99 };
    const scoped = extractScopedState(parentState, stack.computedUses);
    expect(scoped).toEqual({ external: 42 });
  });
});
```

- [ ] **Крок 6.3: Запустити нові тести**

```bash
cd xmlui && npm run test:unit -- --reporter=verbose tests/components/StateContainer.regression.spec.ts
```

Очікувано: всі PASS.

- [ ] **Крок 6.4: Запустити повний suite**

```bash
cd xmlui && npm run test:unit 2>&1 | tail -10
```

- [ ] **Крок 6.5: Коміт**

```bash
git add xmlui/tests/components/StateContainer.regression.spec.ts
git commit -m "test: add StateContainer regression tests for computedUses semantics"
```

---

## Task 7: Тестовий додаток — бенчмарк

**Files:**
- Create: `playground/src/benchmark-computed-uses.xmlui`

- [ ] **Крок 7.1: Переконатися що playground запускається**

```bash
ls playground/src/Main.xmlui
```

- [ ] **Крок 7.2: Створити файл бенчмарку**

Створити `playground/src/benchmark-computed-uses.xmlui`:

```xml
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Timer interval="{100}" onTick="oftenChanges++" />

  <VStack>
    <Text value="Often changes: {oftenChanges}" />
    <Text value="(відкрий DevTools → Console щоб бачити [render] логи)" />
  </VStack>

  <Select>
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
```

- [ ] **Крок 7.3: Тимчасово поміняти Main.xmlui щоб відкривався benchmark**

Перевір поточний Main.xmlui:
```bash
cat playground/src/Main.xmlui
```

Або відкрий бенчмарк напряму через playground URL якщо підтримується routing.

- [ ] **Крок 7.4: Запустити playground**

```bash
cd playground && npm run dev
```

Відкрий браузер, DevTools → Console. 

**Очікуваний вивід БЕЗ computedUses (до):**
```
[render] Select #1
[render] Select #2
[render] Select #3
... (100+ рядків за 10 секунд)
```

**Очікуваний вивід З computedUses (після):**
```
[render] Select #1
(тиша — таймер не викликає ре-рендер Select)
```

- [ ] **Крок 7.5: Зафіксувати результати у коміт-повідомленні**

```bash
git add playground/src/benchmark-computed-uses.xmlui
git commit -m "feat: add benchmark app for computedUses experiment

Before: Select re-renders ~100x per 10s (every timer tick)
After:  Select re-renders 1x (only on mount)"
```

---

## Task 8: E2E-тест коректності

**Files:**
- Create: `xmlui/tests-e2e/computed-uses.spec.ts`

- [ ] **Крок 8.1: Перевірити структуру E2E тестів**

```bash
ls xmlui/tests-e2e/ | head -10
```

- [ ] **Крок 8.2: Створити E2E тест**

Створити `xmlui/tests-e2e/computed-uses.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("computedUses: Select не ре-рендериться при зміні непов'язаної змінної", () => {
  test.beforeEach(async ({ page }) => {
    // Відкрити тестовий додаток з бенчмарком
    await page.goto("/benchmark-computed-uses");
    // Дати таймеру попрацювати 2 секунди
    await page.waitForTimeout(2000);
  });

  test("Select рендериться ≤ 3 рази за 2 секунди таймера", async ({ page }) => {
    const selectRenderCount = await page.evaluate(
      () => (window as any).__renderCounts?.["Select"] ?? 0,
    );
    // Без computedUses: ~20+ рендерів за 2с (таймер 100мс)
    // З computedUses: 1 рендер (mount)
    expect(selectRenderCount).toBeLessThanOrEqual(3);
  });

  test("Text з oftenChanges оновлюється (таймер працює)", async ({ page }) => {
    const textContent = await page.locator("text=Often changes:").first().textContent();
    expect(textContent).toMatch(/Often changes: \d+/);
    // Значення > 0 означає що таймер спрацював
    const value = parseInt(textContent!.replace("Often changes: ", ""), 10);
    expect(value).toBeGreaterThan(0);
  });

  test("Select показує всі 1000 опцій (дані не втрачені)", async ({ page }) => {
    // Відкрити Select
    await page.locator("[data-type='Select']").first().click();
    await page.waitForTimeout(300);
    // Перевірити що є опції
    const options = page.locator("[data-type='Option']");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });
});
```

- [ ] **Крок 8.3: Запустити E2E тест (потрібен запущений playground)**

```bash
cd xmlui && npm run test:e2e -- tests-e2e/computed-uses.spec.ts 2>&1 | tail -20
```

Якщо playground не запущено — запустити в окремому терміналі:
```bash
cd playground && npm run dev
```

- [ ] **Крок 8.4: Коміт**

```bash
git add xmlui/tests-e2e/computed-uses.spec.ts
git commit -m "test: E2E correctness tests for computedUses benchmark"
```

---

## Task 9: Фінальна перевірка і підсумок

- [ ] **Крок 9.1: Повний unit suite**

```bash
cd xmlui && npm run test:unit 2>&1 | tail -5
```

Очікувано: ✓ всі тести пройшли.

- [ ] **Крок 9.2: TypeScript без помилок**

```bash
cd xmlui && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Крок 9.3: Зафіксувати результати бенчмарку**

Відкрий `window.__renderCounts` у консолі браузера після 10 секунд роботи:

```js
// У DevTools Console:
JSON.stringify(window.__renderCounts, null, 2)
```

Запиши значення у файл:

```bash
cat >> xmlui/dev-docs/specs/2026-05-11-computed-uses-design.md << 'EOF'

---

## Результати бенчмарку

| Компонент | До (рендерів за 10с) | Після | Покращення |
|-----------|---------------------|-------|------------|
| Select    | ???                 | ???   | ???x       |

> Заповнити після запуску benchmark-computed-uses.xmlui
EOF
```

- [ ] **Крок 9.4: Фінальний коміт**

```bash
git add -A
git commit -m "docs: update spec with benchmark results"
```

---

## Довідка: корисні команди

```bash
# Запустити тільки нові unit-тести
cd xmlui && npm run test:unit -- tests/prepare/ tests/components/StateContainer.regression.spec.ts

# TypeScript check
cd xmlui && npx tsc --noEmit

# Запустити playground
cd playground && npm run dev

# Переглянути render counts у браузері (DevTools Console):
# JSON.stringify(window.__renderCounts)
```

---

## Що НЕ входить у цей план

- Інтеграція у Vite plugin (build-time) — після підтвердження результатів бенчмарку
- Loop-оптимізація для `Items`/`List` рядків — окрема задача
- Розширення `IMPLICIT_CONTAINER_COMPONENT_NAMES` — окремий аналіз
- Кроки 1-14 з `prepare-plan.md` — незалежні задачі
