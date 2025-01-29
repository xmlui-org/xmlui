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
  once?: boolean;
};

const AnimatedComponent = animated(
  forwardRef(function InlineComponentDef(props: any, ref) {
    const { children, ...rest } = props;
    return React.cloneElement(children, { ...rest, ref });
  }),
);

export const Animation = ({
  children,
  registerComponentApi,
  animation,
  duration,
  onStop,
  onStart,
  animateWhenInView = false,
  once = false,
}: AnimationProps) => {
  const [_animation] = useState(animation);
  const animationSettings = useMemo<any>(
    () => ({
      from: _animation.from,
      to: _animation.to,
      config: {
        ..._animation.config,
        duration,
      },
      onStart: () => onStart,
      onRest: onStop,
      once,
    }),
    [_animation.config, _animation.from, _animation.to, duration, onStart, onStop, once],
  );

  const [springs, api] = useSpring(() => ({
    ...animationSettings,
  }));

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
