import { memo, useCallback, useEffect, useRef } from "react";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import toast from "react-hot-toast";

type ToastProps = {
  renderContent: (type: string | null, context: unknown) => React.ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const Toast = memo(function Toast({ renderContent, registerComponentApi }: ToastProps) {
  const thizRef = useRef<{ id: string | null }>({ id: null });
  const show = useEvent((type: string | null, context: unknown) => {
    const toastFn = type ? (toast as unknown as Record<string, unknown>)[type] : null;
    thizRef.current.id = (typeof toastFn === "function" ? toastFn : toast)(
      renderContent(type, context),
      { id: thizRef.current.id ?? undefined },
    );
  });

  const loading = useCallback((context: unknown) => show("loading", context), [show]);
  const success = useCallback((context: unknown) => show("success", context), [show]);
  const error = useCallback((context: unknown) => show("error", context), [show]);
  const showDefault = useCallback((context: unknown) => show(null, context), [show]);

  useEffect(() => {
    registerComponentApi?.({
      loading,
      success,
      error,
      show: showDefault,
    });
  }, [registerComponentApi, loading, success, error, showDefault]);

  return null;
});
