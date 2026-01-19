import styles from "./FormItem.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useMemo } from "react";
import {
  defaultValidationMode,
  formControlTypesMd,
  validationModeMd,
  validationSeverityValues,
  type FormItemValidations,
} from "../Form/FormContext";
import {
  createMetadata,
  d,
  dAutoFocus,
  dComponent,
  dEnabled,
  dInitialValue,
  dLabel,
  dLabelPosition,
  dLabelWidth,
  dRequired,
} from "../metadata-helpers";
import { parseSeverity } from "./Validations";
import { CustomFormItem, FormItem, defaultProps } from "./FormItemNative";
import { MemoizedItem } from "../container-helpers";
import { partitionObject } from "../../components-core/utils/misc";
import { requireLabelModeMd } from "../abstractions";

const COMP = "FormItem";

// NOTE: We need to filter the "none" value out so that it doesn't show up in the docs.
const filteredValidationSeverityValues = validationSeverityValues.filter(
  (value) => value !== "none",
);

export const FormItemMd = createMetadata({
  status: "stable",
  allowArbitraryProps: true,
  description:
    "`FormItem` wraps individual input controls within a `Form`, providing data " +
    "binding, validation, labeling, and layout functionality. It connects form " +
    "controls to the parent form's data model and handles validation feedback " +
    "automatically. " +
    "**Note:** `FormItem` must be used inside a `Form` component.",
  props: {
    bindTo: {
      description:
        "This property binds a particular input field to one of the attributes of the \`Form\` data. " +
        "It names the property of the form's \`data\` data to get the input's initial value." +
        "When the field is saved, its value will be stored in the \`data\` property with this name. " +
        "If the property is not set, the input will be bound to an internal data field but not submitted.",
    },
    autoFocus: dAutoFocus(),
    label: dLabel(),
    labelPosition: dLabelPosition(),
    labelWidth: dLabelWidth(COMP),
    labelBreak: {
      description:
        `This boolean value indicates if the label can be split into multiple lines if it would ` +
        `overflow the available label width.`,
      type: "boolean",
      defaultValue: defaultProps.labelBreak,
    },
    enabled: dEnabled(),
    type: {
      description:
        `This property is used to determine the specific input control the FormItem will wrap ` +
        `around. Note that the control names start with a lowercase letter and map to input ` +
        `components found in XMLUI.`,
      availableValues: formControlTypesMd,
      defaultValue: defaultProps.type,
      valueType: "string",
    },
    customValidationsDebounce: {
      description: `This optional number prop determines the time interval between two runs of a custom validation.`,
      type: "number",
      defaultValue: defaultProps.customValidationsDebounce,
    },
    validationMode: {
      description:
        `This property sets what kind of validation mode or strategy to employ for a particular ` +
        `input field.`,
      availableValues: validationModeMd,
      defaultValue: defaultValidationMode,
    },
    requireLabelMode: {
      description: "Controls how required/optional status is visually indicated in the label.",
      type: "string",
      availableValues: requireLabelModeMd,
      isRequired: false,
    },
    initialValue: dInitialValue(),
    required: dRequired(),
    requiredInvalidMessage: {
      description:
        "This optional string property is used to customize the message that is displayed if the " +
        "field is not filled in. If not defined, the default message is used.",
      valueType: "string",
    },
    minLength: {
      description:
        "This property sets the minimum length of the input value. If the value is not set, " +
        "no minimum length check is done.",
      valueType: "number",
    },
    maxLength: {
      description:
        "This property sets the maximum length of the input value. If the value is not set, " +
        "no maximum length check is done.",
      valueType: "number",
    },
    maxTextLength: {
      description:
        "The maximum length of the text in the input field. If this value is not set, " +
        "no maximum length constraint is set for the input field.",
      valueType: "number",
    },
    lengthInvalidMessage: {
      description:
        "This optional string property is used to customize the message that is displayed on a failed " +
        "length check: [minLength](#minlength) or [maxLength](#maxlength).",
      valueType: "string",
    },
    lengthInvalidSeverity: {
      description: `This property sets the severity level of the length validation.`,
      valueType: "string",
      availableValues: filteredValidationSeverityValues,
      defaultValue: "error",
    },
    minValue: {
      description:
        "The minimum value of the input. If this value is not specified, no minimum " +
        "value check is done.",
      valueType: "number",
    },
    maxValue: {
      description:
        "The maximum value of the input. If this value is not specified, no maximum " +
        "value check is done.",
      valueType: "number",
    },
    rangeInvalidMessage: {
      description:
        `This optional string property is used to customize the message that is displayed when ` +
        `a value is out of range.`,
      valueType: "string",
    },
    rangeInvalidSeverity: {
      description: `This property sets the severity level of the value range validation.`,
      valueType: "string",
      availableValues: filteredValidationSeverityValues,
      defaultValue: "error",
    },
    pattern: {
      description:
        "This value specifies a predefined regular expression to test the input value. " +
        "If this value is not set, no pattern check is done.",
      valueType: "string",
    },
    patternInvalidMessage: {
      description:
        `This optional string property is used to customize the message that is displayed on a ` +
        `failed pattern test.`,
      valueType: "string",
    },
    patternInvalidSeverity: {
      description: `This property sets the severity level of the pattern validation.`,
      valueType: "string",
      availableValues: filteredValidationSeverityValues,
      defaultValue: "error",
    },
    regex: {
      description:
        "This value specifies a custom regular expression to test the input value. If this value " +
        "is not set, no regular expression pattern check is done.",
      valueType: "string",
    },
    regexInvalidMessage: {
      description:
        `This optional string property is used to customize the message that is displayed on a ` +
        `failed regular expression test.`,
      valueType: "string",
    },
    regexInvalidSeverity: {
      description: `This property sets the severity level of regular expression validation.`,
      valueType: "string",
      availableValues: filteredValidationSeverityValues,
      defaultValue: "error",
    },
    inputTemplate: dComponent("This property is used to define a custom input template."),
    gap: {
      description: "This property defines the gap between the adornments and the input area.",
      valueType: "string",
      defaultValue: defaultProps.gap,
    },
    noSubmit: {
      description:
        "When set to `true`, the field will not be included in the form's submitted data. " +
        "This is useful for fields that should be present in the form but not submitted, " +
        "similar to hidden fields. If multiple FormItems reference the same `bindTo` value " +
        "and any of them has `noSubmit` set to `true`, the field will NOT be submitted.",
      type: "boolean",
      defaultValue: defaultProps.noSubmit,
    },
  },
  events: {
    validate: {
      description: `This event is used to define a custom validation function.`,
      signature: "validate(value: any): string | null | undefined | void",
      parameters: {
        value: "The current value of the FormItem to validate.",
      },
    },
  },
  apis: {
    addItem: {
      description:
        "This method adds a new item to the list held by the FormItem. The function has a single " +
        "parameter, the data to add to the FormItem. The new item is appended to the end of the list.",
      signature: "addItem(data: any): void",
      parameters: {
        data: "The data to add to the FormItem's list.",
      },
    },
    removeItem: {
      description:
        "Removes the item specified by its index from the list held by the FormItem. " +
        "The function has a single argument, the index to remove.",
      signature: "removeItem(index: number): void",
      parameters: {
        index: "The index of the item to remove from the FormItem's list.",
      },
    },
  },
  contextVars: {
    $value: d("Current value of the FormItem, accessible in expressions and code snippets"),
    $setValue: d("Function to set the FormItem's value programmatically"),
    $validationResult: d("Current validation state and error messages for this field"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "textColor-FormItemLabel": "$textColor",
    "fontSize-FormItemLabel": "$fontSize-sm",
    "fontWeight-FormItemLabel": "$fontWeight-medium",
    "fontStyle-FormItemLabel": "normal",
    "textTransform-FormItemLabel": "none",
    "textColor-FormItemLabel-requiredMark": "$color-danger-400",
    "textColor-FormItemLabel-optionalTag": "$textColor-secondary",
  },
});

export const formItemComponentRenderer = createComponentRenderer(
  COMP,
  FormItemMd,
  ({
    node,
    renderChild,
    extractValue,
    className,
    layoutContext,
    lookupEventHandler,
    lookupAction,
    registerComponentApi,
  }) => {
    const {
      bindTo,
      autoFocus,
      label,
      labelPosition,
      labelWidth,
      labelBreak,
      enabled,
      required,
      type,
      requiredInvalidMessage,
      minLength,
      maxLength,
      lengthInvalidMessage,
      lengthInvalidSeverity,
      minValue,
      maxValue,
      rangeInvalidMessage,
      rangeInvalidSeverity,
      pattern,
      patternInvalidMessage,
      patternInvalidSeverity,
      regex,
      regexInvalidMessage,
      regexInvalidSeverity,
      customValidationsDebounce,
      validationMode,
      maxTextLength,
      gap,
      noSubmit,
      ...rest
    } = node.props;

    // Separate template props from regular props
    // i.e. props like groupHeaderTemplate
    const [templateProps, nonTemplateProps] = partitionObject(rest, (key) =>
      key.endsWith("Template"),
    );
    // Remove the *Template suffix and create renderer functions with the same name + Renderer
    const resolvedRestProps: Record<string | number | symbol, any> = {
      ...Object.fromEntries(
        Object.entries(nonTemplateProps).map(([key, value]) => [key, extractValue(value)]),
      ),
      ...Object.fromEntries(
        Object.entries(templateProps).map(([key, value]) => [
          key.replace(/Template$/, "Renderer"),
          (contextVars: Record<string, any>) => {
            return (
              <MemoizedItem
                contextVars={contextVars}
                node={value}
                renderChild={renderChild}
                layoutContext={layoutContext}
              />
            );
          },
        ]),
      ),
    };

    const formItemType = extractValue.asOptionalString(type);
    const isCustomFormItem =
      (formItemType === undefined || formItemType === "custom") && !!node.children;
    const inputTemplate = node.children || node.props?.inputTemplate;

    return (
      <FormItem
        // --- validation props
        required={extractValue.asOptionalBoolean(required)}
        requiredInvalidMessage={extractValue.asOptionalString(requiredInvalidMessage)}
        minLength={extractValue.asOptionalNumber(minLength)}
        maxLength={extractValue.asOptionalNumber(maxLength)}
        lengthInvalidMessage={extractValue.asOptionalString(lengthInvalidMessage)}
        lengthInvalidSeverity={parseSeverity(extractValue.asOptionalString(lengthInvalidSeverity))}
        minValue={extractValue.asOptionalNumber(minValue)}
        maxValue={extractValue.asOptionalNumber(maxValue)}
        rangeInvalidMessage={extractValue.asOptionalString(rangeInvalidMessage)}
        rangeInvalidSeverity={parseSeverity(extractValue.asOptionalString(rangeInvalidSeverity))}
        pattern={extractValue.asOptionalString(pattern)}
        patternInvalidMessage={extractValue.asOptionalString(patternInvalidMessage)}
        patternInvalidSeverity={parseSeverity(
          extractValue.asOptionalString(patternInvalidSeverity),
        )}
        regex={extractValue.asOptionalString(regex)}
        regexInvalidMessage={extractValue.asOptionalString(regexInvalidMessage)}
        regexInvalidSeverity={parseSeverity(extractValue.asOptionalString(regexInvalidSeverity))}
        //  ----
        className={className}
        layoutContext={layoutContext}
        labelBreak={extractValue.asOptionalBoolean(labelBreak)}
        labelWidth={extractValue.asOptionalString(labelWidth)}
        bindTo={extractValue.asString(bindTo)}
        autoFocus={extractValue.asOptionalBoolean(autoFocus)}
        enabled={extractValue.asOptionalBoolean(enabled)}
        label={extractValue.asOptionalString(label)}
        labelPosition={extractValue.asOptionalString(labelPosition)}
        type={isCustomFormItem ? "custom" : (formItemType as any)}
        onValidate={lookupEventHandler("validate")}
        customValidationsDebounce={extractValue.asOptionalNumber(customValidationsDebounce)}
        validationMode={extractValue.asOptionalString(validationMode)}
        requireLabelMode={extractValue.asOptionalString(rest.requireLabelMode)}
        registerComponentApi={registerComponentApi}
        maxTextLength={extractValue(maxTextLength)}
        itemIndex={extractValue("{$itemIndex}")}
        initialValue={extractValue(node.props.initialValue)}
        noSubmit={extractValue.asOptionalBoolean(noSubmit)}
        inputRenderer={
          inputTemplate
            ? (contextVars: Record<string, any>) => (
                <MemoizedItem
                  contextVars={contextVars}
                  node={inputTemplate}
                  renderChild={renderChild}
                  layoutContext={layoutContext}
                />
              )
            : undefined
        }
        gap={extractValue.asOptionalString(gap)}
        {...resolvedRestProps}
      >
        {isCustomFormItem ? (
          <CustomFormItem
            renderChild={renderChild}
            node={node as any}
            bindTo={extractValue.asString(bindTo)}
          />
        ) : (
          renderChild(node.children, {
            type: formItemType,
          })
        )}
      </FormItem>
    );
  },
);
