import { useEffect } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { ToastMd } from "./Toast";

export const toastRenderer = wrapComponent({
  name: "Toast",
  metadata: ToastMd,
  renderer: ({ adapter }) => {
    useEffect(() => {
      adapter.registerApi({
        show: (context: unknown) => adapter.scope.toast?.show("info", renderContext(context)),
        success: (context: unknown) => adapter.scope.toast?.show("success", renderContext(context)),
        error: (context: unknown) => adapter.scope.toast?.show("error", renderContext(context)),
        loading: (context: unknown) => adapter.scope.toast?.show("loading", renderContext(context)),
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
