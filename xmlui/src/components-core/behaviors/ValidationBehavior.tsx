import { ReactElement } from "react";
import { ValidationWrapper } from "../../components/FormItem/ValidationWrapper";
import { Behavior } from "./Behavior";
import { RequireLabelMode } from "../../components/abstractions";
import { FormItemValidations } from "../../components/Form/FormContext";

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
