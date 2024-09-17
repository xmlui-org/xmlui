import type { ComponentDef } from "@abstractions/ComponentDefs";

// This type defines the common properties in input component definitions. Other input components may extend this
// definition with additional component properties.
export interface InputViewComponentDef<T extends string> extends ComponentDef<T> {
  // The unique identifier of an input component. While in ComponentDef it is optional, for
  // input controls it is mandatory
  uid: string;
  props: {
    placeholder?: string;
    initialValue?: string;
    maxLength?: number;
    autoFocus?: boolean;
    helperText?: string;
    required?: boolean;
    label?: string;
    readOnly?: boolean;
    allowCopy?: boolean;
    validators?: any;
    enabled?: string | boolean;
    hideHelperText?: boolean;
    status?: ValidationStatus;
  };
}

// This type defines the common properties in input component definitions. Other input components may extend this
// definition with additional component properties.
export interface InputComponentDef<T extends string> extends ComponentDef<T> {
  props: {
    placeholder?: string;
    value?: string | string[];
    initialValue?: string | string[];
    labelId?: string;
    maxLength?: number;
    autoFocus?: boolean;
    required?: boolean;
    readOnly?: boolean;
    allowCopy?: boolean;
    enabled?: string | boolean;
    validationStatus?: ValidationStatus;
  };
  events: {
    change?: string;
    didChange?: string;
    gotFocus?: string;
    lostFocus?: string;
  };
}

// Input control adornments
export interface Adornments {
  props: {
    startText?: string;
    startIcon?: string;
    endText?: string;
    endIcon?: string;
  };
}

// The state of a validated UI element
const validationStatusValues = ["none", "error", "warning", "valid"] as const;
export const validationStatusNames: string[] = [...validationStatusValues];
export type ValidationStatus = (typeof validationStatusValues)[number];

// The validation result of a particular component
export type ValidationResult = {
  status: ValidationStatus;
  message?: string;
};
