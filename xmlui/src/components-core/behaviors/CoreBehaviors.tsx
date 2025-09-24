import { useId } from "react";
import { 
  Animation, 
  parseAnimation, 
  parseAnimationOptions 
} from "../../components/Animation/AnimationNative";
import { ItemWithLabel } from "../../components/FormItem/ItemWithLabel";
import { 
  parseTooltipOptions, 
  Tooltip 
} from "../../components/Tooltip/TooltipNative";
import type { Behavior } from "./BehaviorContext";
import { MetadataProvider } from "../../language-server/services/common/metadata-utils";
import { collectedComponentMetadata } from "../../components/collectedComponentMetadata";
import { ComponentMetadata } from "../..";

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

/**
 * Behavior for applying a label to form components using ItemWithLabel.
 */
export const labelBehavior: Behavior = {
  name: "label",
  canAttach: (node) => {

  /**
   * This behavior can be attached if the component has a 'label' prop
   * and is not a component that handles its own labeling.
   */
  const metadataProvider = new MetadataProvider(collectedComponentMetadata);
  const metadata: ComponentMetadata | undefined = metadataProvider.getComponent(node.type)?.getMetadata();

  if (metadata?.props?.label) {
    return false;
  } else if (!node.props?.label) {
    return false;
  }
  return true;
  },
  attach: (context, node) => {
    const { extractValue, node: componentNode, className } = context;

    const label = extractValue.asOptionalString(componentNode.props.label);
    const labelPosition = extractValue(componentNode.props.labelPosition);
    const labelWidth = extractValue.asOptionalString(componentNode.props.labelWidth);
    const labelBreak = extractValue.asOptionalBoolean(componentNode.props.labelBreak);
    const required = extractValue.asOptionalBoolean(componentNode.props.required);
    const enabled = extractValue.asOptionalBoolean(componentNode.props.enabled, true);
    const shrinkToLabel = extractValue.asOptionalBoolean(componentNode.props.shrinkToLabel);
    const style = extractValue(componentNode.props.style);
    const generatedId = useId();

    return (
      <ItemWithLabel
        id={componentNode.uid || generatedId}
        labelPosition={labelPosition as any}
        label={label}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        style={style}
        className={className}
        isInputTemplateUsed={true}
        shrinkToLabel={shrinkToLabel}
        testId={componentNode.testId}
      >
       {node}
      </ItemWithLabel>
    );
  },
};
