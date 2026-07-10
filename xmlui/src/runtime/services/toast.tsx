import hotToast from "react-hot-toast";
import type {
  Renderable,
  Toast,
  ToastOptions as HotToastOptions,
  ValueOrFunction,
} from "react-hot-toast";

import { announceLiveRegion } from "../../components/LiveRegion/LiveRegionReact";

type ToastMessage = ValueOrFunction<Renderable, Toast>;
export type ToastOptions = HotToastOptions;

type ToastApi = typeof hotToast;
type ToastCallable = ((message: ToastMessage, options?: ToastOptions) => string) & {
  success: ToastApi["success"];
  error: ToastApi["error"];
  loading: ToastApi["loading"];
  custom: ToastApi["custom"];
  dismiss: ToastApi["dismiss"];
  remove: ToastApi["remove"];
  promise: ToastApi["promise"];
};

export class ToastService {
  readonly reference: ToastCallable;

  constructor(toastApi: ToastApi = hotToast) {
    const toast = ((message: ToastMessage, options?: ToastOptions) => {
      announceLiveRegion(message);
      return toastApi(message, options);
    }) as ToastCallable;

    toast.success = (message, options) => {
      announceLiveRegion(message);
      return toastApi.success(message, options);
    };
    toast.error = (message, options) => {
      announceLiveRegion(message, "assertive");
      return toastApi.error(message, options);
    };
    toast.loading = (message, options) => {
      announceLiveRegion(message);
      return toastApi.loading(message, options);
    };
    toast.custom = toastApi.custom.bind(toastApi);
    toast.dismiss = toastApi.dismiss.bind(toastApi);
    toast.remove = toastApi.remove.bind(toastApi);
    toast.promise = toastApi.promise.bind(toastApi);

    this.reference = toast;
  }
}

export function createToastService(toastApi?: ToastApi): ToastService {
  return new ToastService(toastApi);
}
