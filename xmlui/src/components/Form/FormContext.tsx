import { useCallback, useMemo, useRef } from "react";
import type { Dispatch } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { get } from "lodash-es";

import type { ContainerAction } from "../../components-core/rendering/containers";
import type { FormAction } from "../Form/formActions";
import { fieldChanged, fieldInitialized, fieldRemoved } from "../Form/formActions";
import type { LabelPosition, RequireLabelMode } from "../abstractions";
import type { PropertyValueDescription } from "../../abstractions/ComponentDefs";

export type InteractionFlags = {
  isDirty: boolean;
  invalidToValid: boolean;
  isValidOnFocus: boolean;
  isValidLostFocus: boolean;
  focused: boolean;
  afterFirstDirtyBlur: boolean;
  forceShowValidationResult: boolean;
};

interface IFormContext {
  subject: Record<string, any>;
  originalSubject: Record<string, any>;
  validationResults: Record<string, ValidationResult>;
  interactionFlags: Record<string, InteractionFlags>;
  dispatch: Dispatch<ContainerAction | FormAction>;
  enabled?: boolean;
  itemLabelWidth?: string;
  itemLabelBreak?: boolean;
  itemLabelPosition?: string | LabelPosition;
  itemRequireLabelMode?: RequireLabelMode;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
}

export type ValidationResult = {
  isValid: boolean;
  validations: Array<SingleValidationResult>;
  validatedValue: any;
  partial: boolean;
};

export type SingleValidationResult = {
  isValid: boolean;
  severity: ValidationSeverity;
  invalidMessage?: string;
  validMessage?: string;
  async?: boolean;
  stale?: boolean;
  fromBackend?: boolean;
};

export interface FormItemValidations {
  required?: boolean;
  requiredInvalidMessage?: string;
  minLength?: number;
  maxLength?: number;
  lengthInvalidMessage?: string;
  lengthInvalidSeverity?: ValidationSeverity;
  minValue?: number;
  maxValue?: number;
  rangeInvalidMessage?: string;
  rangeInvalidSeverity?: ValidationSeverity;
  // --- W5-1 / plan #09 Step 1.2: `pattern` is the deprecated alias for
  // `validator`. Both forms are accepted; `validator` (a registered name or
  // an array of registered names) wins when both are present and emits a
  // one-shot `deprecated-alias` diagnostic.
  validator?: string | string[];
  validatorParams?: unknown;
  validatorInvalidMessage?: string;
  validatorInvalidSeverity?: ValidationSeverity;
  /** @deprecated since W5-1 — use `validator` instead. */
  pattern?: string;
  /** @deprecated since W5-1 — use `validatorInvalidMessage` instead. */
  patternInvalidMessage?: string;
  /** @deprecated since W5-1 — use `validatorInvalidSeverity` instead. */
  patternInvalidSeverity?: ValidationSeverity;
  regex?: string;
  regexInvalidMessage?: string;
  regexInvalidSeverity?: ValidationSeverity;
  matchValue?: any;
  matchInvalidMessage?: string;
}

export const validationSeverityValues = ["error", "warning", "valid", "none"] as const;
export type ValidationSeverity = (typeof validationSeverityValues)[number];
export const validationSeverityMd: PropertyValueDescription[] = [
  { value: "valid", description: "Visual indicator for an input that is accepted" },
  { value: "warning", description: "Visual indicator for an input that produced a warning" },
  { value: "error", description: "Visual indicator for an input that produced an error" },
];

export type ValidateEventHandler = ((value: any) => Promise<ValidateFunctionResult>) | undefined;

type ValidateFunctionResult =
  | null                        // null → valid, no error
  | string                      // string → invalid with that string as the error message
  | boolean
  | SingleValidationResult
  | Array<SingleValidationResult>;

export const validationModeValues = ["errorLate", "onChanged", "onLostFocus"] as const;
export type ValidationMode = (typeof validationModeValues)[number];
export const defaultValidationMode = "errorLate";
export const validationModeMd: PropertyValueDescription[] = [
  {
    value: "errorLate",
    description:
      "Display the error when the field loses focus." +
      "If an error is already displayed, continue for every keystroke until input is accepted.",
  },
  {
    value: "onChanged",
    description: "Display error (if present) for every keystroke.",
  },
  {
    value: "onLostFocus",
    description: "Show/hide error (if present) only if the field loses focus.",
  },
];

export const FormContext = createContext<IFormContext>(undefined as unknown as IFormContext);
export const FormProvider = FormContext.Provider;

export function useFormContextPart<T = unknown>(selector: (value?: IFormContext) => T) {
  return useContextSelector(FormContext, selector);
}

export type FormValues = Record<string, unknown>;

export type FormItemRegistration = {
  name: string;
  label?: string;
  required?: boolean;
  requiredInvalidMessage?: string;
  minLength?: number;
  lengthInvalidMessage?: string;
  pattern?: string;
  patternInvalidMessage?: string;
  patternInvalidSeverity?: ValidationSeverity | string;
  regex?: string;
  regexInvalidMessage?: string;
  regexInvalidSeverity?: ValidationSeverity | string;
  matchValue?: unknown;
  matchInvalidMessage?: string;
  noSubmit?: boolean;
  sanitizeSubmitValue?: (value: unknown) => unknown;
  validate?: (value: unknown) => unknown | Promise<unknown>;
};

export type FormValidationIssue = {
  field?: string;
  message: string;
  severity: "error" | "warning";
};

export type FormContextValue = {
  values: FormValues;
  errors: Record<string, string>;
  issues: FormValidationIssue[];
  dirtyFields: ReadonlySet<string>;
  validatingFields: ReadonlySet<string>;
  enabled: boolean;
  itemLabelPosition?: string;
  itemLabelWidth?: string | number;
  itemLabelBreak?: boolean;
  itemRequireLabelMode?: string;
  verboseValidationFeedback?: boolean;
  fieldPrefix?: string;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  isFieldValid: (name: string) => boolean;
  validateField: (name: string, value?: unknown) => Promise<string | undefined>;
  registerItem: (registration: FormItemRegistration) => () => void;
  validationIconSuccess?: string;
  validationIconError?: string;
};

export function useFormContext(): FormContextValue | undefined {
  const value = useFormContextPart((value) => value);
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const getValue = useCallback((name: string) => get(latestValueRef.current?.subject, name), []);
  const setValue = useCallback((name: string, fieldValue: unknown) => {
    latestValueRef.current?.dispatch?.(fieldChanged(name, fieldValue));
  }, []);
  const isFieldValid = useCallback(
    (name: string) => latestValueRef.current?.validationResults?.[name]?.isValid ?? true,
    [],
  );
  const validateField = useCallback(async () => undefined, []);
  const registerItem = useCallback(({ name, noSubmit }: FormItemRegistration) => {
    const currentValue = get(latestValueRef.current?.subject, name);
    const originalValue = get(latestValueRef.current?.originalSubject, name);
    latestValueRef.current?.dispatch?.(
      fieldInitialized(
        name,
        currentValue === undefined ? originalValue : currentValue,
        false,
        noSubmit,
      ),
    );
    return () => {
      latestValueRef.current?.dispatch?.(fieldRemoved(name));
    };
  }, []);

  return useMemo((): FormContextValue | undefined => {
    if (!value) {
      return undefined;
    }
    const validationEntries = Object.entries(value.validationResults ?? {});
    const errors = Object.fromEntries(
      validationEntries.flatMap(([field, result]) => {
        const invalidMessage = result.validations.find((validation) => !validation.isValid)?.invalidMessage;
        return invalidMessage ? [[field, invalidMessage]] : [];
      }),
    );
    const issues = validationEntries.flatMap(([field, result]) =>
      result.validations
        .filter((validation) => !validation.isValid && validation.invalidMessage)
        .map((validation) => ({
          field,
          message: validation.invalidMessage ?? "",
          severity: validation.severity === "warning" ? "warning" as const : "error" as const,
        })),
    );
    return {
      values: value.subject ?? {},
      errors,
      issues,
      dirtyFields: new Set(
        Object.entries(value.interactionFlags ?? {})
          .filter(([, flags]) => flags.isDirty)
          .map(([field]) => field),
      ),
      validatingFields: new Set(
        validationEntries
          .filter(([, result]) => result.partial)
          .map(([field]) => field),
      ),
      enabled: value.enabled ?? true,
      itemLabelPosition: value.itemLabelPosition,
      itemLabelWidth: value.itemLabelWidth,
      itemLabelBreak: value.itemLabelBreak,
      itemRequireLabelMode: value.itemRequireLabelMode,
      verboseValidationFeedback: value.verboseValidationFeedback,
      fieldPrefix: undefined,
      getValue,
      setValue,
      isFieldValid,
      validateField,
      registerItem,
      validationIconSuccess: value.validationIconSuccess,
      validationIconError: value.validationIconError,
    };
  }, [getValue, isFieldValid, registerItem, setValue, validateField, value]);
}

export function useIsInsideForm(){
  const contextPart = useFormContextPart((value) => value?.dispatch);
  return contextPart !== undefined;
}

export const formControlTypes = [
  "text",
  "password",
  "textarea",
  "checkbox",
  "number",
  "integer",
  "number2",
  "integer2",
  "file",
  "select",
  "autocomplete",
  "datePicker",
  "radioGroup",
  "custom",
  "switch",
  "slider",
  "colorpicker",
  "items",
] as const;

export const formControlTypesMd: PropertyValueDescription[] = [
  {
    value: "text",
    description: "Renders TextBox",
  },
  {
    value: "password",
    description: "Renders TextBox with `password` type",
  },
  {
    value: "textarea",
    description: "Renders Textarea",
  },
  {
    value: "checkbox",
    description: "Renders Checkbox",
  },
  {
    value: "number",
    description: "Renders NumberBox",
  },
  {
    value: "integer",
    description: "Renders NumberBox with `integersOnly` set to true",
  },
  {
    value: "file",
    description: "Renders FileInput",
  },
  {
    value: "datePicker",
    description: "Renders DatePicker",
  },
  {
    value: "radioGroup",
    description: "Renders RadioGroup",
  },
  {
    value: "switch",
    description: "Renders Switch",
  },
  {
    value: "select",
    description: "Renders Select",
  },
  {
    value: "autocomplete",
    description: "Renders AutoComplete",
  },
  {
    value: "slider",
    description: "Renders Slider",
  },
  {
    value: "colorpicker",
    description: "Renders ColorPicker",
  },
  {
    value: "items",
    description: "Renders Items",
  },
  {
    value: "custom",
    description:
      "A custom control specified in children. If `type` is not specified " +
      "but the `FormItem` has children, it considers the control a custom one.",
  },
];
export type FormControlType = (typeof formControlTypes)[number];
