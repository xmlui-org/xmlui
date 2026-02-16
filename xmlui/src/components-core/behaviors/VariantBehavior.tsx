import { ReactElement, cloneElement } from "react";
import { buttonVariantValues } from "../../components/abstractions";
import { badgeVariantValues } from "../../components/Badge/BadgeNative";
import { THEME_VAR_PREFIX } from "../theming/layout-resolver";
import { parseLayoutProperty, toCssPropertyName } from "../theming/parse-layout-props";
import { useStyles } from "../theming/StyleContext";
import { Behavior } from "./Behavior";

/**
 * Behavior for applying custom variant styling to components with non-predefined variant values.
 * For Button components, this only applies if the variant is not "solid", "outlined", or "ghost".
 * For other components, it applies to any component with a variant prop.
 *
 * This behavior wraps the rendered node in a VariantWrapper component that applies the variant styling.
 */
export const variantBehavior: Behavior = {
  metadata: {
    name: "variant",
    friendlyName: "Styling Variant",
    description:
      "Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.",
    triggerProps: ["variant"],
    props: {
      variant: {
        valueType: "string",
        description:
          "The variant value to apply. For Button components, this should be a custom variant value that is not 'solid', 'outlined', or 'ghost'. For other components, this can be any string value.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (context, node) => {
    const { extractValue } = context;
    const variant = extractValue(node.props?.variant, true);

    // Must have a variant prop
    if (!variant) {
      return false;
    }

    // Special handling for Button component
    if (node.type === "Button") {
      // For Button, only attach if variant is NOT one of the predefined values
      const variantStr = typeof variant === "string" ? variant : String(variant);
      return (
        variantStr != undefined &&
        variantStr !== "" &&
        !buttonVariantValues.includes(variantStr as any)
      );
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
    if (!themeVars || typeof themeVars !== "object" || Array.isArray(themeVars)) {
      return node;
    }

    const themeVarKeys = Object.keys(themeVars);

    if (themeVarKeys.length === 0) {
      return node;
    }

    return (
      <VariantWrapper variant={variant} componentType={componentType} themeVars={themeVars}>
        {node as ReactElement}
      </VariantWrapper>
    );
  },
};

/**
 * Component that applies custom variant styling using React hooks.
 */
function VariantWrapper({
  children,
  variant,
  componentType,
  themeVars,
}: {
  children: ReactElement;
  variant: string;
  componentType: string;
  themeVars: Record<string, any>;
}) {
  // Generate the variant style specification from metadata themeVars
  const subject = `-${componentType}-${variant}`;

  const variantSpec: Record<string, any> = {
    "&": {},
    "&:hover": {},
    "&:active": {},
    "&:disabled": {},
  };

  // Process each theme variable from metadata
  for (const themeVar of Object.keys(themeVars)) {
    const parsed = parseLayoutProperty(themeVar, true);

    // Skip if parsing failed or returned an error string
    if (typeof parsed === "string") {
      continue;
    }

    const { property, component, states } = parsed;

    // Only process themeVars that match the current component type
    // This prevents e.g., "color-anchor-Heading" from overwriting "textColor-H1" when rendering H1
    if (component && component !== componentType) {
      continue;
    }

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
    const cssVarValue =
      `var(--${THEME_VAR_PREFIX}-${property}${subject}${stateSuffix}, ` +
      `var(--${THEME_VAR_PREFIX}-${property}-${componentType}))`;

    // Add to appropriate selector in variant spec
    if (!variantSpec[selector]) {
      variantSpec[selector] = {};
    }
    variantSpec[selector][cssProperty] = cssVarValue;
  }

  // Generate the CSS class using useStyles hook
  const customVariantClassName = useStyles(variantSpec);

  // Clone the node and add the custom variant className
  const existingClassName = children.props.className || "";
  const newClassName = `${existingClassName} ${customVariantClassName || ""}`.trim();

  return cloneElement(children, {
    className: newClassName,
  });
}

