import { describe, expect, it } from "vitest";

import type { BoundDependency } from "../../src/compiler/scriptSemantics";
import { parseXmlui } from "../../src/compiler/parseXmlui";
import {
  builtInRenderers,
  evaluateExpressionOrText,
  getBindingEvaluationCount,
  normalizeDependencies,
  resetBindingEvaluationCounters,
  runEvent,
  stateDependencies,
  XmluiRenderError,
} from "../../src/runtime/rendering";
import { createRuntimeScope, createRuntimeStateStore } from "../../src/runtime/state";

describe("rendering dependency normalization", () => {
  it("resolves local dependencies to the owning runtime scope", () => {
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 100 });
    store.createLocalOwner("root", { count: 1 });
    store.createLocalOwner("child", {});
    const root = createRuntimeScope({ store, localOwnerId: "root" });
    const child = createRuntimeScope({ store, localOwnerId: "child", parent: root });

    expect(
      normalizeDependencies([dependency("local", "count")], child),
    ).toEqual([
      expect.objectContaining({ kind: "local", ownerId: "root", name: "count" }),
    ]);
  });

  it("keeps globals and props distinct from local shadowing", () => {
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 100 });
    store.createLocalOwner("root", { count: 1 });
    const scope = createRuntimeScope({
      store,
      localOwnerId: "root",
      props: { label: "Click" },
    });

    expect(normalizeDependencies([dependency("global", "count")], scope)).toEqual([
      expect.objectContaining({ kind: "global", name: "count" }),
    ]);
    expect(normalizeDependencies([dependency("props", "$props", ["label"])], scope)).toEqual([
      expect.objectContaining({ kind: "prop", name: "label" }),
    ]);
  });

  it("filters state dependencies for slot subscriptions", () => {
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 0 });
    const scope = createRuntimeScope({ store });
    const dependencies = normalizeDependencies(
      [dependency("global", "count"), dependency("props", "$props", ["label"])],
      scope,
    );

    expect(stateDependencies(dependencies)).toEqual([
      expect.objectContaining({ kind: "global", name: "count" }),
    ]);
  });
});

describe("rendering binding evaluation", () => {
  it("uses generated functions for expressions, mixed text, and events", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button onClick="count++">Count: {count}</Button></App>`,
    );
    const store = createRuntimeStateStore();
    store.setInitialGlobalValues({ count: 0 });
    const scope = createRuntimeScope({ store });
    const button = document.root.children[0];
    if (button.kind !== "element" || button.children[0].kind !== "text") {
      throw new Error("Unexpected test fixture shape.");
    }

    const text = button.children[0];
    expect(evaluateExpressionOrText(text.value, text.segments, scope, "counter-text")).toBe(
      "Count: 0",
    );
    runEvent(button.parsed?.events?.click, scope);
    expect(store.readGlobal("count")).toBe(1);
    expect(evaluateExpressionOrText(text.value, text.segments, scope, "counter-text")).toBe(
      "Count: 1",
    );
  });

  it("records binding recomputation counters", () => {
    resetBindingEvaluationCounters();
    const store = createRuntimeStateStore();
    const scope = createRuntimeScope({ store });

    evaluateExpressionOrText("Hello", undefined, scope, "literal");
    evaluateExpressionOrText("Hello", undefined, scope, "literal");

    expect(getBindingEvaluationCount("literal")).toBe(2);
  });
});

describe("built-in renderer registry", () => {
  it("contains the initial built-in renderers", () => {
    expect(Object.keys(builtInRenderers).sort()).toEqual(["App", "Button", "H1"]);
  });

  it("exposes render errors with the unknown component name", () => {
    const document = parseXmlui(`<App><Missing /></App>`);
    const missing = document.root.children[0];
    if (missing.kind !== "element") {
      throw new Error("Unexpected test fixture shape.");
    }

    expect(() => {
      throw new XmluiRenderError(`Unknown XMLUI component: ${missing.type}`, missing);
    }).toThrow("Unknown XMLUI component: Missing");
  });
});

function dependency(
  kind: "local" | "global" | "props",
  name: string,
  path: string[] = [name],
): BoundDependency {
  return {
    kind,
    name,
    path,
    span: {
      sourceId: "test.xmlui",
      start: 0,
      end: 0,
    },
  };
}
