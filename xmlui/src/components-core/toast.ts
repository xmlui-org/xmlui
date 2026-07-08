type ToastOptions = {
  id?: string | null;
};

type ToastApi = {
  (message: string, options?: ToastOptions): string;
  loading(message: string, options?: ToastOptions): string;
  success(message: string, options?: ToastOptions): string;
  error(message: string, options?: ToastOptions): string;
  dismiss(id?: string | null): void;
};

let toastCounter = 0;

function nextToastId(options?: ToastOptions): string {
  return options?.id || `toast-${++toastCounter}`;
}

function emitToast(kind: string, message: string, options?: ToastOptions): string {
  const id = nextToastId(options);
  if (typeof window !== "undefined") {
    renderToast(id, kind, message);
    window.dispatchEvent(new CustomEvent("xmlui:toast", { detail: { id, kind, message } }));
  }
  return id;
}

const toast = ((message: string, options?: ToastOptions) => emitToast("default", message, options)) as ToastApi;

toast.loading = (message, options) => emitToast("loading", message, options);
toast.success = (message, options) => emitToast("success", message, options);
toast.error = (message, options) => emitToast("error", message, options);
toast.dismiss = (id) => {
  if (typeof window !== "undefined") {
    if (id) {
      document.querySelector(`[data-xmlui-toast-id="${id}"]`)?.remove();
    }
    window.dispatchEvent(new CustomEvent("xmlui:toast-dismiss", { detail: { id } }));
  }
};

export default toast;

function renderToast(id: string, kind: string, message: string): void {
  let container = document.querySelector<HTMLElement>("[data-xmlui-toast-container]");
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("data-xmlui-toast-container", "");
    document.body.appendChild(container);
  }
  let item = container.querySelector<HTMLElement>(`[data-xmlui-toast-id="${id}"]`);
  if (!item) {
    item = document.createElement("div");
    item.setAttribute("data-xmlui-toast-id", id);
    container.appendChild(item);
  }
  item.setAttribute("data-kind", kind);
  item.textContent = message;
}
