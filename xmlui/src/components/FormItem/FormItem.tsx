import type { CSSProperties, ReactNode } from "react";
import { Fragment, memo, useCallback, useEffect, useMemo } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "./FormItem.module.scss";
import type { FormItemValidations, ValidateEventHandler, ValidationMode } from "@components/Form/FormContext";
import { useFormContextPart } from "@components/Form/FormContext";
import { TextBox } from "@components/TextBox/TextBox";
import { Toggle } from "@components/Toggle/Toggle";
import { FileInput } from "@components/FileInput/FileInputNative";
import { NumberBox } from "@components/NumberBox/NumberBox";
import { Select } from "@components/Select/Select";
import { RadioGroup } from "@components/RadioGroup/RadioGroup";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { HelperText } from "@components/FormItem/HelperText";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { parseSeverity, useValidation, useValidationDisplay } from "./Validations";
import { Combobox } from "@components/Combobox/ComboboxNative";
import { MultiCombobox } from "@components/MultiCombobox/MultiCombobox";
import { fieldChanged, fieldFocused, fieldInitialized, fieldLostFocus } from "@components/Form/formActions";
import { TextArea } from "@components/TextArea/TextArea";
import { useEvent } from "@components-core/utils/misc";
import { MultiSelect } from "@components/MultiSelect/MultiSelect";
import type { LabelPosition } from "./ItemWithLabel";
import { ItemWithLabel } from "./ItemWithLabel";
import { DatePicker } from "@components/DatePicker/DatePickerNative";
import { getByPath } from "@components/Form/Form";
import { asOptionalBoolean } from "@components-core/container/valueExtractor";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

type FormControlType =
  | "text"
  | "password"
  | "textarea"
  | "checkbox"
  | "number"
  | "integer"
  | "file"
  | "select"
  | "multiSelect"
  | "datePicker"
  | "radioGroup"
  | "custom"
  | "combobox"
  | "multiCombobox"
  | "switch";

const DEFAULT_LABEL_POSITIONS: Record<FormControlType | string, LabelPosition> = {
  checkbox: "right",
};

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  bindTo: string;
  type?: FormControlType;
  labelPosition?: LabelPosition;
  autoFocus?: boolean;
  enabled?: boolean;
  required?: boolean;
  label?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  validations: FormItemValidations;
  onValidate?: ValidateEventHandler;
  customValidationsDebounce?: number;
  validationMode?: ValidationMode;
  initialValue?: any;
  registerComponentApi?: RegisterComponentApiFn;
  syncToValidation?: boolean;
  maxTextLength?: number;
};

const FormItem = memo(function FormItem({
  style,
  bindTo,
  type = "text",
  label,
  enabled = true,
  labelPosition,
  labelWidth,
  labelBreak = true,
  children,
  validations,
  onValidate,
  customValidationsDebounce,
  validationMode,
  registerComponentApi,
  syncToValidation = true,
  maxTextLength,
  ...rest
}: Props) {
  const labelWidthValue = useFormContextPart((value) => labelWidth || value.itemLabelWidth);
  const labelBreakValue = useFormContextPart((value) => (labelBreak !== undefined ? labelBreak : value.itemLabelBreak));
  const labelPositionValue = useFormContextPart<any>(
    (value) => labelPosition || value.itemLabelPosition || DEFAULT_LABEL_POSITIONS[type]
  );
  const initialValueFromSubject = useFormContextPart<any>((value) => getByPath(value.originalSubject, bindTo));
  const initialValue = initialValueFromSubject === undefined ? rest.initialValue : initialValueFromSubject;
  const value = useFormContextPart<any>((value) => getByPath(value.subject, bindTo));
  const validationResult = useFormContextPart((value) => value.validationResults[bindTo]);
  const dispatch = useFormContextPart((value) => value.dispatch);

  useEffect(() => {
    dispatch(fieldInitialized(bindTo, initialValue));
  }, [bindTo, dispatch, initialValue]);

  useValidation(validations, onValidate, value, dispatch, bindTo, customValidationsDebounce);

  const onStateChange = useCallback(
    ({ value }: any) => {
      dispatch(fieldChanged(bindTo, value));
    },
    [bindTo, dispatch]
  );

  const { validationStatus, isHelperTextShown } = useValidationDisplay(bindTo, value, validationResult, validationMode);

  let formControl = null;
  switch (type) {
    case "combobox": {
      formControl = (
        <Combobox
          {...rest}
          value={value}
          updateState={onStateChange}
          enabled={enabled}
          validationStatus={validationStatus}
          registerComponentApi={registerComponentApi}
        >
          {children}
        </Combobox>
      );
      break;
    }
    case "multiCombobox": {
      formControl = (
        <MultiCombobox
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
        >
          {children}
        </MultiCombobox>
      );
      break;
    }
    case "select": {
      formControl = (
        <Select
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
        >
          {children}
        </Select>
      );
      break;
    }
    case "multiSelect": {
      formControl = (
        <MultiSelect
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
        >
          {children}
        </MultiSelect>
      );
      break;
    }
    case "datePicker": {
      formControl = (
        <DatePicker
          {...rest}
          value={value}
          updateState={onStateChange}
          // registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
        />
      );
      break;
    }
    case "radioGroup": {
      formControl = (
        <RadioGroup
          {...rest}
          value={value}
          updateState={onStateChange}
          // registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
        >
          {children}
        </RadioGroup>
      );
      break;
    }
    case "number":
    case "integer": {
      formControl = (
        <NumberBox
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          integersOnly={type === "integer"}
          validationStatus={validationStatus}
          min={syncToValidation ? validations.minValue : undefined}
          max={syncToValidation ? validations.maxValue : undefined}
          maxLength={maxTextLength ?? (syncToValidation ? validations?.maxLength : undefined)}
        ></NumberBox>
      );
      break;
    }
    case "switch":
    case "checkbox": {
      formControl = (
        <Toggle
          {...rest}
          value={value}
          updateState={onStateChange}
          // registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
          variant={type}
        />
      );
      break;
    }
    case "file": {
      formControl = (
        <FileInput
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
          multiple={asOptionalBoolean((rest as any).multiple, false)} //TODO come up with something for this
        />
      );
      break;
    }
    case "text": {
      formControl = (
        <TextBox
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
          maxLength={maxTextLength ?? (syncToValidation ? validations?.maxLength : undefined)}
        />
      );
      break;
    }
    case "password": {
      formControl = (
        <TextBox
          {...rest}
          type={"password"}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
          maxLength={maxTextLength ?? (syncToValidation ? validations?.maxLength : undefined)}
        />
      );
      break;
    }
    case "textarea": {
      formControl = (
        <TextArea
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={enabled}
          validationStatus={validationStatus}
          maxLength={maxTextLength ?? (syncToValidation ? validations?.maxLength : undefined)}
        />
      );
      break;
    }
    case "custom": {
      formControl = children;
      break;
    }
    default: {
      console.warn(`unknown form item type ${type}`);
      formControl = <div>{value}</div>;
      break;
    }
  }

  const onFocus = useEvent(() => {
    dispatch(fieldFocused(bindTo));
  });

  const onBlur = useEvent(() => {
    dispatch(fieldLostFocus(bindTo));
  });
  const [animateContainerRef] = useAutoAnimate({ duration: 100 });

  return (
    <>
      <ItemWithLabel
        labelPosition={labelPositionValue}
        label={label}
        labelWidth={labelWidthValue}
        labelBreak={labelBreakValue}
        enabled={enabled}
        required={validations.required}
        validationInProgress={validationResult?.partial}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        validationResult={
          <div ref={animateContainerRef}>
            {isHelperTextShown &&
              validationResult?.validations.map((singleValidation, i) => (
                <Fragment key={i}>
                  {singleValidation.isValid && singleValidation.validMessage && (
                    <HelperText
                      text={singleValidation.validMessage}
                      status={"valid"}
                      style={{ opacity: singleValidation.stale ? 0.5 : undefined }}
                    />
                  )}
                  {!singleValidation.isValid && singleValidation.invalidMessage && (
                    <HelperText
                      text={singleValidation.invalidMessage}
                      status={singleValidation.severity}
                      style={{ opacity: singleValidation.stale ? 0.5 : undefined }}
                    />
                  )}
                </Fragment>
              ))}
          </div>
        }
      >
        {formControl}
      </ItemWithLabel>
    </>
  );
});

function CustomFormItem({
  renderChild,
  node,
  bindTo,
}: {
  renderChild: RenderChildFn;
  node: FormItemComponentDef;
  bindTo: string;
}) {
  const value = useFormContextPart<any>((value) => getByPath(value.subject, bindTo));
  const validationResult = useFormContextPart((value) => value.validationResults[bindTo]);
  const dispatch = useFormContextPart((value) => value.dispatch);

  const decoratedMetadata = useMemo(() => {
    return {
      type: "Container",
      uid: "formFieldContainer - " + bindTo,
      vars: node.vars,
      contextVars: {
        $value: value,
        $setValue: (newValue: any) => {
          dispatch(fieldChanged(bindTo, newValue));
        },
        $validationResult: validationResult,
      },
      children: node.children,
    };
  }, [bindTo, dispatch, node.children, node.vars, validationResult, value]);

  return <>{renderChild(decoratedMetadata)}</>;
}

/**
 * A `FormItem` component represents a single input element within a `Form`. The value within
 * the `FormItem` may be associated with a particular property within the encapsulating `Form` component's
 * data.
 *
 * You can learn more about this component in the [Using Forms](../learning/using-components/forms.mdx)
 * article.
 */
export interface FormItemComponentDef extends ComponentDef<"FormItem"> {
  props: {
    /** @descriptionRef */
    bindTo: string;
    /** @descriptionRef */
    autoFocus?: string;
    /** @descriptionRef */
    label?: string;
    /** @descriptionRef */
    labelPosition?: string;
    /**
     * This property sets the width of the item label.
     */
    labelWidth?: number;
    /**
     * This boolean value indicates if the label can be split into multiple lines if it would overflow
     * the available label width.
     */
    labelBreak?: boolean;
    /** @descriptionRef */
    enabled?: string;
    /** @descriptionRef */
    type?: string;
    /** @descriptionRef */
    customValidationsDebounce?: number;
    /** @descriptionRef */
    validationMode?: string;
    /** @descriptionRef */
    initialValue?: string;
    /**
     * This boolean property indicates if the following validation properties should override the
     * underlying controls' properties (by default, \`true\`):
     * - \`maxLength\` --> Set the \`maxTextLength\` property value of \`Text\` or \`TextArea\` if
     * that value is not defined.
     * - \`minValue\` --> Set the \`min\` property value of \`NumberBox\`.
     * - \`maxValue\` --> Set the \`max\` property value of \`NumberBox\`.
     */
    syncToValidation?: boolean;
    /** @descriptionRef */
    required?: string;
    /** @descriptionRef */
    requiredInvalidMessage?: string;
    /** @descriptionRef */
    minLength?: string;
    /** @descriptionRef */
    maxLength?: string;
    /**
     * The maximum length of the text in the input field.
     */
    maxTextLength?: number;
    /** @descriptionRef */
    lengthInvalidMessage?: string;
    /** @descriptionRef */
    lengthInvalidSeverity?: string;
    /** @descriptionRef */
    minValue?: string;
    /** @descriptionRef */
    maxValue?: string;
    /** @descriptionRef */
    rangeInvalidMessage?: string;
    /** @descriptionRef */
    rangeInvalidSeverity?: string;
    /** @descriptionRef */
    pattern?: string;
    /** @descriptionRef */
    patternInvalidMessage?: string;
    /** @descriptionRef */
    patternInvalidSeverity?: string;
    /** @descriptionRef */
    regex?: string;
    /** @descriptionRef */
    regexInvalidMessage?: string;
    /** @descriptionRef */
    regexInvalidSeverity?: string;
  };
  events: {
    /** @descriptionRef */
    validate: string;
  };
  contextVars: {
    /**
     * The context variable represents the current value of the \`FormItem\`. It can be used in
     * expressions and code snippets within the \`FormItem\` instance.
     */
    $value: any;

    /**
     * This function can be invoked to set the \`FormItem\` instance's value. The function has a
     * single argument, the new value to set.
     */
    $setValue: (newValue: any) => void;

    /**
     * This variable represents the result of the latest validation of the \`FormItem\` instance.
     */
    $validationResult: any;
  };
}

export const FormItemMd: ComponentDescriptor<FormItemComponentDef> = {
  displayName: "FormItem",
  description: "A single input element within a form",
  props: {
    bindTo: desc("The property path to bind the form item to"),
    autoFocus: desc("Indicates if the form item should automatically receive focus"),
    label: desc("The label for the form item"),
    labelPosition: desc("The position of the label relative to the form item"),
    labelWidth: desc("The width of the label"),
    labelBreak: desc("Indicates if the label can be split into multiple lines"),
    enabled: desc("Indicates if the form item is enabled"),
    type: desc("The type of form item"),
    customValidationsDebounce: desc("The debounce time for custom validations"),
    validationMode: desc("The validation mode"),
    initialValue: desc("The initial value of the form item"),
    syncToValidation: desc("Indicates if the form item should sync to validation properties"),
    required: desc("Indicates if the form item is required"),
    requiredInvalidMessage: desc("The message to display when the form item is required"),
    minLength: desc("The minimum length of the form item value"),
    maxLength: desc("The maximum length of the form item value"),
    maxTextLength: desc("The maximum length of the text in the input field"),
    lengthInvalidMessage: desc("The message to display when the form item length is invalid"),
    lengthInvalidSeverity: desc("The severity of the invalid length message"),
    minValue: desc("The minimum value of the form item"),
    maxValue: desc("The maximum value of the form item"),
    rangeInvalidMessage: desc("The message to display when the form item value is out of range"),
    rangeInvalidSeverity: desc("The severity of the out of range message"),
    pattern: desc("The pattern to match the form item value"),
    patternInvalidMessage: desc("The message to display when the form item value does not match the pattern"),
    patternInvalidSeverity: desc("The severity of the pattern mismatch message"),
    regex: desc("The regex to match the form item value"),
    regexInvalidMessage: desc("The message to display when the form item value does not match the regex"),
    regexInvalidSeverity: desc("The severity of the regex mismatch message"),
  },
  events: {
    validate: desc("The event fired when the form item is validated"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-text-FormItemLabel": "$color-text-primary",
    "font-size-FormItemLabel": "$font-size-small",
    "font-weight-FormItemLabel": "$font-weight-medium",
    "font-style-FormItemLabel": "normal",
    "text-transform-FormItemLabel": "none",
    "color-text-FormItemLabel-requiredMark": "$color-danger-400",
  },
};

export const formItemComponentRenderer = createComponentRenderer<FormItemComponentDef>(
  "FormItem",
  ({ node, renderChild, extractValue, layoutCss, lookupEventHandler, lookupAction, registerComponentApi }) => {
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
      syncToValidation,
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
          })
        );
    const resolvedRestProps = extractValue(nonLayoutCssProps);
    const formItemType = extractValue.asOptionalString(type);
    const isCustomFormItem = formItemType === undefined && !!node.children;

    return (
      <FormItem
        style={layoutCss}
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
        syncToValidation={extractValue.asOptionalBoolean(syncToValidation)}
        maxTextLength={extractValue(maxTextLength)}
        {...resolvedRestProps}
      >
        {isCustomFormItem ? (
          <CustomFormItem renderChild={renderChild} node={node} bindTo={extractValue.asString(bindTo)} />
        ) : (
          renderChild(node.children)
        )}
      </FormItem>
    );
  },
  FormItemMd
);
