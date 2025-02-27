import { createComponentRenderer, createMetadata, d } from "xmlui";
import { Animation } from "./AnimationNative";

const COMP = "Animation";

export const AnimationMd = createMetadata({
  status: "in progress",
  description: ``,
  props: {
    animation: d(`The animation object to be applied to the component`),
    animateWhenInView: d(
      `Indicates whether the animation should start when the component is in view`,
    ),
    duration: d(`The duration of the animation in milliseconds`),
    once: d(`Indicates whether the animation should only run once`),
    reverse: d(`Indicates whether the animation should run in reverse`),
    loop: d(`Indicates whether the animation should loop`),
    delay: d(`The delay before the animation starts in milliseconds`),
  },
  events: {
    started: d(`Event fired when the animation starts`),
    stopped: d(`Event fired when the animation stops`),
  },
  apis: {
    start: d(`Starts the animation`),
    stop: d(`Stops the animation`),
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
