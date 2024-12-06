import type { CSSProperties, ReactNode } from "react";
import { Fragment, memo, useCallback, useEffect, useMemo } from "react";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type {
  FormItemValidations,
  ValidateEventHandler,
  ValidationMode,
} from "@components/Form/FormContext";
import { useFormContextPart } from "@components/Form/FormContext";
import { TextBox } from "@components/TextBox/TextBoxNative";
import { Toggle } from "@components/Toggle/Toggle";
import { FileInput } from "@components/FileInput/FileInputNative";
import { NumberBox } from "@components/NumberBox/NumberBoxNative";
import { Select } from "@components/Select/SelectNative";
import { RadioGroup } from "@components/RadioGroup/RadioGroupNative";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { HelperText } from "@components/FormItem/HelperText";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useValidation, useValidationDisplay } from "./Validations";
import {
  fieldChanged,
  fieldFocused,
  fieldInitialized,
  fieldLostFocus,
} from "@components/Form/formActions";
import { TextArea } from "@components/TextArea/TextAreaNative";
import { useEvent } from "@components-core/utils/misc";
import { ItemWithLabel } from "./ItemWithLabel";
import { DatePicker } from "@components/DatePicker/DatePickerNative";
import { getByPath } from "@components/Form/FormNative";
import { asOptionalBoolean } from "@components-core/container/valueExtractor";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { FormItemMd } from "./FormItem";
import { AutoComplete } from "@components/AutoComplete/AutoCompleteNative";
import type { LabelPosition } from "@components/abstractions";

type FormControlType =
  | "text"
  | "password"
  | "textarea"
  | "checkbox"
  | "number"
  | "integer"
  | "file"
  | "select"
  | "autocomplete"
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

export const FormItem = memo(function FormItem({
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
  const labelBreakValue = useFormContextPart((value) =>
    labelBreak !== undefined ? labelBreak : value.itemLabelBreak,
  );
  const labelPositionValue = useFormContextPart<any>(
    (value) => labelPosition || value.itemLabelPosition || DEFAULT_LABEL_POSITIONS[type],
  );
  const initialValueFromSubject = useFormContextPart<any>((value) =>
    getByPath(value.originalSubject, bindTo),
  );
  const initialValue =
    initialValueFromSubject === undefined ? rest.initialValue : initialValueFromSubject;
  const value = useFormContextPart<any>((value) => getByPath(value.subject, bindTo));
  const validationResult = useFormContextPart((value) => value.validationResults[bindTo]);
  const dispatch = useFormContextPart((value) => value.dispatch);
  const formEnabled = useFormContextPart((value) => value.enabled);

  const isEnabled = enabled && formEnabled;

  useEffect(() => {
    dispatch(fieldInitialized(bindTo, initialValue));
  }, [bindTo, dispatch, initialValue]);

  useValidation(validations, onValidate, value, dispatch, bindTo, customValidationsDebounce);

  const onStateChange = useCallback(
    ({ value }: any) => {
      dispatch(fieldChanged(bindTo, value));
    },
    [bindTo, dispatch],
  );

  const { validationStatus, isHelperTextShown } = useValidationDisplay(
    bindTo,
    value,
    validationResult,
    validationMode,
  );

  let formControl = null;
  switch (type) {
    case "select": {
      formControl = (
        <Select
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={isEnabled}
          validationStatus={validationStatus}
        >
          {children}
        </Select>
      );
      break;
    }
    case "autocomplete": {
      formControl = (
        <AutoComplete
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          enabled={isEnabled}
          validationStatus={validationStatus}
        >
          {children}
        </AutoComplete>
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
          enabled={isEnabled}
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
        enabled={isEnabled}
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

type FormItemComponentDef = ComponentDef<typeof FormItemMd>;

export function CustomFormItem({
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

  return <>{renderChild(decoratedMetadata as any)}</>;
}
