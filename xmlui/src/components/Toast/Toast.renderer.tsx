import { useEffect } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { ToastMd } from "./Toast";

export const toastRenderer = wrapComponent({
  name: "Toast",
  metadata: ToastMd,
  renderer: ({ adapter }) => {
    useEffect(() => {
      adapter.registerApi({
        show: (context: unknown, options?: Record<string, unknown>) =>
          adapter.scope.toast?.show("info", renderContext(context), normalizeToastOptions(options)),
        success: (context: unknown, options?: Record<string, unknown>) =>
          adapter.scope.toast?.show("success", renderContext(context), normalizeToastOptions(options)),
        error: (context: unknown, options?: Record<string, unknown>) =>
          adapter.scope.toast?.show("error", renderContext(context), normalizeToastOptions(options)),
        loading: (context: unknown, options?: Record<string, unknown>) =>
          adapter.scope.toast?.show("loading", renderContext(context), normalizeToastOptions(options)),
        dismiss: (id?: string) => adapter.scope.toast?.dismiss(id),
      });
    }, [adapter]);

    return null;
  },
});

function renderContext(context: unknown): string {
  if (context === undefined || context === null) {
    return "";
  }
  if (typeof context === "string") {
    return context;
  }
  return JSON.stringify(context);
}

function normalizeToastOptions(options: Record<string, unknown> | undefined) {
  if (!options) {
    return undefined;
  }
  return {
    id: typeof options.id === "string" ? options.id : undefined,
    duration: typeof options.duration === "number" ? options.duration : undefined,
  };
}
