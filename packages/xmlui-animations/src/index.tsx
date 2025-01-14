import { createComponentRenderer, createMetadata, d } from "xmlui";
import { Animation } from "./AnimationNative";

const COMP = "Animation";
const AnimationMd = createMetadata({
  status: "in progress",
  description: ``,
  props: {
    animation: d(`The animation object to be applied to the component`),
    animateWhenInView: d(
      `Indicates whether the animation should start when the component is in view`,
    ),
    duration: d(`The duration of the animation in milliseconds`),
    once: d(`Indicates whether the animation should only run once`),
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

export default createComponentRenderer(
  COMP,
  AnimationMd,
  ({ node, extractValue, registerComponentApi, lookupEventHandler, renderChild }) => {
    const direction = extractValue.asString(node.props.direction);
    const animation = {
      from: {
        transform:
          direction === "right"
            ? "translateX(100%)"
            : direction === "left"
              ? "translateX(-100%)"
              : direction === "top"
                ? "translateY(-100%)"
                : "translateY(100%)",
      },
      to: {
        transform:
          direction === "right" || direction === "left" ? "translateX(0)" : "translateY(0)",
      },
    };

    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={animation}
        duration={extractValue.asOptionalNumber(node.props.duration)}
        onStop={lookupEventHandler("stopped")}
        animateWhenInView={extractValue.asOptionalBoolean(node.props.animateWhenInView)}
      >
        {renderChild(node.children)}
      </Animation>
    );
  },
);
