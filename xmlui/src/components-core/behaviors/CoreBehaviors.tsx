import {
  cloneElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  Animation,
  parseAnimation,
  parseAnimationOptions,
} from "../../components/Animation/AnimationNative";
import { ItemWithLabel } from "../../components/FormItem/ItemWithLabel";
import { FormBindingWrapper } from "../../components/FormItem/FormBindingWrapper";
import { parseTooltipOptions, Tooltip } from "../../components/Tooltip/TooltipNative";
import { useStyles } from "../theming/StyleContext";
import { THEME_VAR_PREFIX } from "../theming/layout-resolver";
import { parseLayoutProperty, toCssPropertyName } from "../theming/parse-layout-props";
import { buttonVariantValues, type RequireLabelMode } from "../../components/abstractions";
import type { Behavior } from "./Behavior";
import { badgeVariantValues } from "../../components/Badge/BadgeNative";
import { TableOfContentsContext } from "../TableOfContentsContext";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

/**
 * Behavior for applying tooltips to components.
 */
export const tooltipBehavior: Behavior = {
  name: "tooltip",
  canAttach: (context, node) => {
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
  name: "animation",
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
  name: "label",
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
    if (bindTo && FORM_BINDABLE_COMPONENTS.includes(node.type as any)) {
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
  name: "variant",
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
  "TextArea",
  "NumberBox",
  "Toggle",
  "Checkbox",
  "Switch",
  "FileInput",
  "Select",
  "AutoComplete",
  "DatePicker",
  "RadioGroup",
  "Slider",
  "ColorPicker",
] as const;

/**
 * Behavior for adding bookmark functionality to any visual component.
 * When a component has a `bookmark` property, this behavior adds bookmark-related
 * attributes and functionality without wrapping the component.
 */
export const bookmarkBehavior: Behavior = {
  name: "bookmark",
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

  useLayoutEffect(() => {
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
  name: "formBinding",
  canAttach: (context, node) => {
    const { extractValue } = context;

    // Check if the component has a bindTo prop
    const bindTo = extractValue(node.props?.bindTo, true);
    if (!bindTo) {
      return false;
    }

    // Check if the component type is a form-bindable input
    if (!FORM_BINDABLE_COMPONENTS.includes(node.type as any)) {
      return false;
    }

    return true;
  },
  attach: (context, node, metadata) => {
    const { extractValue, node: componentNode, lookupEventHandler } = context;

    const bindTo = extractValue.asOptionalString(componentNode.props?.bindTo);
    const initialValue = extractValue(componentNode.props?.initialValue);
    const noSubmit = extractValue.asOptionalBoolean(componentNode.props?.noSubmit, false);

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

    // Label props (optional, for standalone use)
    const label = extractValue.asOptionalString(componentNode.props?.label);
    const labelPosition = extractValue(componentNode.props?.labelPosition);
    const labelWidth = extractValue.asOptionalString(componentNode.props?.labelWidth);
    const labelBreak = extractValue.asOptionalBoolean(componentNode.props?.labelBreak);

    // Other props
    const enabled = extractValue.asOptionalBoolean(componentNode.props?.enabled, true);

    // Event handlers
    const onValidate = lookupEventHandler("validate");

    const validations = {
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
        bindTo={bindTo!}
        initialValue={initialValue}
        noSubmit={noSubmit}
        validations={validations}
        onValidate={onValidate}
        customValidationsDebounce={customValidationsDebounce}
        validationMode={validationMode as any}
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
