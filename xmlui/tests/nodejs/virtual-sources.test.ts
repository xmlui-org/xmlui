import { describe, expect, it } from "vitest";

import { XmluiVirtualSourceRegistry } from "../../src/nodejs/virtual-sources";

describe("XMLUI virtual source registry", () => {
  it("creates project-root-relative virtual source URLs", () => {
    const registry = new XmluiVirtualSourceRegistry("/project");

    expect(registry.createUrl("/project/src/Main.xmlui")).toBe("/@xmlui-source/src/Main.xmlui");
  });

  it("stores and retrieves source content by virtual URL", () => {
    const registry = new XmluiVirtualSourceRegistry("/project");
    const url = registry.createUrl("/project/src/Main.xmlui");

    registry.register({
      id: "/project/src/Main.xmlui",
      url,
      sourceText: "<App />",
    });

    expect(registry.getContent("/@xmlui-source/src/Main.xmlui")).toBe("<App />");
  });

  it("rejects path traversal attempts", () => {
    const registry = new XmluiVirtualSourceRegistry("/project");

    expect(() => registry.getContent("/@xmlui-source/../secret.txt")).toThrow(
      "Unsafe XMLUI virtual source path",
    );
  });
});
