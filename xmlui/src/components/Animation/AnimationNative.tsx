import { animated, useSpring, useInView } from "@react-spring/web";
import type React from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

export type AnimationProps = {
  children?: React.ReactNode;
  animation: object;
  registerComponentApi?: RegisterComponentApiFn;
  onStop?: () => void;
  animateWhenInView?: boolean;
};

export const Animation = ({
  children,
  registerComponentApi,
  animation,
  onStop,
  animateWhenInView,
}: AnimationProps) => {
  useEffect(() => {
    console.log("animation");
  }, []);

  const [springs, api] = useSpring(() => ({
    ...animation,
    onStart: () => {
      console.log("onStart");
    },
    onRest: () => {
      console.log("onRest");
      onStop?.();
    },
  }));

  const [ref, animationStyles] = useInView(
    () => ({
      ...animation,
    }),
    { rootMargin: "-40% 0%" },
  );

  const startAnimation = useCallback(() => {
    console.log("startAnimation");
    api.start(animation);
    return () => {
      api.stop();
    };
  }, [animation, api]);

  const stopAnimation = useCallback(() => {
    api.stop();
  }, [api]);

  useEffect(() => {
    registerComponentApi?.({
      start: startAnimation,
      stop: stopAnimation,
    });
  }, [registerComponentApi, startAnimation, stopAnimation]);

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
        width: "auto",
        height: "auto",
        ...springs,
      }}
    >
      {children}
    </animated.div>
  );
};
