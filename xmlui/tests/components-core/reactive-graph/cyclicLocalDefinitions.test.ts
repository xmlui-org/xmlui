import { describe, expect, it } from "vitest";

import type { ComponentDef } from "../../../src/abstractions/ComponentDefs";
import {
  filterCyclicLocalDefinitions,
  getCyclicLocalDefinitionNames,
} from "../../../src/components-core/reactive-graph/cyclicLocalDefinitions";

function node(type: string, overrides: Partial<ComponentDef> = {}): ComponentDef {
  return { type, uid: type, ...overrides } as ComponentDef;
}

describe("getCyclicLocalDefinitionNames", () => {
  it("returns both names in a mutual local var cycle", () => {
    const result = getCyclicLocalDefinitionNames(
      node("Stack", {
        vars: {
          a: "{b + 1}",
          b: "{a + 1}",
          c: "{1}",
        },
      }),
    );

    expect([...result].sort()).toEqual(["a", "b"]);
  });

  it("returns a self-referential local var", () => {
    const result = getCyclicLocalDefinitionNames(
      node("Stack", {
        vars: {
          a: "{a + 1}",
        },
      }),
    );

    expect([...result]).toEqual(["a"]);
  });

  it("does not flag acyclic forward references", () => {
    const result = getCyclicLocalDefinitionNames(
      node("Stack", {
        vars: {
          a: "{b + 1}",
          b: "{1}",
        },
      }),
    );

    expect(result.size).toBe(0);
  });

  it("returns function-mediated cycles", () => {
    const result = getCyclicLocalDefinitionNames(
      node("Stack", {
        vars: {
          x: "{fn()}",
        },
        functions: {
          fn: "{x + 1}",
        },
      }),
    );

    expect([...result].sort()).toEqual(["fn", "x"]);
  });

  it("includes script-collected definitions in the local graph", () => {
    const result = getCyclicLocalDefinitionNames(
      node("Stack", {
        scriptCollected: {
          vars: {
            a: "{b + 1}",
            b: "{a + 1}",
          },
        } as any,
      }),
    );

    expect([...result].sort()).toEqual(["a", "b"]);
  });

  it("does not return same-named declarations from child cycles", () => {
    const result = getCyclicLocalDefinitionNames(
      node("Stack", {
        vars: {
          a: "{1}",
        },
        children: [
          node("Inner", {
            uid: "Inner",
            vars: {
              a: "{b + 1}",
              b: "{a + 1}",
            },
          }),
        ],
      }),
    );

    expect(result.size).toBe(0);
  });

  it("filters cyclic definitions before runtime variable resolution", () => {
    const definitions = {
      a: "{b + 1}",
      b: "{a + 1}",
      c: "{1}",
    };
    const cyclicNames = getCyclicLocalDefinitionNames(
      node("Stack", {
        vars: definitions,
      }),
    );

    expect(filterCyclicLocalDefinitions(definitions, cyclicNames)).toEqual({
      c: "{1}",
    });
  });
});
