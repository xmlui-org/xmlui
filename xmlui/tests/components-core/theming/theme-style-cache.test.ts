import { describe, expect, it } from "vitest";
import { StyleRegistry } from "../../../src/components-core/theming/StyleRegistry";

// --- #3969: a style object registered again by identity skips serialization;
// --- equal content still maps to the same class.
describe("StyleRegistry identity cache", () => {
  function countingStyles() {
    const counter = { reads: 0 };
    const styles: Record<string, string> = {};
    Object.defineProperty(styles, "--xmlui-textColor-Text", {
      enumerable: true,
      get() {
        counter.reads++;
        return "var(--xmlui-textColor)";
      },
    });
    return { styles, counter };
  }

  it("re-registering the same object doesn't read it again", () => {
    const registry = new StyleRegistry();
    const { styles, counter } = countingStyles();
    const first = registry.register(styles as any);
    const readsAfterFirst = counter.reads;
    expect(readsAfterFirst).toBeGreaterThan(0);
    const second = registry.register(styles as any);
    expect(second).toBe(first);
    expect(counter.reads).toBe(readsAfterFirst);
  });

  it("an equal but different object gets the same class", () => {
    const registry = new StyleRegistry();
    const a = registry.register({ color: "red", "--x": "1px" } as any);
    const b = registry.register({ color: "red", "--x": "1px" } as any);
    expect(b.className).toBe(a.className);
    expect(b.css).toBe(a.css);
  });

  it("different content gets a different class", () => {
    const registry = new StyleRegistry();
    const a = registry.register({ color: "red" } as any);
    const b = registry.register({ color: "blue" } as any);
    expect(b.className).not.toBe(a.className);
  });

  it("the same object in another layer gets that layer's entry", () => {
    const registry = new StyleRegistry();
    const styles = { color: "red" } as any;
    const dynamic = registry.register(styles, "dynamic");
    const base = registry.register(styles, "base");
    expect(base.layer).toBe("base");
    expect(dynamic.layer).toBe("dynamic");
    expect(base.className).not.toBe(dynamic.className);
    expect(registry.register(styles, "base")).toBe(base);
  });
});
