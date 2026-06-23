export const dateFormats = [
  "MM/dd/yyyy",
  "MM-dd-yyyy",
  "yyyy/MM/dd",
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "dd-MM-yyyy",
  "yyyyMMdd",
  "MMddyyyy",
] as const;

export type DateFormat = (typeof dateFormats)[number];
export const DateInputModeValues = ["single", "range"] as const;
export type DateInputMode = (typeof DateInputModeValues)[number];

export const enum WeekDays {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
