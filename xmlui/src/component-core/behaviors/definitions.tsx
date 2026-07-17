import { cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

import { canBehaviorAttachToComponent, hasTriggeredBehaviorProp } from "./conditions";
import type { Behavior, BehaviorAttachContext, BehaviorMetadata } from "./types";
import {
  Animation,
  parseAnimation,
  parseAnimationOptions,
} from "../../components/Animation/AnimationReact";
import { FormItemMd } from "../../components/FormItem/FormItem";
import { ItemWithLabel } from "../../components/FormItem/ItemWithLabel";
import { useFormContextPart } from "../../components/Form/FormContext";
import { parseTooltipOptions, ThemedTooltip as Tooltip } from "../../components/Tooltip/Tooltip";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { buttonVariantValues } from "../../components/abstractions";
import { badgeVariantValues } from "../../components/Badge/BadgeReact";
import { THEME_VAR_PREFIX } from "../../components-core/theming/layout-resolver";
import { parseLayoutProperty, toCssPropertyName } from "../../components-core/theming/parse-layout-props";
import { useStyles } from "../../components-core/theming/StyleContext";
import { useTheme } from "../../components-core/theming/ThemeContext";

const responsiveWhenProps = {
  "when-xs": {
    valueType: "boolean",
    description: "Conditionally renders a component at the xs breakpoint and above.",
  },
  "when-sm": {
    valueType: "boolean",
    description: "Conditionally renders a component at the sm breakpoint and above.",
  },
  "when-md": {
    valueType: "boolean",
    description: "Conditionally renders a component at the md breakpoint and above.",
  },
  "when-lg": {
    valueType: "boolean",
    description: "Conditionally renders a component at the lg breakpoint and above.",
  },
  "when-xl": {
    valueType: "boolean",
    description: "Conditionally renders a component at the xl breakpoint and above.",
  },
  "when-xxl": {
    valueType: "boolean",
    description: "Conditionally renders a component at the xxl breakpoint and above.",
  },
} satisfies BehaviorMetadata["props"];

export const whenBehavior: Behavior = {
  metadata: {
    name: "when",
    friendlyName: "Conditional Rendering",
    description: "Conditionally renders a component when the `when` prop is truthy.",
    triggerProps: ["when"],
    props: {
      when: {
        valueType: "boolean",
        description: "If false, the component is not rendered.",
      },
      ...responsiveWhenProps,
    },
  },
  canAttach: (context) => Object.prototype.hasOwnProperty.call(context.props, "when"),
  attach: (context, node) => isTruthyWhenValue(context.props.when) ? node : null,
};

export const tooltipBehavior: Behavior = {
  metadata: {
    name: "tooltip",
    friendlyName: "Tooltip",
    description:
      "Adds tooltip functionality to components with a `tooltip` or `tooltipMarkdown` prop.",
    triggerProps: ["tooltip", "tooltipMarkdown"],
    props: {
      tooltip: {
        valueType: "string",
        description: "The text to display in the tooltip. Can be plain text or markdown.",
      },
      tooltipMarkdown: {
        valueType: "string",
        description:
          "The markdown text to display in the tooltip. Takes precedence over `tooltip` if both are provided.",
      },
      tooltipOptions: {
        valueType: "any",
        description: "Options for configuring the tooltip behavior, such as delay and position.",
      },
    },
    condition: { type: "visual" },
  },
  canAttach: canAttachWhenTriggered("tooltip"),
  attach: (context, node) => (
    <TooltipBehavior
      tooltip={stringValue(context.props.tooltip)}
      tooltipMarkdown={stringValue(context.props.tooltipMarkdown)}
      tooltipOptions={context.props.tooltipOptions}
    >
      {node}
    </TooltipBehavior>
  ),
};

export const labelBehavior: Behavior = {
  metadata: {
    name: "label",
    friendlyName: "Component Label",
    description: "Adds a label to input components with a `label` prop.",
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
      readOnly: {
        valueType: "boolean",
        description: "Whether the input component is read-only.",
      },
      requireLabelMode: {
        valueType: "string",
        description: "Controls whether required or optional labels show an indicator.",
      },
    },
    condition: {
      type: "and",
      conditions: [
        { type: "visual" },
        { type: "hasNoProp", propName: "label" },
        { type: "hasNoProp", propName: "bindTo" },
        { type: "isNotType", nodeType: "FormItem" },
      ],
    },
  },
  attach: (context, node) => <LabelBehavior context={context}>{node}</LabelBehavior>,
  canAttach: (context) =>
    context.componentName !== "Text" &&
    context.componentName !== "RadioGroup" &&
    canAttachWhenTriggered("label")(context),
};

export const variantBehavior: Behavior = {
  metadata: {
    name: "variant",
    friendlyName: "Styling Variant",
    description: "Applies custom variant styling to components with a `variant` prop.",
    triggerProps: ["variant"],
    props: {
      variant: {
        valueType: "string",
        description: "The variant value to apply.",
      },
    },
    condition: { type: "visual" },
  },
  canAttach: (context) => {
    if (!canAttachWhenTriggered("variant")(context)) {
      return false;
    }
    const variant = stringValue(context.props.variant);
    if (!variant) {
      return false;
    }
    if (context.componentName === "Button") {
      return !buttonVariantValues.includes(variant as any);
    }
    if (context.componentName === "Badge") {
      return !badgeVariantValues.includes(variant as any);
    }
    return true;
  },
  attach: (context, node) => {
    const variant = stringValue(context.props.variant);
    if (!variant) {
      return node;
    }
    if (!context.metadata.themeVars) {
      if (isValidElement(node)) {
        return cloneElement(node, {
          "data-xmlui-variant": variant,
        } as Record<string, unknown>);
      }
      return (
        <span data-xmlui-behavior="variant" data-xmlui-variant={variant}>
          {node}
        </span>
      );
    }
    if (isValidElement(node)) {
      return (
        <VariantWrapper
          componentType={context.componentName}
          themeVars={context.metadata.themeVars}
          variant={variant}
        >
          {cloneElement(node, {
            "data-xmlui-variant": variant,
          } as Record<string, unknown>)}
        </VariantWrapper>
      );
    }
    return (
      <span data-xmlui-behavior="variant" data-xmlui-variant={variant}>
        {node}
      </span>
    );
  },
};

function VariantWrapper({
  children,
  componentType,
  themeVars,
  variant,
}: {
  children: ReactElement;
  componentType: string;
  themeVars: Record<string, unknown>;
  variant: string;
}) {
  const themeScope = useTheme();
  const subject = `-${componentType}-${variant}`;
  const variantSpec: Record<string, Record<string, string>> = {
    "&": {},
    "&:hover": {},
    "&:active": {},
    "&:disabled": {},
  };

  for (const themeVar of Object.keys(themeVars)) {
    const normalizedThemeVar = themeVar.replace("Input:", "").replace("Heading:", "");
    const parsed = parseLayoutProperty(normalizedThemeVar, true);
    if (typeof parsed === "string") {
      continue;
    }
    const { property, component, states } = parsed;
    if (component && component !== componentType) {
      continue;
    }
    const cssProperty = toCssPropertyName(property);
    if (!cssProperty) {
      continue;
    }
    const variantKey = `${property}${subject}`;
    let selector = "&";
    let stateSuffix = "";
    if (states && states.length > 0) {
      const [state] = states;
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
    const variantThemeVar = themeScope.themeVars[`${variantKey}${stateSuffix}`];
    if (typeof variantThemeVar !== "string" || variantThemeVar.trim() === "") {
      continue;
    }
    variantSpec[selector] ??= {};
    variantSpec[selector][`--${THEME_VAR_PREFIX}-${property}-${componentType}${stateSuffix}`] =
      variantThemeVar;
  }

  const variantClassName = useStyles(variantSpec, { layer: "dynamic" });
  if (children.type === ItemWithLabel && children.props?.children) {
    const innerChild = children.props.children as ReactElement;
    return cloneElement(children, {
      children: cloneElement(innerChild, {
        className: [innerChild.props?.className, variantClassName].filter(Boolean).join(" "),
        "data-xmlui-variant": variant,
      }),
    });
  }
  return cloneElement(children, {
    className: [children.props.className, variantClassName].filter(Boolean).join(" "),
  });
}

export const animationBehavior: Behavior = {
  metadata: {
    name: "animation",
    friendlyName: "Animation",
    description: "Adds animation functionality to components with an `animation` prop.",
    triggerProps: ["animation"],
    props: {
      animation: {
        valueType: "any",
        description: "The animation definition.",
      },
      animationOptions: {
        valueType: "any",
        description: "Options for configuring the animation behavior.",
      },
    },
    condition: { type: "visual" },
  },
  canAttach: (context) =>
    canBehaviorAttachToComponent(animationBehavior.metadata, context.metadata, context.componentName) &&
    hasTriggeredBehaviorProp(animationBehavior.metadata, context.props),
  attach: (context, node) => {
    const animation = parseAnimation(context.props.animation as string | object);
    const options = parseAnimationOptions(context.props.animationOptions);
    return (
      <Animation animation={animation} {...options}>
        {node}
      </Animation>
    );
  },
};

export const bookmarkBehavior = simpleWrapperBehavior({
  name: "bookmark",
  friendlyName: "Bookmark",
  description: "Adds bookmark support to components with a `bookmark` prop.",
  triggerProps: ["bookmark"],
  props: {
    bookmark: {
      valueType: "string",
      description: "The bookmark identifier.",
    },
  },
});

export const liveRegionBehavior: Behavior = {
  metadata: {
    name: "liveRegion",
    friendlyName: "Live Region",
    description: "Adds live-region accessibility behavior.",
    triggerProps: ["withLiveRegion", "liveRegion"],
    props: {
      withLiveRegion: {
        valueType: "boolean",
        description: "If true, adds a hidden live region that announces component value updates.",
      },
      liveRegion: {
        valueType: "string",
        description: "Legacy alias for the ARIA live-region mode.",
      },
      liveRegionMessage: {
        valueType: "string",
        description: "Overrides the message announced by the hidden live region.",
      },
      liveRegionPoliteness: {
        valueType: "string",
        availableValues: ["polite", "assertive"],
        isStrictEnum: true,
        description: "Controls whether updates are announced politely or assertively.",
      },
    },
    condition: { type: "visual" },
  },
  canAttach: (context) =>
    context.componentName !== "Text" &&
    canBehaviorAttachToComponent(liveRegionBehavior.metadata, context.metadata, context.componentName) &&
    (isTruthyWhenValue(context.props.withLiveRegion) || context.props.liveRegion !== undefined),
  attach: (context, node) => (
    <>
      {node}
      <span
        data-xmlui-behavior="liveRegion"
        role={liveRegionPoliteness(context.props) === "assertive" ? "alert" : "status"}
        aria-live={liveRegionPoliteness(context.props)}
        aria-atomic="true"
        style={hiddenLiveRegionStyle}
      >
        {liveRegionMessage(context, node)}
      </span>
    </>
  ),
};

export const pubSubBehavior = simpleWrapperBehavior({
  name: "pubSub",
  friendlyName: "Publish/Subscribe",
  description: "Adds publish/subscribe behavior.",
  triggerProps: ["publish", "subscribe"],
  props: {
    publish: {
      valueType: "any",
      description: "Publish configuration.",
    },
    subscribe: {
      valueType: "any",
      description: "Subscribe configuration.",
    },
  },
});

export const validationBehavior = simpleWrapperBehavior({
  name: "validation",
  friendlyName: "Validation",
  description: "Adds validation behavior to form-capable components.",
  triggerProps: ["required", "validationStatus", "validationMessage"],
  props: {
    required: {
      valueType: "boolean",
      description: "Whether a value is required.",
    },
    validationStatus: {
      valueType: "string",
      description: "The validation status.",
    },
    validationMessage: {
      valueType: "string",
      description: "The validation message.",
    },
  },
});

export const formBindingBehavior = simpleWrapperBehavior({
  name: "formBinding",
  friendlyName: "Form Binding",
  description: "Adds form binding behavior to value components.",
  triggerProps: ["bindTo"],
  props: {
    bindTo: {
      valueType: "string",
      description: "The form field path this component binds to.",
    },
  },
  condition: {
    type: "and",
    conditions: [
      { type: "hasApi", apiName: "value" },
      { type: "hasApi", apiName: "setValue" },
    ],
  },
});

export const collectedBehaviors: Behavior[] = [
  whenBehavior,
  formBindingBehavior,
  validationBehavior,
  labelBehavior,
  tooltipBehavior,
  variantBehavior,
  animationBehavior,
  bookmarkBehavior,
  liveRegionBehavior,
  pubSubBehavior,
];

export const collectedBehaviorMetadata: Record<string, BehaviorMetadata> = Object.fromEntries(
  collectedBehaviors.map((behavior) => [behavior.metadata.name, behavior.metadata]),
);

function simpleWrapperBehavior(metadata: BehaviorMetadata): Behavior {
  const behaviorMetadata: BehaviorMetadata = {
    condition: { type: "visual" },
    ...metadata,
  };
  const behavior: Behavior = {
    metadata: behaviorMetadata,
    canAttach: (context: BehaviorAttachContext) =>
      canBehaviorAttachToComponent(behaviorMetadata, context.metadata, context.componentName) &&
      hasTriggeredBehaviorProp(behaviorMetadata, context.props),
    attach: (context, node) => (
      <span
        data-xmlui-behavior={metadata.name}
        style={
          metadata.name === "validation" && context.componentName === "ColorPicker"
            ? { display: "contents" }
            : undefined
        }
      >
        {node}
      </span>
    ),
  };
  return behavior;
}

function isTruthyWhenValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false && value !== "" && value !== "false";
}

function canAttachWhenTriggered(name: string) {
  return (context: BehaviorAttachContext): boolean => {
    const metadata = collectedBehaviorMetadata[name];
    return (
      metadata !== undefined &&
      canBehaviorAttachToComponent(metadata, context.metadata, context.componentName) &&
      hasTriggeredBehaviorProp(metadata, context.props)
    );
  };
}

function LabelBehavior({
  children,
  context,
}: {
  children: ReactNode;
  context: BehaviorAttachContext;
}) {
  const childStyle = isValidElement(children)
    ? (children.props as { style?: CSSProperties }).style
    : undefined;
  const readOnly = isTruthyWhenValue(context.props.readOnly);
  const hasValueApiPair = !!context.metadata.apis?.value && !!context.metadata.apis?.setValue;
  const formRequireLabelMode = useFormContextPart((value) => value?.itemRequireLabelMode);
  const labelBreak =
    context.props.labelBreak === undefined
      ? context.componentName === "Select"
        ? false
        : undefined
      : isTruthyWhenValue(context.props.labelBreak);
  const shrinkToLabel = context.props.shrinkToLabel === undefined
    ? !hasValueApiPair
    : isTruthyWhenValue(context.props.shrinkToLabel);
  const formItemThemeClassName = useComponentThemeClass(FormItemMd);
  return (
    <ItemWithLabel
      id={stringValue(context.props.id)}
      className={["xmlui-FormItem", formItemThemeClassName].filter(Boolean).join(" ")}
      componentName={context.componentName}
      labelPosition={stringValue(context.props.labelPosition) as any}
      label={stringValue(context.props.label)}
      labelWidth={stringValue(context.props.labelWidth)}
      labelBreak={labelBreak}
      required={isTruthyWhenValue(context.props.required)}
      enabled={
        context.props.enabled === undefined
          ? true
          : isTruthyWhenValue(context.props.enabled)
      }
      style={childStyle}
      cloneStyle={true}
      requireLabelMode={
        (stringValue(context.props.requireLabelMode) as any) ?? formRequireLabelMode
      }
      shrinkToLabel={shrinkToLabel}
      labelStyle={{ pointerEvents: readOnly ? "none" : undefined }}
      isInputTemplateUsed={!!context.props.inputTemplate}
      testId={stringValue(context.props.testId)}
      direction={stringValue(context.props.direction) as "rtl" | "ltr" | undefined}
      layoutContext={context.layoutContext as any}
      compactInlineLabel={context.metadata.compactInlineLabel === true}
    >
      {children}
    </ItemWithLabel>
  );
}

function TooltipBehavior({
  children,
  tooltip,
  tooltipMarkdown,
  tooltipOptions,
  ...rest
}: {
  children: ReactNode;
  tooltip?: string;
  tooltipMarkdown?: string;
  tooltipOptions?: unknown;
  [key: string]: unknown;
}) {
  const parsedOptions = parseTooltipOptions(tooltipOptions);
  const title = tooltipMarkdown ? undefined : tooltip;
  return (
    <Tooltip text={tooltip ?? ""} markdown={tooltipMarkdown} {...parsedOptions}>
      {annotateTooltipTrigger(children, title, rest)}
    </Tooltip>
  );
}

function annotateTooltipTrigger(
  children: ReactNode,
  title: string | undefined,
  extraProps: Record<string, unknown>,
): ReactNode {
  const { ref: _ref, ...propsWithoutRef } = extraProps as Record<string, unknown> & { ref?: unknown };
  const behaviorProps = {
    ...propsWithoutRef,
    "data-xmlui-behavior": "tooltip",
    title: typeof window === "undefined" ? title : undefined,
    style: isTooltipLinkTrigger(children)
      ? { ...(propsWithoutRef.style as CSSProperties | undefined), display: "contents" }
      : propsWithoutRef.style,
  };
  return <span {...behaviorProps}>{children}</span>;
}

function isTooltipLinkTrigger(children: ReactNode): boolean {
  return isValidElement(children) && children.props?.["data-xmlui-component"] === "Link";
}

function stringValue(value: unknown): string | undefined {
  if (value === undefined || value === null || value === false || value === "") {
    return undefined;
  }
  return String(value);
}

const hiddenLiveRegionStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

function liveRegionPoliteness(props: Record<string, unknown>): "polite" | "assertive" {
  const explicit = stringValue(props.liveRegionPoliteness) ?? stringValue(props.liveRegion);
  return explicit === "assertive" ? "assertive" : "polite";
}

function liveRegionMessage(context: BehaviorAttachContext, node: ReactNode): string {
  const explicit = stringValue(context.props.liveRegionMessage);
  if (explicit !== undefined) {
    return explicit;
  }
  if (context.componentName === "ProgressBar") {
    const value = numberValue(context.props.value);
    if (value !== undefined) {
      return `${Math.round(value * 100)}%`;
    }
  }
  for (const name of ["value", "label", "message", "title"]) {
    const value = stringValue(context.props[name]);
    if (value !== undefined) {
      return value;
    }
  }
  const childText = textFromReactNode(node);
  if (childText !== undefined) {
    return childText;
  }
  return "";
}

function textFromReactNode(node: ReactNode): string | undefined {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!isValidElement(node)) {
    return undefined;
  }
  const children = (node.props as { children?: ReactNode }).children;
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    const text = children.map(textFromReactNode).filter((value): value is string => value !== undefined).join("");
    return text === "" ? undefined : text;
  }
  return textFromReactNode(children);
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
