import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
} from "react";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { FormItemValidations, ValidationSeverity } from "../Form/FormContext";
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
import type { LabelPosition, RequireLabelMode } from "../abstractions";
import { ItemWithLabel } from "./ItemWithLabel";
import { useShallowCompareMemoize } from "../../components-core/utils/hooks";

type FormBindingWrapperProps = {
  children: ReactElement;
  bindTo: string;
  initialValue?: any;
  noSubmit?: boolean;
  validations: FormItemValidations;
  requireLabelMode?: RequireLabelMode;
  // Optional label props
  label?: string;
  labelPosition?: LabelPosition;
  labelWidth?: string;
  labelBreak?: boolean;
  enabled?: boolean;
  style?: CSSProperties;
  className?: string;
  registerComponentApi?: RegisterComponentApiFn;
  validationStatus?: ValidationSeverity;
  invalidMessages?: string[];
  validationResult?: ReactNode;
  validationInProgress?: boolean;
};

export function FormBindingWrapper({
  children,
  bindTo,
  initialValue: initialValueFromProps,
  noSubmit = false,
  validations: validationsInput,
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  requireLabelMode,
  enabled = true,
  style,
  className,
  registerComponentApi,
  validationStatus,
  invalidMessages,
  validationResult,
  validationInProgress,
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
  const dispatch = useFormContextPart((value) => value?.dispatch);
  const formEnabled = useFormContextPart((value) => value?.enabled);
  const formRequireLabelMode = useFormContextPart((value) => value?.itemRequireLabelMode);

  const isEnabled = enabled && formEnabled;

  // Initialize field in Form
  useEffect(() => {
    if (!isInsideForm) return;
    dispatch(fieldInitialized(formItemId, initialValue, false, noSubmit));
  }, [dispatch, formItemId, initialValue, noSubmit, isInsideForm]);

  const childUpdateState = (children as any)?.props?.updateState;
  const childRegisterComponentApi = (children as any)?.props?.registerComponentApi;

  // Handle value changes
  const onStateChange = useCallback(
    ({ value }: any, options?: any) => {
      childUpdateState?.({ value }, options);
      if (!isInsideForm) return;
      // We already handled the initial value in the useEffect with fieldInitialized
      if (!options?.initial) {
        dispatch(fieldChanged(formItemId, value));
      }
    },
    [childUpdateState, formItemId, dispatch, isInsideForm],
  );

  // Cleanup on unmount
  useEffect(() => {
    if (!isInsideForm) return;
    return () => {
      dispatch(fieldRemoved(formItemId));
    };
  }, [formItemId, dispatch, isInsideForm]);

  // Focus/blur handlers for validation modes
  const onFocus = useEvent(() => {
    if (!isInsideForm) return;
    dispatch(fieldFocused(formItemId));
  });

  const onBlur = useEvent(() => {
    if (!isInsideForm) return;
    dispatch(fieldLostFocus(formItemId));
  });

  // If not inside a form, or if already inside a FormItem, just render the children
  // The FormItem will handle the form binding in that case
  if (!isInsideForm || isInsideFormItem) {
    return children;
  }

  // Clone the input component and inject form-related props
  const enhancedInput = cloneElement(children, {
    value,
    updateState: onStateChange,
    onFocus,
    onBlur,
    enabled: isEnabled,
    validationStatus,
    invalidMessages,
    registerComponentApi: registerComponentApi ?? childRegisterComponentApi,
  });

  return (
    <ItemWithLabel
      labelPosition={labelPositionValue}
      label={label}
      labelWidth={labelWidthValue}
      labelBreak={labelBreakValue}
      enabled={isEnabled}
      required={validations.required}
      validationInProgress={validationInProgress}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
      className={className}
      validationResult={validationResult}
      requireLabelMode={requireLabelMode ?? formRequireLabelMode}
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
