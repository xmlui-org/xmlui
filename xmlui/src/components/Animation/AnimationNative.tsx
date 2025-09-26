import { animated, useSpring, useInView } from "@react-spring/web";
import React, { Children, ForwardedRef, forwardRef, useEffect, useId, useMemo, useState } from "react";
import { useCallback } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";

import { RegisterComponentApiFn } from "../..";
import { isPlainObject } from "lodash-es";

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
  forwardRef(function InlineComponentDef(props: any, ref: ForwardedRef<any>) {
    const { children, ...rest } = props;

    if (!React.isValidElement(children)) {
      return children;
    }
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

/**
 * Helper function to parse a single animation-specific option value.
 */
function parseAnimationOptionValue(name: string, value: string): any {
  switch (name) {
    case "duration":
    case "delay":
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : num;

    case "animateWhenInView":
    case "reverse":
    case "loop":
    case "once":
      const lowerVal = value.toLowerCase();
      if (lowerVal === "true" || lowerVal === "1" || lowerVal === "yes") return true;
      if (lowerVal === "false" || lowerVal === "0" || lowerVal === "no") return false;
      return undefined;

    default:
      return undefined;
  }
}

/**
 * Parses animation options from a string or object.
 */
export function parseAnimationOptions(input: any): Partial<AnimationProps> {
  if (isPlainObject(input)) {
    return input as Partial<AnimationProps>;
  }

  if (typeof input === "string") {
    const options: Partial<AnimationProps> = {};
    const values = input
      .split(";")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    for (const value of values) {
      if (value.includes(":")) {
        const [name, val] = value.split(":").map((part) => part.trim());
        if (name && val) {
          const parsedValue = parseAnimationOptionValue(name, val);
          if (parsedValue !== undefined) {
            (options as any)[name] = parsedValue;
          }
        }
      } else {
        const booleanOptions = ["animateWhenInView", "reverse", "loop", "once"];
        if (booleanOptions.includes(value)) {
          (options as any)[value] = true;
        } else if (value.startsWith("!") && value.length > 1) {
          const optionName = value.substring(1);
          if (booleanOptions.includes(optionName)) {
            (options as any)[optionName] = false;
          }
        }
      }
    }
    return options;
  }

  return {};
}

export const Animation = forwardRef(function Animation(
  {
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
    ...rest
  }: AnimationProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [_animation] = useState(animation);
  const [toggle, setToggle] = useState(false);
  const [reset, setReset] = useState(false);
  const [count, setCount] = useState(0);
  const times = 1;
  const animationId = useId();
  
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
      onStart: () => {
        onStart?.();
      },
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
      animationId,
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
  const composedRef = ref ? composeRefs(ref, forwardedRef) : forwardedRef;

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
        <AnimatedComponent key={index} {...rest} style={animationStyles} ref={composedRef}>
          {child}
        </AnimatedComponent>
      ) : (
        <AnimatedComponent key={index} {...rest} style={springs} ref={forwardedRef}>
          {child}
        </AnimatedComponent>
      ),
    );
  }, [animateWhenInView, animationStyles, children, springs, rest]);

  return content;
});
