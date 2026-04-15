import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { debounce, isEqual, throttle } from "lodash-es";
import { usePrevious } from "../../components-core/utils/hooks";

// =====================================================================================================================
// React ChangeListener component implementation

type Props = {
  listenTo: unknown;
  onChange?: (newValue: unknown) => void;
  throttleWaitInMs?: number;
  debounceWaitInMs?: number;
};

export const defaultProps: Pick<Props, "throttleWaitInMs" | "debounceWaitInMs"> = {
  throttleWaitInMs: 0,
  debounceWaitInMs: 0,
};

export const ChangeListener = memo(function ChangeListener({
  listenTo,
  onChange,
  throttleWaitInMs = defaultProps.throttleWaitInMs,
  debounceWaitInMs = defaultProps.debounceWaitInMs,
}: Props) {
  const prevValue = usePrevious(listenTo);

  // Track whether the component has completed its initial mount so we only
  // fire onChange for genuine value *changes*, not for the initial render.
  // On the first render, usePrevious returns undefined regardless of the
  // initial listenTo value, which would otherwise cause onChange to fire
  // spuriously on mount.
  const isMountedRef = useRef(false);

  // Keep a ref to the latest onChange to avoid recreating debounce/throttle
  // wrappers when the handler identity changes between renders (which happens
  // because XMLUI creates a new handler function on every render cycle).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // A stable callback that always calls the latest onChange via the ref.
  // With empty deps, this never changes, so useMemo below only re-runs when
  // the wait-time values actually change.
  const stableOnChange = useCallback((args: unknown) => {
    onChangeRef.current?.(args);
  }, []);

  const debouncedOrThrottledOnChange = useMemo(() => {
    if (debounceWaitInMs !== 0) {
      return debounce(stableOnChange, debounceWaitInMs);
    }
    if (throttleWaitInMs !== 0) {
      return throttle(stableOnChange, throttleWaitInMs, {
        leading: true,
      });
    }
    return stableOnChange;
  }, [stableOnChange, throttleWaitInMs, debounceWaitInMs]);

  useEffect(() => {
    const fn = debouncedOrThrottledOnChange as { cancel?: () => void };
    return () => fn.cancel?.();
  }, [debouncedOrThrottledOnChange]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (!isEqual(prevValue, listenTo)) {
      debouncedOrThrottledOnChange?.({
        prevValue,
        newValue: listenTo,
      });
    }
  }, [listenTo, debouncedOrThrottledOnChange, prevValue]);
  return null;
});
