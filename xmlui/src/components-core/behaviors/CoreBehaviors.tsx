import { 
  Animation, 
  parseAnimation, 
  parseAnimationOptions 
} from "../../components/Animation/AnimationNative";
import { 
  parseTooltipOptions, 
  Tooltip 
} from "../../components/Tooltip/TooltipNative";
import type { Behavior } from "./BehaviorContext";

/**
 * Behavior for applying tooltips to components.
 */
export const tooltipBehavior: Behavior = {
  name: "tooltip",
  isEnabled: (context) => {
    const { node, extractValue } = context;
    const tooltipText = extractValue(node.props?.tooltip, true);
    const tooltipMarkdown = extractValue(node.props?.tooltipMarkdown, true);
    return !!tooltipText || !!tooltipMarkdown;
  },
  wrap: (context, node) => {
    const { extractValue } = context;
    const tooltipText = extractValue(context.node.props?.tooltip, true);
    const tooltipMarkdown = extractValue(context.node.props?.tooltipMarkdown, true);
    const tooltipOptions = extractValue(context.node.props?.tooltipOptions, true);
    const parsedOptions = parseTooltipOptions(tooltipOptions);

    return (
      <Tooltip text={tooltipText} markdown={tooltipMarkdown} {...parsedOptions}>
        {node}
      </Tooltip>
    );
  },
};

/**
 * Behavior for applying animations to components.
 */
export const animationBehavior: Behavior = {
  name: "animation",
  isEnabled: (context) => {
    const { node, extractValue } = context;
    const animation = extractValue(node.props?.animation, true);
    return !!animation;
  },
  wrap: (context, node) => {
    const { extractValue } = context;
    const animation = extractValue(context.node.props?.animation, true);
    const animationOptions = extractValue(
      context.node.props?.animationOptions,
      true
    );
    const parsedOptions = parseAnimationOptions(animationOptions);

    return (
      <Animation animation={parseAnimation(animation)} {...parsedOptions}>
        {node}
      </Animation>
    );
  },
};
