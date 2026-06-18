import { describe, expect, it } from "vitest";

import {
  createEventContext,
  createExpressionContext,
  createRuntimeScope,
  createRuntimeStateStore,
  initializeStateValues,
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
});
