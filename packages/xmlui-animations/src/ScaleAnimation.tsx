import { createComponentRenderer, createMetadata, d } from "xmlui";
import { Animation } from "./AnimationNative";

const COMP = "ScaleAnimation";

export const ScaleAnimationMd = createMetadata({
  status: "in progress",
  specializedFrom: "Animation",
  description: `The \`${COMP}\` component represents an animation that scales the content.`,
  props: {
    from: d("The initial scale of the content."),
    to: d("The final scale of the content."),
    duration: d("The duration of the animation in milliseconds."),
    animateWhenInView: d(
      "Indicates whether the animation should start when the component is in view.",
    ),
    reverse: d("Indicates whether the animation should run in reverse."),
    loop: d("Indicates whether the animation should loop."),
    delay: d("The delay before the animation starts in milliseconds."),
  },
  events: {
    started: d("Event fired when the animation starts."),
    stopped: d("Event fired when the animation stops."),
  },
  apis: {
    start: d("Starts the animation."),
    stop: d("Stops the animation."),
  },
});

export const scaleAnimationRenderer = createComponentRenderer(
  COMP,
  ScaleAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={{
          from: { transform: `scale(${extractValue.asOptionalNumber(node.props?.from)})` },
          to: { transform: `scale(${extractValue.asOptionalNumber(node.props?.to)})` },
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
