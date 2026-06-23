import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

import { runEvent } from "../../runtime/rendering/bindings";
import { partAttrs, useBooleanProp, useEvaluatedProp, useStringProp } from "../../runtime/rendering/props";
import type { XmluiBuiltInRenderer } from "../../runtime/rendering/types";

export const timerRenderer: XmluiBuiltInRenderer = ({ node, scope }) => {
  const id = useStringProp(node, scope, "id", "");
  const testId = useStringProp(node, scope, "testId", "");
  const enabled = useBooleanProp(node, scope, "enabled", true);
  const interval = Number(useEvaluatedProp(node, scope, "interval", 1000) ?? 1000);
  const initialDelay = Number(useEvaluatedProp(node, scope, "initialDelay", 0) ?? 0);
  const once = useBooleanProp(node, scope, "once", false);
  const [paused, setPaused] = useState(false);
  const [hasExecutedOnce, setHasExecutedOnce] = useState(false);
  const [hasEverStarted, setHasEverStarted] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<number | undefined>(undefined);
  const handlerRunningRef = useRef(false);
  const pausedRef = useRef(paused);
  const enabledRef = useRef(enabled);
  const intervalValueRef = useRef(interval);
  const onceRef = useRef(once);
  const hasExecutedOnceRef = useRef(hasExecutedOnce);

  pausedRef.current = paused;
  enabledRef.current = enabled;
  intervalValueRef.current = interval;
  onceRef.current = once;
  hasExecutedOnceRef.current = hasExecutedOnce;

  const api = useMemo(() => ({
    pause: () => {
      if (enabledRef.current && !pausedRef.current) {
        setPaused(true);
        clearTimerHandles(intervalRef, timeoutRef);
      }
    },
    resume: () => {
      if (enabledRef.current && pausedRef.current) {
        setPaused(false);
      }
    },
    isPaused: () => pausedRef.current,
    isRunning: () => enabledRef.current && !pausedRef.current &&
      (intervalRef.current !== undefined || timeoutRef.current !== undefined),
  }), []);

  useEffect(() => {
    if (!id) {
      return;
    }
    scope.references[id] = api;
    scope.store.invalidateReference(id);
    return () => {
      if (scope.references[id] === api) {
        delete scope.references[id];
        scope.store.invalidateReference(id);
      }
    };
  }, [api, id, scope]);

  useEffect(() => {
    if (enabled && once) {
      setHasExecutedOnce(false);
    }
    if (!enabled) {
      setPaused(false);
    }
  }, [enabled, once]);

  useEffect(() => {
    clearTimerHandles(intervalRef, timeoutRef);
    if (once && hasExecutedOnce) {
      return;
    }
    if (!enabled || paused || interval <= 0) {
      return;
    }

    const handleTick = async () => {
      if (!enabledRef.current || pausedRef.current || intervalValueRef.current <= 0) {
        return;
      }
      if (handlerRunningRef.current) {
        return;
      }
      handlerRunningRef.current = true;
      try {
        await runEvent(node.parsed?.events?.tick, scope);
        if (!hasEverStarted) {
          setHasEverStarted(true);
        }
        if (onceRef.current && !hasExecutedOnceRef.current) {
          setHasExecutedOnce(true);
        }
      } finally {
        handlerRunningRef.current = false;
      }
    };

    const start = () => {
      if (once && !hasExecutedOnce) {
        timeoutRef.current = window.setTimeout(() => void handleTick(), interval);
      } else {
        intervalRef.current = window.setInterval(() => void handleTick(), interval);
      }
    };

    if (initialDelay > 0 && !hasEverStarted) {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = undefined;
        start();
      }, initialDelay);
    } else {
      start();
    }

    return () => {
      clearTimerHandles(intervalRef, timeoutRef);
    };
  }, [
    enabled,
    hasEverStarted,
    hasExecutedOnce,
    initialDelay,
    interval,
    node.parsed?.events?.tick,
    once,
    paused,
    scope,
  ]);

  return (
    <div
      {...partAttrs("Timer")}
      data-testid={testId || undefined}
      data-timer-enabled={String(enabled)}
      data-timer-interval={String(interval)}
      data-timer-initial-delay={String(initialDelay)}
      data-timer-once={String(once)}
      data-timer-running={String(api.isRunning())}
      data-timer-paused={String(paused)}
      data-timer-has-executed={String(hasExecutedOnce)}
      style={{ display: "none" }}
    />
  );
};

function clearTimerHandles(
  intervalRef: MutableRefObject<number | undefined>,
  timeoutRef: MutableRefObject<number | undefined>,
): void {
  if (intervalRef.current !== undefined) {
    window.clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  }
  if (timeoutRef.current !== undefined) {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  }
}
