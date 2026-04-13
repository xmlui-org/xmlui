import { beforeEach, describe, expect, it, vi } from "vitest";

import { callApi } from "../../../src/components-core/action/APICall";
import type { ActionExecutionContext } from "../../../src/abstractions/ActionDefs";

// Minimal appContext with required fields
function createAppContext(overrides: Record<string, any> = {}): any {
  return {
    appGlobals: { apiUrl: "https://api.example", ...overrides },
    queryClient: {
      getQueryCache: () => ({ getAll: () => [] }),
      invalidateQueries: vi.fn(),
    },
    confirm: vi.fn().mockResolvedValue(true),
  };
}

function createExecutionContext(overrides: Partial<ActionExecutionContext> = {}): ActionExecutionContext {
  return {
    uid: Symbol("test-ctx"),
    state: {},
    appContext: createAppContext(),
    lookupAction: vi.fn().mockReturnValue(undefined),
    getCurrentState: () => ({}),
    navigate: vi.fn(),
    apiInstance: undefined,
    location: undefined as any,
    ...overrides,
  };
}

describe("callApi – mockExecute", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the mockExecute handler instead of making a real API request", async () => {
    const mockResult = { id: 1, name: "mock user" };
    const mockFn = vi.fn().mockResolvedValue(mockResult);
    const lookupAction = vi.fn()
      .mockImplementation((action, _uid, options) => {
        if (options?.eventName === "mockExecute") return mockFn;
        return undefined;
      });

    const ctx = createExecutionContext({ lookupAction });

    const result = await callApi(
      ctx,
      {
        url: "/api/users",
        method: "post",
        body: { name: "test" },
        onMockExecute: "return { id: 1, name: 'mock user' }",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    expect(result).toEqual(mockResult);
    expect(mockFn).toHaveBeenCalledOnce();
    // lookupAction should have been called with the mockExecute handler string
    expect(lookupAction).toHaveBeenCalledWith(
      "return { id: 1, name: 'mock user' }",
      expect.any(Symbol),
      expect.objectContaining({
        eventName: "mockExecute",
        context: expect.objectContaining({
          $pathParams: {},
          $queryParams: {},
          $requestBody: { name: "test" },
          $cookies: {},
          $requestHeaders: {},
        }),
      }),
    );
  });

  it("does not call RestApiProxy when mockExecute is provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response());
    const mockFn = vi.fn().mockResolvedValue({ mocked: true });
    const lookupAction = vi.fn().mockReturnValue(mockFn);

    const ctx = createExecutionContext({ lookupAction });

    await callApi(
      ctx,
      {
        url: "/api/data",
        method: "get",
        onMockExecute: "return { mocked: true }",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("provides $param and $params in mock context", async () => {
    const mockFn = vi.fn().mockResolvedValue("ok");
    const lookupAction = vi.fn().mockReturnValue(mockFn);

    const ctx = createExecutionContext({ lookupAction });

    await callApi(
      ctx,
      {
        url: "/api/items",
        method: "post",
        params: { $param: "myParam", $params: ["myParam", "extra"] },
        onMockExecute: "return 'ok'",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    expect(lookupAction).toHaveBeenCalledWith(
      "return 'ok'",
      expect.any(Symbol),
      expect.objectContaining({
        context: expect.objectContaining({
          $param: "myParam",
          $params: ["myParam", "extra"],
        }),
      }),
    );
  });

  it("resolves body from rawBody when both are provided", async () => {
    const mockFn = vi.fn().mockResolvedValue(null);
    const lookupAction = vi.fn().mockReturnValue(mockFn);

    const ctx = createExecutionContext({ lookupAction });

    await callApi(
      ctx,
      {
        url: "/api/data",
        method: "post",
        body: { json: true },
        rawBody: "raw-content",
        onMockExecute: "return null",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    // rawBody takes precedence over body
    expect(lookupAction).toHaveBeenCalledWith(
      "return null",
      expect.any(Symbol),
      expect.objectContaining({
        context: expect.objectContaining({
          $requestBody: "raw-content",
        }),
      }),
    );
  });

  it("fires success handler after mockExecute", async () => {
    const mockResult = { id: 42 };
    const mockFn = vi.fn().mockResolvedValue(mockResult);
    const successFn = vi.fn().mockResolvedValue(undefined);
    const lookupAction = vi.fn()
      .mockImplementation((action, _uid, options) => {
        if (options?.eventName === "mockExecute") return mockFn;
        if (options?.eventName === "success") return successFn;
        return undefined;
      });

    const ctx = createExecutionContext({ lookupAction });

    await callApi(
      ctx,
      {
        url: "/api/data",
        method: "post",
        onMockExecute: "mock",
        onSuccess: "success",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    expect(successFn).toHaveBeenCalledWith(mockResult, undefined);
  });

  it("fires error handler when mockExecute throws", async () => {
    const error = new Error("mock error");
    const mockFn = vi.fn().mockRejectedValue(error);
    const errorFn = vi.fn().mockResolvedValue(false);
    const lookupAction = vi.fn()
      .mockImplementation((action, _uid, options) => {
        if (options?.eventName === "mockExecute") return mockFn;
        if (options?.eventName === "error") return errorFn;
        return undefined;
      });

    const ctx = createExecutionContext({ lookupAction });

    await callApi(
      ctx,
      {
        url: "/api/data",
        method: "post",
        onMockExecute: "mock",
        onError: "error",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    expect(errorFn).toHaveBeenCalledWith(error, undefined);
  });

  it("falls through to real API when onMockExecute is not set", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ real: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const lookupAction = vi.fn().mockReturnValue(undefined);
    const ctx = createExecutionContext({ lookupAction });

    const result = await callApi(
      ctx,
      {
        url: "https://api.example/data",
        method: "get",
        uid: Symbol("test"),
      },
      { resolveBindingExpressions: false },
    );

    expect(fetchSpy).toHaveBeenCalled();
    expect(result).toEqual({ real: true });
  });
});
