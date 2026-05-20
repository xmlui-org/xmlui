import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { compileRoute, validateRouteParams } from "../../../src/components-core/routing";
import {
  __resetValidatorRegistryForTests,
  registerValidator,
} from "../../../src/components-core/forms";

describe("routing — custom constraints via validator registry (Step 1.2)", () => {
  beforeEach(() => {
    __resetValidatorRegistryForTests();
  });

  afterEach(() => {
    __resetValidatorRegistryForTests();
  });

  it("resolves a registered validator as a route constraint", () => {
    registerValidator({
      name: "employeeId",
      fn: (v) => (/^E\d{6}$/.test(String(v)) ? null : "invalid"),
      defaultMessage: "Invalid employee id",
    });

    const route = compileRoute("/emp/:id:employeeId");
    expect(route.diagnostics).toEqual([]);
    expect(route.constraints.has("id")).toBe(true);

    const ok = validateRouteParams(route, { id: "E123456" }, "/emp/:id:employeeId");
    expect(ok).toEqual({ ok: true, params: { id: "E123456" } });

    const bad = validateRouteParams(route, { id: "X1" }, "/emp/:id:employeeId");
    expect(bad.ok).toBe(false);
    if (bad.ok === false) {
      expect(bad.diagnostic.code).toBe("constraint-rejected");
      expect(bad.diagnostic.constraint).toBe("employeeId");
    }
  });

  it("forwards constraint parameters as { args: [...] } to the validator", () => {
    let observedParams: unknown;
    registerValidator({
      name: "lenRange",
      fn: (v, _ctx, params) => {
        observedParams = params;
        const { args } = params as { args: [number, number] };
        const len = String(v).length;
        return len >= args[0] && len <= args[1] ? null : "out of range";
      },
      defaultMessage: "out of range",
    });

    const route = compileRoute("/u/:n:lenRange(2,4)");
    const ok = validateRouteParams(route, { n: "abc" }, "/u/:n:lenRange(2,4)");
    expect(ok.ok).toBe(true);
    expect(observedParams).toEqual({ args: [2, 4] });

    const bad = validateRouteParams(route, { n: "a" }, "/u/:n:lenRange(2,4)");
    expect(bad.ok).toBe(false);
  });

  it("treats a thrown validator as a constraint rejection", () => {
    registerValidator({
      name: "boom",
      fn: () => {
        throw new Error("nope");
      },
      defaultMessage: "boom",
    });

    const route = compileRoute("/x/:v:boom");
    const result = validateRouteParams(route, { v: "anything" }, "/x/:v:boom");
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.diagnostic.code).toBe("constraint-rejected");
    }
  });

  it("treats an async validator as invalid (routing is sync-only)", () => {
    registerValidator({
      name: "asyncOnly",
      fn: async () => null,
      defaultMessage: "async not supported",
    });

    const route = compileRoute("/a/:v:asyncOnly");
    const result = validateRouteParams(route, { v: "x" }, "/a/:v:asyncOnly");
    expect(result.ok).toBe(false);
  });

  it("still reports unknown-constraint when no built-in or registered validator matches", () => {
    const route = compileRoute("/u/:v:nope");
    expect(route.diagnostics.some((d) => d.code === "unknown-constraint")).toBe(true);
  });

  it("resolves a registered validator as a query constraint", () => {
    registerValidator({
      name: "twoDigits",
      fn: (v) => (/^\d{2}$/.test(String(v)) ? null : "invalid"),
      defaultMessage: "invalid",
    });

    const route = compileRoute("/q", false, "code:twoDigits");
    expect(route.diagnostics).toEqual([]);
    expect(route.queryConstraints.has("code")).toBe(true);
  });
});
