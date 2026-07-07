import type { ValidationStatus } from "../abstractions";

export const defaultProps: {
  maxRating: number;
  enabled: boolean;
  readOnly: boolean;
  initialValue?: number;
  value?: number;
  validationStatus: ValidationStatus;
  invalidMessages: string[];
} = {
  maxRating: 5,
  enabled: true,
  readOnly: false,
  initialValue: undefined,
  value: undefined,
  validationStatus: "none",
  invalidMessages: [],
};
