import { animated, useSpring, useInView } from "@react-spring/web";
import React, { Children, forwardRef, useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import type { RegisterComponentApiFn } from "xmlui";

export type AnimationProps = {
  children?: React.ReactNode;
  animation: any;
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
  forwardRef(function InlineComponentDef(props: any, ref) {
    const { children, ...rest } = props;
    return React.cloneElement(children, { ...rest, ref });
  }),
);

export const defaultProps: Pick<AnimationProps, "delay" | "animateWhenInView" |"reverse" | "loop" | "once"> = {
  delay: 0,
  animateWhenInView: false,
  reverse: false,
  loop: false,
  once: false
};

export const Animation = ({
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
}: AnimationProps) => {
  const [_animation] = useState(animation);
  const [toggle, setToggle] = useState(false);
  const [reset, setReset] = useState(false);
  const [count, setCount] = useState(0);
  const times = 1;
  const animationSettings = useMemo<any>(
    () => ({
      from: _animation.from,
      to: _animation.to,
      config: {
        ..._animation.config,
        duration,
      },
      delay,
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
          if (reverse && count < times) {
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
      delay,
      duration,
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
    return Children.map(children, (child, index) =>
      animateWhenInView ? (
        <AnimatedComponent style={animationStyles} key={index} ref={ref}>
          {child}
        </AnimatedComponent>
      ) : (
        <AnimatedComponent style={springs} key={index}>
          {child}
        </AnimatedComponent>
      ),
    );
  }, [animateWhenInView, animationStyles, children, ref, springs]);

  return content;
};
