import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  cloneElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
} from "react";

import type { LayoutContext, RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { FormItemValidations, ValidationSeverity } from "../Form/FormContext";
import { useFormContextPart, useIsInsideForm } from "../Form/FormContext";
import { FormItemContext, useIsInsideFormItem } from "./FormItemContext";
import {
  fieldChanged,
  fieldFocused,
  fieldInitialized,
  fieldLostFocus,
  fieldRemoved,
  UNBOUND_FIELD_SUFFIX,
} from "../Form/formActions";
import { getByPath } from "../Form/FormReact";
import { useEvent } from "../../components-core/utils/misc";
import type { LabelPosition, RequireLabelMode } from "../abstractions";
import { ItemWithLabel } from "./ItemWithLabel";
import { useShallowCompareMemoize } from "../../components-core/utils/hooks";
import { resolveFormItemId } from "./FormItemUtils";

type FormBindingWrapperProps = {
  children: ReactElement;
  bindTo?: string;
  initialValue?: any;
  noSubmit?: boolean;
  itemIndex?: number;
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
  layoutContext?: LayoutContext;
};

export function FormBindingWrapper({
  children,
  bindTo,
  initialValue: initialValueFromProps,
  noSubmit = false,
  itemIndex,
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
  layoutContext,
}: FormBindingWrapperProps) {
  const validations = useShallowCompareMemoize(validationsInput);
  const defaultId = useId();
  const { parentFormItemId } = useContext(FormItemContext);
  const formItemId = useMemo(() => {
    return resolveFormItemId({ bindTo, defaultId, parentFormItemId, itemIndex });
  }, [bindTo, defaultId, parentFormItemId, itemIndex]);

  // Check if we're inside a form and/or inside a FormItem
  const isInsideForm = useIsInsideForm();
  const isInsideFormItem = useIsInsideFormItem();
  // When inside an items loop (itemIndex is defined), we should NOT defer to the parent FormItem
  // — the parent only manages the array, not individual sub-fields.
  const deferToParentFormItem = isInsideFormItem && itemIndex === undefined;

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
    if (!isInsideForm || deferToParentFormItem) return;
    dispatch(fieldInitialized(formItemId, initialValue, false, noSubmit));
  }, [dispatch, formItemId, initialValue, noSubmit, isInsideForm, deferToParentFormItem]);

  const childUpdateState = (children as any)?.props?.updateState;
  const childRegisterComponentApi = (children as any)?.props?.registerComponentApi;

  // Handle value changes
  const onStateChange = useCallback(
    ({ value }: any, options?: any) => {
      // formOnly:true means only update the form subject, not the wrapped component's
      // own state container. This avoids Radix Select transitioning to uncontrolled
      // mode when the form value is cleared to undefined.
      if (!options?.formOnly) {
        childUpdateState?.({ value }, options);
      }
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
    if (!isInsideForm || deferToParentFormItem) return;
    return () => {
      dispatch(fieldRemoved(formItemId));
    };
  }, [formItemId, dispatch, isInsideForm, deferToParentFormItem]);

  // Focus/blur handlers for validation modes
  const onFocus = useEvent(() => {
    if (!isInsideForm) return;
    dispatch(fieldFocused(formItemId));
  });

  const onBlur = useEvent(() => {
    if (!isInsideForm) return;
    dispatch(fieldLostFocus(formItemId));
  });

  // If already inside a FormItem and NOT in a nested items loop, just render the children.
  // The FormItem handles binding in that case; inside an items loop (itemIndex defined) we
  // must wire up the sub-field ourselves because the parent only manages the array.
  if (deferToParentFormItem) {
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

  // If not inside a form and no label, just return the children
  if (!isInsideForm && !label) {
    return children;
  }

  // Always wrap with ItemWithLabel if label is provided or inside a form
  // This ensures labels are displayed for components with bindTo prop even outside of Forms
  return (
    <FormItemContext.Provider
      value={{
        parentFormItemId,
        isInsideFormItem: true,
        inputId: formItemId,
      }}
    >
      <ItemWithLabel
        id={formItemId}
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
        cloneStyle={true}
        validationResult={validationResult}
        requireLabelMode={requireLabelMode ?? formRequireLabelMode}
        layoutContext={layoutContext}
      >
        {enhancedInput}
      </ItemWithLabel>
    </FormItemContext.Provider>
  );
}

/**
 * Hook that provides form binding functionality for use in components.
 * This can be used when you need more control over how form binding works.
 */
export function useFormBinding(bindTo?: string, options?: {
  initialValue?: any;
  noSubmit?: boolean;
}) {
  const defaultId = useId();
  const isInsideForm = useIsInsideForm();

  const formItemId = useMemo(() => {
    return bindTo || `${defaultId}${UNBOUND_FIELD_SUFFIX}`;
  }, [bindTo, defaultId]);

  return {
    isInsideForm,
    formItemId
  };
}
