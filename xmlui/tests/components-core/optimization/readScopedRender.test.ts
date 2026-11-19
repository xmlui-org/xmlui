import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  nodeContentEqual,
  useNodeContentMemoize,
} from "../../../src/components-core/rendering/ContainerWrapper";
import {
  expandFunctionReads,
  holdsState,
  readRootsOf,
  rootOf,
  writeStampsOf,
  loaderNamesOf,
  definitionUidsOf,
  ownStateChanged,
  readSliceChanged,
  type HeldState,
} from "../../../src/components-core/optimization/readScopedRender";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";

const node = (type: string, overrides: Partial<ComponentDef> = {}) =>
  ({ type, ...overrides }) as ComponentDef;

describe("read-scoped rendering decisions (#3941)", () => {
  const reads = new Set(["ds.value", "shown"]);

  it("sees a change to a read path, and ignores an unread one", () => {
    const prev = { shown: 1, unused: 1, ds: { value: [1], inProgress: false } };
    expect(readSliceChanged(reads, prev, { ...prev, unused: 2 })).toBe(false);
    expect(readSliceChanged(reads, prev, { ...prev, ds: { ...prev.ds, inProgress: true } })).toBe(
      false,
    );
    expect(readSliceChanged(reads, prev, { ...prev, shown: 2 })).toBe(true);
    expect(readSliceChanged(reads, prev, { ...prev, ds: { value: [2], inProgress: false } })).toBe(
      true,
    );
  });

  it("treats every change as read when the read set is all", () => {
    expect(readSliceChanged("all", { a: 1 }, { a: 1 })).toBe(true);
  });

  it("sees a component's own state change, but not a loader's", () => {
    const slider = Symbol("slider");
    const ds = Symbol("ds");
    const prev = { [slider]: { value: 1 }, [ds]: { inProgress: false } };
    const loaders = new Set(["ds"]);
    expect(ownStateChanged(prev, { ...prev, [ds]: { inProgress: true } }, loaders)).toBe(false);
    expect(ownStateChanged(prev, { ...prev, [slider]: { value: 2 } }, loaders)).toBe(true);
    expect(ownStateChanged(prev, prev, loaders)).toBe(false);
  });

  it("collects loader uids anywhere in a definition", () => {
    const root = node("App", {
      loaders: [node("DataSource", { uid: "top" })],
      children: [
        node("Stack", { loaders: [node("DataSource", { uid: "inner" })] }),
        node("List", {
          props: { itemTemplate: node("Card", { loaders: [node("APICall", { uid: "row" })] }) } as any,
        }),
      ],
    });
    expect([...loaderNamesOf(root)].sort()).toEqual(["inner", "row", "top"]);
  });

  it("holds the state only when read paths and own state are unchanged", () => {
    const slider = Symbol("slider");
    const held: HeldState = { state: { shown: 1, unused: 1 }, raw: { [slider]: { value: 1 } }, version: 0 };
    const unreadOnly: HeldState = { state: { shown: 1, unused: 2 }, raw: held.raw, version: 0 };
    expect(holdsState(held, unreadOnly, reads, new Set())).toBe(true);
    expect(holdsState(null, unreadOnly, reads, new Set())).toBe(false);
    // --- A handler's version bump alone doesn't force a render
    expect(holdsState(held, { ...unreadOnly, version: 1 }, reads, new Set())).toBe(true);
    expect(holdsState(held, { ...unreadOnly, state: { shown: 2 } }, reads, new Set())).toBe(false);
    expect(
      holdsState(held, { ...unreadOnly, raw: { [slider]: { value: 2 } } }, reads, new Set()),
    ).toBe(false);
    expect(holdsState(held, unreadOnly, "all", new Set())).toBe(false);
  });
});

describe("read-scoped rendering: writes and reads identity can't see (#3941)", () => {
  const reads = new Set(["fruits[0].size", "shown"]);

  it("takes the variable a path starts at", () => {
    expect(rootOf("fruits[0].size")).toBe("fruits");
    expect(rootOf("ds.value")).toBe("ds");
    expect(rootOf("shown")).toBe("shown");
    expect([...readRootsOf(reads)]).toEqual(["fruits", "shown"]);
  });

  it("sees a write in place through the write stamps", () => {
    const fruits = [{ size: "large" }];
    const state = { fruits, shown: 1 };
    const counts = new Map<string, number>();
    const stampOf = (k: string) => counts.get(k) ?? 0;
    const held: HeldState = {
      state,
      raw: {},
      version: 0,
      stamps: writeStampsOf(readRootsOf(reads), stampOf),
    };
    fruits[0].size = "small";
    counts.set("fruits", 1);
    const next: HeldState = {
      state: { ...state },
      raw: {},
      version: 1,
      stamps: writeStampsOf(readRootsOf(reads), stampOf),
    };
    expect(readSliceChanged(reads, held.state, next.state)).toBe(false);
    expect(holdsState(held, next, reads, new Set())).toBe(false);
  });

  it("ignores a write stamp on an unread variable", () => {
    const counts = new Map<string, number>();
    const stampOf = (k: string) => counts.get(k) ?? 0;
    const state = { fruits: [], shown: 1, unused: 0 };
    const held: HeldState = { state, raw: {}, version: 0, stamps: writeStampsOf(readRootsOf(reads), stampOf) };
    counts.set("unused", 3);
    const next: HeldState = { state: { ...state, unused: 3 }, raw: {}, version: 1, stamps: writeStampsOf(readRootsOf(reads), stampOf) };
    expect(holdsState(held, next, reads, new Set())).toBe(true);
  });

  it("expands a function read into the variables the function reads", () => {
    const expanded = expandFunctionReads(new Set(["countOf", "$item"]), {
      countOf: ["overrides", "item"],
    });
    expect(expanded).not.toBe("all");
    expect([...(expanded as Set<string>)].sort()).toEqual(["$item", "countOf", "item", "overrides"]);
    const untouched = new Set(["shown"]);
    expect(expandFunctionReads(untouched, { countOf: ["overrides"] })).toBe(untouched);
    expect(expandFunctionReads("all", { countOf: ["overrides"] })).toBe("all");
  });
});

describe("read-scoped rendering: own state counts only data fields (#3941, fix 4)", () => {
  const dlg = Symbol("dlg");
  const ds = Symbol("ds");
  const none = new Set<string>();

  it("ignores a rebuilt entry with the same data fields", () => {
    const prev = { [dlg]: { open: false, close: () => {} } };
    expect(ownStateChanged(prev, { [dlg]: { open: false, close: prev[dlg].close } }, none)).toBe(
      false,
    );
  });

  it("ignores function-valued fields (the component's API)", () => {
    const prev = { [dlg]: { isOpen: false, open: () => {} } };
    expect(ownStateChanged(prev, { [dlg]: { isOpen: false, open: () => {} } }, none)).toBe(false);
    expect(ownStateChanged(prev, { [dlg]: { isOpen: true, open: () => {} } }, none)).toBe(true);
  });

  it("ignores API-only fields and loader uids that isApiOnlyField names", () => {
    const prev = { [dlg]: { value: 1, hasOverflow: false }, [ds]: { inProgress: false } };
    const isApiOnly = (uid: symbol, field: string) =>
      uid === ds || (uid === dlg && field === "hasOverflow");
    expect(
      ownStateChanged(
        prev,
        { [dlg]: { value: 1, hasOverflow: true }, [ds]: { inProgress: true } },
        none,
        isApiOnly,
      ),
    ).toBe(false);
    expect(
      ownStateChanged(prev, { ...prev, [dlg]: { value: 2, hasOverflow: false } }, none, isApiOnly),
    ).toBe(true);
  });

  it("counts an entry appearing or going away only through its data fields", () => {
    const apiOnly = { [dlg]: { open: () => {} } };
    expect(ownStateChanged({}, apiOnly, none)).toBe(false);
    expect(ownStateChanged(apiOnly, {}, none)).toBe(false);
    expect(ownStateChanged({}, { [dlg]: { value: 1 } }, none)).toBe(true);
    expect(ownStateChanged({ [dlg]: { value: 1 } }, {}, none)).toBe(true);
  });

  it("holds the state across an API-only re-registration", () => {
    const reads = new Set(["shown"]);
    const held: HeldState = {
      state: { shown: 1 },
      raw: { [dlg]: { isOpen: false, open: () => {} } },
      version: 0,
    };
    const reRegistered: HeldState = {
      state: { shown: 1 },
      raw: { [dlg]: { isOpen: false, open: () => {} } },
      version: 1,
    };
    expect(holdsState(held, reRegistered, reads, none)).toBe(true);
  });
});

describe("ContainerWrapper keeps an equal-content node (#3941, decision 1)", () => {
  const child = { type: "Text" };
  const loader = { type: "DataLoader", uid: "ds" };
  const make = () => ({
    type: "Stack",
    uid: "s",
    props: { gap: "1rem" },
    loaders: [loader],
    children: [child],
  });

  it("treats new props, loaders and children with the same entries as equal", () => {
    expect(nodeContentEqual(make(), make())).toBe(true);
    expect(nodeContentEqual(make(), { ...make(), props: { gap: "2rem" } })).toBe(false);
    expect(nodeContentEqual(make(), { ...make(), children: [{ type: "Text" }] })).toBe(false);
    expect(nodeContentEqual(make(), { ...make(), loaders: [] })).toBe(false);
    expect(nodeContentEqual(make(), { ...make(), extra: 1 })).toBe(false);
  });

  it("compares other fields by identity only", () => {
    const vars = { x: 1 };
    expect(nodeContentEqual({ ...make(), vars }, { ...make(), vars: { x: 1 } })).toBe(false);
    expect(nodeContentEqual({ ...make(), vars }, { ...make(), vars })).toBe(true);
  });

  it("returns the previous node while the content is equal, so it isn't re-wrapped", () => {
    const first = make();
    const { result, rerender } = renderHook(({ node }) => useNodeContentMemoize(node), {
      initialProps: { node: first },
    });
    rerender({ node: make() });
    expect(result.current).toBe(first);
    const changed = { ...make(), props: { gap: "2rem" } };
    rerender({ node: changed });
    expect(result.current).toBe(changed);
  });
});

describe("read-scoped rendering: uids the definition names (#3941)", () => {
  it("collects uids anywhere in a definition", () => {
    const root = node("App", {
      loaders: [node("DataSource", { uid: "ds" })],
      children: [
        node("Stack", { uid: "box", children: [node("Text")] }),
        node("List", {
          props: { itemTemplate: node("Card", { uid: "card" }) } as any,
        }),
      ],
    });
    expect([...definitionUidsOf(root)].sort()).toEqual(["box", "card", "ds"]);
  });
});
