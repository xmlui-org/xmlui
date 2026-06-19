import { describe, expect, it } from "vitest";

import {
  compileRoutePattern,
  matchRoutePattern,
  RuntimeRoutingStore,
} from "../../src/runtime/routing";

describe("runtime routing", () => {
  it("matches static and dynamic route patterns", () => {
    expect(matchRoutePattern(compileRoutePattern("/"), "/")).toEqual({});
    expect(matchRoutePattern(compileRoutePattern("/details/:id"), "/details/42")).toEqual({
      id: "42",
    });
    expect(matchRoutePattern(compileRoutePattern("/details/:id"), "/other/42")).toBeUndefined();
  });

  it("creates hash hrefs with query params", () => {
    const routing = new RuntimeRoutingStore("hash");

    expect(routing.href("/search", { q: "xmlui", page: 2 })).toBe("#/search?q=xmlui&page=2");
  });
});
