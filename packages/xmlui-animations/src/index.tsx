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

const FadeInAnimationMd = createMetadata({
  ...AnimationMd,
  specializedFrom: COMP,
  description: `The \`${COMP}\` component represents an animation that fades in the content.`,
});

const SlideInAnimationMd = createMetadata({
  ...AnimationMd,
  specializedFrom: COMP,
  description: `The \`${COMP}\` component represents an animation that slides in the content from the left.`,
  props: {
    animateWhenInView: d(
      `Indicates whether the animation should start when the component is in view`,
    ),
    direction: d(`The direction from which the content should slide in`),
    duration: d(`The duration of the animation in milliseconds`),
  },
});

const animationComponentRenderer = createComponentRenderer(
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

const fadeInAnimationRenderer = createComponentRenderer(
  "FadeInAnimation",
  FadeInAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={{
          from: { opacity: 0 },
          to: { opacity: 1 },
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

const slideInAnimationRenderer = createComponentRenderer(
  "SlideInAnimation",
  SlideInAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
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

export default {
  namespace: "XMLUIExtensions",
  components: [animationComponentRenderer, fadeInAnimationRenderer, slideInAnimationRenderer]
}