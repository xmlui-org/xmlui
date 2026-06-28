import type { ValidationStatus } from "../abstractions";

export const defaultProps: {
  initialValue: boolean;
  value: boolean;
  enabled: boolean;
  validationStatus: ValidationStatus;
  indeterminate: boolean;
} = {
  initialValue: false,
  value: false,
  enabled: true,
  validationStatus: "none",
  indeterminate: false,
};
