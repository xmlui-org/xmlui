import { describe, expect, it } from "vitest";

import {
  createEventContext,
  createExpressionContext,
  createRuntimeScope,
  createRuntimeStateStore,
  initializeStateValues,
  initializeStateValuesIntoStore,
  sameSlotKey,
  slotKeyId,
} from "../../src/runtime/state";

describe("runtime state slot keys", () => {
  it("normalizes global keys and keeps local owner identity", () => {
    expect(slotKeyId({ kind: "global", ownerId: "ignored", name: "count" })).toBe("global:count");
    expect(slotKeyId({ kind: "local", ownerId: "button-1", name: "count" })).toBe(
      "local:button-1:count",
    );
    expect(
      sameSlotKey(
        { kind: "global", name: "count" },
        { kind: "global", ownerId: "root", name: "count" },
      ),
    ).toBe(true);
  });
});

describe("RuntimeStateStore", () => {
  it("stores globals and isolates repeated local owners", () => {
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 10 });
    store.createLocalOwner("component-1", { count: 0 });
    store.createLocalOwner("component-2", { count: 0 });

    store.writeLocal("component-1", "count", 1);
    store.writeGlobal("count", 11);

    expect(store.readLocal("component-1", "count")).toBe(1);
    expect(store.readLocal("component-2", "count")).toBe(0);
    expect(store.readGlobal("count")).toBe(11);
  });

  it("emits slot-scoped invalidations and supports unsubscribe", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("component-1", { count: 0 });
    store.createLocalOwner("component-2", { count: 0 });

    const localInvalidations: unknown[] = [];
    const allInvalidations: unknown[] = [];
    const unsubscribeSlot = store.subscribeToSlot(
      { kind: "local", ownerId: "component-1", name: "count" },
      (invalidation) => localInvalidations.push(invalidation),
    );
    const unsubscribeAll = store.subscribeToInvalidations((invalidation) =>
      allInvalidations.push(invalidation),
    );

    store.writeLocal("component-2", "count", 1);
    store.writeLocal("component-1", "count", 1);
    unsubscribeSlot();
    unsubscribeAll();
    store.writeLocal("component-1", "count", 2);

    expect(localInvalidations).toHaveLength(1);
    expect(allInvalidations).toHaveLength(2);
    expect(localInvalidations[0]).toMatchObject({
      slot: { kind: "local", ownerId: "component-1", name: "count" },
      previousValue: 0,
      nextValue: 1,
    });
  });

  it("disposes local owners", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("component", { count: 0 });
    expect(store.hasLocalOwner("component")).toBe(true);
    store.disposeLocalOwner("component");
    expect(store.hasLocalOwner("component")).toBe(false);
  });
});

describe("RuntimeScope", () => {
  it("reads locals before globals and falls back through parent locals", () => {
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 100, total: 5 });
    store.createLocalOwner("root", { count: 1 });
    store.createLocalOwner("child", { label: "Child" });
    const root = createRuntimeScope({ store, localOwnerId: "root" });
    const child = createRuntimeScope({
      store,
      localOwnerId: "child",
      parent: root,
      props: { caption: "Click" },
    });
    const context = createExpressionContext(child);

    expect(context.readLocal("label")).toBe("Child");
    expect(context.readLocal("count")).toBe(1);
    expect(context.readLocal("total")).toBe(5);
    expect(context.readGlobal("count")).toBe(100);
    expect(context.props?.caption).toBe("Click");
  });

  it("routes generated local and global writes through the store", () => {
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 100 });
    store.createLocalOwner("root", { count: 1 });
    store.createLocalOwner("child", {});
    const root = createRuntimeScope({ store, localOwnerId: "root" });
    const child = createRuntimeScope({ store, localOwnerId: "child", parent: root });
    const context = createEventContext(child);

    context.writeLocal("count", 2);
    context.writeGlobal("count", 101);

    expect(store.readLocal("root", "count")).toBe(2);
    expect(store.readGlobal("count")).toBe(101);
  });

  it("rejects writes to unknown state", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("root", {});
    const context = createEventContext(createRuntimeScope({ store, localOwnerId: "root" }));

    expect(() => context.writeLocal("missing", 1)).toThrow(
      `Cannot assign to unknown XMLUI variable "missing".`,
    );
    expect(() => context.writeGlobal("missing", 1)).toThrow(
      `Cannot assign to unknown XMLUI global variable "missing".`,
    );
  });
});

describe("runtime state initialization", () => {
  it("initializes slots with compiled binding evaluators", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("root", { seed: 41 });
    const scope = createRuntimeScope({ store, localOwnerId: "root" });
    const values = initializeStateValues(
      { count: "{0}", next: "{seed}" },
      {
        count: {
          source: "0",
          ast: {} as never,
          range: { start: 0, end: 3 },
          evaluate: () => 0,
        },
        next: {
          source: "seed",
          ast: {} as never,
          range: { start: 0, end: 6 },
          evaluate: (context) => Number(context.readLocal("seed")) + 1,
        },
      },
      scope,
      (_value, parsed, evalScope) =>
        !Array.isArray(parsed) && parsed?.evaluate
          ? parsed.evaluate(createExpressionContext(evalScope))
          : null,
    );

    expect(values).toEqual({ count: 0, next: 42 });
  });

  it("initializes derived slots in dependency order and registers graph edges", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("root");
    const scope = createRuntimeScope({ store, localOwnerId: "root" });

    const values = initializeStateValuesIntoStore({
      kind: "local",
      ownerId: "root",
      expressions: { double: "{count * 2}", count: "{2}" },
      parsed: {
        count: {
          source: "2",
          ast: {} as never,
          range: { start: 0, end: 3 },
          bindingMode: "source",
          dependencies: [],
          evaluate: () => 2,
        },
        double: {
          source: "count * 2",
          ast: {} as never,
          range: { start: 0, end: 12 },
          bindingMode: "derived",
          dependencies: [
            {
              kind: "local",
              name: "count",
              path: ["count"],
              span: { sourceId: "Main.xmlui", start: 0, end: 5 },
            },
          ],
          evaluate: (context) => Number(context.readLocal("count")) * 2,
        },
      },
      scope,
      evaluate: (_value, parsed, evalScope) =>
        !Array.isArray(parsed) && parsed?.evaluate
          ? parsed.evaluate(createExpressionContext(evalScope))
          : null,
    });

    expect(values).toEqual({ count: 2, double: 4 });
    expect(store.readLocal("root", "double")).toBe(4);
    expect(store.getReactiveVariable({ kind: "local", ownerId: "root", name: "double" })).toMatchObject({
      mode: "derived",
      dependencies: [{ kind: "local", ownerId: "root", name: "count" }],
    });
    expect(store.getReactiveDependents({ kind: "local", ownerId: "root", name: "count" })).toEqual([
      expect.objectContaining({
        slot: { kind: "local", ownerId: "root", name: "double" },
      }),
    ]);
  });

  it("recomputes derived variables and transitive chains after source writes", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("root");
    const scope = createRuntimeScope({ store, localOwnerId: "root" });

    initializeStateValuesIntoStore({
      kind: "local",
      ownerId: "root",
      expressions: {
        count: "{1}",
        double: "{count * 2}",
        label: "{'double: ' + double}",
      },
      parsed: {
        count: {
          source: "1",
          ast: {} as never,
          range: { start: 0, end: 3 },
          evaluate: () => 1,
          dependencies: [],
        },
        double: {
          source: "count * 2",
          ast: {} as never,
          range: { start: 0, end: 12 },
          dependencies: [
            { kind: "local", name: "count", path: ["count"], span: { sourceId: "Main.xmlui", start: 0, end: 5 } },
          ],
          evaluate: (context) => Number(context.readLocal("count")) * 2,
        },
        label: {
          source: "'double: ' + double",
          ast: {} as never,
          range: { start: 0, end: 20 },
          dependencies: [
            { kind: "local", name: "double", path: ["double"], span: { sourceId: "Main.xmlui", start: 12, end: 18 } },
          ],
          evaluate: (context) => `double: ${context.readLocal("double")}`,
        },
      },
      scope,
      evaluate: (_value, parsed, evalScope) =>
        !Array.isArray(parsed) && parsed?.evaluate
          ? parsed.evaluate(createExpressionContext(evalScope))
          : null,
    });

    store.writeLocal("root", "count", 3);

    expect(store.readLocal("root", "count")).toBe(3);
    expect(store.readLocal("root", "double")).toBe(6);
    expect(store.readLocal("root", "label")).toBe("double: 6");
  });

  it("stops recomputing a derived variable after explicit assignment", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("root");
    const scope = createRuntimeScope({ store, localOwnerId: "root" });

    initializeStateValuesIntoStore({
      kind: "local",
      ownerId: "root",
      expressions: {
        count: "{1}",
        double: "{count * 2}",
      },
      parsed: {
        count: {
          source: "1",
          ast: {} as never,
          range: { start: 0, end: 3 },
          evaluate: () => 1,
          dependencies: [],
        },
        double: {
          source: "count * 2",
          ast: {} as never,
          range: { start: 0, end: 12 },
          dependencies: [
            { kind: "local", name: "count", path: ["count"], span: { sourceId: "Main.xmlui", start: 0, end: 5 } },
          ],
          evaluate: (context) => Number(context.readLocal("count")) * 2,
        },
      },
      scope,
      evaluate: (_value, parsed, evalScope) =>
        !Array.isArray(parsed) && parsed?.evaluate
          ? parsed.evaluate(createExpressionContext(evalScope))
          : null,
    });

    expect(store.readLocal("root", "double")).toBe(2);
    store.writeLocal("root", "double", 99);
    store.writeLocal("root", "count", 2);

    expect(store.readLocal("root", "double")).toBe(99);
    expect(store.getReactiveVariable({ kind: "local", ownerId: "root", name: "double" })).toMatchObject({
      mode: "assigned",
    });
  });

  it("recomputes prop-driven derived locals when props are invalidated", () => {
    const store = createRuntimeStateStore();
    store.createLocalOwner("child");
    const scope = createRuntimeScope({ store, localOwnerId: "child", props: { value: 2 } });

    initializeStateValuesIntoStore({
      kind: "local",
      ownerId: "child",
      expressions: { doubled: "{$props.value * 2}" },
      parsed: {
        doubled: {
          source: "$props.value * 2",
          ast: {} as never,
          range: { start: 0, end: 18 },
          dependencies: [
            { kind: "props", name: "value", path: ["value"], span: { sourceId: "Child.xmlui", start: 7, end: 12 } },
          ],
          evaluate: (context) => Number(context.props?.value) * 2,
        },
      },
      scope,
      evaluate: (_value, parsed, evalScope) =>
        !Array.isArray(parsed) && parsed?.evaluate
          ? parsed.evaluate(createExpressionContext(evalScope))
          : null,
    });

    expect(store.readLocal("child", "doubled")).toBe(4);
    const nextScope = createRuntimeScope({ store, localOwnerId: "child", props: { value: 5 } });
    store.updateReactiveEvaluator(
      { kind: "local", ownerId: "child", name: "doubled" },
      () => Number(nextScope.props.value) * 2,
    );
    store.invalidateProp("child", "value");

    expect(store.readLocal("child", "doubled")).toBe(10);
  });
});
