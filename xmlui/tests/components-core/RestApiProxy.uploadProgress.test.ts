import { beforeEach, describe, expect, it, vi } from "vitest";

import RestApiProxy, { getLastApiStatus } from "../../src/components-core/RestApiProxy";

type MockXhrScenario = {
  status?: number;
  statusText?: string;
  responseText?: string;
  responseHeaders?: Record<string, string>;
  progressEvents?: Array<{ loaded: number; total?: number }>;
};

class MockXMLHttpRequest {
  static scenarios: MockXhrScenario[] = [];
  static requests: MockXMLHttpRequest[] = [];

  method = "";
  url = "";
  requestHeaders: Record<string, string> = {};
  sentBody: any = undefined;
  responseText = "";
  status = 0;
  statusText = "";
  responseURL = "";
  readyState = 0;
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  onabort: null | (() => void) = null;
  aborted = false;

  upload = {
    addEventListener: (
      eventName: string,
      cb: (event: { loaded: number; total?: number }) => void,
    ) => {
      if (eventName === "progress") {
        this._uploadProgressListener = cb;
      }
    },
  };

  private _uploadProgressListener?: (event: { loaded: number; total?: number }) => void;
  private _responseHeaders: Record<string, string> = {};

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.responseURL = url;
  }

  setRequestHeader(key: string, value: string) {
    this.requestHeaders[key] = value;
  }

  getAllResponseHeaders() {
    return Object.entries(this._responseHeaders)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\r\n");
  }

  send(body?: any) {
    this.sentBody = body;
    const scenario = MockXMLHttpRequest.scenarios.shift() || {};
    this.status = scenario.status ?? 200;
    this.statusText = scenario.statusText ?? "OK";
    this.responseText = scenario.responseText ?? "";
    this._responseHeaders = scenario.responseHeaders || { "content-type": "application/json" };

    (scenario.progressEvents || []).forEach((event) => {
      this._uploadProgressListener?.(event);
    });

    queueMicrotask(() => {
      if (this.aborted) {
        this.onabort?.();
      } else if (this.status === 0) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }

  abort() {
    this.aborted = true;
    this.onabort?.();
  }

  constructor() {
    MockXMLHttpRequest.requests.push(this);
  }
}

function createProxy(appGlobals: Record<string, any> = {}) {
  return new RestApiProxy({ appGlobals: { apiUrl: "https://api.example", ...appGlobals } } as any);
}

describe("RestApiProxy upload progress transport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    MockXMLHttpRequest.scenarios = [];
    MockXMLHttpRequest.requests = [];
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest as any);
  });

  it("uses XMLHttpRequest when onProgress is provided and reports headers/status", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const onProgress = vi.fn();
    const onResponseHeaders = vi.fn();
    const transactionId = "tx-progress-success";

    MockXMLHttpRequest.scenarios.push({
      status: 200,
      responseText: JSON.stringify({ ok: true }),
      responseHeaders: {
        "content-type": "application/json",
        "x-trace-id": "trace-123",
      },
      progressEvents: [
        { loaded: 40, total: 100 },
        { loaded: 100, total: 100 },
      ],
    });

    const result = await createProxy().execute({
      operation: { url: "/upload", method: "post", body: { a: 1 } },
      onProgress,
      transactionId,
      onResponseHeaders,
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onResponseHeaders).toHaveBeenCalledWith(
      expect.objectContaining({
        "content-type": "application/json",
        "x-trace-id": "trace-123",
      }),
    );
    expect(getLastApiStatus(transactionId)).toBe(200);
    expect(MockXMLHttpRequest.requests[0]?.requestHeaders["x-ue-client-tx-id"]).toBe(transactionId);
    expect(MockXMLHttpRequest.requests[0]?.requestHeaders["content-type"]).toContain(
      "application/json",
    );
  });

  it("stringifies raw object body and sets application/json when header is absent", async () => {
    MockXMLHttpRequest.scenarios.push({
      status: 200,
      responseText: JSON.stringify({ ok: true }),
      responseHeaders: {
        "content-type": "application/json",
      },
    });

    await createProxy().execute({
      operation: { url: "/upload", method: "post", body: { a: 1 } },
      onProgress: vi.fn(),
      transactionId: "tx-raw-body",
    });

    expect(MockXMLHttpRequest.requests[0]?.sentBody).toBe(JSON.stringify({ a: 1 }));
    expect(MockXMLHttpRequest.requests[0]?.requestHeaders["content-type"]).toContain(
      "application/json",
    );
  });

  it("rejects with AbortError when abortSignal is aborted", async () => {
    MockXMLHttpRequest.scenarios.push({
      status: 200,
      responseText: JSON.stringify({ ok: true }),
      responseHeaders: {
        "content-type": "application/json",
      },
    });

    const controller = new AbortController();
    const promise = createProxy().execute({
      operation: { url: "/upload", method: "post", body: { a: 1 } },
      onProgress: vi.fn(),
      abortSignal: controller.signal,
      transactionId: "tx-abort",
    });
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  });

  it("uses status text when error response has no body", async () => {
    MockXMLHttpRequest.scenarios.push({
      status: 503,
      statusText: "Service Unavailable",
      responseText: "",
      responseHeaders: {
        "content-type": "application/json",
      },
    });

    const promise = createProxy().execute({
      operation: { url: "/upload", method: "post", body: { a: 1 } },
      onProgress: vi.fn(),
      transactionId: "tx-empty-error",
    });

    await expect(promise).rejects.toMatchObject({
      message: "Service Unavailable",
      statusCode: 503,
    });
    await expect(promise).rejects.not.toMatchObject({ message: "<No error description>" });
  });

  it("uses text body when error response is plain text", async () => {
    MockXMLHttpRequest.scenarios.push({
      status: 400,
      statusText: "Bad Request",
      responseText: "Validation failed",
      responseHeaders: {
        "content-type": "text/plain",
      },
    });

    const promise = createProxy().execute({
      operation: { url: "/upload", method: "post", body: { a: 1 } },
      onProgress: vi.fn(),
      transactionId: "tx-text-error",
    });

    await expect(promise).rejects.toMatchObject({
      message: "Validation failed",
      statusCode: 400,
    });
  });
});
