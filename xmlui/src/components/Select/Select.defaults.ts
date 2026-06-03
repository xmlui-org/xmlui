import type { ValidationStatus } from "../abstractions";

export type SelectVariant = "default" | "outlined";

export const defaultProps: {
  enabled: boolean;
  placeholder: string;
  autoFocus: boolean;
  searchable: boolean;
  multiSelect: boolean;
  required: boolean;
  inProgress: boolean;
  inProgressNotificationMessage: string;
  readOnly: boolean;
  validationStatus: ValidationStatus;
  labelBreak: boolean;
  clearable: boolean;
  modal: boolean;
  variant: SelectVariant;
} = {
  enabled: true,
  placeholder: "",
  autoFocus: false,
  searchable: false,
  multiSelect: false,
  required: false,
  inProgress: false,
  inProgressNotificationMessage: "",
  readOnly: false,
  validationStatus: "none",
  labelBreak: false,
  clearable: false,
  modal: false,
  variant: "default",
};
