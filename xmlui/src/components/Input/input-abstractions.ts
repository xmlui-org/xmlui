import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { PropertyComponentDescriptorHash, EventDescriptorHash } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";

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

// Use these property descriptor in concrete input view component metadata
export const inputViewPropertyDescriptors: PropertyComponentDescriptorHash<InputViewComponentDef<"_Input_">> = {
  placeholder: desc("Placeholder text to sign the input is empty"),
  initialValue: desc("The initial value to display"),
  maxLength: desc("The maximum length of the input text"),
  autoFocus: desc("Should the component be automatically focused?"),
  helperText: desc("Helper text to display with the component"),
  required: desc("Is the component value required (use for indication)?"),
  label: desc("Optional label to display"),
  readOnly: desc("Is the component read-only?"),
  allowCopy: desc("Allow copying the component value to the clipboard?"),
  validators: desc("Optional list of validators to check the component's value"),
  enabled: desc("Is the component enabled?"),
  hideHelperText: desc("Indicate that the component should hide its helper text"),
  status: desc("The validation status of the component"),
};

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

// --- Use these property descriptor in concrete input view component metadata
export const inputComponentPropertyDescriptors: PropertyComponentDescriptorHash<
  InputComponentDef<"_Input_"> & Adornments
> = {
  placeholder: desc("Placeholder text to sign the input is empty"),
  value: desc("The current value to display"),
  initialValue: desc("The initial value to display"),
  labelId: desc("ID of the label attached to this input"),
  maxLength: desc("The maximum length of the input text"),
  autoFocus: desc("Should the component be automatically focused?"),
  required: desc("Is the component value required (use for indication)?"),
  readOnly: desc("Is the component read-only?"),
  allowCopy: desc("Allow copying the component value to the clipboard?"),
  enabled: desc("Is the component enabled?"),
  validationStatus: desc("The validation status of the component"),
  // --- Adornment props
  startText: desc("Text rendered at the start of the input"),
  startIcon: desc("Icon rendered at the start of the input"),
  endText: desc("Text rendered at the end of the input"),
  endIcon: desc("Icon rendered at the end of the input"),
};

export const inputComponentEventDescriptors: EventDescriptorHash<InputComponentDef<"_Input_">> = {
  change: desc("Triggered when the input value changes"),
  gotFocus: desc("Triggered when the input gains focus"),
  lostFocus: desc("triggered when the input has lost focus"),
};

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
export type ValidationStatus = typeof validationStatusValues[number];

// The validation result of a particular component
export type ValidationResult = {
  status: ValidationStatus;
  message?: string;
};
