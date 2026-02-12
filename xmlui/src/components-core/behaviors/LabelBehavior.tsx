import { ItemWithLabel } from "../../components/FormItem/ItemWithLabel";
import { Behavior } from "./Behavior";

/**
 * Behavior for applying a label to form components using ItemWithLabel.
 */
export const labelBehavior: Behavior = {
  metadata: {
    name: "label",
    friendlyName: "Component Label",
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
          type: "visual"
        },
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

