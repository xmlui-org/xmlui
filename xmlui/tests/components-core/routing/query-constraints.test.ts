import { describe, expect, it } from "vitest";

import { compileRoute, validateQueryParams } from "../../../src/components-core/routing";

describe("routing query constraints", () => {
  it("coerces declared query parameters", () => {
    const route = compileRoute("/search", false, "q:string,page:int(min=1)?,sort:enum(asc,desc)?");
    const result = validateQueryParams(
      route,
      new URLSearchParams("q=xmlui&page=2&sort=desc"),
      "/search",
    );
    expect(result).toEqual({ ok: true, params: { q: "xmlui", page: 2, sort: "desc" } });
  });

  it("rejects missing required query parameters", () => {
    const route = compileRoute("/search", false, "q:string,page:int(min=1)?");
    const result = validateQueryParams(route, new URLSearchParams("page=2"), "/search");
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.diagnostic.message).toContain("q");
    }
  });

  it("preserves unknown query parameters in non-strict mode", () => {
    const route = compileRoute("/search", false, "q:string");
    const result = validateQueryParams(route, new URLSearchParams("q=x&extra=y"), "/search");
    expect(result).toEqual({ ok: true, params: { q: "x", extra: "y" } });
  });
});
