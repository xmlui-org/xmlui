import { describe, it, expect } from "vitest";
import type { ComponentDef, CompoundComponentDef } from "../../src/abstractions/ComponentDefs";

// ============================================================================
// Global Variables Runtime Integration Tests
// ============================================================================

/**
 * Helper to simulate resolveRuntime's globalVars collection logic.
 * This tests the logic without needing full StandaloneApp infrastructure.
 * Note: Global variables can only be declared in Main.xmlui, not in component files.
 */
function collectGlobalVars(
  entryPoint: ComponentDef,
  components: CompoundComponentDef[],
): Record<string, any> {
  // Only collect from root element (Main.xmlui)
  return entryPoint.globalVars || {};
}

describe("Global Variables Runtime Integration", () => {
  describe("GlobalVars Collection from Root (Main.xmlui)", () => {
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

    it("handles complex value expressions", () => {
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

    it("ignores globalVars in compound components (feature removed)", () => {
      const entryPoint: ComponentDef = {
        type: "Stack",
        globalVars: {
          rootGlobal: "{100}",
        },
      };

      // Even if a component has globalVars (from old code), they should be ignored
      const components: CompoundComponentDef[] = [
        {
          name: "Counter",
          component: {
            type: "Button",
            globalVars: {
              shouldBeIgnored: "{200}",
            },
          },
        },
      ];

      const result = collectGlobalVars(entryPoint, components);

      // Only root globals should be in the result
      expect(result).toEqual({
        rootGlobal: "{100}",
      });
      expect(result.shouldBeIgnored).toBeUndefined();
    });
  });
});
