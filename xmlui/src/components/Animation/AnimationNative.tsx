import { animated, useSpring, useInView } from "@react-spring/web";
import React, { Children, forwardRef, useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { RegisterComponentApiFn } from "../..";

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

export const parseAnimation = (animation: string | object): object => {
  if (typeof animation === 'object') {
    return animation;
  }

  const presetAnimations: Record<string, object> = {
    fadein: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    fadeout: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    slidein: {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0%)' }
    },
    slideout: {
      from: { transform: 'translateX(0%)' },
      to: { transform: 'translateX(100%)' }
    },
    popin: {
      from: { transform: 'scale(0.8)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 }
    },
    popout: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.8)', opacity: 0 }
    },
    flipin: {
      from: { transform: 'rotateY(90deg)', opacity: 0 },
      to: { transform: 'rotateY(0deg)', opacity: 1 }
    },
    flipout: {
      from: { transform: 'rotateY(0deg)', opacity: 1 },
      to: { transform: 'rotateY(90deg)', opacity: 0 }
    },
    rotatein: {
      from: { transform: 'rotate(-180deg)', opacity: 0 },
      to: { transform: 'rotate(0deg)', opacity: 1 }
    },
    rotateout: {
      from: { transform: 'rotate(0deg)', opacity: 1 },
      to: { transform: 'rotate(180deg)', opacity: 0 }
    },
    zoomin: {
      from: { transform: 'scale(0)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 }
    },
    zoomout: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0)', opacity: 0 }
    }
  };

  return presetAnimations[animation] || { from: {}, to: {} };
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
