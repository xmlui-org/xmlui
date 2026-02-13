import { ReactElement } from "react";
import { RequireLabelMode } from "../../components/abstractions";
import { FormItemValidations } from "../../components/Form/FormContext";
import { FormBindingWrapper } from "../../components/FormItem/FormBindingWrapper";
import { Behavior } from "./Behavior";

/**
 * Behavior for binding input components directly to a Form without requiring
 * a FormItem wrapper. When a component has a `bindTo` prop and is inside a Form,
 * this behavior wraps it with form binding logic (validation, state management, etc.)
 */
export const formBindingBehavior: Behavior = {
  metadata: {
    name: "formBinding",
    friendlyName: "Form Binding",
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
