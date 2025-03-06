import { createComponentRenderer, createMetadata } from "xmlui";
import { Animation, defaultProps } from "./AnimationNative";

const COMP = "FadeAnimation";

const defaultAnimationValues = {
  from: 0,
  to: 1,
};

export const FadeAnimationMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` component represents an animation that fades the content with adjustable opacity values.`,
  docFolder: "src",
  props: {
    from: {
      description:
        "Sets the initial opacity of the content." +
        "If the `to` property is not set, the initial opacity set here will be used as the final opacity.",
      valueType: "number",
      defaultValue: defaultAnimationValues.from,
    },
    to: {
      description:
        "Sets the final opacity of the content." +
        "If the `from` property is not set, the initial opacity set here will be used as the final opacity.",
      valueType: "number",
      defaultValue: defaultAnimationValues.to,
    },
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

export const fadeAnimationRenderer = createComponentRenderer(
  "FadeAnimation",
  FadeAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={{
          from: {
            opacity: extractValue.asOptionalNumber(node.props.from, defaultAnimationValues.from),
          },
          to: {
            opacity: extractValue.asOptionalNumber(node.props.to, defaultAnimationValues.to),
          },
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
