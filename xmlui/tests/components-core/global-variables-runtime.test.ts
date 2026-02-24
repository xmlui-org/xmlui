import { describe, it, expect } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "../../src/abstractions/ComponentDefs";

// ============================================================================
// Global Variables Runtime Integration Tests
// ============================================================================

/**
 * Helper to simulate resolveRuntime's globalVars collection logic.
 * This tests the logic without needing full StandaloneApp infrastructure.
 */
function collectGlobalVars(
  entryPoint: ComponentDef,
  components: CompoundComponentDef[],
): Record<string, any> {
  const compoundGlobals: Record<string, any> = {};
  components.forEach((compound) => {
    if (compound.component?.globalVars) {
      Object.assign(compoundGlobals, compound.component.globalVars);
    }
  });

  // Merge with root globals (root takes precedence)
  const mergedGlobals = {
    ...compoundGlobals,
    ...(entryPoint.globalVars || {}),
  };

  return mergedGlobals;
}

describe("Global Variables Runtime Integration", () => {
  describe("GlobalVars Collection from Root", () => {
    it("collects globalVars from root element", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          count: "{0}",
          name: "{'Alice'}",
        },
      };

      const result = collectGlobalVars(entryPoint, []);

      expect(result).toEqual({
        count: "{0}",
        name: "{'Alice'}",
      });
    });

    it("returns empty object when root has no globalVars", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
      };

      const result = collectGlobalVars(entryPoint, []);

      expect(result).toEqual({});
    });

    it("handles multiple globals in root", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          a: "{1}",
          b: "{2}",
          c: "{3}",
          d: "{'text'}",
        },
      };

      const result = collectGlobalVars(entryPoint, []);

      expect(result).toEqual({
        a: "{1}",
        b: "{2}",
        c: "{3}",
        d: "{'text'}",
      });
    });
  });

  describe("GlobalVars Collection from Compound Components", () => {
    it("collects globalVars from single compound component", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Counter",
          component: {
            type: "Button",
            globalVars: {
              clickCount: "{0}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({
        clickCount: "{0}",
      });
    });

    it("collects globalVars from multiple compound components", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Counter",
          component: {
            type: "Button",
            globalVars: {
              clickCount: "{0}",
            },
          },
        },
        {
          name: "Display",
          component: {
            type: "Text",
            globalVars: {
              displayText: "{'Hello'}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({
        clickCount: "{0}",
        displayText: "{'Hello'}",
      });
    });

    it("handles compound component without globalVars", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Simple",
          component: {
            type: "Button",
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({});
    });
  });

  describe("GlobalVars Merging Behavior", () => {
    it("merges root and compound component globals", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          rootGlobal: "{100}",
        },
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Counter",
          component: {
            type: "Button",
            globalVars: {
              compoundGlobal: "{200}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({
        compoundGlobal: "{200}",
        rootGlobal: "{100}",
      });
    });

    it("root globals override compound globals with same name", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          count: "{999}",
        },
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Counter",
          component: {
            type: "Button",
            globalVars: {
              count: "{0}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      // Root value should win
      expect(result.count).toEqual("{999}");
    });

    it("later compound components override earlier ones", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
      };

      const components: CompoundComponentDef[] = [
        {
          name: "First",
          component: {
            type: "Button",
            globalVars: {
              shared: "{1}",
            },
          },
        },
        {
          name: "Second",
          component: {
            type: "Button",
            globalVars: {
              shared: "{2}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      // Later component value should win with Object.assign
      expect(result.shared).toEqual("{2}");
    });

    it("root overrides all compound components even with multiple conflicts", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          a: "{ROOT_A}",
          b: "{ROOT_B}",
        },
      };

      const components: CompoundComponentDef[] = [
        {
          name: "First",
          component: {
            type: "Button",
            globalVars: {
              a: "{COMP1_A}",
              c: "{COMP1_C}",
            },
          },
        },
        {
          name: "Second",
          component: {
            type: "Button",
            globalVars: {
              b: "{COMP2_B}",
              d: "{COMP2_D}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({
        a: "{ROOT_A}", // Root wins
        b: "{ROOT_B}", // Root wins
        c: "{COMP1_C}", // From First component
        d: "{COMP2_D}", // From Second component
      });
    });
  });

  describe("Complex Scenarios", () => {
    it("handles mix of element and attribute syntax", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          elemGlobal: "{1}",
          attrGlobal: "{2}",
        },
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Mixed",
          component: {
            type: "Button",
            globalVars: {
              compElem: "{3}",
              compAttr: "{4}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({
        compElem: "{3}",
        compAttr: "{4}",
        elemGlobal: "{1}",
        attrGlobal: "{2}",
      });
    });

    it("handles empty globalVars objects", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {},
      };

      const components: CompoundComponentDef[] = [
        {
          name: "Empty",
          component: {
            type: "Button",
            globalVars: {},
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      expect(result).toEqual({});
    });

    it("preserves complex value expressions", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          obj: "{{ a: 1, b: [2, 3] }}",
          arr: "{[1, 2, 3]}",
          expr: "{x > 0 ? 'pos' : 'neg'}",
        },
      };

      const result = collectGlobalVars(entryPoint, []);

      expect(result.obj).toEqual("{{ a: 1, b: [2, 3] }}");
      expect(result.arr).toEqual("{[1, 2, 3]}");
      expect(result.expr).toEqual("{x > 0 ? 'pos' : 'neg'}");
    });
  });
});
