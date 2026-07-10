import { describe, expect, it, vi } from "vitest";
import type hotToast from "react-hot-toast";

import { createToastService } from "../../src/runtime/services/toast";
import {
  createEventContext,
  createExpressionContext,
  createRuntimeScope,
} from "../../src/runtime/state";
import { createRuntimeStateStore } from "../../src/runtime/state/store";

function createHotToastApi() {
  const calls: Array<{ kind: string; message?: unknown; options?: unknown; id?: string }> = [];
  const call = vi.fn((message: unknown, options?: { id?: string }) => {
    const id = options?.id ?? `toast-${calls.length + 1}`;
    calls.push({ kind: "default", message, options, id });
    return id;
  }) as unknown as typeof hotToast;
  call.success = vi.fn((message: unknown, options?: { id?: string }) => {
    const id = options?.id ?? `toast-${calls.length + 1}`;
    calls.push({ kind: "success", message, options, id });
    return id;
  }) as typeof hotToast.success;
  call.error = vi.fn((message: unknown, options?: { id?: string }) => {
    const id = options?.id ?? `toast-${calls.length + 1}`;
    calls.push({ kind: "error", message, options, id });
    return id;
  }) as typeof hotToast.error;
  call.loading = vi.fn((message: unknown, options?: { id?: string }) => {
    const id = options?.id ?? `toast-${calls.length + 1}`;
    calls.push({ kind: "loading", message, options, id });
    return id;
  }) as typeof hotToast.loading;
  call.custom = vi.fn((message: unknown, options?: { id?: string }) => {
    const id = options?.id ?? `toast-${calls.length + 1}`;
    calls.push({ kind: "custom", message, options, id });
    return id;
  }) as typeof hotToast.custom;
  call.dismiss = vi.fn((id?: string) => {
    calls.push({ kind: "dismiss", id });
  }) as typeof hotToast.dismiss;
  call.remove = vi.fn((id?: string) => {
    calls.push({ kind: "remove", id });
  }) as typeof hotToast.remove;
  call.promise = vi.fn() as unknown as typeof hotToast.promise;
  return { api: call, calls };
}

describe("runtime services", () => {
  it("exposes the app toast service through compiled handler references", () => {
    const store = createRuntimeStateStore();
    const hotToastApi = createHotToastApi();
    const toast = createToastService(hotToastApi.api);
    const context = createEventContext(createRuntimeScope({ store, toast }));
    const toastReference = context.readReference?.("toast") as ReturnType<typeof createToastService>["reference"];

    const id = toastReference.success("Saved");

    expect(id).toBe("toast-1");
    expect(hotToastApi.api.success).toHaveBeenCalledWith("Saved", undefined);
    expect(hotToastApi.calls).toEqual([
      { kind: "success", message: "Saved", options: undefined, id: "toast-1" },
    ]);
  });

  it("exposes the app toast service through app context reads", () => {
    const store = createRuntimeStateStore();
    const toast = createToastService();
    const context = createExpressionContext(createRuntimeScope({ store, toast }));

    expect(context.readContext?.("toast")).toBe(toast.reference);
  });

  it("updates loading toasts by id and supports dismissing all notifications", () => {
    const hotToastApi = createHotToastApi();
    const toast = createToastService(hotToastApi.api);
    const id = toast.reference.loading("Working");

    toast.reference.success("Done", { id });
    expect(hotToastApi.api.success).toHaveBeenCalledWith("Done", { id });

    toast.reference.dismiss();
    expect(hotToastApi.api.dismiss).toHaveBeenCalledWith();
  });
});
