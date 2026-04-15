import { wrapComponent, createMetadata } from "xmlui";
import { Animation, defaultProps } from "./AnimationNative";

const COMP = "Animation";

export const AnimationMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` component represents a generic animation wrapper that can apply various animations to its children.`,
  docFolder: "src",
  props: {
    animation: {
      description: `The animation object to be applied to the component`,
    },
    animateWhenInView: {
      description: `Indicates whether the animation should start when the component is in view`,
    },
    duration: {
      description: `The duration of the animation in milliseconds`,
    },
    once: {
      description: `Indicates whether the animation should only run once`,
      defaultValue: defaultProps.once,
    },
    reverse: {
      description: `Indicates whether the animation should run in reverse after the normal animation completes`,
      defaultValue: defaultProps.reverse,
    },
    loop: {
      description: `Indicates whether the animation should loop`,
      defaultValue: defaultProps.loop,
    },
    delay: {
      description: `The delay before the animation starts in milliseconds`,
      defaultValue: defaultProps.delay,
    },
  },
  events: {
    started: { description: `Event fired when the animation starts` },
    stopped: { description: `Event fired when the animation stops` },
  },
  apis: {
    start: { description: `Starts the animation` },
    stop: { description: `Stops the animation` },
  },
});

export const animationComponentRenderer = wrapComponent(
  COMP,
  Animation,
  AnimationMd,
  {
    exposeRegisterApi: true,
    events: { started: "onStart", stopped: "onStop" },
    booleans: ["animateWhenInView", "once", "reverse", "loop"],
    numbers: ["duration", "delay"],
  },
);
