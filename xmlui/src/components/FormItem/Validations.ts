import { type Dispatch, useDeferredValue, useEffect, useMemo, useState } from "react";
import { isArray, isEmpty, isNumber } from "lodash-es";

import { asyncThrottle } from "../../components-core/utils/misc";
import { EMPTY_OBJECT } from "../../components-core/constants";
import type { ContainerAction } from "../../components-core/rendering/containers";
import {
  defaultValidationMode,
  useFormContextPart,
  type FormItemValidations,
  type SingleValidationResult,
  type ValidateEventHandler,
  type ValidationMode,
  type ValidationResult,
  type ValidationSeverity,
} from "../Form/FormContext";
import { fieldValidated, type FormAction } from "../Form/formActions";

function isInputEmpty(value: any) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (typeof value === "number") return false;
  return isEmpty(value);
}

function isMinLengthValid(value: any = "", boundary: number) {
  if (typeof value === "string") {
    return value.length >= boundary;
  }
  console.warn("minLength can only be used on strings");
  return true;
}

function isMaxLengthValid(value: any = "", boundary: number) {
  if (typeof value === "string") {
    return value.length <= boundary;
  }
  console.warn("maxLength can only be used on strings");
  return true;
}

function isMinValueValid(value: any = "", minValue: number) {
  if (typeof value !== "string" && !isNumber(value)) {
    console.warn("Range can only be used on strings and numbers");
  }
  return Number(value) >= minValue;
}

function isMaxValueValid(value: any = "", maxValue: number) {
  if (typeof value !== "string" && !isNumber(value)) {
    console.warn("Range can only be used on strings and numbers");
  }
  return Number(value) <= maxValue;
}

function isRegexValid(value: any = "", regex: string) {
  if (typeof value === "string") {
    const _value = stringToRegex(regex).test(value);
    return _value;
  }
  console.warn("Regex can only be used on strings");
  return true;

  // Source: https://stackoverflow.com/questions/17250815/how-to-check-if-the-input-string-is-a-valid-regular-expression
  function stringToRegex(s: string) {
    const m = s.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
    return m ? new RegExp(m[2], m[3]) : new RegExp(s);
  }
}

class FormItemValidator {
  constructor(
    private validations: FormItemValidations,
    private onValidate: ValidateEventHandler,
    private value: any,
  ) {}

  preValidate = () => {
    const requiredResult = this.validateRequired();
    let validationResults: SingleValidationResult[] = [requiredResult];
    if (!requiredResult || requiredResult.isValid) {
      validationResults.push(
        this.validateLength(),
        this.validateRange(),
        this.validatePattern(),
        this.validateRegex(),
      );
    }
    validationResults = validationResults.filter(
      (result) => result !== undefined,
    ) as Array<SingleValidationResult>;

    return {
      isValid: validationResults.find((result) => !result.isValid) === undefined,
      validatedValue: this.value,
      partial: this.onValidate !== undefined,
      validations: validationResults,
    } as ValidationResult;
  };

  validate = async () => {
    const preValidateResult = this.preValidate();
    const constValidationResult = (await this.validateCustom()) || [];
    preValidateResult.validations.push(
      ...constValidationResult.map((res) => ({ ...res, async: true })),
    );

    return {
      isValid: preValidateResult.validations.find((result) => !result.isValid) === undefined,
      validatedValue: this.value,
      partial: false,
      validations: preValidateResult.validations,
    } as ValidationResult;
  };

  private validateRequired(): SingleValidationResult | undefined {
    const { required, requiredInvalidMessage } = this.validations;
    if (!required) {
      return undefined;
    }
    const validationResult: SingleValidationResult = {
      isValid: !isInputEmpty(this.value),
      invalidMessage: requiredInvalidMessage || "This field is required",
      severity: "error",
    };
    return validationResult;
  }

  private validateLength(): SingleValidationResult | undefined {
    const {
      minLength,
      maxLength,
      lengthInvalidMessage,
      lengthInvalidSeverity = "error",
    } = this.validations;
    if (minLength === undefined && maxLength === undefined) {
      return undefined;
    }
    if (minLength !== undefined && maxLength === undefined) {
      return {
        isValid: isMinLengthValid(this.value, minLength),
        invalidMessage:
          lengthInvalidMessage ||
          `Input should be at least ${minLength} ${pluralize(minLength, "character")}`,
        severity: lengthInvalidSeverity,
      };
    }
    if (minLength === undefined && maxLength !== undefined) {
      return {
        isValid: isMaxLengthValid(this.value, maxLength),
        invalidMessage:
          lengthInvalidMessage ||
          `Input should be up to ${maxLength} ${pluralize(maxLength, "character")}`,
        severity: lengthInvalidSeverity,
      };
    }
    return {
      isValid: isMinLengthValid(this.value, minLength!) && isMaxLengthValid(this.value, maxLength!),
      invalidMessage:
        lengthInvalidMessage || `Input length should be between ${minLength} and ${maxLength}`,
      severity: lengthInvalidSeverity,
    };
  }

  private validateRange(): SingleValidationResult | undefined {
    const {
      minValue,
      maxValue,
      rangeInvalidMessage,
      rangeInvalidSeverity = "error",
    } = this.validations;

    if (minValue === undefined && maxValue === undefined) {
      return undefined;
    }

    if (minValue !== undefined && maxValue === undefined) {
      return {
        isValid: isMinValueValid(this.value, minValue),
        invalidMessage: rangeInvalidMessage || `Input should be bigger than ${minValue}`,
        severity: rangeInvalidSeverity,
      };
    }
    if (minValue === undefined && maxValue !== undefined) {
      return {
        isValid: isMaxValueValid(this.value, maxValue),
        invalidMessage: rangeInvalidMessage || `Input should be smaller than ${maxValue}`,
        severity: rangeInvalidSeverity,
      };
    }

    if (typeof this.value === "object" && Array.isArray(this.value)) {
      // If the value is an array, we check if all elements are within the range
      const allValid = this.value.every(
        (val) => isMinValueValid(val, minValue!) && isMaxValueValid(val, maxValue!),
      );

      return {
        isValid: allValid,
        invalidMessage:
          rangeInvalidMessage || `All inputs should be between ${minValue} and ${maxValue}`,
        severity: rangeInvalidSeverity,
      };
    }

    return {
      isValid: isMinValueValid(this.value, minValue!) && isMaxValueValid(this.value, maxValue!),
      invalidMessage: rangeInvalidMessage || `Input should be between ${minValue} and ${maxValue}`,
      severity: rangeInvalidSeverity,
    };
  }

  private validatePattern(): SingleValidationResult | undefined {
    const { pattern, patternInvalidMessage, patternInvalidSeverity = "error" } = this.validations;
    if (!pattern) {
      return undefined;
    }
    switch (pattern.toLowerCase()) {
      case "email":
        return {
          isValid: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            this.value,
          ),
          invalidMessage: patternInvalidMessage || "Not a valid email address",
          severity: patternInvalidSeverity,
        };
      case "phone":
        return {
          isValid: /^[a-zA-Z0-9#*)(+.\-_&']+$/g.test(this.value),
          invalidMessage: patternInvalidMessage || "Not a valid phone number",
          severity: patternInvalidSeverity,
        };
      case "url":
        let url;
        try {
          url = new URL(this.value);
        } catch (e) {}
        if (!url || (url.protocol && !["http:", "https:"].includes(url.protocol))) {
          return {
            isValid: false,
            invalidMessage: "Not a valid URL",
            severity: patternInvalidSeverity,
          };
        }

        return {
          isValid: true,
          severity: "valid",
        };
      default: {
        console.warn("Unknown pattern provided");
        return {
          isValid: true,
          severity: "valid",
        };
      }
    }
  }

  private validateRegex(): SingleValidationResult | undefined {
    const { regex, regexInvalidMessage, regexInvalidSeverity = "error" } = this.validations;
    if (regex === undefined) {
      return undefined;
    }
    return {
      isValid: isRegexValid(this.value, regex),
      invalidMessage: regexInvalidMessage || "Input is not in the correct format",
      severity: regexInvalidSeverity,
    };
  }

  private async validateCustom(): Promise<Array<SingleValidationResult> | undefined> {
    if (!this.onValidate) {
      return undefined;
    }
    const validationFnResult = await this.onValidate(this.value);

    if (typeof validationFnResult === "boolean") {
      return [
        {
          isValid: validationFnResult,
          invalidMessage: "Invalid input",
          severity: "error",
        },
      ];
    }
    if (!isArray(validationFnResult)) {
      return [validationFnResult];
    }

    return validationFnResult;
  }
}

async function asyncValidate(
  validations: FormItemValidations,
  onValidate: ValidateEventHandler,
  deferredValue: any,
) {
  const validator = new FormItemValidator(validations, onValidate, deferredValue);
  // console.log("calling async validate with ", deferredValue);
  return await validator.validate();
}

export function useValidation(
  validations: FormItemValidations,
  onValidate: ValidateEventHandler,
  value: any,
  dispatch: Dispatch<ContainerAction | FormAction>,
  bindTo: string,
  throttleWaitInMs: number = 0,
) {
  const deferredValue = useDeferredValue(value);

  const throttledAsyncValidate = useMemo(() => {
    if (throttleWaitInMs !== 0) {
      return asyncThrottle(asyncValidate, throttleWaitInMs, {
        trailing: true,
        leading: true,
      });
    }
    return asyncValidate;
  }, [throttleWaitInMs]);

  useEffect(
    function runAllValidations() {
      const validator = new FormItemValidator(validations, onValidate, deferredValue);
      let ignore = false;
      const partialResult = validator.preValidate();
      if (!ignore) {
        dispatch(fieldValidated(bindTo, partialResult));
        if (partialResult.partial) {
          (async () => {
            const result = await throttledAsyncValidate(validations, onValidate, deferredValue);
            if (!ignore) {
              // console.log(`async validation result for ${bindTo}`, result);
              dispatch(fieldValidated(bindTo, result));
            }
          })();
        }
      }
      return () => {
        ignore = true;
      };
    },
    [bindTo, deferredValue, dispatch, onValidate, throttledAsyncValidate, validations],
  );
}

export function useValidationDisplay(
  bindTo: string,
  value: any,
  validationResult: ValidationResult | undefined,
  validationMode: ValidationMode = defaultValidationMode,
): {
  isHelperTextShown: boolean;
  validationStatus: ValidationSeverity;
} {
  const interactionFlags: any =
    useFormContextPart((value) => value.interactionFlags[bindTo]) || EMPTY_OBJECT;
  const forceShowValidationResult = interactionFlags.forceShowValidationResult;
  const focused = interactionFlags.focused;
  const afterFirstDirtyBlur = interactionFlags.afterFirstDirtyBlur;
  const isValidLostFocus = interactionFlags.isValidLostFocus;
  const isValidOnFocus = interactionFlags.isValidOnFocus;
  const invalidToValid = interactionFlags.invalidToValid;
  const validationInProgress = !validationResult || validationResult.validatedValue !== value;
  const isDirty = interactionFlags.isDirty;
  const isValid = validationResult?.isValid === true;

  let highestValidationSeverity: ValidationSeverity = "none";
  for (const val of validationResult?.validations || []) {
    if (val.isValid) {
      continue;
    }
    if (
      highestValidationSeverity !== ("error" as ValidationSeverity) &&
      val.severity === "warning"
    ) {
      highestValidationSeverity = "warning";
    }
    if (val.severity === "error") {
      highestValidationSeverity = "error";
      break;
    }
  }

  let isHelperTextShown = false;
  switch (validationMode) {
    // This validation model was inspired by https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce
    // The idea is to show validation errors as late as possible (on blur)
    case "errorLate": {
      // --- Don't fire if not dirty
      if (!isDirty) {
        isHelperTextShown = false;
        break;
      }
      // --- Show if losing focus and invalid
      if (!focused && !isValidLostFocus) {
        isHelperTextShown = true;
        break;
      }
      // --- Show if focused, after first meaningful blur, was not valid on last focus and not changed to valid while typing
      if (focused && afterFirstDirtyBlur && !isValidOnFocus && !invalidToValid) {
        isHelperTextShown = true;
        break;
      }
      break;
    }
    case "onChanged": {
      isHelperTextShown = isDirty;
      break;
    }
    case "onLostFocus": {
      isHelperTextShown = isDirty && !focused && !isValidLostFocus;
    }
  }
  isHelperTextShown = isHelperTextShown || forceShowValidationResult;

  const [prevStableShown, setPrevStableShown] = useState(isHelperTextShown);
  if (prevStableShown !== isHelperTextShown && !validationInProgress) {
    setPrevStableShown(isHelperTextShown);
  }
  if (validationInProgress) {
    isHelperTextShown = prevStableShown;
  }
  return {
    isHelperTextShown,
    validationStatus: isHelperTextShown ? highestValidationSeverity : "none",
  };
}

export function parseSeverity(severity: string | undefined) {
  if (severity === undefined) {
    return undefined;
  }
  if (
    severity === "error" ||
    severity === "warning" ||
    severity === "valid" ||
    severity === "none"
  ) {
    return severity as ValidationSeverity;
  }
  return "none";
}

export function groupInvalidValidationResultsBySeverity(
  validationResults: Array<ValidationResult>,
) {
  const ret: Record<ValidationSeverity, Array<SingleValidationResult>> = {
    error: [],
    warning: [],
    valid: [],
    none: [],
  };
  Object.entries(validationResults).forEach(([field, validationResult]) => {
    validationResult.validations.forEach((singleValidationResult) => {
      if (!singleValidationResult.isValid) {
        ret[singleValidationResult.severity] = ret[singleValidationResult.severity] || [];
        ret[singleValidationResult.severity].push(singleValidationResult);
      }
    });
  });
  return ret;
}

function pluralize(count: number, word: string) {
  return count === 1 ? word : word + "s";
}
