import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { debounce, isEqual, throttle } from "lodash-es";
import { usePrevious } from "../../components-core/utils/hooks";
import { defaultProps } from "./ChangeListener.defaults";

// =====================================================================================================================
// React ChangeListener component implementation

type Props = {
  listenTo: unknown;
  listenToSources?: unknown;
  onChange?: (newValue: unknown) => void;
  throttleWaitInMs?: number;
  debounceWaitInMs?: number;
};

type SourceKey = string | number;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSourceKeys(prevValue: unknown, newValue: unknown): SourceKey[] {
  if (Array.isArray(prevValue) || Array.isArray(newValue)) {
    const maxLength = Math.max(
      Array.isArray(prevValue) ? prevValue.length : 0,
      Array.isArray(newValue) ? newValue.length : 0,
    );
    return Array.from({ length: maxLength }, (_, index) => index);
  }

  if (isRecord(prevValue) || isRecord(newValue)) {
    return Array.from(
      new Set([
        ...Object.keys(isRecord(prevValue) ? prevValue : {}),
        ...Object.keys(isRecord(newValue) ? newValue : {}),
      ]),
    );
  }

  return ["value"];
}

function getSourceValue(value: unknown, key: SourceKey): unknown {
  if (Array.isArray(value) || isRecord(value)) {
    return value[key as keyof typeof value];
  }
  return value;
}

function createSourcesChange(prevValue: unknown, newValue: unknown) {
  const changes: Record<string, { prevValue: unknown; newValue: unknown }> = {};
  const changedSources: SourceKey[] = [];

  for (const source of getSourceKeys(prevValue, newValue)) {
    const previousSourceValue = getSourceValue(prevValue, source);
    const newSourceValue = getSourceValue(newValue, source);

    if (!isEqual(previousSourceValue, newSourceValue)) {
      changedSources.push(source);
      changes[String(source)] = {
        prevValue: previousSourceValue,
        newValue: newSourceValue,
      };
    }
  }

  return {
    prevValue,
    newValue,
    changedSources,
    changes,
  };
}

export const ChangeListener = memo(function ChangeListener({
  listenTo,
  listenToSources,
  onChange,
  throttleWaitInMs = defaultProps.throttleWaitInMs,
  debounceWaitInMs = defaultProps.debounceWaitInMs,
}: Props) {
  const hasSources = listenToSources !== undefined;
  const listenedValue = hasSources ? listenToSources : listenTo;
  const prevValue = usePrevious(listenedValue);
  const warnedAboutDuplicateSourcesRef = useRef(false);

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
    if (
      listenTo !== undefined &&
      listenToSources !== undefined &&
      !warnedAboutDuplicateSourcesRef.current
    ) {
      console.warn(
        "[XMLUI] ChangeListener cannot use both listenTo and listenToSources; listenToSources will be used.",
      );
      warnedAboutDuplicateSourcesRef.current = true;
    }
  }, [listenTo, listenToSources]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (!isEqual(prevValue, listenedValue)) {
      debouncedOrThrottledOnChange?.(
        hasSources
          ? createSourcesChange(prevValue, listenedValue)
          : {
              prevValue,
              newValue: listenedValue,
            },
      );
    }
  }, [debouncedOrThrottledOnChange, hasSources, listenedValue, prevValue]);
  return null;
});
