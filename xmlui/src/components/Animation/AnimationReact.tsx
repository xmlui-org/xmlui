import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

export type AnimationProps = {
  children?: ReactNode;
  animation: AnimationDefinition;
  animateWhenInView?: boolean;
  duration?: number;
  reverse?: boolean;
  loop?: boolean;
  once?: boolean;
  delay?: number;
};

export type AnimationDefinition = {
  from?: CSSProperties;
  to?: CSSProperties;
  config?: {
    duration?: number;
  };
};

const defaultProps = {
  delay: 0,
  animateWhenInView: false,
  reverse: false,
  loop: false,
  once: false,
};

const presetAnimations: Record<string, AnimationDefinition> = {
  fadein: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeout: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slidein: {
    from: { transform: "translateX(-100%)" },
    to: { transform: "translateX(0%)" },
  },
  slideout: {
    from: { transform: "translateX(0%)" },
    to: { transform: "translateX(100%)" },
  },
  popin: {
    from: { transform: "scale(0.8)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
  },
  popout: {
    from: { transform: "scale(1)", opacity: 1 },
    to: { transform: "scale(0.8)", opacity: 0 },
  },
  flipin: {
    from: { transform: "rotateY(90deg)", opacity: 0 },
    to: { transform: "rotateY(0deg)", opacity: 1 },
  },
  flipout: {
    from: { transform: "rotateY(0deg)", opacity: 1 },
    to: { transform: "rotateY(90deg)", opacity: 0 },
  },
  rotatein: {
    from: { transform: "rotate(-180deg)", opacity: 0 },
    to: { transform: "rotate(0deg)", opacity: 1 },
  },
  rotateout: {
    from: { transform: "rotate(0deg)", opacity: 1 },
    to: { transform: "rotate(180deg)", opacity: 0 },
  },
  zoomin: {
    from: { transform: "scale(0)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
  },
  zoomout: {
    from: { transform: "scale(1)", opacity: 1 },
    to: { transform: "scale(0)", opacity: 0 },
  },
};

export function parseAnimation(animation: unknown): AnimationDefinition {
  if (isPlainObject(animation)) {
    return animation as AnimationDefinition;
  }
  if (typeof animation === "string") {
    return presetAnimations[animation.toLowerCase()] ?? { from: {}, to: {} };
  }
  return { from: {}, to: {} };
}

export function parseAnimationOptions(input: unknown): Partial<AnimationProps> {
  if (isPlainObject(input)) {
    return input as Partial<AnimationProps>;
  }
  if (typeof input !== "string") {
    return {};
  }
  const options: Partial<AnimationProps> = {};
  for (const value of input.split(";").map((part) => part.trim()).filter(Boolean)) {
    if (value.includes(":")) {
      const [name, raw] = value.split(":").map((part) => part.trim());
      const parsed = parseAnimationOptionValue(name ?? "", raw ?? "");
      if (parsed !== undefined) {
        (options as Record<string, unknown>)[name ?? ""] = parsed;
      }
      continue;
    }
    if (isBooleanAnimationOption(value)) {
      (options as Record<string, unknown>)[value] = true;
    } else if (value.startsWith("!") && isBooleanAnimationOption(value.slice(1))) {
      (options as Record<string, unknown>)[value.slice(1)] = false;
    }
  }
  return options;
}

export function Animation({
  children,
  animation,
  duration,
  delay = defaultProps.delay,
  reverse = defaultProps.reverse,
  loop = defaultProps.loop,
}: AnimationProps) {
  const [running, setRunning] = useState(false);
  const resolvedDuration = duration ?? animation.config?.duration ?? 300;
  const from = reverse ? animation.to ?? {} : animation.from ?? {};
  const to = reverse ? animation.from ?? {} : animation.to ?? {};
  const transition = useMemo(
    () => transitionFor(to, resolvedDuration, delay),
    [delay, resolvedDuration, to],
  );
  const style = {
    ...(running ? to : from),
    transition,
    transitionDelay: `${delay}ms`,
    animationIterationCount: loop ? "infinite" : undefined,
  } as CSSProperties;

  useEffect(() => {
    const handle = window.setTimeout(() => setRunning(true), 0);
    return () => window.clearTimeout(handle);
  }, [animation, delay, duration, reverse]);

  return (
    <>
      {Children.map(children, (child) => applyAnimationToChild(child, style))}
    </>
  );
}

function applyAnimationToChild(child: ReactNode, style: CSSProperties): ReactNode {
  if (isValidElement(child)) {
    const element = child as ReactElement<{ style?: CSSProperties }>;
    return cloneElement(element, {
      "data-xmlui-behavior": "animation",
      style: {
        ...element.props.style,
        ...style,
      },
    } as Record<string, unknown>);
  }
  return (
    <span data-xmlui-behavior="animation" style={style}>
      {child}
    </span>
  );
}

function transitionFor(style: CSSProperties, duration: number, delay: number): string {
  const names = Object.keys(style);
  const properties = names.length > 0 ? names : ["all"];
  return properties.map((name) => `${cssPropertyName(name)} ${duration}ms ease ${delay}ms`).join(", ");
}

function cssPropertyName(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function parseAnimationOptionValue(name: string, value: string): unknown {
  switch (name) {
    case "duration":
    case "delay": {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    case "animateWhenInView":
    case "reverse":
    case "loop":
    case "once": {
      const normalized = value.toLowerCase();
      if (normalized === "true" || normalized === "1" || normalized === "yes") {
        return true;
      }
      if (normalized === "false" || normalized === "0" || normalized === "no") {
        return false;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

function isBooleanAnimationOption(value: string): boolean {
  return ["animateWhenInView", "reverse", "loop", "once"].includes(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
