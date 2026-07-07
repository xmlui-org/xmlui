import type { ValidationStatus } from "../abstractions";

export const defaultProps: {
  step: number;
  min: number;
  max: number;
  enabled: boolean;
  validationStatus: ValidationStatus;
  tabIndex: number;
  showValues: boolean;
  valueFormat: (value: number) => string;
  minStepsBetweenThumbs: number;
} = {
  step: 1,
  min: 0,
  max: 10,
  enabled: true,
  validationStatus: "none",
  tabIndex: -1,
  showValues: true,
  valueFormat: (value: number) => value.toString(),
  minStepsBetweenThumbs: 1,
};
