import { describe, expect, it } from "vitest";

import { compileRoute, validateRouteParams } from "../../../src/components-core/routing";

describe("routing constraint compiler", () => {
  it("round-trips unconstrained routes", () => {
    const route = compileRoute("/users/:id/details");
    expect(route.rrPath).toBe("/users/:id/details");
    expect(route.constraints.size).toBe(0);
    expect(route.diagnostics).toEqual([]);
  });

  it("strips constraints from the React Router path", () => {
    const route = compileRoute("/users/:id:int/posts/:slug:slug");
    expect(route.rrPath).toBe("/users/:id/posts/:slug");
    expect([...route.constraints.keys()]).toEqual(["id", "slug"]);
  });

  it("coerces matching route params", () => {
    const route = compileRoute("/users/:id:int(min=1,max=9)");
    const result = validateRouteParams(route, { id: "7" }, "/users/:id:int(min=1,max=9)");
    expect(result).toEqual({ ok: true, params: { id: 7 } });
  });

  it("rejects invalid route params", () => {
    const route = compileRoute("/users/:id:int(min=1,max=9)");
    const result = validateRouteParams(route, { id: "12" }, "/users/:id:int(min=1,max=9)");
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.diagnostic.code).toBe("constraint-rejected");
      expect(result.diagnostic.segment).toBe("id");
    }
  });
});
