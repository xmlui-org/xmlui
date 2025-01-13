import { animated, useSpring, useInView } from "@react-spring/web";
import type React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { RegisterComponentApiFn } from "xmlui";

export type AnimationProps = {
  children?: React.ReactNode;
  animation: object;
  registerComponentApi?: RegisterComponentApiFn;
  onStop?: () => void;
  animateWhenInView?: boolean;
  duration?: number;
  once?: boolean;
};

export const Animation = ({
  children,
  registerComponentApi,
  animation,
  onStop,
  animateWhenInView,
  duration = 500,
  once = false,
}: AnimationProps) => {
  const [settings, setSettings] = useState(animation);

  const [springs, api] = useSpring(() => ({
    ...settings,
    config: {
      duration,
      once,
    },
    onStart: () => {},
    onRest: () => {
      onStop?.();
    },
  }));

  const [ref, animationStyles] = useInView(
    () => ({
      ...settings,
    }),
    {
      rootMargin: "-40% 0%",
      once,
    },
  );

  const startAnimation = useCallback(() => {
    api.start(settings);
    return () => {
      api.stop();
    };
  }, [api, settings]);

  const stopAnimation = useCallback(() => {
    api.stop();
  }, [api]);

  useEffect(() => {
    registerComponentApi?.({
      start: startAnimation,
      stop: stopAnimation,
    });
  }, [registerComponentApi, startAnimation]);

  return animateWhenInView ? (
    <animated.div
      ref={ref}
      style={{
        width: "auto",
        height: "auto",
        ...animationStyles,
      }}
    >
      {children}
    </animated.div>
  ) : (
    <animated.div
      style={{
        width: "fit-content",
        height: "fit-content",
        ...springs,
      }}
    >
      {children}
    </animated.div>
  );
};
