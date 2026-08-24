import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ActionExecutionContext } from "../../../src/abstractions/ActionDefs";
import { uploadAction } from "../../../src/components-core/action/FileUploadAction";
import { createOperationAbortError } from "../../../src/components-core/action/operationCancellation";

function createExecutionContext(
  handlers: Record<string, ReturnType<typeof vi.fn>> = {},
): ActionExecutionContext {
  return {
    uid: Symbol("upload-test"),
    state: {},
    appContext: {} as any,
    lookupAction: vi.fn((action: string | undefined) => (action ? handlers[action] : undefined)),
    getCurrentState: () => ({}),
    navigate: vi.fn(),
    location: undefined as any,
  };
}

describe("upload action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("passes AbortSignal to uploads and fires onCancel when aborted", async () => {
    const controller = new AbortController();
    const onCancel = vi.fn();
    const onError = vi.fn();
    let capturedSignal: AbortSignal | undefined;

    vi.spyOn(globalThis, "fetch").mockImplementation((_url, options) => {
      capturedSignal = options?.signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        capturedSignal?.addEventListener("abort", () => reject(createOperationAbortError()), {
          once: true,
        });
      });
    });

    const promise = uploadAction.actionFn(createExecutionContext({ cancel: onCancel, error: onError }), {
      url: "/upload",
      method: "post",
      file: new File(["hello"], "hello.txt", { type: "text/plain" }),
      asForm: true,
      params: {},
      abortSignal: controller.signal,
      onCancel: "cancel",
      onError: "error",
    });

    await vi.waitFor(() => expect(capturedSignal).toBe(controller.signal));
    controller.abort("upload-stop");

    await expect(promise).resolves.toEqual({
      cancelled: true,
      reason: "upload-stop",
    });
    expect(onCancel).toHaveBeenCalledWith("upload-stop", undefined);
    expect(onError).not.toHaveBeenCalled();
  });

  it("stops chunked uploads before starting the next chunk after cancellation", async () => {
    const controller = new AbortController();
    const onCancel = vi.fn();
    let uploadCount = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      uploadCount += 1;
      controller.abort("chunk-stop");
      return new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    await expect(
      uploadAction.actionFn(createExecutionContext({ cancel: onCancel }), {
        url: "/upload",
        method: "post",
        file: new File(["hello"], "hello.txt", { type: "text/plain" }),
        asForm: true,
        params: {},
        chunkSizeInBytes: 2,
        abortSignal: controller.signal,
        onCancel: "cancel",
      }),
    ).resolves.toEqual({
      cancelled: true,
      reason: "chunk-stop",
    });

    expect(uploadCount).toBe(1);
    expect(onCancel).toHaveBeenCalledWith("chunk-stop", undefined);
  });
});
