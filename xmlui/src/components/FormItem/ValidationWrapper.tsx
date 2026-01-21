import type { Dispatch, ReactElement } from "react";
import { Fragment, cloneElement, useId, useMemo, useContext } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import type {
  FormItemValidations,
  ValidateEventHandler,
  ValidationMode,
} from "../Form/FormContext";
import { useFormContextPart, useIsInsideForm } from "../Form/FormContext";
import { getByPath } from "../Form/FormNative";
import { useValidation, useValidationDisplay } from "./Validations";
import { HelperText } from "./HelperText";
import { FormItemContext } from "./FormItemNative";
import { resolveFormItemId } from "./FormItemUtils";
import { useShallowCompareMemoize } from "../../components-core/utils/hooks";
import styles from "./FormItem.module.scss";

type ValidationWrapperProps = {
  children: ReactElement;
  bindTo?: string;
  validations: FormItemValidations;
  onValidate?: ValidateEventHandler;
  customValidationsDebounce?: number;
  validationMode?: ValidationMode;
  verboseValidationFeedback?: boolean;
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

export function ValidationWrapper({
  children,
  bindTo,
  validations: validationsInput,
  onValidate,
  customValidationsDebounce = 0,
  validationMode,
  verboseValidationFeedback,
  itemIndex,
  formItemType,
  componentType,
  inline,
  isFormItem = false,
}: ValidationWrapperProps) {
  const validations = useShallowCompareMemoize(validationsInput);
  const isInsideForm = useIsInsideForm();
  const defaultId = useId();
  const { parentFormItemId } = useContext(FormItemContext);

  const formItemId = useMemo(() => {
    if (isFormItem) {
      return resolveFormItemId({
        bindTo,
        defaultId,
        parentFormItemId,
        itemIndex,
      });
    }
    return bindTo || defaultId;
  }, [bindTo, defaultId, isFormItem, itemIndex, parentFormItemId]);

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

  useValidation(validations, onValidate, value, dispatch, formItemId, customValidationsDebounce);

  const { validationStatus, isHelperTextShown } = useValidationDisplay(
    formItemId,
    value,
    validationResult,
    validationMode,
    effectiveVerboseValidationFeedback,
  );

  if (!isInsideForm) {
    return children;
  }

  const invalidMessages =
    validationResult?.validations
      .filter((validation) => !validation.isValid && validation.invalidMessage)
      .map((validation) => validation.invalidMessage!) ?? [];

  const [animateContainerRef] = useAutoAnimate({ duration: 100 });

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

  if (isFormItem) {
    childProps.formItemId = formItemId;
  }

  return cloneElement(children, childProps);
}
