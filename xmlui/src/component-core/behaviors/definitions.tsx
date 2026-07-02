import { Fragment, cloneElement, isValidElement, useState, type CSSProperties, type ReactNode } from "react";

import { canBehaviorAttachToComponent, hasTriggeredBehaviorProp } from "./conditions";
import type { Behavior, BehaviorAttachContext, BehaviorMetadata } from "./types";
import {
  Animation,
  parseAnimation,
  parseAnimationOptions,
} from "../../components/Animation/AnimationReact";
import { useFormContext } from "../../components/Form/FormContext";

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
  canAttach: canAttachWhenTriggered("label"),
  attach: (context, node) => <LabelBehavior context={context}>{node}</LabelBehavior>,
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
  canAttach: canAttachWhenTriggered("variant"),
  attach: (context, node) => {
    if (isValidElement(node)) {
      return cloneElement(node, {
        "data-xmlui-variant": stringValue(context.props.variant),
      } as Record<string, unknown>);
    }
    return (
      <span data-xmlui-behavior="variant" data-xmlui-variant={stringValue(context.props.variant)}>
        {node}
      </span>
    );
  },
};

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
    const animation = parseAnimation(context.props.animation);
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
        {liveRegionMessage(context)}
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
    attach: (_context, node) => (
      <span data-xmlui-behavior={metadata.name}>
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
  const form = useFormContext();
  const child = isValidElement(children)
    ? cloneElement(children, {
        "data-testid": undefined,
        "data-xmlui-id": undefined,
        style: undefined,
      } as Record<string, unknown>)
    : children;
  const childStyle = isValidElement(children)
    ? (children.props as { style?: CSSProperties }).style
    : undefined;
  const position = normalizedLabelPosition(context.props.labelPosition);
  const required = isTruthyWhenValue(context.props.required);
  const requireLabelMode =
    stringValue(context.props.requireLabelMode) ??
    form?.itemRequireLabelMode ??
    "markRequired";
  const marker =
    (required && (requireLabelMode === "markRequired" || requireLabelMode === "markBoth"))
      ? "*"
      : (!required && (requireLabelMode === "markOptional" || requireLabelMode === "markBoth"))
        ? "(Optional)"
        : undefined;
  const labelWidth = stringValue(context.props.labelWidth);
  const label = (
    <span
      key="label"
      data-xmlui-part="label"
      data-part-id="label"
      style={{
        flex: labelWidth ? `0 0 ${labelWidth}` : undefined,
        width: labelWidth,
        whiteSpace: context.props.labelBreak === true ? "normal" : "nowrap",
      }}
    >
      {stringValue(context.props.label)}
      {marker ? <span>{marker}</span> : null}
    </span>
  );
  const orderedChildren = position === "end" || position === "bottom"
    ? [<Fragment key="control">{child}</Fragment>, label]
    : [label, <Fragment key="control">{child}</Fragment>];
  return (
    <label
      data-xmlui-behavior="label"
      data-xmlui-component={context.componentName}
      data-xmlui-id={stringValue(context.props.id)}
      data-xmlui-label-position={position}
      data-xmlui-label-width={labelWidth}
      data-testid={stringValue(context.props.testId)}
    >
      <span
        data-xmlui-part="labeledItem"
        data-part-id="labeledItem"
        style={{
          ...(childStyle ?? {}),
          display: "flex",
          flexDirection: position === "top" || position === "bottom" ? "column" : "row",
          alignItems: position === "top" || position === "bottom" ? "stretch" : "center",
          gap: "var(--xmlui-gap-label-TextBox, var(--xmlui-space-2, 0.5rem))",
        }}
      >
        {orderedChildren}
      </span>
    </label>
  );
}

function normalizedLabelPosition(value: unknown): "start" | "end" | "top" | "bottom" {
  const position = stringValue(value);
  if (position === "end" || position === "after") {
    return "end";
  }
  if (position === "bottom") {
    return "bottom";
  }
  if (position === "top") {
    return "top";
  }
  return "start";
}

function TooltipBehavior({
  children,
  tooltip,
  tooltipMarkdown,
  ...rest
}: {
  children: ReactNode;
  tooltip?: string;
  tooltipMarkdown?: string;
} & Record<string, unknown>) {
  const [visible, setVisible] = useState(false);
  const content = tooltipMarkdown || tooltip;
  return (
    <span
      {...rest}
      data-xmlui-behavior="tooltip"
      title={tooltip}
      data-xmlui-tooltip-markdown={tooltipMarkdown}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content ? (
        <span role="tooltip">
          {tooltipMarkdown ? renderTinyMarkdown(tooltipMarkdown) : content}
        </span>
      ) : null}
    </span>
  );
}

function renderTinyMarkdown(markdown: string) {
  const strongMatch = /^\*\*(.*)\*\*$/.exec(markdown.trim());
  return strongMatch ? <strong>{strongMatch[1]}</strong> : markdown;
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

function liveRegionMessage(context: BehaviorAttachContext): string {
  const explicit = stringValue(context.props.liveRegionMessage);
  if (explicit !== undefined) {
    return explicit;
  }
  for (const name of ["value", "label", "message", "title"]) {
    const value = stringValue(context.props[name]);
    if (value !== undefined) {
      return value;
    }
  }
  return "";
}
