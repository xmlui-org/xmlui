import { cloneElement, type ReactElement } from "react";
import {
  Animation,
  parseAnimation,
  parseAnimationOptions,
} from "../../components/Animation/AnimationNative";
import { ItemWithLabel } from "../../components/FormItem/ItemWithLabel";
import { parseTooltipOptions, Tooltip } from "../../components/Tooltip/TooltipNative";
import { useStyles } from "../theming/StyleContext";
import { THEME_VAR_PREFIX, toCssVar } from "../theming/layout-resolver";
import { parseLayoutProperty, toCssPropertyName } from "../theming/parse-layout-props";
import { buttonVariantValues } from "../../components/abstractions";
import type { Behavior } from "./Behavior";
import { badgeVariantValues } from "../../components/Badge/BadgeNative";

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
  attach: (context, node, metadata) => {
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

/**
 * Behavior for applying a label to form components using ItemWithLabel.
 */
export const labelBehavior: Behavior = {
  name: "label",
  canAttach: (node, metadata) => {
    /**
     * This behavior can be attached if the component has a 'label' prop
     * and is not a component that handles its own labeling.
     */
    if (metadata?.props?.label) {
      return false;
    } else if (!node.props?.label) {
      return false;
    }
    return true;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode, className } = context;

    const label = extractValue.asOptionalString(componentNode.props.label);
    const labelPosition = extractValue(componentNode.props.labelPosition);
    const labelWidth = extractValue.asOptionalString(componentNode.props.labelWidth);
    const labelBreak = extractValue.asOptionalBoolean(componentNode.props.labelBreak);
    const required = extractValue.asOptionalBoolean(componentNode.props.required);
    const enabled = extractValue.asOptionalBoolean(componentNode.props.enabled, true);
    const shrinkToLabel = extractValue.asOptionalBoolean(componentNode.props.shrinkToLabel);
    const style = extractValue(componentNode.props.style);
    const readOnly = extractValue.asOptionalBoolean(componentNode.props.readOnly);

    return (
      <ItemWithLabel
        labelPosition={labelPosition as any}
        label={label}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        style={style}
        className={className}
        shrinkToLabel={shrinkToLabel}
        labelStyle={{ pointerEvents: readOnly ? "none" : undefined }}
        isInputTemplateUsed={!!componentNode.props?.inputTemplate}
      >
        {node}
      </ItemWithLabel>
    );
  },
};

/**
 * Behavior for applying custom variant styling to components with non-predefined variant values.
 * For Button components, this only applies if the variant is not "solid", "outlined", or "ghost".
 * For other components, it applies to any component with a variant prop.
 * 
 * This behavior clones the rendered node and adds the generated CSS class directly,
 * without wrapping in an additional component.
 */
export const variantBehavior: Behavior = {
  name: "variant",
  canAttach: (node) => {
    const variant = node.props?.variant;
    
    // Must have a variant prop
    if (!variant) {
      return false;
    }

    // Special handling for Button component
    if (node.type === "Button") {
      // *** Temporarily disable for Button until we resolve conflicts with existing variants ***
      return false;
      // // For Button, only attach if variant is NOT one of the predefined values
      // const variantStr = typeof variant === "string" ? variant : String(variant);
      // return !buttonVariantValues.includes(variantStr as any);
    }

    // Special handling for Badge component
    if (node.type === "Badge") {
      // For Badge, only attach if variant is NOT one of the predefined values
      const variantStr = typeof variant === "string" ? variant : String(variant);
      return !badgeVariantValues.includes(variantStr as any);
    }

    return true;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode } = context;
    const variant = extractValue(componentNode.props?.variant, true);
    const componentType = componentNode.type;

    if (!variant || typeof variant !== "string") {
      return node;
    }

    // Get theme variables from metadata
    const themeVars = metadata?.themeVars;
    
    // Validate that themeVars is a record object
    if (!themeVars || typeof themeVars !== 'object' || Array.isArray(themeVars)) {
      return node;
    }

    const themeVarKeys = Object.keys(themeVars);
    
    if (themeVarKeys.length === 0) {
      return node;
    }

    // Generate the variant style specification from metadata themeVars
    const subject = `-${componentType}-${variant}`;
    
    const variantSpec: Record<string, any> = {
      "&": {},
      "&:hover": {},
      "&:active": {},
      "&:disabled": {},
    };

    // Process each theme variable from metadata
    for (const themeVar of themeVarKeys) {
      const parsed = parseLayoutProperty(themeVar, true);
      
      // Skip if parsing failed or returned an error string
      if (typeof parsed === "string") {
        continue;
      }

      const { property, states } = parsed;
      
      // Convert camelCase property to CSS property name
      const cssProperty = toCssPropertyName(property);
      if (!cssProperty) {
        continue;
      }
      
      // Determine which selector to use based on states
      let selector = "&";
      let stateSuffix = "";
      
      if (states && states.length > 0) {
        const state = states[0]; // Use first state
        stateSuffix = `--${states.join("--")}`;
        
        if (state === "hover") {
          selector = "&:hover";
        } else if (state === "active") {
          selector = "&:active";
        } else if (state === "disabled") {
          selector = "&:disabled";
        } else if (state === "focus") {
          selector = "&:focus";
        }
      }

      // Generate CSS variable reference for this theme variable with variant suffix
      //const cssVarValue = toCssVar(`$${property}${subject}${stateSuffix}`);
      const cssVarValue = `var(--${THEME_VAR_PREFIX}-${property}${subject}${stateSuffix}, ` +
        `var(--${THEME_VAR_PREFIX}-${property}-${componentType}))`;
      
      // Add to appropriate selector in variant spec
      if (!variantSpec[selector]) {
        variantSpec[selector] = {};
      }
      variantSpec[selector][cssProperty] = cssVarValue;
    }

    // Generate the CSS class using useStyles hook
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const customVariantClassName = useStyles(variantSpec);

    // Clone the node and add the custom variant className
    const existingClassName = (node as ReactElement).props.className || "";
    const newClassName = `${existingClassName} ${customVariantClassName || ""}`.trim();

    return cloneElement(node as ReactElement, {
      className: newClassName,
    });
  },
};
