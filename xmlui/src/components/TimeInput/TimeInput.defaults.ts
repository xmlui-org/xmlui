import type { ValidationStatus } from "../abstractions";

export const defaultProps = {
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  hour24: true,
  seconds: false,
  clearable: false,
  clearToInitialValue: false,
  required: false,
  readOnly: false,
  autoFocus: false,
  emptyCharacter: "-",
};
