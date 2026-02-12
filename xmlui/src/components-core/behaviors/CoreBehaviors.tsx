import { cloneElement, type ReactElement, useContext, useCallback, useEffect, useRef } from "react";
import {
  Animation,
  parseAnimation,
  parseAnimationOptions,
} from "../../components/Animation/AnimationNative";
import { ItemWithLabel } from "../../components/FormItem/ItemWithLabel";
import { FormBindingWrapper } from "../../components/FormItem/FormBindingWrapper";
import { ValidationWrapper } from "../../components/FormItem/ValidationWrapper";
import { parseTooltipOptions, Tooltip } from "../../components/Tooltip/TooltipNative";
import { useStyles } from "../theming/StyleContext";
import { THEME_VAR_PREFIX } from "../theming/layout-resolver";
import { parseLayoutProperty, toCssPropertyName } from "../theming/parse-layout-props";
import { buttonVariantValues, type RequireLabelMode } from "../../components/abstractions";
import type { FormItemValidations } from "../../components/Form/FormContext";
import type { Behavior } from "./Behavior";
import { badgeVariantValues } from "../../components/Badge/BadgeNative";
import { TableOfContentsContext } from "../TableOfContentsContext";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useIsomorphicLayoutEffect } from "../utils/hooks";

// Re-export pubSubBehavior from its own file
export { pubSubBehavior } from "./PubSubBehavior";

/**
 * Behavior for applying tooltips to components.
 */
export const tooltipBehavior: Behavior = {
  metadata: {
    name: "tooltip",
    description:
      "Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.",
    triggerProps: ["tooltip", "tooltipMarkdown"],
    props: {
      tooltip: {
        valueType: "string",
        description: "The text to display in the tooltip. Can be plain text or markdown.",
      },
      tooltipMarkdown: {
        valueType: "string",
        description:
          "The markdown text to display in the tooltip. Takes precedence over 'tooltip' if both are provided.",
      },
      tooltipOptions: {
        valueType: "any",
        description: "Options for configuring the tooltip behavior, such as delay and position.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (context, node, metadata) => {
    if (metadata?.nonVisual) {
      return false;
    }
    const { extractValue } = context;
    const tooltipText = extractValue(node.props?.tooltip, true);
    const tooltipMarkdown = extractValue(node.props?.tooltipMarkdown, true);
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

/**
 * Behavior for applying a label to form components using ItemWithLabel.
 */
export const labelBehavior: Behavior = {
  metadata: {
    name: "label",
    description:
      "Adds a label to input components with a 'label' prop using the ItemWithLabel component.",
    triggerProps: ["label"],
    props: {
      label: {
        valueType: "string",
        description: "The text to display as the label for the input component.",
      },
      labelPosition: {
        valueType: "string",
        description: "The position of the label relative to the input component.",
      },
      labelWidth: {
        valueType: "string",
        description: "The width of the label.",
      },
      labelBreak: {
        valueType: "boolean",
        description: "Whether the label should break onto a new line.",
      },
      required: {
        valueType: "boolean",
        description: "Whether the input component is required.",
      },
      enabled: {
        valueType: "boolean",
        description: "Whether the input component is enabled.",
      },
      shrinkToLabel: {
        valueType: "boolean",
        description: "Whether the input component should shrink to fit the label.",
      },
      style: {
        valueType: "any",
        description: "Custom styles for the label.",
      },
      readOnly: {
        valueType: "boolean",
        description: "Whether the input component is read-only.",
      },
    },
    condition: {
      type: "and",
      conditions: [
        {
          type: "hasNoProp",
          propName: "label",
        },
        {
          type: "hasNoProp",
          propName: "bindTo",
        },
        {
          type: "isNotType",
          nodeType: "FormItem",
        },
      ],
    },
  },
  canAttach: (context, node, metadata) => {
    /**
     * This behavior can be attached if the component has a 'label' prop
     * and is not a component that handles its own labeling.
     */
    if (metadata?.props?.label) {
      return false;
    }
    const { extractValue } = context;
    const label = extractValue(node.props?.label, true);
    if (!label) {
      return false;
    }

    // Don't attach if formBindingBehavior will handle this component
    // (form-bindable components with bindTo prop will get label from FormBindingWrapper)
    const bindTo = extractValue(node.props?.bindTo, true);
    const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
    if ((bindTo && hasValueApiPair) || node.type === "FormItem") {
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
 * This behavior wraps the rendered node in a VariantWrapper component that applies the variant styling.
 */
export const variantBehavior: Behavior = {
  metadata: {
    name: "variant",
    description:
      "Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.",
    triggerProps: ["variant"],
    props: {},
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

/**
 * List of component types that support form binding behavior.
 * These are input components that can be bound to form data.
 */
const FORM_BINDABLE_COMPONENTS = [
  "TextBox",
  "PasswordInput",
  "TextArea",
  "NumberBox",
  "Toggle",
  "Checkbox",
  "Switch",
  "FileInput",
  "Select",
  "AutoComplete",
  "DatePicker",
  "DateInput",
  "TimeInput",
  "RadioGroup",
  "Slider",
  "ColorPicker",
] as const;

const FORM_VALIDATION_COMPONENTS = [...FORM_BINDABLE_COMPONENTS, "FormItem"] as const;

/**
 * Behavior for adding bookmark functionality to any visual component.
 * When a component has a `bookmark` property, this behavior adds bookmark-related
 * attributes and functionality without wrapping the component.
 */
export const bookmarkBehavior: Behavior = {
  metadata: {
    name: "bookmark",
    description:
      "Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.",
    triggerProps: ["bookmark"],
    props: {
      bookmark: {
        valueType: "string",
        description: "The ID of the bookmark to create for this component.",
      },
      bookmarkLevel: {
        valueType: "number",
        description: "The heading level for this bookmark (used in table of contents).",
      },
      bookmarkTitle: {
        valueType: "string",
        description:
          "The title to use for this bookmark in the table of contents. Defaults to the component's text content.",
      },
      bookmarkOmitFromToc: {
        valueType: "boolean",
        description: "Whether to omit this bookmark from the table of contents.",
      },
    },
    condition: {
      type: "visual",
    },
  },
  canAttach: (context, node, metadata) => {
    // Don't attach to non-visual components
    if (metadata?.nonVisual) {
      return false;
    }

    const { extractValue } = context;
    const bookmark = extractValue(node.props?.bookmark, true);
    return !!bookmark;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode, registerComponentApi } = context;
    const bookmarkId = extractValue.asOptionalString(componentNode.props?.bookmark);
    const bookmarkLevel = extractValue.asOptionalNumber(componentNode.props?.bookmarkLevel, 1);
    const bookmarkTitle = extractValue.asOptionalString(componentNode.props?.bookmarkTitle);
    const bookmarkOmitFromToc = extractValue.asOptionalBoolean(
      componentNode.props?.bookmarkOmitFromToc,
      false,
    );

    if (!bookmarkId) {
      return node;
    }

    // Wrap the node in a component that provides bookmark functionality
    return (
      <BookmarkWrapper
        bookmarkId={bookmarkId}
        level={bookmarkLevel}
        title={bookmarkTitle}
        omitFromToc={bookmarkOmitFromToc}
        registerComponentApi={registerComponentApi}
      >
        {node as ReactElement}
      </BookmarkWrapper>
    );
  },
};

/**
 * Wrapper component that adds bookmark functionality to any child element
 * using React.cloneElement to avoid extra DOM wrappers.
 */
function BookmarkWrapper({
  children,
  bookmarkId,
  level,
  title,
  omitFromToc,
  registerComponentApi,
}: {
  children: ReactElement;
  bookmarkId: string;
  level: number;
  title?: string;
  omitFromToc: boolean;
  registerComponentApi?: RegisterComponentApiFn;
}) {
  const elementRef = useRef<HTMLElement>(null);
  const tableOfContentsContext = useContext(TableOfContentsContext);
  const registerHeading = tableOfContentsContext?.registerHeading;
  const observeIntersection = tableOfContentsContext?.hasTableOfContents;

  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    if (elementRef.current) {
      // Try to find and scroll the nearest scrollable ancestor
      let scrollableParent = elementRef.current.parentElement;
      while (scrollableParent) {
        const style = window.getComputedStyle(scrollableParent);
        const isScrollable =
          (style.overflowY === "scroll" || style.overflowY === "auto") &&
          scrollableParent.scrollHeight > scrollableParent.clientHeight;

        if (isScrollable) {
          // Found a scrollable parent, calculate the position
          const rect = elementRef.current.getBoundingClientRect();
          const parentRect = scrollableParent.getBoundingClientRect();

          // Calculate where the element is relative to the parent's viewport
          const relativeTop = rect.top - parentRect.top + scrollableParent.scrollTop;

          scrollableParent.scrollTo({
            top: relativeTop,
            behavior: options?.behavior || "smooth",
          });
          return;
        }
        scrollableParent = scrollableParent.parentElement;
      }

      // Fallback to browser's default scrollIntoView
      elementRef.current.scrollIntoView({
        behavior: options?.behavior || "smooth",
        block: "start",
      });
    }
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      scrollIntoView,
    });
  }, [registerComponentApi, scrollIntoView]);

  useIsomorphicLayoutEffect(() => {
    if (observeIntersection && elementRef.current && bookmarkId && !omitFromToc) {
      return registerHeading?.({
        id: bookmarkId,
        level,
        text: title || elementRef.current?.textContent?.trim()?.replace(/#$/, "") || bookmarkId,
        anchor: elementRef.current as any,
      });
    }
  }, [bookmarkId, observeIntersection, registerHeading, level, title, omitFromToc]);

  // Clone the child element and add bookmark-related props
  return cloneElement(children, {
    ref: elementRef,
    id: bookmarkId,
    "data-anchor": true,
  } as any);
}

/**
 * Behavior for binding input components directly to a Form without requiring
 * a FormItem wrapper. When a component has a `bindTo` prop and is inside a Form,
 * this behavior wraps it with form binding logic (validation, state management, etc.)
 */
export const formBindingBehavior: Behavior = {
  metadata: {
    name: "formBinding",
    description:
      "Binds input components directly to a Form when they have a 'bindTo' prop, without requiring a FormItem wrapper. This behavior adds form binding logic such as validation and state management to the component.",
    triggerProps: ["bindTo"],
    props: {
      bindTo: {
        valueType: "string",
        description: "The name of the form field to bind this input component to.",
      },
      initialValue: {
        valueType: "any",
        description: "The initial value for this form field when the form is first rendered.",
      },
      noSubmit: {
        valueType: "boolean",
        description: "Whether to exclude this field's value from form submission.",
      },
    },
    condition: {
      type: "and",
      conditions: [
        {
          type: "hasApi",
          apiName: "value",
        },
        {
          type: "hasApi",
          apiName: "setValue",
        },
        {
          type: "isNotType",
          nodeType: "FormItem",
        },
      ],
    },
  },
  canAttach: (context, node, metadata) => {
    const { extractValue } = context;

    // Check if the component has a bindTo prop
    const bindTo = extractValue(node.props?.bindTo, true);
    // Check if the component exposes value/setValue APIs
    const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
    if (!bindTo || !hasValueApiPair || node.type === "FormItem") {
      return false;
    }
    return true;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode } = context;

    const bindTo = extractValue.asOptionalString(componentNode.props?.bindTo);
    const initialValue = extractValue(componentNode.props?.initialValue);
    const noSubmit = extractValue.asOptionalBoolean(componentNode.props?.noSubmit, false);

    // Validation props used for required label display
    const required = extractValue.asOptionalBoolean(componentNode.props?.required);
    const requiredInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.requiredInvalidMessage,
    );
    const minLength = extractValue.asOptionalNumber(componentNode.props?.minLength);
    const maxLength = extractValue.asOptionalNumber(componentNode.props?.maxLength);
    const lengthInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.lengthInvalidMessage,
    );
    const lengthInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.lengthInvalidSeverity,
    );
    const minValue = extractValue.asOptionalNumber(componentNode.props?.minValue);
    const maxValue = extractValue.asOptionalNumber(componentNode.props?.maxValue);
    const rangeInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.rangeInvalidMessage,
    );
    const rangeInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.rangeInvalidSeverity,
    );
    const pattern = extractValue.asOptionalString(componentNode.props?.pattern);
    const patternInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.patternInvalidMessage,
    );
    const patternInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.patternInvalidSeverity,
    );
    const regex = extractValue.asOptionalString(componentNode.props?.regex);
    const regexInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.regexInvalidMessage,
    );
    const regexInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.regexInvalidSeverity,
    );

    const requireLabelMode = extractValue.asOptionalString(
      componentNode.props?.requireLabelMode,
    ) as RequireLabelMode | undefined;

    // Label props (optional, for standalone use)
    const label = extractValue.asOptionalString(componentNode.props?.label);
    const labelPosition = extractValue(componentNode.props?.labelPosition);
    const labelWidth = extractValue.asOptionalString(componentNode.props?.labelWidth);
    const labelBreak = extractValue.asOptionalBoolean(componentNode.props?.labelBreak);

    // Other props
    const enabled = extractValue.asOptionalBoolean(componentNode.props?.enabled, true);

    const validations: FormItemValidations = {
      required,
      requiredInvalidMessage,
      minLength,
      maxLength,
      lengthInvalidMessage,
      lengthInvalidSeverity: lengthInvalidSeverity as any,
      minValue,
      maxValue,
      rangeInvalidMessage,
      rangeInvalidSeverity: rangeInvalidSeverity as any,
      pattern,
      patternInvalidMessage,
      patternInvalidSeverity: patternInvalidSeverity as any,
      regex,
      regexInvalidMessage,
      regexInvalidSeverity: regexInvalidSeverity as any,
    };

    return (
      <FormBindingWrapper
        key={bindTo}
        bindTo={bindTo}
        initialValue={initialValue}
        noSubmit={noSubmit}
        validations={validations}
        label={label}
        labelPosition={labelPosition as any}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        enabled={enabled}
        requireLabelMode={requireLabelMode}
      >
        {node as ReactElement}
      </FormBindingWrapper>
    );
  },
};

export const validationBehavior: Behavior = {
  metadata: {
    name: "validation",
    description:
      "Adds validation functionality to input components with validation-related props (e.g., 'required', 'minLength', 'maxLength', etc.) by wrapping them with a ValidationWrapper component that handles validation logic and error display.",
    triggerProps: ["bindTo"],
    props: {
      required: {
        valueType: "boolean",
        description: "Whether this field is required (for validation purposes).",
      },
      minLength: {
        valueType: "number",
        description: "Minimum length for string inputs (for validation purposes).",
      },
      maxLength: {
        valueType: "number",
        description: "Maximum length for string inputs (for validation purposes).",
      },
      lengthInvalidMessage: {
        valueType: "string",
        description:
          "Custom error message to display when input length is invalid (for validation purposes).",
      },
      lengthInvalidSeverity: {
        valueType: "string",
        description:
          "Severity level for length validation errors (e.g., 'error', 'warning', 'info') (for validation purposes).",
      },
      minValue: {
        valueType: "number",
        description: "Minimum value for number inputs (for validation purposes).",
      },
      maxValue: {
        valueType: "number",
        description: "Maximum value for number inputs (for validation purposes).",
      },
      rangeInvalidMessage: {
        valueType: "string",
        description:
          "Custom error message to display when input value is out of range (for validation purposes).",
      },
      rangeInvalidSeverity: {
        valueType: "string",
        description:
          "Severity level for range validation errors (e.g., 'error', 'warning', 'info') (for validation purposes).",
      },
      pattern: {
        valueType: "string",
        description: "Regex pattern for input validation (for validation purposes).",
      },
      patternInvalidMessage: {
        valueType: "string",
        description:
          "Custom error message to display when input does not match the pattern (for validation purposes).",
      },
      patternInvalidSeverity: {
        valueType: "string",
        description:
          "Severity level for pattern validation errors (e.g., 'error', 'warning', 'info') (for validation purposes).",
      },
      regex: {
        valueType: "string",
        description: "Regex pattern for input validation (for validation purposes).",
      },
      regexInvalidMessage: {
        valueType: "string",
        description:
          "Custom error message to display when input does not match the regex (for validation purposes).",
      },
      regexInvalidSeverity: {
        valueType: "string",
        description:
          "Severity level for regex validation errors (e.g., 'error', 'warning', 'info') (for validation purposes).",
      },
      validationMode: {
        valueType: "string",
        description:
          "The mode to use for validating the input (e.g., 'onChange', 'onBlur', 'onSubmit').",
      },
      verboseValidationFeedback: {
        valueType: "boolean",
        description:
          "Whether to display verbose validation feedback (e.g., show all validation errors instead of just the first one).",
      },
    },
    condition: {
      type: "and",
      conditions: [
        {
          type: "hasApi",
          apiName: "value",
        },
        {
          type: "hasApi",
          apiName: "setValue",
        },
        {
          type: "isNotType",
          nodeType: "FormItem",
        },
      ],
    },
  },
  canAttach: (context, node, metadata) => {
    const { extractValue } = context;

    const bindTo = extractValue(node.props?.bindTo, true);
    const isFormItem = node.type === "FormItem";
    if (!isFormItem && (bindTo === undefined || bindTo === null)) {
      return false;
    }

    if (!isFormItem) {
      const hasValueApiPair = !!metadata?.apis?.value && !!metadata?.apis?.setValue;
      if (!hasValueApiPair) {
        return false;
      }
    }

    return true;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode, lookupEventHandler } = context;
    const renderedNode = node as ReactElement;

    const bindTo = extractValue.asOptionalString(componentNode.props?.bindTo);
    const itemIndex =
      (renderedNode.props as any)?.itemIndex ??
      extractValue.asOptionalNumber(componentNode.props?.itemIndex);
    const formItemType = extractValue.asOptionalString(componentNode.props?.type);
    const inline = extractValue.asOptionalBoolean(componentNode.props?.inline);
    const verboseValidationFeedback = extractValue.asOptionalBoolean(
      componentNode.props?.verboseValidationFeedback,
    );

    // Validation props
    const required = extractValue.asOptionalBoolean(componentNode.props?.required);
    const requiredInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.requiredInvalidMessage,
    );
    const minLength = extractValue.asOptionalNumber(componentNode.props?.minLength);
    const maxLength = extractValue.asOptionalNumber(componentNode.props?.maxLength);
    const lengthInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.lengthInvalidMessage,
    );
    const lengthInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.lengthInvalidSeverity,
    );
    const minValue = extractValue.asOptionalNumber(componentNode.props?.minValue);
    const maxValue = extractValue.asOptionalNumber(componentNode.props?.maxValue);
    const rangeInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.rangeInvalidMessage,
    );
    const rangeInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.rangeInvalidSeverity,
    );
    const pattern = extractValue.asOptionalString(componentNode.props?.pattern);
    const patternInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.patternInvalidMessage,
    );
    const patternInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.patternInvalidSeverity,
    );
    const regex = extractValue.asOptionalString(componentNode.props?.regex);
    const regexInvalidMessage = extractValue.asOptionalString(
      componentNode.props?.regexInvalidMessage,
    );
    const regexInvalidSeverity = extractValue.asOptionalString(
      componentNode.props?.regexInvalidSeverity,
    );
    const customValidationsDebounce = extractValue.asOptionalNumber(
      componentNode.props?.customValidationsDebounce,
      0,
    );
    const validationMode = extractValue.asOptionalString(componentNode.props?.validationMode);
    const requireLabelMode = extractValue.asOptionalString(
      componentNode.props?.requireLabelMode,
    ) as RequireLabelMode | undefined;

    // Event handlers
    let onValidate = lookupEventHandler("validate");
    if (!onValidate) {
      const onValidateProp = componentNode.props?.onValidate;
      if (onValidateProp) {
        // If onValidate is passed as a prop (not in metadata events), we treat it as an action
        const action = extractValue(onValidateProp);
        if (action) {
          onValidate = (value) => context.lookupAction(action)(value);
        }
      }
    }

    const validations: FormItemValidations = {
      required,
      requiredInvalidMessage,
      minLength,
      maxLength,
      lengthInvalidMessage,
      lengthInvalidSeverity: lengthInvalidSeverity as any,
      minValue,
      maxValue,
      rangeInvalidMessage,
      rangeInvalidSeverity: rangeInvalidSeverity as any,
      pattern,
      patternInvalidMessage,
      patternInvalidSeverity: patternInvalidSeverity as any,
      regex,
      regexInvalidMessage,
      regexInvalidSeverity: regexInvalidSeverity as any,
    };

    const isFormItem = componentNode.type === "FormItem";

    return (
      <ValidationWrapper
        bindTo={bindTo}
        validations={validations}
        onValidate={onValidate}
        customValidationsDebounce={customValidationsDebounce}
        validationMode={validationMode as any}
        verboseValidationFeedback={verboseValidationFeedback}
        itemIndex={itemIndex}
        formItemType={formItemType}
        componentType={componentNode.type}
        inline={inline}
        isFormItem={isFormItem}
      >
        {node as ReactElement}
      </ValidationWrapper>
    );
  },
};
