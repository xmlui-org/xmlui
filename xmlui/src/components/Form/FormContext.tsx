import { createContext, useContext } from "react";

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
  patternInvalidSeverity?: "error" | "warning" | string;
  regex?: string;
  regexInvalidMessage?: string;
  regexInvalidSeverity?: "error" | "warning" | string;
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
};

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const FormProvider = FormContext.Provider;

export function useFormContext(): FormContextValue | undefined {
  return useContext(FormContext);
}
