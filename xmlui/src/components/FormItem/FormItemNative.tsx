import type { CSSProperties, ReactNode } from "react";
import {
  createContext,
  Fragment,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
} from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import type { RegisterComponentApiFn, RenderChildFn } from "../../abstractions/RendererDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { asOptionalBoolean } from "../../components-core/rendering/valueExtractor";
import type {
  FormControlType,
  FormItemValidations,
  ValidateEventHandler,
  ValidationMode,
} from "../Form/FormContext";
import { useFormContextPart, useIsInsideForm } from "../Form/FormContext";
import { TextBox } from "../TextBox/TextBoxNative";
import { Toggle } from "../Toggle/Toggle";
import { FileInput } from "../FileInput/FileInputNative";
import { NumberBox } from "../NumberBox/NumberBoxNative";
import { Select } from "../Select/SelectNative";
import { RadioGroup } from "../RadioGroup/RadioGroupNative";

import {
  fieldChanged,
  fieldFocused,
  fieldInitialized,
  fieldLostFocus,
  fieldRemoved,
  UNBOUND_FIELD_SUFFIX,
} from "../Form/formActions";
import { TextArea } from "../TextArea/TextAreaNative";
import { useEvent } from "../../components-core/utils/misc";
import { DatePicker } from "../DatePicker/DatePickerNative";
import { getByPath } from "../Form/FormNative";
import { AutoComplete } from "../AutoComplete/AutoCompleteNative";
import type { LabelPosition } from "../abstractions";
import type { FormItemMd } from "./FormItem";
import { ItemWithLabel } from "./ItemWithLabel";
import { useValidation, useValidationDisplay } from "./Validations";
import { Slider } from "../Slider/SliderNative";
import { ColorPicker } from "../ColorPicker/ColorPickerNative";
import { HelperText } from "./HelperText";
import { Items } from "../Items/ItemsNative";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { useShallowCompareMemoize } from "../../components-core/utils/hooks";
import styles from "./FormItem.module.scss";
import { Select2 } from "../Select/Select2Native";

const DEFAULT_LABEL_POSITIONS: Record<FormControlType | string, LabelPosition> = {
  checkbox: "end",
};

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  bindTo: string;
  type?: FormControlType;
  labelPosition?: LabelPosition;
  autoFocus?: boolean;
  enabled?: boolean;
  label?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  onValidate?: ValidateEventHandler;
  customValidationsDebounce?: number;
  validationMode?: ValidationMode;
  initialValue?: any;
  registerComponentApi?: RegisterComponentApiFn;
  maxTextLength?: number;
  inputRenderer?: any;
  itemIndex?: number;
  gap?: string;
  noSubmit?: boolean;
} & FormItemValidations;

export const defaultProps: Pick<
  Props,
  "type" | "labelBreak" | "enabled" | "customValidationsDebounce" | "gap" | "noSubmit"
> = {
  type: "text",
  labelBreak: true,
  enabled: true,
  customValidationsDebounce: 0,
  gap: "0",
  noSubmit: false,
};

const FormItemContext = createContext<any>({ parentFormItemId: null });

function ArrayLikeFormItem({
  children,
  formItemId,
  registerComponentApi,
  value = EMPTY_ARRAY,
  updateState,
}) {
  const formContextValue = useMemo(() => {
    return {
      parentFormItemId: formItemId,
    };
  }, [formItemId]);

  const addItem = useEvent((item) => {
    updateState({ value: [...value, item] });
  });

  const removeItem = useEvent((index) => {
    updateState({ value: value.filter((item, i) => i !== index) });
  });

  useEffect(() => {
    registerComponentApi?.({
      addItem: addItem,
      removeItem: removeItem,
    });
  }, [addItem, registerComponentApi, removeItem]);

  return <FormItemContext.Provider value={formContextValue}>{children}</FormItemContext.Provider>;
}

export const FormItem = memo(function FormItem({
  // --- validation props
  required,
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
  // ---
  style,
  className,
  bindTo,
  type = defaultProps.type,
  label,
  enabled = defaultProps.enabled,
  labelPosition,
  labelWidth,
  labelBreak = defaultProps.labelBreak,
  children,
  onValidate,
  customValidationsDebounce = defaultProps.customValidationsDebounce,
  validationMode,
  registerComponentApi,
  maxTextLength,
  inputRenderer,
  itemIndex,
  initialValue: initialValueFromProps,
  gap,
  noSubmit = defaultProps.noSubmit,
  ...rest
}: Props) {
  const validations: FormItemValidations = useShallowCompareMemoize({
    required,
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
  });
  const defaultId = useId();
  const { parentFormItemId } = useContext(FormItemContext);
  const formItemId = useMemo(() => {
    const safeBindTo = bindTo || `${defaultId}${UNBOUND_FIELD_SUFFIX}`;
    if (parentFormItemId) {
      if (itemIndex !== undefined) {
        let parentFieldReference = `${parentFormItemId}[${itemIndex}]`;
        if (bindTo !== undefined && bindTo.trim() === "") {
          return parentFieldReference;
        } else {
          return `${parentFieldReference}.${safeBindTo}`;
        }
      }
    } else {
      return safeBindTo;
    }
  }, [bindTo, defaultId, itemIndex, parentFormItemId]);

  const labelWidthValue = useFormContextPart((value) => labelWidth || value?.itemLabelWidth);
  const labelBreakValue = useFormContextPart((value) =>
    labelBreak !== undefined ? labelBreak : value?.itemLabelBreak,
  );
  const labelPositionValue = useFormContextPart<any>(
    (value) => labelPosition || value?.itemLabelPosition || DEFAULT_LABEL_POSITIONS[type],
  );
  const initialValueFromSubject = useFormContextPart<any>((value) =>
    getByPath(value?.originalSubject, formItemId),
  );
  const initialValue =
    initialValueFromSubject === undefined || initialValueFromSubject === null
      ? initialValueFromProps
      : initialValueFromSubject;

  const value = useFormContextPart<any>((value) => getByPath(value?.subject, formItemId));

  const validationResult = useFormContextPart((value) => value?.validationResults[formItemId]);
  const dispatch = useFormContextPart((value) => value?.dispatch);
  const formEnabled = useFormContextPart((value) => value?.enabled);

  const isEnabled = enabled && formEnabled;

  useEffect(() => {
    // Always dispatch fieldInitialized to ensure noSubmit tracking
    // Pass undefined as value when initialValue is undefined to avoid overwriting existing values
    dispatch(fieldInitialized(formItemId, initialValue, false, noSubmit));
  }, [dispatch, formItemId, initialValue, noSubmit]);

  useValidation(validations, onValidate, value, dispatch, formItemId, customValidationsDebounce);

  const onStateChange = useCallback(
    ({ value }: any, options?: any) => {
      //we already handled the initial value in the useEffect with fieldInitialized(...);
      if (!options?.initial) {
        dispatch(fieldChanged(formItemId, value));
      }
    },
    [formItemId, dispatch],
  );

  useEffect(() => {
    return () => {
      dispatch(fieldRemoved(formItemId));
    };
  }, [formItemId, dispatch]);

  const { validationStatus, isHelperTextShown } = useValidationDisplay(
    formItemId,
    value,
    validationResult,
    validationMode,
  );

  const onFocus = useEvent(() => {
    dispatch(fieldFocused(formItemId));
  });

  const onBlur = useEvent(() => {
    dispatch(fieldLostFocus(formItemId));
  });

  let formControl = null;

  switch (type) {
    case "select": {
      formControl = (
        <Select
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
        >
          {children}
        </Select>
      );
      break;
    }
    case "select2": {
      formControl = (
        <Select2
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
        >
          {children}
        </Select2>
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
          onFocus={onFocus}
          onBlur={onBlur}
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
          //registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
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
          //registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
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
          initialValue={initialValue}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          integersOnly={type === "integer"}
          validationStatus={validationStatus}
          min={validations.minValue}
          max={validations.maxValue}
          maxLength={maxTextLength ?? validations?.maxLength}
          gap={gap}
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
          registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
          variant={type}
          inputRenderer={inputRenderer}
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
          onFocus={onFocus}
          onBlur={onBlur}
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
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
          maxLength={maxTextLength ?? validations?.maxLength}
          gap={gap}
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
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
          maxLength={maxTextLength ?? validations?.maxLength}
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
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
          maxLength={maxTextLength ?? validations?.maxLength}
        />
      );
      break;
    }
    case "slider": {
      formControl = (
        <Slider
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
          min={validations.minValue}
          max={validations.maxValue}
        />
      );
      break;
    }
    case "colorpicker": {
      formControl = (
        <ColorPicker
          {...rest}
          value={value}
          updateState={onStateChange}
          registerComponentApi={registerComponentApi}
          onFocus={onFocus}
          onBlur={onBlur}
          enabled={isEnabled}
          validationStatus={validationStatus}
        />
      );
      break;
    }
    case "items": {
      formControl = (
        <ArrayLikeFormItem
          formItemId={formItemId}
          registerComponentApi={registerComponentApi}
          updateState={onStateChange}
          value={value}
        >
          <Items items={value} renderItem={inputRenderer} />
        </ArrayLikeFormItem>
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

  const [animateContainerRef] = useAutoAnimate({ duration: 100 });

  const isInsideForm = useIsInsideForm();
  if (!isInsideForm) {
    throw new Error("FormItem must be used inside a Form");
  }
  return (
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
      className={className}
      validationResult={
        <div ref={animateContainerRef} className={styles.helperTextContainer}>
          {isHelperTextShown &&
            validationResult?.validations.map((singleValidation, i) => (
              <Fragment key={i}>
                {singleValidation.isValid && !!singleValidation.validMessage && (
                  <HelperText
                    text={singleValidation.validMessage}
                    status={"valid"}
                    style={{ opacity: singleValidation.stale ? 0.5 : undefined }}
                  />
                )}
                {!singleValidation.isValid && !!singleValidation.invalidMessage && (
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
  // IMPORTANT NOTE:
  //  why we use useFormContextPart, and not useFormContext?
  //  because we want to avoid re-rendering the whole form when the form state changes.
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
