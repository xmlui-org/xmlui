import { describe, expect, it } from "vitest";

import { ManagedFetchService, appendQueryParams, type ManagedFetchAdapter } from "../../src/runtime/data";

describe("managed fetch service", () => {
  it("builds normalized requests and appends query params", () => {
    const service = new ManagedFetchService();
    const request = service.buildRequest({
      url: "/api/items",
      method: "POST",
      body: { name: "Ada" },
      queryParams: { q: "runtime", page: 2 },
      headers: { Authorization: "Bearer test" },
      credentials: "include",
    });

    expect(request).toMatchObject({
      url: "/api/items",
      method: "post",
      body: { name: "Ada" },
      queryParams: { q: "runtime", page: 2 },
      headers: { Authorization: "Bearer test" },
      credentials: "include",
      dataType: "json",
    });
    expect(appendQueryParams("/api/items", request.queryParams)).toBe("/api/items?q=runtime&page=2");
  });

  it("deduplicates simultaneous loads with the same key", async () => {
    const service = new ManagedFetchService();
    let calls = 0;
    const adapter: ManagedFetchAdapter = async () => {
      calls++;
      return { data: { count: calls } };
    };
    service.setAdapter(adapter);
    const request = service.buildRequest({ url: "/api/count" });

    const [first, second] = await Promise.all([
      service.load(request),
      service.load(request),
    ]);

    expect(calls).toBe(1);
    expect(first.value).toEqual({ count: 1 });
    expect(second.value).toEqual({ count: 1 });
  });

  it("forces refetches after a value is cached", async () => {
    const service = new ManagedFetchService();
    let calls = 0;
    service.setAdapter(async () => ({ data: { count: ++calls } }));
    const request = service.buildRequest({ url: "/api/count" });

    expect((await service.load(request)).value).toEqual({ count: 1 });
    expect((await service.load(request)).value).toEqual({ count: 1 });
    expect((await service.load(request, { force: true })).value).toEqual({ count: 2 });
  });
});
