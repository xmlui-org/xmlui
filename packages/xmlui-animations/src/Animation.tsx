import { wrapComponent, createMetadata } from "xmlui";
import { Animation, defaultProps } from "./AnimationReact";

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
      valueType: "boolean",
    },
    duration: {
      description: `The duration of the animation in milliseconds`,
      valueType: "number",
    },
    once: {
      description: `Indicates whether the animation should only run once`,
      defaultValue: defaultProps.once,
      valueType: "boolean",
    },
    reverse: {
      description: `Indicates whether the animation should run in reverse after the normal animation completes`,
      defaultValue: defaultProps.reverse,
      valueType: "boolean",
    },
    loop: {
      description: `Indicates whether the animation should loop`,
      defaultValue: defaultProps.loop,
      valueType: "boolean",
    },
    delay: {
      description: `The delay before the animation starts in milliseconds`,
      defaultValue: defaultProps.delay,
      valueType: "number",
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
