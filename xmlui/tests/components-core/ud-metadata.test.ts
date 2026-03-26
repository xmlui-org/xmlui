import { describe, expect, it } from "vitest";
import { Parser } from "../../src/parsers/scripting/Parser";
import type { ComponentDef } from "../../src/abstractions/ComponentDefs";
import {
  extractPropsFromExpression,
  extractThemeVarsFromValue,
  walkComponentDefTree,
  collectPropsFromComponentDef,
  collectThemeVarsFromComponentDef,
  generateUdComponentMetadata,
} from "../../src/components-core/ud-metadata";
import { xmlUiMarkupToComponent } from "../../src/components-core/xmlui-parser";

// Helper: parse an expression string into an AST
function parseExpr(src: string) {
  return new Parser(src).parseExpr();
}

describe("extractPropsFromExpression", () => {
  it("extracts simple $props.foo", () => {
    const expr = parseExpr("$props.foo");
    expect(extractPropsFromExpression(expr)).toEqual(["foo"]);
  });

  it("extracts multiple $props members in binary expression", () => {
    const expr = parseExpr("$props.bar + $props.baz");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("bar");
    expect(result).toContain("baz");
    expect(result).toHaveLength(2);
  });

  it("returns empty for no $props references", () => {
    const expr = parseExpr("someVar + 42");
    expect(extractPropsFromExpression(expr)).toEqual([]);
  });

  it("returns empty for bare $props identifier without member access", () => {
    const expr = parseExpr("$props");
    expect(extractPropsFromExpression(expr)).toEqual([]);
  });

  it("extracts from nested conditional expression", () => {
    const expr = parseExpr("$props.enabled ? $props.label : 'default'");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("enabled");
    expect(result).toContain("label");
    expect(result).toHaveLength(2);
  });

  it("extracts from function call arguments", () => {
    const expr = parseExpr("format($props.value, $props.pattern)");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("value");
    expect(result).toContain("pattern");
    expect(result).toHaveLength(2);
  });

  it("extracts from template literal", () => {
    const expr = parseExpr("`Hello ${$props.name}!`");
    expect(extractPropsFromExpression(expr)).toEqual(["name"]);
  });

  it("deduplicates repeated $props members", () => {
    const expr = parseExpr("$props.x + $props.x");
    expect(extractPropsFromExpression(expr)).toEqual(["x"]);
  });

  it("extracts from unary expression", () => {
    const expr = parseExpr("!$props.visible");
    expect(extractPropsFromExpression(expr)).toEqual(["visible"]);
  });

  it("extracts from optional chaining $props?.foo", () => {
    const expr = parseExpr("$props?.foo");
    expect(extractPropsFromExpression(expr)).toEqual(["foo"]);
  });

  it("extracts from array literal", () => {
    const expr = parseExpr("[$props.a, $props.b]");
    const result = extractPropsFromExpression(expr);
    expect(result).toContain("a");
    expect(result).toContain("b");
  });

  it("extracts from object literal", () => {
    const expr = parseExpr("{ key: $props.val }");
    expect(extractPropsFromExpression(expr)).toContain("val");
  });

  it("extracts from spread expression", () => {
    const expr = parseExpr("[...$props.items]");
    expect(extractPropsFromExpression(expr)).toEqual(["items"]);
  });

  it("extracts from nested member access on $props", () => {
    // $props.config.value — only top-level member "config" should be extracted
    // because that's the prop name; .value is a sub-path
    const expr = parseExpr("$props.config.value");
    expect(extractPropsFromExpression(expr)).toEqual(["config"]);
  });

  it("does not extract from non-$props member access", () => {
    const expr = parseExpr("$state.value");
    expect(extractPropsFromExpression(expr)).toEqual([]);
  });

  it("extracts from assignment expression", () => {
    const expr = parseExpr("x = $props.initial");
    expect(extractPropsFromExpression(expr)).toEqual(["initial"]);
  });

  it("extracts from prefix/postfix expressions", () => {
    const expr = parseExpr("++$props.count");
    expect(extractPropsFromExpression(expr)).toEqual(["count"]);
  });

  it("extracts from new expression arguments", () => {
    const expr = parseExpr("new Date($props.timestamp)");
    expect(extractPropsFromExpression(expr)).toEqual(["timestamp"]);
  });
});

describe("extractThemeVarsFromValue", () => {
  it("extracts single theme variable", () => {
    expect(extractThemeVarsFromValue("$color-surface-100")).toEqual(["color-surface-100"]);
  });

  it("extracts multiple theme variables", () => {
    const result = extractThemeVarsFromValue("$space-2 $space-4");
    expect(result).toContain("space-2");
    expect(result).toContain("space-4");
    expect(result).toHaveLength(2);
  });

  it("returns empty for plain CSS value", () => {
    expect(extractThemeVarsFromValue("10px")).toEqual([]);
  });

  it("returns empty for undefined", () => {
    expect(extractThemeVarsFromValue(undefined)).toEqual([]);
  });

  it("returns empty for null", () => {
    expect(extractThemeVarsFromValue(null)).toEqual([]);
  });

  it("returns empty for empty string", () => {
    expect(extractThemeVarsFromValue("")).toEqual([]);
  });

  it("extracts from CSS function value", () => {
    expect(extractThemeVarsFromValue("rgb(from $color-secondary-500 r g b / 0.6)")).toEqual([
      "color-secondary-500",
    ]);
  });

  it("extracts theme var with hyphen", () => {
    expect(extractThemeVarsFromValue("$border-radius")).toEqual(["border-radius"]);
  });

  it("extracts theme var with underscore", () => {
    expect(extractThemeVarsFromValue("$space_large")).toEqual(["space_large"]);
  });

  it("extracts multiple vars in complex expression", () => {
    const result = extractThemeVarsFromValue("$space-0_5 $space-2");
    expect(result).toContain("space-0_5");
    expect(result).toContain("space-2");
    expect(result).toHaveLength(2);
  });

  it("deduplicates repeated theme vars", () => {
    expect(extractThemeVarsFromValue("$x $x")).toEqual(["x"]);
  });

  it("does not match dollar sign followed by number", () => {
    // $1 doesn't match because name must start with a letter
    expect(extractThemeVarsFromValue("$1foo")).toEqual([]);
  });
});

// --- Helpers for Steps 3 & 4

/** Parse a compound component markup and return its inner ComponentDef */
function parseCompound(markup: string): ComponentDef {
  const result = xmlUiMarkupToComponent(markup);
  if (!result.component || result.errors.length > 0) {
    throw new Error(`Parse failed: ${result.errors.map((e: any) => e.message).join("; ")}`);
  }
  return (result.component as any).component as ComponentDef;
}

/** Build a minimal ComponentDef with typed children */
function makeDef(type: string, children?: ComponentDef[]): ComponentDef {
  return { type, ...(children ? { children } : {}) } as ComponentDef;
}

describe("walkComponentDefTree", () => {
  it("visits a single node with no children", () => {
    const visited: string[] = [];
    const def = makeDef("Root");
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toEqual(["Root"]);
  });

  it("visits root and its direct children", () => {
    const visited: string[] = [];
    const def = makeDef("Root", [makeDef("Child1"), makeDef("Child2")]);
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toEqual(["Root", "Child1", "Child2"]);
  });

  it("visits deeply nested children", () => {
    const visited: string[] = [];
    const def = makeDef("A", [makeDef("B", [makeDef("C")])]);
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toEqual(["A", "B", "C"]);
  });

  it("visits loader nodes", () => {
    const visited: string[] = [];
    const def: ComponentDef = {
      type: "Root",
      loaders: [makeDef("Loader1")],
    } as ComponentDef;
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toContain("Loader1");
  });

  it("visits slot contents", () => {
    const visited: string[] = [];
    const def: ComponentDef = {
      type: "Root",
      slots: { header: [makeDef("SlotHeader")] },
    } as ComponentDef;
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toContain("SlotHeader");
  });

  it("visits ComponentDef values in props (template props)", () => {
    const visited: string[] = [];
    const def: ComponentDef = {
      type: "Root",
      props: { template: makeDef("Template") } as any,
    };
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toContain("Template");
  });

  it("visits ComponentDef values in events (inline template handlers)", () => {
    const visited: string[] = [];
    const def: ComponentDef = {
      type: "Root",
      events: { click: makeDef("Handler") } as any,
    };
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toContain("Handler");
  });

  it("handles empty children array gracefully", () => {
    const visited: string[] = [];
    const def = makeDef("Root", []);
    walkComponentDefTree(def, (n) => visited.push(n.type));
    expect(visited).toEqual(["Root"]);
  });

  it("counts total nodes in a multi-level tree", () => {
    let count = 0;
    const def = makeDef("A", [
      makeDef("B", [makeDef("D"), makeDef("E")]),
      makeDef("C"),
    ]);
    walkComponentDefTree(def, () => count++);
    expect(count).toBe(5);
  });
});

describe("collectPropsFromComponentDef", () => {
  it("extracts $props references from a prop attribute", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Text value="{$props.label}" /></Component>`,
    );
    expect(collectPropsFromComponentDef(def)).toContain("label");
  });

  it("extracts multiple props from multiple attributes", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Text value="{$props.title}" hint="{$props.subtitle}" /></Component>`,
    );
    const result = collectPropsFromComponentDef(def);
    expect(result).toContain("title");
    expect(result).toContain("subtitle");
  });

  it("extracts $props from event handlers", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Button onClick="$props.onSave()" /></Component>`,
    );
    expect(collectPropsFromComponentDef(def)).toContain("onSave");
  });

  it("extracts $props from deeply nested child", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Stack><Text value="{$props.deep}" /></Stack></Component>`,
    );
    expect(collectPropsFromComponentDef(def)).toContain("deep");
  });

  it("returns empty when no $props references", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Text value="hello" /></Component>`,
    );
    expect(collectPropsFromComponentDef(def)).toEqual([]);
  });

  it("deduplicates repeated $props references", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Text value="{$props.x}" hint="{$props.x}" /></Component>`,
    );
    const result = collectPropsFromComponentDef(def);
    expect(result.filter((v) => v === "x")).toHaveLength(1);
  });

  it("handles mixed literal and expression props (only expressions analyzed)", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Text value="fixed" label="{$props.dynamic}" /></Component>`,
    );
    const result = collectPropsFromComponentDef(def);
    expect(result).toContain("dynamic");
    expect(result).not.toContain("fixed");
  });

  it("extracts $props from vars", () => {
    const def = parseCompound(
      `<Component name="MyComp"><Stack var:computed="{$props.base + 10}" /></Component>`,
    );
    expect(collectPropsFromComponentDef(def)).toContain("base");
  });
});

// ---------------------------------------------------------------------------
// helpers for Steps 5 & 6
// ---------------------------------------------------------------------------

/** Build a minimal ComponentDef directly (bypasses the XML parser). */
function makeNode(
  props?: Record<string, string>,
  children?: ComponentDef[],
): ComponentDef {
  return { type: "Stack", props, children } as unknown as ComponentDef;
}

/** Parse XMLUI markup and return the CompoundComponentDef (for generateUdComponentMetadata). */
function parseCompoundDef(xml: string) {
  const result = xmlUiMarkupToComponent(xml);
  if (!result.component || result.errors.length > 0) {
    throw new Error(`Parse failed: ${result.errors.map((e: any) => e.message).join("; ")}`);
  }
  return result.component as any;
}

describe("collectThemeVarsFromComponentDef", () => {
  it("returns empty object when no layout props", () => {
    const node = makeNode({ label: "hello" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({});
  });

  it("collects theme var from a layout prop string value", () => {
    const node = makeNode({ padding: "$space-2" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({ "space-2": "" });
  });

  it("ignores layout prop with expression syntax", () => {
    const node = makeNode({ padding: "{$props.padding}" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({});
  });

  it("ignores layout prop with plain literal (no theme var)", () => {
    const node = makeNode({ padding: "10px" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({});
  });

  it("collects multiple theme vars from one value", () => {
    const node = makeNode({ padding: "$space-2 $space-4" });
    const result = collectThemeVarsFromComponentDef(node);
    expect(result["space-2"]).toBe("");
    expect(result["space-4"]).toBe("");
  });

  it("collects from backgroundColor layout prop", () => {
    const node = makeNode({ backgroundColor: "$color-surface-100" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({ "color-surface-100": "" });
  });

  it("deduplicates theme vars across nodes", () => {
    const child = makeNode({ padding: "$space-2" });
    const parent = makeNode({ padding: "$space-2" }, [child]);
    const result = collectThemeVarsFromComponentDef(parent);
    expect(Object.keys(result)).toEqual(["space-2"]);
  });

  it("collects from nested children", () => {
    const inner = makeNode({ margin: "$space-4" });
    const outer = makeNode({ padding: "$space-2" }, [inner]);
    const result = collectThemeVarsFromComponentDef(outer);
    expect(result["space-2"]).toBe("");
    expect(result["space-4"]).toBe("");
  });

  it("collects from responsive layout props", () => {
    // padding-md is a valid responsive layout prop
    const node = makeNode({ "padding-md": "$space-4" });
    const result = collectThemeVarsFromComponentDef(node);
    expect(result["space-4"]).toBe("");
  });

  it("collects from any valid camelCase prop name with theme var value", () => {
    // parseLayoutProperty accepts any valid camelCase name — not just known CSS props
    const node = makeNode({ customProp: "$my-color" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({ "my-color": "" });
  });

  it("ignores prop names with uppercase start (component names are invalid)", () => {
    // A prop like "Whatever" would fail parseLayoutProperty (starts with uppercase)
    const node = makeNode({ Whatever: "$some-var" });
    expect(collectThemeVarsFromComponentDef(node)).toEqual({});
  });
});

describe("generateUdComponentMetadata", () => {
  it("returns stable status", () => {
    const comp = parseCompoundDef(`<Component name="MyComp"><Text /></Component>`);
    const meta = generateUdComponentMetadata(comp);
    expect(meta.status).toBe("stable");
  });

  it("includes component name in description", () => {
    const comp = parseCompoundDef(`<Component name="Widget"><Text /></Component>`);
    const meta = generateUdComponentMetadata(comp);
    expect(meta.description).toContain("Widget");
  });

  it("generates props from $props references", () => {
    const comp = parseCompoundDef(
      `<Component name="MyComp"><Text value="{$props.label}" /></Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.props).toBeDefined();
    expect(meta.props!["label"]).toBeDefined();
    expect(meta.props!["label"].description).toBe("");
  });

  it("returns empty props when no $props references", () => {
    const comp = parseCompoundDef(`<Component name="MyComp"><Text value="hello" /></Component>`);
    const meta = generateUdComponentMetadata(comp);
    expect(meta.props).toEqual({});
  });

  it("generates themeVars from layout prop string values", () => {
    const comp = parseCompoundDef(
      `<Component name="MyComp"><Stack backgroundColor="$color-surface-100" /></Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.themeVars).toBeDefined();
    expect(meta.themeVars!["color-surface-100"]).toBe("");
  });

  it("returns empty themeVars when no layout prop theme var references", () => {
    const comp = parseCompoundDef(`<Component name="MyComp"><Text value="{$props.x}" /></Component>`);
    const meta = generateUdComponentMetadata(comp);
    expect(meta.themeVars).toEqual({});
  });

  it("collects both props and themeVars together", () => {
    const comp = parseCompoundDef(
      `<Component name="MyComp">
        <Stack backgroundColor="$color-surface-100" padding="$space-2">
          <Text value="{$props.title}" />
        </Stack>
      </Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.props!["title"]).toBeDefined();
    expect(meta.themeVars!["color-surface-100"]).toBe("");
    expect(meta.themeVars!["space-2"]).toBe("");
  });

  it("handles multiple props and theme vars across nested tree", () => {
    const comp = parseCompoundDef(
      `<Component name="Card">
        <Stack padding="$space-4">
          <Text value="{$props.header}" />
          <Text value="{$props.body}" color="$color-text" />
        </Stack>
      </Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(Object.keys(meta.props!).sort()).toEqual(["body", "header"]);
    expect(meta.themeVars!["space-4"]).toBe("");
    expect(meta.themeVars!["color-text"]).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Step 9: Edge case tests
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("collects theme vars from component referencing another component's var", () => {
    const comp = parseCompoundDef(
      `<Component name="MyComp">
        <OtherComp backgroundColor="$bg-OtherComp" />
      </Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.themeVars!["bg-OtherComp"]).toBe("");
  });

  it("collects $props from when/if conditions", () => {
    const comp = parseCompoundDef(
      `<Component name="MyComp">
        <Text when="{$props.visible}" value="shown" />
      </Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.props!["visible"]).toBeDefined();
  });

  it("handles compound component with no children", () => {
    const comp = parseCompoundDef(`<Component name="Empty"><Fragment /></Component>`);
    const meta = generateUdComponentMetadata(comp);
    expect(meta.status).toBe("stable");
    expect(meta.props).toEqual({});
    expect(meta.themeVars).toEqual({});
  });

  it("handles deeply nested tree with mixed props and theme vars", () => {
    const comp = parseCompoundDef(
      `<Component name="Deep">
        <Stack padding="$space-1">
          <Stack margin="$space-2">
            <Stack gap="$space-3">
              <Text value="{$props.deep}" />
            </Stack>
          </Stack>
        </Stack>
      </Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.props!["deep"]).toBeDefined();
    expect(meta.themeVars!["space-1"]).toBe("");
    expect(meta.themeVars!["space-2"]).toBe("");
    expect(meta.themeVars!["space-3"]).toBe("");
  });

  it("walkComponentDefTree does not infinite-loop on empty children", () => {
    const node: ComponentDef = {
      type: "Stack",
      children: [],
    } as unknown as ComponentDef;
    const visited: string[] = [];
    walkComponentDefTree(node, (n) => visited.push(n.type));
    expect(visited).toEqual(["Stack"]);
  });

  it("explicit metadata overrides auto-generated fields", () => {
    // This tests the merge semantics used in registerCompoundComponentRenderer:
    // explicit metadata wins over auto-generated metadata.
    const comp = parseCompoundDef(
      `<Component name="MyComp"><Text value="{$props.label}" /></Component>`,
    );
    const auto = generateUdComponentMetadata(comp);
    const explicit = { description: "Custom description" };
    const merged = { ...auto, ...explicit };
    expect(merged.description).toBe("Custom description");
    expect(merged.props!["label"]).toBeDefined();
  });

  it("collects theme vars from loaders", () => {
    // Loaders are ComponentDef nodes with layout props — should be visited
    const node: ComponentDef = {
      type: "Stack",
      loaders: [
        { type: "ApiCall", props: { padding: "$space-2" } } as unknown as ComponentDef,
      ],
    } as unknown as ComponentDef;
    expect(collectThemeVarsFromComponentDef(node)["space-2"]).toBe("");
  });

  it("collects $props from slots", () => {
    const comp = parseCompoundDef(
      `<Component name="SlotComp">
        <Stack>
          <Slot name="header" content="{$props.headerContent}" />
        </Stack>
      </Component>`,
    );
    const meta = generateUdComponentMetadata(comp);
    expect(meta.props!["headerContent"]).toBeDefined();
  });
});
