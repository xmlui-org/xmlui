import { createComponentRenderer, createMetadata } from "xmlui";
import { Animation, defaultProps } from "./AnimationNative";

const COMP = "FadeOutAnimation";

const defaultAnimationValues = {
  from: 1,
  to: 0,
};

export const FadeOutAnimationMd = createMetadata({
  specializedFrom: "Animation",
  description: `The \`${COMP}\` component represents an animation that fades out the content.`,
  props: {
    animateWhenInView: {
      description: `Indicates whether the animation should start when the component is in view`,
      valueType: "boolean",
    },
    duration: {
      description: `The duration of the animation in milliseconds`,
      valueType: "number",
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

export const fadeOutAnimationRenderer = createComponentRenderer(
  "FadeOutAnimation",
  FadeOutAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={{
          from: { opacity: defaultAnimationValues.from },
          to: { opacity: defaultAnimationValues.to },
        }}
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
