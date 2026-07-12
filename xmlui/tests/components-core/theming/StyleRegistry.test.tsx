import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StyleProvider, useStyleRegistry } from "../../../src/components-core/theming/StyleContext";
import { StyleRegistry } from "../../../src/components-core/theming/StyleRegistry";

describe("StyleRegistry", () => {
  it("uses stable hashes for equivalent style objects", () => {
    const registry = new StyleRegistry();

    const first = registry.register({ color: "red", backgroundColor: "white" });
    const second = registry.register({ backgroundColor: "white", color: "red" });

    expect(second).toBe(first);
    expect(first.className).toMatch(/^css-/);
  });

  it("generates nested selectors and at-rules like the old registry", () => {
    const registry = new StyleRegistry();
    const entry = registry.register({
      color: "red",
      "&:hover": {
        color: "blue",
      },
      "@media (min-width: 576px)": {
        "&": {
          color: "green",
        },
      },
    });

    expect(entry.css).toContain(`.${entry.className} {color:red;}`);
    expect(entry.css).toContain(`.${entry.className}:hover {color:blue;}`);
    expect(entry.css).toContain(`@media (min-width: 576px){.${entry.className} {color:green;}}`);
    expect(entry.css.indexOf(`.${entry.className}:hover`)).toBeLessThan(
      entry.css.indexOf("@media (min-width: 576px)"),
    );
  });

  it("emits SSR styles in the old layer order", () => {
    const registry = new StyleRegistry();
    registry.register({ color: "reset" }, "reset");
    registry.register({ color: "dynamic" }, "dynamic");
    registry.register({ color: "theme" }, "themes");
    registry.register({ color: "custom" }, "custom");

    const css = registry.getSsrStyles();

    expect(css.startsWith("@layer reset, base, components, themes, dynamic, custom;")).toBe(true);
    expect(css.indexOf("@layer reset")).toBeLessThan(css.indexOf("@layer themes"));
    expect(css.indexOf("@layer themes")).toBeLessThan(css.indexOf("@layer dynamic"));
    expect(css.indexOf("@layer dynamic")).toBeLessThan(css.indexOf("@layer custom"));
  });

  it("collects root classes and tracks references", () => {
    const registry = new StyleRegistry();

    registry.addRootClasses(["theme-root", undefined, "theme-root", "app-root"]);
    registry.incrementRef("abc");
    registry.incrementRef("abc");

    expect(registry.getRootClasses()).toBe("theme-root app-root");
    expect(registry.getRootClassNames()).toBe("theme-root app-root");
    expect(registry.getRefCount("abc")).toBe(2);
    expect(registry.decrementRef("abc")).toBe(1);
    expect(registry.decrementRef("abc")).toBe(0);
    expect(registry.getRefCount("abc")).toBe(0);
  });
});

describe("StyleProvider", () => {
  it("throws when useStyleRegistry is used without a provider", () => {
    function Probe() {
      useStyleRegistry();
      return null;
    }

    expect(() => renderToStaticMarkup(<Probe />)).toThrow("Component must be used within a StyleProvider");
  });

  it("reuses the parent registry unless forceNew is set", () => {
    const outer = new StyleRegistry();
    const inner = new StyleRegistry();
    const forced = new StyleRegistry();
    const seen: Array<boolean> = [];

    function Probe({ expected }: { expected: StyleRegistry }) {
      seen.push(useStyleRegistry() === expected);
      return null;
    }

    renderToStaticMarkup(
      <StyleProvider styleRegistry={outer}>
        <Probe expected={outer} />
        <StyleProvider styleRegistry={inner}>
          <Probe expected={outer} />
        </StyleProvider>
        <StyleProvider styleRegistry={forced} forceNew>
          <Probe expected={forced} />
        </StyleProvider>
      </StyleProvider>,
    );

    expect(seen).toEqual([true, true, true]);
  });
});
