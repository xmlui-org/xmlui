import { animated, useSpring, useInView } from "@react-spring/web";
import React, { Children, forwardRef, useMemo } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
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

export const Animation = ({
  children,
  registerComponentApi,
  animation,
  duration = 500,
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
    rootMargin: "-40% 0%",
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
  }, [registerComponentApi, startAnimation]);

  const Components = Children.map(children, (child) => {
    return animated(
      forwardRef(function InlineComponentDef(props, ref) {
        return React.isValidElement(child) ? (
          React.cloneElement(child, { ...props, ref } as any)
        ) : (
          <>{child}</>
        );
      }),
    );
  });

  return Components.map((Component, index) => {
    if (animateWhenInView) {
      return <Component style={animationStyles} ref={ref} key={index} />;
    }
    return <Component style={springs} key={index} />;
  });
};
