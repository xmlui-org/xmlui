import type { ValidationStatus, OrientationOptions } from "../abstractions";

export const defaultProps: {
  value: string;
  initialValue: string;
  enabled: boolean;
  validationStatus: ValidationStatus;
  required: boolean;
  readOnly: boolean;
  orientation: OrientationOptions;
  gap: string;
} = {
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none",
  required: false,
  readOnly: false,
  orientation: "vertical",
  gap: "$gap-normal",
};
