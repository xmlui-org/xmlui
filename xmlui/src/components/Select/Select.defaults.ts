export type SelectVariant = "default" | "outlined";

export const defaultProps = {
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
  variant: "default" as SelectVariant,
};
