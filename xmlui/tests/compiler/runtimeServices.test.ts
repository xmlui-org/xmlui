import { describe, expect, it, vi } from "vitest";

import { createToastService } from "../../src/runtime/services/toast";
import {
  createEventContext,
  createRuntimeScope,
} from "../../src/runtime/state";
import { createRuntimeStateStore } from "../../src/runtime/state/store";

describe("runtime services", () => {
  it("exposes the app toast service through compiled handler references", () => {
    const store = createRuntimeStateStore();
    const toast = createToastService();
    const context = createEventContext(createRuntimeScope({ store, toast }));
    const toastReference = context.readReference?.("toast") as ReturnType<typeof createToastService>["reference"];

    const id = toastReference.success("Saved");

    expect(id).toBe("toast-1");
    expect(toast.getSnapshot()).toEqual([
      { id: "toast-1", message: "Saved", kind: "success" },
    ]);
  });

  it("updates loading toasts by id and supports dismissing all notifications", () => {
    vi.useFakeTimers();
    try {
      const toast = createToastService();
      const id = toast.reference.loading("Working");

      toast.reference.success("Done", { id });
      expect(toast.getSnapshot()).toEqual([
        { id, message: "Done", kind: "success" },
      ]);

      toast.reference.dismiss();
      expect(toast.getSnapshot()).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});
