import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Animation } from "@components/Animation/AnimationNative";

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

export const FadeInAnimationMd = createMetadata({
  ...AnimationMd,
  specializedFrom: COMP,
  description: `The \`${COMP}\` component represents an animation that fades in the content.`,
});

export const SlideFromLeftAnimationMd = createMetadata({
    ...AnimationMd,
    specializedFrom: COMP,
    description: `The \`${COMP}\` component represents an animation that slides in the content from the left.`,
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
        duration={extractValue.asOptionalNumber(node.props.duration)}
        animateWhenInView={extractValue.asOptionalBoolean(node.props.animateWhenInView)}
      >
        {renderChild(node.children)}
      </Animation>
    );
  },
);

export const fadeInAnimationRenderer = createComponentRenderer(
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
        animateWhenInView={extractValue.asOptionalBoolean(node.props.animateWhenInView)}
      >
        {renderChild(node.children)}
      </Animation>
    );
  },
);

export const slideFromLeftAnimationRenderer = createComponentRenderer(
    "SlideFromLeftAnimation",
    SlideFromLeftAnimationMd,
    ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
        return (
        <Animation
            registerComponentApi={registerComponentApi}
            animation={{
            from: { transform: "translateX(-100%)" },
            to: { transform: "translateX(0)" },
            }}
            duration={extractValue.asOptionalNumber(node.props.duration)}
            onStop={lookupEventHandler("stopped")}
            animateWhenInView={extractValue.asOptionalBoolean(node.props.animateWhenInView)}
        >
            {renderChild(node.children)}
        </Animation>
        );
    },
    );
