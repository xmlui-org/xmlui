import { animated, useSpring } from "@react-spring/web";
import type React from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

export type AnimationProps = {
  children?: React.ReactNode;
  animation: object;
  registerComponentApi?: RegisterComponentApiFn;
};

export const Animation = ({ children, registerComponentApi, animation }: AnimationProps) => {
  const [springs, api] = useSpring(() => ({
    from: { x: 0 },
    onStart: () => {
      console.log("onStart");
    },
  }));

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

  return (
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
