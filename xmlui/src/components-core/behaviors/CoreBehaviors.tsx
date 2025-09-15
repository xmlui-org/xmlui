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
  canAttach: (node) => {
    const tooltipText = node.props?.tooltip;
    const tooltipMarkdown = node.props?.tooltipMarkdown;
    return !!tooltipText || !!tooltipMarkdown;
  },
  attach: (context, node) => {
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
  canAttach: (node) => {
    return !!node.props?.animation;
  },
  attach: (context, node) => {
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
