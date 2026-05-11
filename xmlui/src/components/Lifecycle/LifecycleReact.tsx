import { memo, useEffect, useRef } from "react";

export const defaultProps = {};

type LifecycleHandler = ((...args: any[]) => any) | null | undefined;

type Props = {
  /**
   * When this value changes, the component fires `onUnmount` (with the
   * previous value's effects) and then `onMount` (for the new value),
   * declaratively re-arming the effect. This is the markup equivalent of
   * a React `useEffect` with a dependency array. The first render does
   * nothing extra — the universal `onMount` event from the renderer's
   * mount effect (Plan #04 Step 1.1) handles the initial fire.
   */
  keyValue?: unknown;
  onMount?: LifecycleHandler;
  onUnmount?: LifecycleHandler;
  onError?: LifecycleHandler;
};

function fireSafely(
  handler: LifecycleHandler,
  source: "mount" | "unmount",
  onError: LifecycleHandler,
): void {
  if (!handler) return;
  try {
    const result = handler();
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      (result as PromiseLike<unknown>).then(undefined, (err) => {
        if (onError) {
          try {
            onError({
              source,
              error: {
                message: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
              },
            });
          } catch {
            /* swallowed; reported by lifecycle dispatcher elsewhere */
          }
        }
      });
    }
  } catch (err) {
    if (onError) {
      try {
        onError({
          source,
          error: {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          },
        });
      } catch {
        /* swallowed */
      }
    }
  }
}

export const Lifecycle = memo(function Lifecycle({
  keyValue,
  onMount,
  onUnmount,
  onError,
}: Props) {
  // --- Track the previous keyValue across renders so we can detect changes
  // --- without firing on the initial render (handled by the universal
  // --- `onMount` event from the renderer adapter).
  const initializedRef = useRef(false);
  const prevKeyRef = useRef<unknown>(keyValue);

  // --- Keep latest handler references stable so the effect below sees the
  // --- current handlers without re-running on every identity change.
  const handlersRef = useRef({ onMount, onUnmount, onError });
  handlersRef.current = { onMount, onUnmount, onError };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevKeyRef.current = keyValue;
      return;
    }
    if (prevKeyRef.current === keyValue) {
      return;
    }
    prevKeyRef.current = keyValue;
    const { onMount: m, onUnmount: u, onError: e } = handlersRef.current;
    fireSafely(u, "unmount", e);
    fireSafely(m, "mount", e);
  }, [keyValue]);

  // --- Render nothing visible. A hidden div is used so tests can locate the
  // --- node by `testId` if desired (matches the `<Timer>` pattern).
  return null;
});
