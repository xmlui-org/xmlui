import { animated, useSpring, useInView } from "@react-spring/web";
import React, { Children, ForwardedRef, forwardRef, memo, useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import type { RegisterComponentApiFn } from "xmlui";

export type SpringAnimation = {
  from: Record<string, unknown>;
  to: Record<string, unknown>;
  config?: Record<string, unknown>;
};

export type AnimationProps = {
  children?: React.ReactNode;
  animation: SpringAnimation;
  registerComponentApi?: RegisterComponentApiFn;
  onStop?: () => void;
  onStart?: () => void;
  animateWhenInView?: boolean;
  duration?: number;
  reverse?: boolean;
  loop?: boolean;
  once?: boolean;
  delay?: number;
};

const AnimatedComponent = animated(
  forwardRef(function InlineComponentDef(
    props: React.HTMLAttributes<HTMLElement> & { children: React.ReactElement },
    ref: ForwardedRef<HTMLElement>,
  ) {
    const { children, ...rest } = props;
    return React.cloneElement(children, { ...rest, ref });
  }),
);

export const defaultProps: Pick<AnimationProps, "delay" | "animateWhenInView" | "reverse" | "loop" | "once"> = {
  delay: 0,
  animateWhenInView: false,
  reverse: false,
  loop: false,
  once: false,
};

const TIMES = 1;

export const Animation = memo(function Animation({
  children,
  registerComponentApi,
  animation,
  duration,
  onStop,
  onStart,
  delay = defaultProps.delay,
  animateWhenInView = defaultProps.animateWhenInView,
  reverse = defaultProps.reverse,
  loop = defaultProps.loop,
  once = defaultProps.once,
}: AnimationProps) {
  const [_animation] = useState(animation);
  const [toggle, setToggle] = useState(false);
  const [reset, setReset] = useState(false);
  const [count, setCount] = useState(0);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const effectiveDuration = reducedMotion ? 0 : duration;
  const effectiveDelay = reducedMotion ? 0 : delay;

  const animationSettings = useMemo(
    () => ({
      from: _animation.from,
      to: _animation.to,
      config: {
        ..._animation.config,
        duration: effectiveDuration,
      },
      delay: effectiveDelay,
      loop,
      reset,
      reverse: toggle,
      onRest: () => {
        onStop?.();
        if (loop) {
          if (reverse) {
            setCount(count + 1);
            setToggle(!toggle);
          }
          setReset(true);
        } else {
          if (reverse && count < TIMES) {
            setCount(count + 1);
            setToggle(!toggle);
          }
        }
      },
      onStart: () => onStart?.(),
    }),
    [
      _animation.config,
      _animation.from,
      _animation.to,
      count,
      effectiveDelay,
      effectiveDuration,
      loop,
      onStart,
      onStop,
      reset,
      reverse,
      toggle,
    ],
  );

  const [springs, api] = useSpring(
    () => ({
      ...animationSettings,
    }),
    [animationSettings],
  );

  const [ref, animationStyles] = useInView(() => animationSettings, {
    once,
  });

  const startAnimation = useCallback(() => {
    api.start(_animation);
    return () => {
      api.stop();
    };
  }, [_animation, api]);

  const stopAnimation = useCallback(() => {
    api.stop();
  }, [api]);

  useEffect(() => {
    registerComponentApi?.({
      start: startAnimation,
      stop: stopAnimation,
    });
  }, [registerComponentApi, startAnimation, stopAnimation]);

  const content = useMemo(() => {
    return Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      return animateWhenInView ? (
        <AnimatedComponent style={animationStyles} key={index} ref={ref}>
          {child}
        </AnimatedComponent>
      ) : (
        <AnimatedComponent style={springs} key={index}>
          {child}
        </AnimatedComponent>
      );
    });
  }, [animateWhenInView, animationStyles, children, ref, springs]);

  return content;
});
