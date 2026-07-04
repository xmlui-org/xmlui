export const defaultProps = {
  mode: "single" as const,
  dateFormat: "MM/dd/yyyy",
  enabled: true,
  readOnly: false,
  required: false,
  autoFocus: false,
  inline: false,
  // The clear affordance is off by default; opt in with `clearable`.
  clearable: false,
  validationStatus: "none" as const,
  weekStartsOn: 0,
  showWeekNumber: false,
  showWeekNumbers: false,
  locale: "en-US",
  timeZone: "UTC",
  numOfMonths: 1,
  // Presets are off by default; opt in with showPresets, or implicitly by
  // supplying a custom `presets` list.
  showPresets: false,
  confirmRangeSelection: false,
};
