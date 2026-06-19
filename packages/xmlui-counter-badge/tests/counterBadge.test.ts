import { describe, expect, it } from "vitest";

import counterBadgeExtension from "../src";

describe("xmlui-counter-badge extension package", () => {
  it("exports an old-style XMLUI extension object", () => {
    expect(counterBadgeExtension.namespace).toBe("XMLUIExtensions");
    expect(counterBadgeExtension.themeNamespacePrefix).toBe("CounterBadge");
    expect(counterBadgeExtension.components?.[0]).toMatchObject({
      name: "CounterBadge",
      props: ["label", "value"],
      events: ["increment"],
    });
    expect(counterBadgeExtension.functions?.addAmount?.(2, 3)).toBe(5);
  });
});

