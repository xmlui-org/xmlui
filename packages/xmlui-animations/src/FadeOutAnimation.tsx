import { createComponentRenderer, createMetadata, d } from "xmlui";
import { Animation } from "./AnimationNative";

const COMP = "FadeOutAnimation";

export const FadeOutAnimationMd = createMetadata({
  specializedFrom: "Animation",
  description: `The \`${COMP}\` component represents an animation that fades out the content.`,
  descriptionRef: "",
});

export const fadeOutAnimationRenderer = createComponentRenderer(
  "FadeOutAnimation",
  FadeOutAnimationMd,
  ({ node, renderChild, extractValue, registerComponentApi, lookupEventHandler }) => {
    return (
      <Animation
        registerComponentApi={registerComponentApi}
        animation={{
          from: { opacity: 1 },
          to: { opacity: 0 },
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
