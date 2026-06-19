import { describe, expect, it } from "vitest";

import { compileXmluiSource } from "../../src/compiler/compileXmluiSource";
import { generateXmluiMetadata } from "../../src/metadata";
import { compatibilityAnchors } from "./sourceAnchors";

describe("compatibility sweep smoke fixtures", () => {
  it("keeps source anchors for state-mutating compatibility fixtures", () => {
    expect(compatibilityAnchors.map((anchor) => anchor.id)).toEqual([
      "counter-local-mutation",
      "global-mutation-from-component",
      "async-handler-mutation",
      "managed-fetch-data-update",
      "extension-event-mutation",
    ]);

    for (const anchor of compatibilityAnchors) {
      expect(anchor.oldSource).toMatch(/^\/Users\/dotneteer\/source\/xmlui\//);
      expect(anchor.rewriteSource).toMatch(/^xmlui\//);
      expect(anchor.note.length).toBeGreaterThan(20);
    }
  });

  it("compiles a local state mutation fixture from the old Button behavior surface", () => {
    const compiled = compileXmluiSource({
      id: "compatibility/counter-local.xmlui",
      source: `
        <App var.count="{0}">
          <Button onClick="count++">Count: {count}</Button>
        </App>
      `,
    });

    const button = compiled.document.root.children.find((child) =>
      child.kind === "element" && child.type === "Button"
    );
    expect(button?.kind).toBe("element");
    if (button?.kind !== "element") {
      throw new Error("Expected Button child.");
    }
    expect(button.type).toBe("Button");
    expect(button.events.click).toBeDefined();
    expect(compiled.compilerIr.definition.dependencies.writes).toContainEqual(
      expect.objectContaining({ name: "count" }),
    );
    expect(compiled.compilerIr.definition.root.dependencies.invalidates).toContainEqual({
      kind: "local",
      name: "count",
    });
  });

  it("compiles a global state mutation fixture across a component boundary", () => {
    const compiled = compileXmluiSource({
      id: "compatibility/counter-global.xmlui",
      source: `
        <App global.count="{0}">
          <Component name="IncrementButton">
            <Button onClick="count++">Global: {count}</Button>
          </Component>
          <IncrementButton />
        </App>
      `,
    });

    expect(compiled.document.root.globals).toHaveProperty("count");
    expect(compiled.compilerIr.referencedComponents).toContain("IncrementButton");
    expect(compiled.compilerIr.definition.declarations).toContainEqual(
      expect.objectContaining({ kind: "global", name: "count" }),
    );
  });

  it("marks metadata examples as mutation-capable for compatibility sweep coverage", () => {
    const metadata = generateXmluiMetadata();
    expect(metadata.examples.length).toBeGreaterThan(0);
    expect(metadata.examples.every((example) => example.demonstratesMutation)).toBe(true);
  });
});
