import styles from "./FormItem.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import type { FormItemValidations } from "../Form/FormContext";
import {
  dAutoFocus,
  dEnabled,
  dInitialValue,
  dLabel,
  dLabelPosition,
  dRequired,
} from "../metadata-helpers";
import { parseSeverity } from "./Validations";
import { CustomFormItem, FormItem } from "./FormItemNative";
import { MemoizedItem } from "../container-helpers";

const COMP = "FormItem";

export const FormItemMd = createMetadata({
  status: "experimental",
  description:
    `A \`${COMP}\` component represents a single input element within a \`Form\`. The value within ` +
    `the \`${COMP}\` may be associated with a particular property within the encapsulating \`Form\` ` +
    `component's data.`,
  props: {
    bindTo: d(
      `This property binds a particular input field to one of the attributes of the \`Form\` data. ` +
        `It names the property of the form's \`data\` data to get the input's initial value.` +
        `When the field is saved, its value will be stored in the \`data\` property with this name.`,
    ),
    autoFocus: dAutoFocus(),
    label: dLabel(),
    labelPosition: dLabelPosition(),
    labelWidth: d(`This property sets the width of the item label.`),
    labelBreak: d(
      `This boolean value indicates if the label can be split into multiple lines if it would ` +
        `overflow the available label width.`,
    ),
    enabled: dEnabled(),
    type: d(
      `This property is used to determine the specific input control the FormItem will wrap ` +
        `around. Note that the control names start with a lowercase letter and map to input ` +
        `components found in XMLUI.`,
    ),
    customValidationsDebounce: d(
      `This optional number prop determines the time interval between two runs of a custom validation.`,
    ),
    validationMode: d(
      `This property sets what kind of validation mode or strategy to employ for a particular ` +
        `input field.`,
    ),
    initialValue: dInitialValue(),
    required: dRequired(),
    requiredInvalidMessage: d(
      `This optional string property is used to customize the message that is displayed if the ` +
        `field is not filled in.`,
    ),
    minLength: d(`Checks whether the input has a minimum length of a specified value.`),
    maxLength: d(`Checks whether the input has a maximum length of a specified value.`),
    maxTextLength: d(`The maximum length of the text in the input field`),
    lengthInvalidMessage: d(
      `This optional string property is used to customize the message that is displayed on a failed ` +
        `length check: [minLength](#minlength) or [maxLength](#maxlength).`,
    ),
    lengthInvalidSeverity: d(`This property sets the severity level of length validations.`),
    minValue: d(`Checks whether the input has the minimum specified value.`),
    maxValue: d(`Checks whether the input has the maximum specified value.`),
    rangeInvalidMessage: d(
      `This optional string property is used to customize the message that is displayed when ` +
        `a value is out of range.`,
    ),
    rangeInvalidSeverity: d(`This property sets the severity level of the value range validation.`),
    pattern: d(`Checks whether the input fits a predefined regular expression.`),
    patternInvalidMessage: d(
      `This optional string property is used to customize the message that is displayed on a ` +
        `failed pattern test.`,
    ),
    patternInvalidSeverity: d(`This property sets the severity level of the pattern validation.`),
    regex: d(`Checks whether the input fits the provided regular expression.`),
    regexInvalidMessage: d(
      `This optional string property is used to customize the message that is displayed on a ` +
        `failed regular expression test.`,
    ),
    regexInvalidSeverity: d(
      `This property sets the severity level of regular expression validation.`,
    ),
    inputTemplate: d("This property is used to define a custom input template."),
  },
  events: {
    validate: d(`This event is used to define a custom validation function.`),
  },
  contextVars: {
    $value: d(
      `The context variable represents the current value of the \`${COMP}\`. It can be used in ` +
        `expressions and code snippets within the \`${COMP}\` instance.`,
    ),
    $setValue: d(
      `This function can be invoked to set the \`${COMP}\` instance's value. The function has a ` +
        `single argument, the new value to set.`,
    ),
    $validationResult: d(
      `This variable represents the result of the latest validation of the \`${COMP}\` instance.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-FormItemLabel": "$color-text-primary",
    "font-size-FormItemLabel": "$font-size-small",
    "font-weight-FormItemLabel": "$font-weight-medium",
    "font-style-FormItemLabel": "normal",
    "transform-text-FormItemLabel": "none",
    "color-text-FormItemLabel-requiredMark": "$color-danger-400",
  },
});

export const formItemComponentRenderer = createComponentRenderer(
  COMP,
  FormItemMd,
  ({
    node,
    renderChild,
    extractValue,
    layoutCss,
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
      ...rest
    } = node.props;

    //extractValue works as a memoization mechanism too (if there's nothing to resolve, it won't produce a new object every time)
    const resolvedValidationPropsAndEvents: FormItemValidations = extractValue({
      required: extractValue.asOptionalBoolean(required),
      requiredInvalidMessage: extractValue.asOptionalString(requiredInvalidMessage),
      minLength: extractValue.asOptionalNumber(minLength),
      maxLength: extractValue.asOptionalNumber(maxLength),
      lengthInvalidMessage: extractValue.asOptionalString(lengthInvalidMessage),
      lengthInvalidSeverity: parseSeverity(extractValue.asOptionalString(lengthInvalidSeverity)),
      minValue: extractValue.asOptionalNumber(minValue),
      maxValue: extractValue.asOptionalNumber(maxValue),
      rangeInvalidMessage: extractValue.asOptionalString(rangeInvalidMessage),
      rangeInvalidSeverity: parseSeverity(extractValue.asOptionalString(rangeInvalidSeverity)),
      pattern: extractValue.asOptionalString(pattern),
      patternInvalidMessage: extractValue.asOptionalString(patternInvalidMessage),
      patternInvalidSeverity: parseSeverity(extractValue.asOptionalString(patternInvalidSeverity)),
      regex: extractValue.asOptionalString(regex),
      regexInvalidMessage: extractValue.asOptionalString(regexInvalidMessage),
      regexInvalidSeverity: parseSeverity(extractValue.asOptionalString(regexInvalidSeverity)),
    });

    const nonLayoutCssProps = !layoutCss
      ? rest
      : Object.fromEntries(
          Object.entries(rest).filter(([key, _]) => {
            return !layoutCss?.hasOwnProperty(key);
          }),
        );
    const resolvedRestProps = extractValue(nonLayoutCssProps);
    const formItemType = extractValue.asOptionalString(type);
    const isCustomFormItem = formItemType === undefined && !!node.children;
    const inputTemplate = node.children || node.props?.inputTemplate;

    return (
      <FormItem
        style={layoutCss}
        layoutContext={layoutContext}
        labelBreak={extractValue.asOptionalBoolean(labelBreak)}
        labelWidth={extractValue.asOptionalString(labelWidth)}
        bindTo={extractValue.asString(bindTo)}
        autoFocus={extractValue.asOptionalBoolean(autoFocus)}
        enabled={extractValue.asOptionalBoolean(enabled)}
        label={extractValue.asOptionalString(label)}
        labelPosition={extractValue.asOptionalString(labelPosition)}
        type={isCustomFormItem ? "custom" : formItemType}
        validations={resolvedValidationPropsAndEvents}
        onValidate={lookupEventHandler("validate")}
        customValidationsDebounce={extractValue.asOptionalNumber(customValidationsDebounce)}
        validationMode={extractValue.asOptionalString(validationMode)}
        registerComponentApi={registerComponentApi}
        maxTextLength={extractValue(maxTextLength)}
        inputRenderer={
          inputTemplate
            ? (contextVars) => (
                <MemoizedItem
                  contextVars={contextVars}
                  node={inputTemplate}
                  renderChild={renderChild}
                  layoutContext={layoutContext}
                />
              )
            : undefined
        }
        {...resolvedRestProps}
      >
        {isCustomFormItem ? (
          <CustomFormItem
            renderChild={renderChild}
            node={node}
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
