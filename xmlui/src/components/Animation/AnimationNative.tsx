import { animated, useSpring, useInView } from "@react-spring/web";
import type React from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

export type AnimationProps = {
  children?: React.ReactNode;
  animation: object;
  registerComponentApi?: RegisterComponentApiFn;
  onStop?: () => void;
  animateWhenInView?: boolean;
  duration?: number;
};

export const Animation = ({
  children,
  registerComponentApi,
  animation,
  onStop,
  animateWhenInView,
  duration = 500,
}: AnimationProps) => {
  useEffect(() => {
    console.log("animation");
  }, []);

  const [settings, setSettings] = useState(animation);

  const [springs, api] = useSpring(() => ({
    ...settings,
    config: {
      duration,
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
    { rootMargin: "-40% 0%" },
  );

  const startAnimation = useCallback(() => {
    console.log("startAnimation");
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
        width: "100%",
        height: "100%",
        ...springs,
      }}
    >
      {children}
    </animated.div>
  );
};
