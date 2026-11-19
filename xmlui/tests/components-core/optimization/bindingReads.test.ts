import { describe, expect, it } from "vitest";
import {
  bindingReadPathsOf,
  isPathRead,
  readPathsUnder,
} from "../../../src/components-core/optimization/bindingReads";
import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import { Parser } from "../../../src/parsers/scripting/Parser";
import { collectCodeBehindFromSource } from "../../../src/parsers/scripting/code-behind-collect";

function node(type: string, overrides: Partial<ComponentDef> = {}): ComponentDef {
  return { type, ...overrides } as ComponentDef;
}

function parsedEvent(source: string) {
  return { statements: new Parser(source).parseStatements() } as any;
}

const readsOf = (root: ComponentDef) => {
  const reads = bindingReadPathsOf(root);
  if (reads === "all") throw new Error("expected a path set");
  return reads;
};

describe("bindingReadPathsOf (#3941)", () => {
  it("keeps the member paths props read, anywhere in the definition", () => {
    const root = node("App", {
      children: [
        node("Stack", {
          children: [node("Text", { props: { value: "{ds.inProgress ? 'x' : ds.value.length}" } })],
        }),
      ],
    });
    const reads = readsOf(root);
    expect(reads.has("ds.inProgress")).toBe(true);
    expect(reads.has("ds.value.length")).toBe(true);
    expect(reads.has("ds")).toBe(false);
  });

  it("leaves out what only event handlers read", () => {
    const root = node("App", {
      children: [
        node("Button", { events: { click: parsedEvent("dlg.open()") } }),
        node("Button", { events: { click: "dlg.close()" } as any }),
      ],
    });
    expect([...readsOf(root)].some((p) => p.startsWith("dlg"))).toBe(false);
  });

  it("includes when, vars and loader props", () => {
    const root = node("App", {
      vars: { label: "{box.value}" } as any,
      loaders: [node("DataSource", { uid: "ds", props: { url: "/api/{sel.value}" } })],
      children: [node("Text", { when: "{chk.value}" } as any)],
    });
    const reads = readsOf(root);
    expect(reads.has("box.value")).toBe(true);
    expect(reads.has("sel.value")).toBe(true);
    expect(reads.has("chk.value")).toBe(true);
  });

  it("includes markup passed as a prop (templates)", () => {
    const root = node("App", {
      children: [
        node("List", {
          props: { itemTemplate: node("Text", { props: { value: "{tpl.value}" } }) } as any,
        }),
      ],
    });
    expect(readsOf(root).has("tpl.value")).toBe(true);
  });

  it("includes what a code-behind function reads, since a binding may call it", () => {
    const { functions } = collectCodeBehindFromSource(
      "test.xs",
      "function current() { return slider.value; }",
    );
    const root = node("App", {
      scriptCollected: { functions } as any,
      children: [node("Text", { props: { value: "{current()}" } })],
    });
    expect(readsOf(root).has("slider.value")).toBe(true);
  });

  it("reads everything when the code-behind can't be analysed", () => {
    const root = node("App", { scriptCollected: { hasInvalidStatements: true } as any });
    expect(bindingReadPathsOf(root)).toBe("all");
  });

  it("caches the result per definition node", () => {
    const root = node("App", { children: [node("Text", { props: { value: "{a}" } })] });
    expect(bindingReadPathsOf(root)).toBe(bindingReadPathsOf(root));
  });
});

describe("isPathRead and readPathsUnder (#3941)", () => {
  const reads = new Set(["ds.value", "list", "events.value.length"]);

  it("matches a changed path read exactly, read whole, or read below", () => {
    expect(isPathRead(reads, "ds.value")).toBe(true); // exact
    expect(isPathRead(reads, "list.items")).toBe(true); // `list` read whole
    expect(isPathRead(reads, "events.value")).toBe(true); // `events.value.length` read below
    expect(isPathRead(reads, "events")).toBe(true);
  });

  it("doesn't match a sibling field or a name that merely shares a prefix", () => {
    expect(isPathRead(reads, "ds.inProgress")).toBe(false);
    expect(isPathRead(reads, "dsx")).toBe(false);
    expect(isPathRead(reads, "listing")).toBe(false);
  });

  it("treats every path as read when the read set is all", () => {
    expect(isPathRead("all", "anything.at.all")).toBe(true);
  });

  it("lists what is read under a root", () => {
    expect(readPathsUnder(reads, "ds")).toEqual(["ds.value"]);
    expect(readPathsUnder(reads, "nothing")).toEqual([]);
  });
});
