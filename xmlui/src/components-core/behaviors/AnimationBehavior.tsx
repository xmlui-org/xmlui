import { cloneElement, ReactElement } from "react";
import {
  Animation,
  parseAnimationOptions,
  parseAnimation,
} from "../../components/Animation/AnimationNative";
import { Behavior } from "./Behavior";

/**
 * Behavior for applying animations to components.
 */
export const animationBehavior: Behavior = {
  metadata: {
    name: "animation",
    description: "Adds animation functionality to components with an 'animation' prop.",
    triggerProps: ["animation"],
    props: {
      animation: {
        valueType: "any",
        description:
          "The animation definition, which can be a string reference or an object defining the animation.",
      },
      animationOptions: {
        valueType: "any",
        description: "Options for configuring the animation behavior, such as duration and easing.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (context, node) => {
    const { extractValue } = context;
    const animation = extractValue(node.props?.animation, true);
    return !!animation;
  },
  attach: (context, node, metadata) => {
    const { extractValue } = context;
    const animation = extractValue(context.node.props?.animation, true);
    const animationOptions = extractValue(context.node.props?.animationOptions, true);
    const parsedOptions = parseAnimationOptions(animationOptions);

    return (
      <Animation animation={parseAnimation(animation)} {...parsedOptions}>
        {context.node.type === "ModalDialog"
          ? cloneElement(node as ReactElement, {
              externalAnimation: true,
            })
          : node}
      </Animation>
    );
  },
};
