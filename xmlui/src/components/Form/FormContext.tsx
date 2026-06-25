import { createContext, useContext } from "react";

export type FormValues = Record<string, unknown>;

export type FormItemRegistration = {
  name: string;
  label?: string;
  required?: boolean;
  requiredInvalidMessage?: string;
  validate?: (value: unknown) => unknown | Promise<unknown>;
};

export type FormContextValue = {
  values: FormValues;
  errors: Record<string, string>;
  dirtyFields: ReadonlySet<string>;
  validatingFields: ReadonlySet<string>;
  enabled: boolean;
  itemLabelPosition?: string;
  itemLabelWidth?: string | number;
  itemLabelBreak?: boolean;
  itemRequireLabelMode?: string;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  validateField: (name: string, value?: unknown) => Promise<string | undefined>;
  registerItem: (registration: FormItemRegistration) => () => void;
};

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const FormProvider = FormContext.Provider;

export function useFormContext(): FormContextValue | undefined {
  return useContext(FormContext);
}
