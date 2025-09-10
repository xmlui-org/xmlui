import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Animation, defaultProps } from "./AnimationNative";

const COMP = "Animation";

export const AnimationMd = createMetadata({
  status: "experimental",
  description: ``,
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
      description: `Indicates whether the animation should run in reverse`,
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

export const animationComponentRenderer = createComponentRenderer(
  COMP,
  AnimationMd,
  ({ registerComponentApi, renderChild, node, extractValue, lookupEventHandler }) => {
    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={extractValue(node.props.animation)}
        onStop={lookupEventHandler("stopped")}
        onStart={lookupEventHandler("started")}
        duration={extractValue.asOptionalNumber(node.props.duration)}
        animateWhenInView={extractValue.asOptionalBoolean(node.props.animateWhenInView)}
        once={extractValue.asOptionalBoolean(node.props.once)}
        reverse={extractValue.asOptionalBoolean(node.props.reverse)}
        loop={extractValue.asOptionalBoolean(node.props.loop)}
        delay={extractValue.asOptionalNumber(node.props.delay)}
      >
        {renderChild(node.children)}
      </Animation>
    );
  },
);
