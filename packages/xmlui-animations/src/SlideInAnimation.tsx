import { createComponentRenderer, createMetadata } from "xmlui";
import { Animation } from "./AnimationNative";

const COMP = "SlideInAnimation";

export const SlideInAnimationMd = createMetadata({
  specializedFrom: "Animation",
  description: `The \`${COMP}\` component represents an animation that slides in the content from the left.`,
  descriptionRef: "",
});

export const slideInAnimationRenderer = createComponentRenderer(
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
