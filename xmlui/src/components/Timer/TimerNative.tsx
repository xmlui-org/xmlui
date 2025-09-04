import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef, useEffect, useRef, useState, useCallback, useImperativeHandle } from "react";
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
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasExecutedOnce, setHasExecutedOnce] = useState(false);
  const [isInInitialDelay, setIsInInitialDelay] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialDelayRef = useRef<NodeJS.Timeout | null>(null);
  const handlerRunningRef = useRef(false);

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

  const isTimerPaused = useCallback(() => isPaused, [isPaused]);
  const isTimerRunning = useCallback(() => isRunning && !isPaused, [isRunning, isPaused]);

  // Register the API
  useImperativeHandle(forwardedRef, () => ({
    pause,
    resume,
    isPaused: isTimerPaused,
    isRunning: isTimerRunning,
  } as TimerApi & HTMLDivElement), [pause, resume, isTimerPaused, isTimerRunning]);

  // Register component API if provided
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({
        pause,
        resume,
        isPaused: isTimerPaused,
        isRunning: isTimerRunning,
      });
    }
  }, [registerComponentApi, pause, resume, isTimerPaused, isTimerRunning]);

  const handleTick = useCallback(async () => {
    // Prevent re-firing if the previous event hasn't completed yet
    if (handlerRunningRef.current) {
      return;
    }

    if (onTick) {
      handlerRunningRef.current = true;
      try {
        await onTick();
        
        // If this is a "once" timer, mark it as executed and stop the timer
        if (once) {
          setHasExecutedOnce(true);
        }
      } finally {
        handlerRunningRef.current = false;
      }
    }
  }, [onTick, once]);

  useEffect(() => {
    // If this is a "once" timer and it has already executed, don't start again
    if (once && hasExecutedOnce) {
      setIsRunning(false);
      setIsInInitialDelay(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (initialDelayRef.current) {
        clearTimeout(initialDelayRef.current);
        initialDelayRef.current = null;
      }
      return;
    }

    // Clear any existing timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (initialDelayRef.current) {
      clearTimeout(initialDelayRef.current);
      initialDelayRef.current = null;
    }

    if (enabled && !isPaused && interval > 0) {
      setIsRunning(true);
      
      const startTimer = () => {
        setIsInInitialDelay(false);
        if (once) {
          // For "once" timers, use setTimeout instead of setInterval
          intervalRef.current = setTimeout(handleTick, interval) as any;
        } else {
          intervalRef.current = setInterval(handleTick, interval);
        }
      };

      // Only apply initial delay if:
      // 1. There is an initial delay configured
      // 2. The timer hasn't executed once yet (fresh start)
      // 3. This is not a resume from pause (we don't want delay on resume)
      const shouldUseInitialDelay = initialDelay > 0 && !hasExecutedOnce;
      
      if (shouldUseInitialDelay) {
        // Start with initial delay
        setIsInInitialDelay(true);
        initialDelayRef.current = setTimeout(startTimer, initialDelay);
      } else {
        // Start immediately (including resume from pause)
        startTimer();
      }
    } else {
      setIsRunning(false);
      setIsInInitialDelay(false);
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
      handlerRunningRef.current = false;
    };
  }, [enabled, interval, handleTick, once, hasExecutedOnce, isPaused, initialDelay]);

  // Reset hasExecutedOnce when enabled changes from false to true
  useEffect(() => {
    if (enabled && once) {
      setHasExecutedOnce(false);
    }
  }, [enabled, once]);

  // Reset pause state when timer is disabled
  useEffect(() => {
    if (!enabled) {
      setIsPaused(false);
    }
  }, [enabled]);

  // Timer is a non-visual component, but we return a div for potential debugging
  // and to maintain consistency with other XMLUI components
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
