import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Animation } from "@components/Animation/AnimationNative";

const COMP = "Animation";

export const AnimationMd = createMetadata({
  status: "in progress",
  description: ``,
  props: {
    animation: d(`The animation object to be applied to the component`),
  },
  events: {
    started: d(`Event fired when the animation starts`),
    stopped: d(`Event fired when the animation stops`)
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
      >
        {renderChild(node.children)}
      </Animation>
    );
  },
);
