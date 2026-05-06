import type { Dispatch, MutableRefObject, ReactElement } from "react";
import { Fragment, cloneElement, forwardRef, useCallback, useEffect, useId, useMemo, useRef, useContext } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import type {
  FormItemValidations,
  ValidateEventHandler,
  ValidationMode,
} from "../Form/FormContext";
import { useFormContextPart, useIsInsideForm } from "../Form/FormContext";
import { getByPath } from "../Form/FormReact";
import { useValidation, useValidationDisplay } from "./Validations";
import { HelperText } from "./HelperText";
import { FormItemContext } from "./FormItemContext";
import { resolveFormItemId } from "./FormItemUtils";
import { useShallowCompareMemoize } from "../../components-core/utils/hooks";
import styles from "./FormItem.module.scss";

// data-* attributes that ComponentDecorator may have placed on the wrapper
// div via its helper-span fallback. When we additionally forward the ref to
// the child (so those attributes also land on a layout-box-having element),
// we must strip them from the wrapper to avoid two elements sharing the
// same data-testid.
const TESTID_ATTRS = ["data-testid", "data-inspectId", "data-component-type"] as const;

type ValidationWrapperProps = {
  children: ReactElement;
  bindTo?: string;
  validations: FormItemValidations;
  onValidate?: ValidateEventHandler;
  customValidationsDebounce?: number;
  validationMode?: ValidationMode;
  verboseValidationFeedback?: boolean;
  validationDisplayDelay?: number;
  itemIndex?: number;
  formItemType?: string;
  componentType?: string;
  inline?: boolean;
  isFormItem?: boolean;
};

function isForcedVerbose(
  componentType?: string,
  formItemType?: string,
  inline?: boolean,
): boolean {
  const typeValue = (formItemType || componentType || "").toLowerCase();

  if (
    typeValue === "checkbox" ||
    typeValue === "switch" ||
    typeValue === "radiogroup" ||
    typeValue === "colorpicker" ||
    typeValue === "slider" ||
    typeValue === "toggle"
  ) {
    return true;
  }

  if (typeValue === "datepicker" && inline) {
    return true;
  }

  return false;
}

export const ValidationWrapper = forwardRef<HTMLElement, ValidationWrapperProps>(function ValidationWrapper({
  children,
  bindTo,
  validations: validationsInput,
  onValidate,
  customValidationsDebounce = 0,
  validationMode,
  verboseValidationFeedback,
  validationDisplayDelay = 0,
  itemIndex,
  formItemType,
  componentType,
  inline,
  isFormItem = false,
}, ref) {
  const validations = useShallowCompareMemoize(validationsInput);
  const isInsideForm = useIsInsideForm();
  const defaultId = useId();
  const { parentFormItemId } = useContext(FormItemContext);

  const formItemId = useMemo(() => {
    return resolveFormItemId({
      bindTo,
      defaultId,
      parentFormItemId,
      itemIndex,
    });
  }, [bindTo, defaultId, itemIndex, parentFormItemId]);

  const contextVerboseValidationFeedback = useFormContextPart(
    (value) => value?.verboseValidationFeedback,
  );

  const effectiveVerboseValidationFeedback = isForcedVerbose(componentType, formItemType, inline)
    ? true
    : (verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true);

  const value = useFormContextPart<any>((value) => getByPath(value?.subject, formItemId));
  const validationResult = useFormContextPart((value) => value?.validationResults[formItemId]);
  const dispatch =
    useFormContextPart((value) => value?.dispatch) ||
    ((() => undefined) as unknown as Dispatch<any>);

  useValidation(
    validations,
    onValidate,
    value,
    dispatch,
    formItemId,
    customValidationsDebounce,
  );

  const { validationStatus, isHelperTextShown } = useValidationDisplay(
    formItemId,
    value,
    validationResult,
    validationMode,
    effectiveVerboseValidationFeedback,
    validationDisplayDelay,
  );

  const [animateContainerRef] = useAutoAnimate({ duration: 100 });

  // The ref forwarded by ComponentDecorator carries data-testid/data-inspectId.
  // For FormItem we want those attributes on the child's actual DOM node
  // (.itemWithLabel) — which has a real layout box — rather than the outer
  // wrapper div (which uses display: contents). For non-FormItem inputs
  // (e.g. a TextBox with bindTo) the existing wrappered-testId behavior is
  // preserved, so we don't redirect the ref in that case.
  const childRef = useCallback(
    (node: HTMLElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref],
  );

  // The wrapper div may end up with the testId attributes (placed by
  // ComponentDecorator's helper-span fallback). When we redirect the ref
  // to the child, we have to strip them from the wrapper to keep a single
  // element carrying the testId. useEffect runs after the parent
  // ComponentDecorator's useLayoutEffect, so the attributes are already in
  // place by the time we remove them.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isFormItem) return;
    const node = wrapperRef.current;
    if (!node) return;
    TESTID_ATTRS.forEach((attr) => node.removeAttribute(attr));
  });

  if (!isInsideForm) {
    return cloneElement(children, { ref: childRef });
  }

  const invalidMessages =
    validationResult?.validations
      .filter((validation) => !validation.isValid && validation.invalidMessage)
      .map((validation) => validation.invalidMessage!) ?? [];

  const validationResultDisplay =
    effectiveVerboseValidationFeedback === false ? null : (
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

  const childProps: Record<string, unknown> = {
    validationStatus,
    invalidMessages,
    validationResult: validationResultDisplay,
    validationInProgress: validationResult?.partial ?? false,
  };

  const validationAttributes = {
    "data-validation-valid": validationResult?.isValid ?? true,
    "data-validation-partial": validationResult?.partial ?? false,
    "data-validation-status": validationStatus,
    "data-validation-shown": isHelperTextShown,
    "data-validations-evaluated": validationResult?.validations?.length ?? 0,
  };

  if (isFormItem) {
    childProps.formItemId = formItemId;
  }

  // Only redirect the ref for FormItem children — they have a wrapping
  // .itemWithLabel div that can host the testId. For non-FormItem inputs
  // (TextBox, TextArea, … rendered with a plain bindTo), keep the legacy
  // behaviour and let ComponentDecorator put the testId on the wrapper.
  const childRefToPass = isFormItem ? childRef : undefined;

  return (
    <div ref={wrapperRef} {...validationAttributes} className={styles.validationWrapper}>
      {cloneElement(children, { ...childProps, ...(childRefToPass ? { ref: childRefToPass } : {}) })}
    </div>
  );
});
