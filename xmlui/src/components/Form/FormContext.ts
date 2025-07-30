import type { Dispatch } from "react";
import { createContext, useContext, useContextSelector } from "use-context-selector";

import type { ContainerAction } from "../../components-core/rendering/containers";
import type { FormAction } from "../Form/formActions";
import type { LabelPosition } from "../abstractions";
import type { PropertyValueDescription } from "../../abstractions/ComponentDefs";

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
  enabled?: boolean;
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

export const validationSeverityValues = ["error", "warning", "valid", "none"] as const;
export type ValidationSeverity = (typeof validationSeverityValues)[number];
export const validationSeverityMd: PropertyValueDescription[] = [
  { value: "valid", description: "Visual indicator for an input that is accepted" },
  { value: "warning", description: "Visual indicator for an input that produced a warning" },
  { value: "error", description: "Visual indicator for an input that produced an error" },
];

export type ValidateEventHandler = ((value: any) => Promise<ValidateFunctionResult>) | undefined;

type ValidateFunctionResult = boolean | SingleValidationResult | Array<SingleValidationResult>;

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

export function useFormContextPart<T = unknown>(selector: (value: IFormContext) => T) {
  return useContextSelector(FormContext, selector);
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
