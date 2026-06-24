import { createContext, useContext } from "react";

export type FormValues = Record<string, unknown>;

export type FormItemRegistration = {
  name: string;
  label?: string;
  required?: boolean;
  requiredInvalidMessage?: string;
};

export type FormContextValue = {
  values: FormValues;
  errors: Record<string, string>;
  dirtyFields: ReadonlySet<string>;
  enabled: boolean;
  getValue: (name: string) => unknown;
  setValue: (name: string, value: unknown) => void;
  registerItem: (registration: FormItemRegistration) => () => void;
};

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const FormProvider = FormContext.Provider;

export function useFormContext(): FormContextValue | undefined {
  return useContext(FormContext);
}
