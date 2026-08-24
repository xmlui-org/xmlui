import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadAction } from "../../../src/components-core/action/FileDownloadAction";
import type { ActionExecutionContext } from "../../../src/abstractions/ActionDefs";
import { createOperationAbortError } from "../../../src/components-core/action/operationCancellation";

function createExecutionContext(
  overrides: Partial<ActionExecutionContext> = {},
  handlers: Record<string, ReturnType<typeof vi.fn>> = {},
): ActionExecutionContext {
  return {
    uid: Symbol("download-test"),
    state: {},
    appContext: {
      appGlobals: { apiUrl: "https://api.example" },
      apiInterceptorContext: {
        isMocked: vi.fn().mockReturnValue(false),
      },
    } as any,
    lookupAction: vi.fn((action: string | undefined) => (action ? handlers[action] : undefined)),
    getCurrentState: () => ({}),
    navigate: vi.fn(),
    location: undefined as any,
    ...overrides,
  };
}

describe("download action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:download");
    vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  });

  it("keeps simple GET downloads on the iframe path", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await downloadAction.actionFn(createExecutionContext(), {
      url: "/reports/public.csv",
      method: "get",
      fileName: "public.csv",
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.querySelector("iframe")?.getAttribute("src")).toBe(
      "https://api.example/reports/public.csv",
    );
  });

  it("uses fetch for GET downloads with custom headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("a,b\n1,2\n", {
        status: 200,
        headers: { "content-type": "text/csv" },
      }),
    );

    await downloadAction.actionFn(createExecutionContext(), {
      url: "/reports/private.csv",
      method: "get",
      fileName: "private.csv",
      headers: { "X-Custom-Header": "test-value" },
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toMatchObject({
      "X-Custom-Header": "test-value",
    });
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("passes AbortSignal to fetch downloads and fires onCancel when aborted", async () => {
    const controller = new AbortController();
    const onCancel = vi.fn();
    let capturedSignal: AbortSignal | undefined;

    vi.spyOn(globalThis, "fetch").mockImplementation((_url, options) => {
      capturedSignal = options?.signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        capturedSignal?.addEventListener("abort", () => reject(createOperationAbortError()), {
          once: true,
        });
      });
    });

    const promise = downloadAction.actionFn(createExecutionContext({}, { cancel: onCancel }), {
      url: "/reports/private.csv",
      method: "get",
      fileName: "private.csv",
      headers: { "X-Custom-Header": "test-value" },
      abortSignal: controller.signal,
      onCancel: "cancel",
    });

    await vi.waitFor(() => expect(capturedSignal).toBe(controller.signal));
    controller.abort("download-stop");

    await expect(promise).resolves.toEqual({
      cancelled: true,
      reason: "download-stop",
    });
    expect(onCancel).toHaveBeenCalledWith("download-stop", undefined);
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("removes iframe downloads and fires onCancel when aborted", async () => {
    const controller = new AbortController();
    const onCancel = vi.fn();

    await downloadAction.actionFn(createExecutionContext({}, { cancel: onCancel }), {
      url: "/reports/public.csv",
      method: "get",
      fileName: "public.csv",
      abortSignal: controller.signal,
      onCancel: "cancel",
    });

    expect(document.querySelector("iframe")).not.toBeNull();
    controller.abort("iframe-stop");

    await vi.waitFor(() => expect(document.querySelector("iframe")).toBeNull());
    expect(onCancel).toHaveBeenCalledWith("iframe-stop", undefined);
  });
});
