import { beforeEach, describe, expect, it, vi } from "vitest";

import RestApiProxy from "../../src/components-core/RestApiProxy";

// Minimal mock of a successful fetch response
function mockFetchSuccess(body: object = {}) {
  const clone = () => ({
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: { get: () => "application/json" },
  });
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    clone,
    headers: { get: () => "application/json" },
  });
}

function createProxy(appGlobals: Record<string, any> = {}) {
  return new RestApiProxy(
    { appGlobals: { apiUrl: "https://api.example", ...appGlobals } } as any,
  );
}

describe("RestApiProxy – transaction ID header (x-ue-client-tx-id)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("includes the header for non-GET requests by default", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy().execute({
      operation: { url: "https://api.example/data", method: "post", body: {} },
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeDefined();
  });

  it("does NOT include the header for GET requests", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy().execute({
      operation: { url: "https://api.example/data", method: "get" },
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeUndefined();
  });

  it("does NOT include the header when appGlobals.enableTransactionIds is false", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy({ enableTransactionIds: false }).execute({
      operation: { url: "https://api.example/data", method: "post", body: {} },
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeUndefined();
  });

  it("still includes the header when appGlobals.enableTransactionIds is explicitly true", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy({ enableTransactionIds: true }).execute({
      operation: { url: "https://api.example/data", method: "post", body: {} },
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeDefined();
  });

  it("does NOT include the header when omitTransactionId is true on the call", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy().execute({
      operation: { url: "https://api.example/data", method: "post", body: {} },
      omitTransactionId: true,
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeUndefined();
  });

  it("per-call omitTransactionId overrides even when enableTransactionIds is true", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy({ enableTransactionIds: true }).execute({
      operation: { url: "https://api.example/data", method: "put", body: {} },
      omitTransactionId: true,
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeUndefined();
  });

  it("does NOT include the header for DELETE requests when omitTransactionId is true", async () => {
    const fetchMock = mockFetchSuccess();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    await createProxy().execute({
      operation: { url: "https://api.example/data", method: "delete" },
      omitTransactionId: true,
    });

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)["x-ue-client-tx-id"]).toBeUndefined();
  });
});
