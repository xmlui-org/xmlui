import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  cloneElement,
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
} from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type {
  FormItemValidations,
  ValidateEventHandler,
  ValidationMode,
} from "../Form/FormContext";
import { useFormContextPart, useIsInsideForm } from "../Form/FormContext";
import { useIsInsideFormItem } from "./FormItemNative";
import {
  fieldChanged,
  fieldFocused,
  fieldInitialized,
  fieldLostFocus,
  fieldRemoved,
} from "../Form/formActions";
import { getByPath } from "../Form/FormNative";
import { useEvent } from "../../components-core/utils/misc";
import type { LabelPosition } from "../abstractions";
import { ItemWithLabel } from "./ItemWithLabel";
import { useValidation, useValidationDisplay } from "./Validations";
import { HelperText } from "./HelperText";
import { useShallowCompareMemoize } from "../../components-core/utils/hooks";
import styles from "./FormItem.module.scss";

type FormBindingWrapperProps = {
  children: ReactElement;
  bindTo: string;
  initialValue?: any;
  noSubmit?: boolean;
  validations: FormItemValidations;
  onValidate?: ValidateEventHandler;
  customValidationsDebounce?: number;
  validationMode?: ValidationMode;
  // Optional label props
  label?: string;
  labelPosition?: LabelPosition;
  labelWidth?: string;
  labelBreak?: boolean;
  enabled?: boolean;
  style?: CSSProperties;
  className?: string;
  registerComponentApi?: RegisterComponentApiFn;
};

export function FormBindingWrapper({
  children,
  bindTo,
  initialValue: initialValueFromProps,
  noSubmit = false,
  validations: validationsInput,
  onValidate,
  customValidationsDebounce = 0,
  validationMode,
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  enabled = true,
  style,
  className,
  registerComponentApi,
}: FormBindingWrapperProps) {
  const validations = useShallowCompareMemoize(validationsInput);
  const defaultId = useId();
  const formItemId = useMemo(() => {
    return bindTo || defaultId;
  }, [bindTo, defaultId]);

  // Check if we're inside a form and/or inside a FormItem
  const isInsideForm = useIsInsideForm();
  const isInsideFormItem = useIsInsideFormItem();

  // Get form context values
  const labelWidthValue = useFormContextPart((value) => labelWidth || value?.itemLabelWidth);
  const labelBreakValue = useFormContextPart((value) =>
    labelBreak !== undefined ? labelBreak : value?.itemLabelBreak,
  );
  const labelPositionValue = useFormContextPart<any>(
    (value) => labelPosition || value?.itemLabelPosition,
  );
  const initialValueFromSubject = useFormContextPart<any>((value) =>
    getByPath(value?.originalSubject, formItemId),
  );
  const initialValue =
    (initialValueFromSubject === undefined || initialValueFromSubject === null)
      ? initialValueFromProps
      : initialValueFromSubject;

  const value = useFormContextPart<any>((value) => getByPath(value?.subject, formItemId));
  const validationResult = useFormContextPart((value) => value?.validationResults[formItemId]);
  const dispatch = useFormContextPart((value) => value?.dispatch);
  const formEnabled = useFormContextPart((value) => value?.enabled);
  const verboseValidationFeedback = useFormContextPart((value) => value?.verboseValidationFeedback);

  const isEnabled = enabled && formEnabled;

  // Initialize field in Form
  useEffect(() => {
    if (!isInsideForm) return;
    dispatch(fieldInitialized(formItemId, initialValue, false, noSubmit));
  }, [dispatch, formItemId, initialValue, noSubmit, isInsideForm]);

  // Run validations
  useValidation(validations, onValidate, value, dispatch, formItemId, customValidationsDebounce);

  // Handle value changes
  const onStateChange = useCallback(
    ({ value }: any, options?: any) => {
      if (!isInsideForm) return;
      // We already handled the initial value in the useEffect with fieldInitialized
      if (!options?.initial) {
        dispatch(fieldChanged(formItemId, value));
      }
    },
    [formItemId, dispatch, isInsideForm],
  );

  // Cleanup on unmount
  useEffect(() => {
    if (!isInsideForm) return;
    return () => {
      dispatch(fieldRemoved(formItemId));
    };
  }, [formItemId, dispatch, isInsideForm]);

  // Get validation display state
  const { validationStatus, isHelperTextShown: isHelperTextShownHook } = useValidationDisplay(
    formItemId,
    value,
    validationResult,
    validationMode ?? "errorLate",
  );

  // We use useFormContextPart to access forceShowValidationResult efficiently.
  // This avoids re-rendering the component on every form state change which happens
  // when using useContext(FormContext).
  const forceShowValidationResult = useFormContextPart(
    (value) => value?.interactionFlags[formItemId]?.forceShowValidationResult
  );
  
  const isHelperTextShown = isHelperTextShownHook || !!forceShowValidationResult;

  // Focus/blur handlers for validation modes
  const onFocus = useEvent(() => {
    if (!isInsideForm) return;
    dispatch(fieldFocused(formItemId));
  });

  const onBlur = useEvent(() => {
    if (!isInsideForm) return;
    dispatch(fieldLostFocus(formItemId));
  });

  const [animateContainerRef] = useAutoAnimate({ duration: 100 });

  // If not inside a form, or if already inside a FormItem, just render the children
  // The FormItem will handle the form binding in that case
  if (!isInsideForm || isInsideFormItem) {
    return children;
  }

  // Get the first invalid message from validation results
  const invalidMessage = validationResult?.validations.find(
    (v) => !v.isValid && v.invalidMessage
  )?.invalidMessage;

  // Clone the input component and inject form-related props
  const enhancedInput = cloneElement(children, {
    value,
    updateState: onStateChange,
    onFocus,
    onBlur,
    enabled: isEnabled,
    validationStatus,
    invalidMessage,
    registerComponentApi,
  });

  // Create validation result display (hidden when verboseValidationFeedback is enabled)
  const validationResultDisplay = verboseValidationFeedback ? null : (
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
  );

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
      validationResult={validationResultDisplay}
    >
      {enhancedInput}
    </ItemWithLabel>
  );
}

/**
 * Hook that provides form binding functionality for use in components.
 * This can be used when you need more control over how form binding works.
 */
export function useFormBinding(bindTo: string, options?: {
  initialValue?: any;
  noSubmit?: boolean;
}) {
  const defaultId = useId();
  const isInsideForm = useIsInsideForm();
  
  const formItemId = useMemo(() => {
    return bindTo || defaultId;
  }, [bindTo, defaultId]);
  
  return {
    isInsideForm,
    formItemId
  };
}
