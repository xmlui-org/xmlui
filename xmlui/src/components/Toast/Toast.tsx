import { createMetadata, dComponent } from "../../component-core/metadata/helpers";

export const ToastMd = createMetadata({
  status: "internal",
  description: "`Toast` exposes imperative toast APIs with optional templates.",
  props: {
    id: {
      description: "The identifier used to expose the Toast API.",
      valueType: "string",
    },
    successTemplate: dComponent("Template rendered for success toasts."),
    loadingTemplate: dComponent("Template rendered for loading toasts."),
    errorTemplate: dComponent("Template rendered for error toasts."),
  },
  apis: {
    show: { description: "Shows a default toast.", signature: "show(context: any, options?: { id?: string; duration?: number }): string | undefined" },
    success: { description: "Shows a success toast.", signature: "success(context: any, options?: { id?: string; duration?: number }): string | undefined" },
    error: { description: "Shows an error toast.", signature: "error(context: any, options?: { id?: string; duration?: number }): string | undefined" },
    loading: { description: "Shows a loading toast.", signature: "loading(context: any, options?: { id?: string; duration?: number }): string | undefined" },
    dismiss: { description: "Dismisses one toast by id or all toasts.", signature: "dismiss(id?: string): void" },
  },
});
