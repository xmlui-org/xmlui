import { describe, expect, it } from "vitest";

import counterBadgeExtension from "../../../packages/xmlui-counter-badge/src";
import { compileXmluiSource } from "../../src/compiler/compileXmluiSource";
import { generateXmluiMetadata, getXmluiCompletions, getXmluiHoverInfo } from "../../src/metadata";
import { normalizeExtensions, StandaloneExtensionManager } from "../../src/extensions";

describe("XMLUI extension packages", () => {
  it("normalizes old-style extension exports into contracts and renderers", () => {
    const normalized = normalizeExtensions([counterBadgeExtension]);

    expect(normalized.contracts.map((contract) => contract.name)).toEqual([
      "CounterBadge",
      "XMLUIExtensions.CounterBadge",
    ]);
    expect(normalized.functionNames).toEqual(["addAmount"]);
    expect(normalized.renderers.CounterBadge).toBeTypeOf("function");
    expect(normalized.renderers["XMLUIExtensions.CounterBadge"]).toBeTypeOf("function");
  });

  it("preserves standalone extension manager replay behavior", () => {
    const manager = new StandaloneExtensionManager();
    const seen: string[] = [];
    manager.registerExtension(counterBadgeExtension);
    manager.subscribeToRegistrations((extension) => seen.push(extension.namespace ?? ""));

    expect(seen).toEqual(["XMLUIExtensions"]);
    expect(manager.listExtensions()).toEqual([counterBadgeExtension]);
  });

  it("compiles namespaced extension components and extension function calls", () => {
    const compiled = compileXmluiSource({
      id: "Main.xmlui",
      source: `
        <App xmlns:ext="XMLUIExtensions" var.count="{0}">
          <ext:CounterBadge value="{count}" onIncrement="count = addAmount(count, 1)" />
        </App>
      `,
      extensions: [counterBadgeExtension],
    });

    expect(compiled.compilerIr.diagnostics).toEqual([]);
    expect(compiled.referencedComponents).toEqual(["XMLUIExtensions.CounterBadge"]);
    expect(compiled.runtimeDocument.root.children[0]).toMatchObject({
      type: "XMLUIExtensions.CounterBadge",
      events: { increment: "count = addAmount(count, 1)" },
    });
  });

  it("adds extension components to metadata, completions, and hover", () => {
    const metadata = generateXmluiMetadata({ extensions: [counterBadgeExtension] });
    const component = metadata.components.find((item) => item.name === "CounterBadge");

    expect(component).toMatchObject({
      kind: "extension",
      description: "Extension counter badge that raises increment events.",
    });
    expect(component?.events).toContainEqual(expect.objectContaining({
      name: "increment",
      attributeName: "onIncrement",
    }));
    expect(getXmluiCompletions("<", 1, metadata)).toContainEqual(expect.objectContaining({
      label: "CounterBadge",
      kind: "component",
    }));
    expect(getXmluiHoverInfo("<CounterBadge />", 3, metadata)).toEqual({
      title: "<CounterBadge>",
      body: "Extension counter badge that raises increment events.",
    });
  });
});
