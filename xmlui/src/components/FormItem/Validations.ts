import { type Dispatch, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
// --- W5-1 / plan #09: registry-backed named validators. The forms barrel
// ensures the standard-library validators are registered before lookup/run
// calls, which keeps the production test-bed bundle from dropping them as
// side-effect-only imports.
import {
  hasValidator,
  lookupValidator,
  runValidator,
} from "../../components-core/forms";
import { pushXsLog } from "../../components-core/inspector/inspectorUtils";

function isInputEmpty(value: any) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "boolean") return !value;
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

// --- W5-1 / plan #09 Step 1.2: one-shot deprecation warning per `pattern`
// name. Emits a `kind:"forms"` `deprecated-alias` trace entry so apps can
// migrate `pattern="email"` → `validator="email"` deliberately without
// pre-emptive noise.
const _seenDeprecatedPatterns = new Set<string>();
function warnPatternDeprecationOnce(patternName: string): void {
  if (_seenDeprecatedPatterns.has(patternName)) return;
  _seenDeprecatedPatterns.add(patternName);
  pushXsLog({
    kind: "forms",
    ts: Date.now(),
    code: "deprecated-alias",
    severity: "warn",
    validatorName: patternName,
    message:
      `\`FormItem.pattern="${patternName}"\` is deprecated; ` +
      `use \`validator="${patternName}"\` instead.`,
  });
}

class FormItemValidator {
  /** Names of validators whose `fn` returned a Promise in the sync phase. */
  private _asyncValidatorNames: string[] = [];

  constructor(
    private validations: FormItemValidations,
    private onValidate: ValidateEventHandler,
    private value: any,
    private abortSignal?: AbortSignal,
    private formItemId: string = "",
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
        this.validateMatch(),
      );
    }
    validationResults = validationResults.filter(
      (result) => result !== undefined,
    ) as Array<SingleValidationResult>;

    return {
      isValid: validationResults.find((result) => !result.isValid) === undefined,
      validatedValue: this.value,
      partial: this.onValidate !== undefined || this.hasAsyncValidator(),
      validations: validationResults,
    } as ValidationResult;
  };

  /**
   * Returns `true` when `validatePattern()` encountered at least one
   * validator whose `fn` returned a `Promise` (i.e. a truly async
   * validator). Purely synchronous built-ins (email, phone, etc.) return
   * a string directly and therefore do NOT mark the result as partial.
   *
   * Must be called AFTER `validatePattern()` (which populates
   * `_asyncValidatorNames`) — the ordering in `preValidate()` guarantees
   * this.
   */
  private hasAsyncValidator(): boolean {
    return this._asyncValidatorNames.length > 0;
  }

  validate = async () => {
    const preValidateResult = this.preValidate();
    const constValidationResult = (await this.validateCustom()) || [];
    const asyncValidatorResults = (await this.validateValidatorAsync()) || [];
    preValidateResult.validations.push(
      ...constValidationResult.map((res) => ({ ...res, async: true })),
      ...asyncValidatorResults.map((res) => ({ ...res, async: true })),
    );

    return {
      isValid: preValidateResult.validations.find((result) => !result.isValid) === undefined,
      validatedValue: this.value,
      partial: false,
      validations: preValidateResult.validations,
    } as ValidationResult;
  };

  /**
   * Run *async* registry validators (those whose `fn` returned a Promise
   * in the sync pre-validate phase). First failure wins. Returns the
   * single failing result, or `undefined` when none failed / no async
   * validators are present.
   *
   * Uses `_asyncValidatorNames` populated by `validatePattern()` so that
   * only genuinely async validators are re-invoked here.
   */
  private async validateValidatorAsync(): Promise<Array<SingleValidationResult> | undefined> {
    if (this._asyncValidatorNames.length === 0) return undefined;
    const {
      validator,
      validatorParams,
      validatorInvalidMessage,
      validatorInvalidSeverity = "error",
      pattern,
      patternInvalidMessage,
      patternInvalidSeverity = "error",
    } = this.validations;
    const names = this._asyncValidatorNames;
    if (this.value === undefined || this.value === null || this.value === "") return undefined;
    const messageOverride = validator != null ? validatorInvalidMessage : patternInvalidMessage;
    const severityOverride =
      validator != null ? validatorInvalidSeverity : patternInvalidSeverity;
    for (const name of names) {
      const entry = lookupValidator(name);
      if (!entry) continue;
      let raw: unknown;
      try {
        raw = entry.fn(this.value, {
          fieldName: this.formItemId,
          formData: {},
          signal: this.abortSignal,
        }, validatorParams);
      } catch {
        continue; // sync path already reported the throw
      }
      if (!raw || typeof (raw as Promise<unknown>).then !== "function") continue;
      try {
        const result = (await raw) as string | null | undefined;
        if (this.abortSignal?.aborted) return undefined;
        if (result != null && result !== "") {
          return [
            {
              isValid: false,
              invalidMessage: messageOverride || result,
              severity: severityOverride,
            },
          ];
        }
      } catch (err) {
        if (this.abortSignal?.aborted) return undefined;
        const msg = err instanceof Error ? err.message : String(err);
        return [
          {
            isValid: false,
            invalidMessage: messageOverride || entry.defaultMessage || msg,
            severity: severityOverride,
          },
        ];
      }
    }
    return undefined;
  }

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
    // --- W5-1 / plan #09 Step 1.2: `validator` is the new prop; `pattern`
    // is the deprecated alias kept for backward compatibility. Both
    // forms route through the validator registry. When both are set,
    // `validator` wins (so a migration can be done one prop at a time).
    const {
      validator,
      validatorParams,
      validatorInvalidMessage,
      validatorInvalidSeverity = "error",
      pattern,
      patternInvalidMessage,
      patternInvalidSeverity = "error",
    } = this.validations;

    const names: string[] = (() => {
      if (validator != null) {
        return Array.isArray(validator)
          ? (validator.filter((n) => typeof n === "string") as string[])
          : typeof validator === "string"
            ? [validator]
            : [];
      }
      if (typeof pattern === "string" && pattern.length > 0) {
        warnPatternDeprecationOnce(pattern);
        return [pattern];
      }
      return [];
    })();

    if (names.length === 0) return undefined;

    const messageOverride = validator != null ? validatorInvalidMessage : patternInvalidMessage;
    const severityOverride =
      validator != null ? validatorInvalidSeverity : patternInvalidSeverity;

    // Empty values pass through — builtins already special-case empty, but
    // keep this guard so unknown registry entries behave consistently.
    if (this.value === undefined || this.value === null || this.value === "") {
      return { isValid: true, severity: "valid" };
    }

    // Run validators in order; first sync failure wins. Async validators are
    // skipped here and re-run in `validateCustom`'s async phase.
    for (const name of names) {
      const entry = lookupValidator(name);
      if (!entry) {
        if (!hasValidator(name)) {
          // Surface `unknown-validator` via the central runner so the
          // diagnostic is emitted with consistent shape.
          // The result is treated as "valid" (no field error) under
          // non-strict mode because the user's markup is the source of
          // the typo, not the field's value.
          // Fire-and-forget the async runner just to emit the diagnostic.
          void runValidator(name, this.value, {
            fieldName: this.formItemId,
            formData: {},
            signal: this.abortSignal,
          }, validatorParams);
        }
        continue;
      }
      let raw: unknown;
      try {
        raw = entry.fn(this.value, {
          fieldName: this.formItemId,
          formData: {},
          signal: this.abortSignal,
        }, validatorParams);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          isValid: false,
          invalidMessage: messageOverride || entry.defaultMessage || msg,
          severity: severityOverride,
        };
      }
      // Skip async results in the sync phase; the async path below picks them up.
      if (raw && typeof (raw as Promise<unknown>).then === "function") {
        // Record this validator as needing an async pass.
        this._asyncValidatorNames.push(name);
        continue;
      }
      const message = raw as string | null | undefined;
      if (message != null && message !== "") {
        return {
          isValid: false,
          invalidMessage: messageOverride || message,
          severity: severityOverride,
        };
      }
    }
    return { isValid: true, severity: "valid" };
  }

  private validateRegex(): SingleValidationResult | undefined {
    const { regex, regexInvalidMessage, regexInvalidSeverity = "error" } = this.validations;
    if (regex === undefined) {
      return undefined;
    }
    if (this.value === undefined || this.value === null || this.value === "") {
      return {
        isValid: true,
        severity: "valid",
      };
    }
    return {
      isValid: isRegexValid(this.value, regex),
      invalidMessage: regexInvalidMessage || "Input is not in the correct format",
      severity: regexInvalidSeverity,
    };
  }

  private validateMatch(): SingleValidationResult | undefined {
    const { matchValue, matchInvalidMessage } = this.validations;
    if (matchValue === undefined) {
      return undefined;
    }
    return {
      isValid: Object.is(this.value, matchValue),
      invalidMessage: matchInvalidMessage || "Input does not match",
      severity: "error",
    };
  }

  private async validateCustom(): Promise<Array<SingleValidationResult> | undefined> {
    if (!this.onValidate) {
      return undefined;
    }
    
    // --- Wrap the validation call to handle abortion
    // Why use abort if we have ignore? Because the validation function might be doing
    // some heavy async work (e.g., network requests) that we want to cancel
    const validationPromise = this.onValidate(this.value);
    
    // Race between the validation promise and an abort promise
    const validationFnResult = await Promise.race([
      validationPromise,
      new Promise<never>((_, reject) => {
        if (this.abortSignal) {
          this.abortSignal.addEventListener('abort', () => {
            reject(new Error('Validation aborted'));
          });
        }
      })
    ]).catch((error) => {
      // If aborted or any other error, return undefined (no validation results)
      if (error.message === 'Validation aborted' || this.abortSignal?.aborted) {
        return undefined;
      }
      // Re-throw other errors
      throw error;
    });

    if (validationFnResult === undefined || validationFnResult === null) {
      return undefined;
    }

    if (typeof validationFnResult === "string") {
      return [
        {
          isValid: false,
          invalidMessage: validationFnResult,
          severity: "error",
        },
      ];
    }

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
  abortSignal?: AbortSignal,
  bindTo: string = "",
) {
  const validator = new FormItemValidator(
    validations,
    onValidate,
    deferredValue,
    abortSignal,
    bindTo,
  );
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
  const throttledAsyncValidate = useMemo(() => {
    if (throttleWaitInMs !== 0) {
      return asyncThrottle(asyncValidate, throttleWaitInMs, {
        trailing: true,
        leading: true,
      });
    }
    return asyncValidate;
  }, [throttleWaitInMs]);

  // Use useLayoutEffect for the synchronous preValidate dispatch so that
  // formState.validationResults is always current before the browser paints.
  // This prevents a race condition where doValidate() reads stale results when
  // the user fills a field and immediately clicks Submit (effects would otherwise
  // run after Playwright's click action fires).
  useLayoutEffect(
    function runSyncValidation() {
      const abortController = new AbortController();
      const validator = new FormItemValidator(
        validations,
        onValidate,
        value,
        abortController.signal,
        bindTo,
      );
      const partialResult = validator.preValidate();
      dispatch(fieldValidated(bindTo, partialResult));
      return () => {
        abortController.abort();
      };
    },
    [bindTo, value, dispatch, onValidate, validations],
  );

  useEffect(
    function runAsyncValidation() {
      const abortController = new AbortController();
      const validator = new FormItemValidator(
        validations,
        onValidate,
        value,
        abortController.signal,
        bindTo,
      );
      const partialResult = validator.preValidate();
      if (!partialResult.partial) {
        return () => abortController.abort();
      }
      let ignore = false;
      void (async () => {
        const result = await throttledAsyncValidate(
          validations,
          onValidate,
          value,
          abortController.signal,
          bindTo,
        );
        if (!ignore) {
          dispatch(fieldValidated(bindTo, result));
        }
      })();
      return () => {
        ignore = true;
        abortController.abort();
      };
    },
    [bindTo, value, dispatch, onValidate, throttledAsyncValidate, validations],
  );
}

export function useValidationDisplay(
  bindTo: string,
  value: any,
  validationResult: ValidationResult | undefined,
  validationMode: ValidationMode = defaultValidationMode,
  verboseValidationFeedback: boolean = true,
  validationDisplayDelay: number = 0,
): {
  isHelperTextShown: boolean;
  validationStatus: ValidationSeverity;
} {
  const interactionFlags: any =
    useFormContextPart((value) => value?.interactionFlags[bindTo]) || EMPTY_OBJECT;
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
  let hasValidValidation = false;
  for (const val of validationResult?.validations || []) {
    if (val.isValid) {
      hasValidValidation = true;
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

  if (highestValidationSeverity === "none" && hasValidValidation && !verboseValidationFeedback) {
    highestValidationSeverity = "valid";
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
      if (!focused && (!isValidLostFocus || highestValidationSeverity === "valid")) {
        isHelperTextShown = true;
        break;
      }
      // --- Show if focused, after first meaningful blur, was not valid on last focus and not changed to valid while typing
      if (
        focused &&
        afterFirstDirtyBlur &&
        !isValidOnFocus &&
        (!invalidToValid || highestValidationSeverity === "valid")
      ) {
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
      isHelperTextShown =
        isDirty && !focused && (!isValidLostFocus || highestValidationSeverity === "valid");
    }
  }
  isHelperTextShown = isHelperTextShown || forceShowValidationResult;

  // Eagerly show validation results when async validation takes longer than validationDisplayDelay.
  // "Punish-late" mode normally hides results until blur — but a slow async check (e.g. a network
  // call) should reveal the outcome once it settles, even if the field is still focused.
  const isPartial = validationResult?.partial ?? false;
  const [asyncTookLong, setAsyncTookLong] = useState(false);
  // Reset the flag whenever the value changes (a new validation cycle begins).
  useEffect(() => {
    setAsyncTookLong(false);
  }, [value]);
  // Start a timer when async validation is in-flight for a dirty field.
  // If it fires before validation resolves, record that it took long.
  useEffect(() => {
    if (!isPartial || !isDirty || validationDisplayDelay <= 0) {
      return;
    }
    const timer = setTimeout(() => setAsyncTookLong(true), validationDisplayDelay);
    return () => clearTimeout(timer);
  }, [isPartial, isDirty, validationDisplayDelay]);
  // Override: once a slow async validation settles, show the result immediately.
  if (asyncTookLong && !isPartial) {
    isHelperTextShown = true;
  }

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
