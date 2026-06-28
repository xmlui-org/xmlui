import type { RuntimeRoutingStore } from "./routing";
import type { ToastService } from "./services/toast";

export type XmluiAppContextObject = Record<string, unknown>;

export type CreateXmluiAppContextObjectOptions = {
  appGlobals?: Record<string, unknown>;
  mediaSize?: { sizeIndex: number };
  toast?: ToastService;
  confirm?: (...args: unknown[]) => unknown;
  routing?: RuntimeRoutingStore;
};

export function createXmluiAppContextObject({
  appGlobals = {},
  mediaSize = { sizeIndex: 4 },
  toast,
  confirm,
  routing,
}: CreateXmluiAppContextObjectOptions = {}): XmluiAppContextObject {
  return {
    appGlobals,
    $appGlobals: appGlobals,
    mediaSize,
    toast: toast?.reference,
    confirm,
    navigate: (target: unknown, queryParams?: Record<string, unknown>) =>
      routing?.navigate(target, queryParams),
  };
}

export function hasXmluiAppContextProperty(
  appContext: XmluiAppContextObject | undefined,
  name: string,
): boolean {
  return !!appContext && Object.prototype.hasOwnProperty.call(appContext, name);
}
