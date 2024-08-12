import { createContext, useContextSelector } from "use-context-selector";
import type {Dispatch} from "react";
import type { ContainerAction } from "@components-core/abstractions/containers";
import type {FormAction} from "@components/Form/formActions";
import type { LabelPosition } from "@components/FormItem/ItemWithLabel";

export type InteractionFlags = {
  isDirty: boolean;
  invalidToValid: boolean;
  isValidOnFocus: boolean;
  isValidLostFocus: boolean;
  focused: boolean;
  forceShowValidationResult: boolean;
};

interface IFormContext {
  subject: Record<string, any>;
  originalSubject: Record<string, any>;
  validationResults: Record<string, ValidationResult>;
  interactionFlags: Record<string, InteractionFlags>;
  dispatch: Dispatch<ContainerAction | FormAction>;
  itemLabelWidth?: string;
  itemLabelBreak?: boolean;
  itemLabelPosition?: string | LabelPosition;
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
  required: boolean | undefined;
  requiredInvalidMessage: string | undefined;
  minLength: number | undefined;
  maxLength: number | undefined;
  lengthInvalidMessage: string | undefined;
  lengthInvalidSeverity: ValidationSeverity | undefined;
  minValue: number | undefined;
  maxValue: number | undefined;
  rangeInvalidMessage: string | undefined;
  rangeInvalidSeverity: ValidationSeverity | undefined;
  pattern: string | undefined;
  patternInvalidMessage: string | undefined;
  patternInvalidSeverity: ValidationSeverity | undefined;
  regex: string | undefined;
  regexInvalidMessage: string | undefined;
  regexInvalidSeverity: ValidationSeverity | undefined;
}

export type ValidationSeverity = "error" | "warning" | "valid" | "none";

export type ValidateEventHandler = ((value: any) => Promise<ValidateFunctionResult>) | undefined;

type ValidateFunctionResult = boolean | SingleValidationResult | Array<SingleValidationResult>;

export type ValidationMode = "errorLate"| "onChanged"| "onLostFocus";

export const FormContext = createContext<IFormContext>(undefined as unknown as IFormContext);

export function useFormContextPart<T = unknown>(selector: (value: IFormContext) => T) {
  return useContextSelector(FormContext, selector);
}
