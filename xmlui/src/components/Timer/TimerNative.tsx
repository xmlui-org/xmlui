import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef, useEffect, useRef, useState, useCallback, useImperativeHandle, useMemo } from "react";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

export interface TimerApi {
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  isRunning(): boolean;
}

export const defaultProps = {
  enabled: true,
  interval: 1000,
  once: false,
  initialDelay: 0,
};

type TimerProps = {
  enabled?: boolean;
  interval?: number;
  once?: boolean;
  initialDelay?: number;
  onTick?: () => void | Promise<void>;
  registerComponentApi?: RegisterComponentApiFn;
  style?: CSSProperties;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Timer = forwardRef(function Timer(
  {
    enabled = defaultProps.enabled,
    interval = defaultProps.interval,
    once = defaultProps.once,
    initialDelay = defaultProps.initialDelay,
    onTick,
    registerComponentApi,
    style,
    className,
    ...rest
  }: TimerProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [isPaused, setIsPaused] = useState(false);
  const [hasExecutedOnce, setHasExecutedOnce] = useState(false);
  const [hasEverStarted, setHasEverStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayRef = useRef<NodeJS.Timeout | null>(null);
  const handlerRunningRef = useRef(false);

  // Refs for current values to ensure handleTick has stable dependencies
  const enabledRef = useRef(enabled);
  const isPausedRef = useRef(isPaused);
  const intervalRef2 = useRef(interval);
  const onTickRef = useRef(onTick);
  const onceRef = useRef(once);
  const hasExecutedOnceRef = useRef(hasExecutedOnce);
  const hasEverStartedRef = useRef(hasEverStarted);

  // Update refs when values change
  enabledRef.current = enabled;
  isPausedRef.current = isPaused;
  intervalRef2.current = interval;
  onTickRef.current = onTick;
  onceRef.current = once;
  hasExecutedOnceRef.current = hasExecutedOnce;
  hasEverStartedRef.current = hasEverStarted;

  // Derived state
  const isRunning = enabled && !isPaused && (intervalRef.current !== null || initialDelayRef.current !== null);
  const isInInitialDelay = initialDelayRef.current !== null;

  // Timer API methods
  const pause = useCallback(() => {
    // Pause if timer is enabled and currently running (not already paused)
    if (enabled && !isPaused) {
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (initialDelayRef.current) {
        clearTimeout(initialDelayRef.current);
        initialDelayRef.current = null;
      }
    }
  }, [enabled, isPaused]);

  const resume = useCallback(() => {
    // Resume if timer is enabled and currently paused
    if (enabled && isPaused) {
      setIsPaused(false);
      // The useEffect will handle restarting the timer
    }
  }, [enabled, isPaused]);

  // Create API object once
  const timerApi = useMemo(() => ({
    pause,
    resume,
    isPaused: () => isPaused,
    isRunning: () => isRunning && !isPaused,
  }), [pause, resume, isPaused, isRunning]);

  // Register both APIs together
  useImperativeHandle(forwardedRef, () => timerApi as TimerApi & HTMLDivElement, [timerApi]);
  
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi(timerApi);
    }
  }, [registerComponentApi, timerApi]);

  const handleTick = useCallback(async () => {
    // Check if timer should still be running (enabled, not paused, valid interval)
    if (!enabledRef.current || isPausedRef.current || intervalRef2.current <= 0) {
      return;
    }

    // Prevent re-firing if the previous event hasn't completed yet
    if (handlerRunningRef.current) {
      return;
    }

    if (onTickRef.current) {
      handlerRunningRef.current = true;
      try {
        await onTickRef.current();
        
        // Mark that the timer has actually started executing (for initial delay logic)
        if (!hasEverStartedRef.current) {
          setHasEverStarted(true);
        }
        
        // If this is a "once" timer and it's the very first execution, mark it as executed
        // After the first execution, the timer becomes a regular timer that can be paused/resumed
        if (onceRef.current && !hasExecutedOnceRef.current) {
          setHasExecutedOnce(true);
        }
      } finally {
        handlerRunningRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    // Clear any existing timers first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (initialDelayRef.current) {
      clearTimeout(initialDelayRef.current);
      initialDelayRef.current = null;
    }

    // If "once" is true and the timer has already executed, don't start the timer
    if (once && hasExecutedOnce) {
      return;
    }

    if (enabled && !isPaused && interval > 0) {
      // Helper to start the actual timer
      const startTicking = () => {
        intervalRef.current = (once && !hasExecutedOnce) 
          ? setTimeout(handleTick, interval) as any
          : setInterval(handleTick, interval);
      };

      // Only apply initial delay if timer has never been started before
      if (initialDelay > 0 && !hasEverStarted) {
        initialDelayRef.current = setTimeout(() => {
          initialDelayRef.current = null;
          startTicking();
        }, initialDelay);
      } else {
        startTicking();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (initialDelayRef.current) {
        clearTimeout(initialDelayRef.current);
        initialDelayRef.current = null;
      }
    };
  }, [enabled, interval, once, hasExecutedOnce, isPaused, initialDelay, hasEverStarted]);

  // Reset state when enabled changes
  useEffect(() => {
    if (enabled && once) {
      // Reset hasExecutedOnce when enabled changes from false to true for "once" timers
      setHasExecutedOnce(false);
    }
    if (!enabled) {
      // Reset pause state when timer is disabled
      setIsPaused(false);
    }
  }, [enabled, once]);

  // Timer is a non-visual component
  return (
    <div
      ref={forwardedRef}
      style={{ display: "none", ...style }}
      className={className}
      data-timer-enabled={enabled}
      data-timer-interval={interval}
      data-timer-initial-delay={initialDelay}
      data-timer-once={once}
      data-timer-running={isRunning}
      data-timer-paused={isPaused}
      data-timer-in-initial-delay={isInInitialDelay}
      data-timer-has-executed={hasExecutedOnce}
      {...rest}
    />
  );
});
