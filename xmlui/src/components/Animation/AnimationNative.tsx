import { animated, useSpring, useInView } from "@react-spring/web";
import React, { Children, forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { useCallback } from "react";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

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
  const animationSettings = useMemo<any>(
    () => ({
      from: animation.from,
      to: animation.to,
      config: {
        ...animation.config,
        duration,
      },
      onStart,
      onRest: onStop,
      once,
    }),
    [animation, duration, onStart, onStop, once],
  );

  const [springs, api] = useSpring(() => ({
    ...animationSettings,
  }));

  const [ref, animationStyles] = useInView(() => animationSettings, {
    once,
  });

  const startAnimation = useCallback(() => {
    api.start(animation);
    return () => {
      api.stop();
    };
  }, [api]);

  const stopAnimation = useCallback(() => {
    api.stop();
  }, [api]);

  useEffect(() => {
    registerComponentApi?.({
      start: startAnimation,
      stop: stopAnimation,
    });
  }, [registerComponentApi, startAnimation, stopAnimation]);

  return Children.map(children, (child, index) => (
    <AnimatedComponent style={animateWhenInView ? animationStyles : springs} key={index} ref={ref}>
      {child}
    </AnimatedComponent>
  ));
};
