import { cloneElement, isValidElement } from "react";

import { canBehaviorAttachToComponent, hasTriggeredBehaviorProp } from "./conditions";
import type { Behavior, BehaviorAttachContext, BehaviorMetadata } from "./types";

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
    <span
      data-xmlui-behavior="tooltip"
      title={stringValue(context.props.tooltip)}
      data-xmlui-tooltip-markdown={stringValue(context.props.tooltipMarkdown)}
    >
      {node}
    </span>
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
  attach: (context, node) => (
    <label
      data-xmlui-behavior="label"
      data-xmlui-label-position={stringValue(context.props.labelPosition)}
      data-xmlui-label-width={stringValue(context.props.labelWidth)}
    >
      <span data-xmlui-part="label">{stringValue(context.props.label)}</span>
      {node}
    </label>
  ),
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

export const animationBehavior = simpleWrapperBehavior({
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
});

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

export const liveRegionBehavior = simpleWrapperBehavior({
  name: "liveRegion",
  friendlyName: "Live Region",
  description: "Adds live-region accessibility behavior.",
  triggerProps: ["liveRegion"],
  props: {
    liveRegion: {
      valueType: "string",
      description: "The ARIA live-region mode.",
    },
  },
});

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

function stringValue(value: unknown): string | undefined {
  if (value === undefined || value === null || value === false || value === "") {
    return undefined;
  }
  return String(value);
}
