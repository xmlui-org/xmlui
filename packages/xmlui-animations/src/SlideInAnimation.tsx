import { createComponentRenderer, createMetadata } from "xmlui";
import { Animation, defaultProps } from "./AnimationNative";

const COMP = "SlideInAnimation";

const defaultAnimationValues = {
  direction: "left",
};

export const SlideInAnimationMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` component represents an animation that slides in the content from the left.`,
  docFolder: "src",
  props: {
      direction: {
        description: "The direction of the animation.",
        valueType: "string",
        options: ["left", "right", "top", "bottom"],
        defaultValue: defaultAnimationValues.direction,
      },
      duration: {
        description: "The duration of the animation in milliseconds.",
        valueType: "number",
      },
      animateWhenInView: {
        description: "Indicates whether the animation should start when the component is in view.",
        valueType: "boolean",
      },
      reverse: {
        description: `Indicates whether the animation should run in reverse`,
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

export const slideInAnimationRenderer = createComponentRenderer(
  "SlideInAnimation",
  SlideInAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
    const direction = extractValue.asOptionalString(node.props.direction, defaultAnimationValues.direction);
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
        onStart={lookupEventHandler("started")}
        animateWhenInView={extractValue.asOptionalBoolean(node.props.animateWhenInView)}
        reverse={extractValue.asOptionalBoolean(node.props.reverse)}
        loop={extractValue.asOptionalBoolean(node.props.loop)}
        delay={extractValue.asOptionalNumber(node.props.delay)}
      >
        {renderChild(node.children)}
      </Animation>
    );
  },
);
