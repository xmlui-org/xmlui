import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
} from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./DatePicker.defaults";
import { dateFormats } from "./DatePicker.constants";

const COMP = "DatePicker";

const datePickerStylesSource = `
$borderRadius-DatePicker: createThemeVar("borderRadius-DatePicker");
$borderColor-DatePicker: createThemeVar("borderColor-DatePicker");
$borderWidth-DatePicker: createThemeVar("borderWidth-DatePicker");
$borderStyle-DatePicker: createThemeVar("borderStyle-DatePicker");
$backgroundColor-DatePicker: createThemeVar("backgroundColor-DatePicker");
$boxShadow-DatePicker: createThemeVar("boxShadow-DatePicker");
$textColor-DatePicker: createThemeVar("textColor-DatePicker");
$fontSize-DatePicker: createThemeVar("fontSize-DatePicker");
$minHeight-DatePicker: createThemeVar("minHeight-DatePicker");
$borderColor-DatePicker--hover: createThemeVar("borderColor-DatePicker--hover");
$backgroundColor-DatePicker--hover: createThemeVar("backgroundColor-DatePicker--hover");
$outlineWidth-DatePicker--focus: createThemeVar("outlineWidth-DatePicker--focus");
$outlineColor-DatePicker--focus: createThemeVar("outlineColor-DatePicker--focus");
$outlineStyle-DatePicker--focus: createThemeVar("outlineStyle-DatePicker--focus");
$outlineOffset-DatePicker--focus: createThemeVar("outlineOffset-DatePicker--focus");
$textColor-placeholder-DatePicker: createThemeVar("textColor-placeholder-DatePicker");
$color-adornment-DatePicker: createThemeVar("color-adornment-DatePicker");
$textColor-value-DatePicker: createThemeVar("textColor-value-DatePicker");
$backgroundColor-DatePicker--disabled: createThemeVar("backgroundColor-DatePicker--disabled");
$textColor-DatePicker--disabled: createThemeVar("textColor-DatePicker--disabled");
$borderColor-DatePicker--disabled: createThemeVar("borderColor-DatePicker--disabled");
$borderColor-DatePicker--error: createThemeVar("borderColor-DatePicker--error");
$borderColor-DatePicker--warning: createThemeVar("borderColor-DatePicker--warning");
$borderColor-DatePicker--success: createThemeVar("borderColor-DatePicker--success");
$boxShadow-menu-DatePicker: createThemeVar("boxShadow-menu-DatePicker");
$backgroundColor-menu-DatePicker: createThemeVar("backgroundColor-menu-DatePicker");
$borderColor-menu-DatePicker: createThemeVar("borderColor-menu-DatePicker");
$borderRadius-menu-DatePicker: createThemeVar("borderRadius-menu-DatePicker");
$backgroundColor-item-DatePicker--hover: createThemeVar("backgroundColor-item-DatePicker--hover");
$backgroundColor-day-DatePicker--selected: createThemeVar("backgroundColor-day-DatePicker--selected");
$textColor-day-DatePicker--selected: createThemeVar("textColor-day-DatePicker--selected");
$backgroundColor-day-DatePicker--rangeMiddle: createThemeVar("backgroundColor-day-DatePicker--rangeMiddle");
$textColor-day-DatePicker--rangeMiddle: createThemeVar("textColor-day-DatePicker--rangeMiddle");
$backgroundColor-day-DatePicker--today: createThemeVar("backgroundColor-day-DatePicker--today");
$textColor-day-DatePicker--today: createThemeVar("textColor-day-DatePicker--today");
$borderColor-day-DatePicker--today: createThemeVar("borderColor-day-DatePicker--today");
$borderWidth-day-DatePicker--today: createThemeVar("borderWidth-day-DatePicker--today");
$borderStyle-day-DatePicker--today: createThemeVar("borderStyle-day-DatePicker--today");
$backgroundColor-day-DatePicker--disabled: createThemeVar("backgroundColor-day-DatePicker--disabled");
$textColor-day-DatePicker--disabled: createThemeVar("textColor-day-DatePicker--disabled");
$textColor-weekday-DatePicker: createThemeVar("textColor-weekday-DatePicker");
$borderColor-selectedItem-DatePicker: createThemeVar("borderColor-selectedItem-DatePicker");
$paddingHorizontal-DatePicker: createThemeVar("paddingHorizontal-DatePicker");
$paddingVertical-DatePicker: createThemeVar("paddingVertical-DatePicker");
`;

export const DatePickerMd = createMetadata({
  status: "stable",
  description:
    "`DatePicker` provides an interactive calendar interface for selecting single dates or date ranges.",
  parts: {
    input: { description: "The input control." },
    calendar: { description: "The calendar popup or inline panel." },
    clearButton: { description: "The button to clear the date picker value." },
    conciseValidationFeedback: {
      description: "The concise validation feedback indicator shown when verboseValidationFeedback is false.",
    },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    bindTo: { description: "Binds the picker to form data.", valueType: "string" },
    placeholder: dPlaceholder(),
    value: { description: "Controlled value. In single mode, a date string; in range mode, a `{ from, to }` object." },
    initialValue: dInitialValue(null, "string"),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    required: dRequired(),
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: defaultProps.validationStatus },
    mode: {
      description: "The mode of the date picker.",
      valueType: "string",
      availableValues: ["single", "range"],
      defaultValue: defaultProps.mode,
    },
    label: { description: "Optional label rendered above the input.", valueType: "string" },
    dateFormat: {
      description: "The format of the date displayed in the input field.",
      valueType: "string",
      availableValues: dateFormats,
      defaultValue: defaultProps.dateFormat,
    },
    inline: { description: "If true, the calendar is always visible.", valueType: "boolean", defaultValue: defaultProps.inline },
    clearable: { description: "Set to true to show a clear button.", valueType: "boolean", defaultValue: defaultProps.clearable },
    weekStartsOn: { description: "The first day of the week. 0 is Sunday.", valueType: "number", defaultValue: defaultProps.weekStartsOn },
    showWeekNumber: { description: "Show week number cells in the day table.", valueType: "boolean", defaultValue: defaultProps.showWeekNumber },
    showWeekNumbers: { description: "Alias for showWeekNumber.", valueType: "boolean", defaultValue: defaultProps.showWeekNumbers },
    startDate: { description: "The earliest selectable date.", valueType: "string" },
    endDate: { description: "The latest selectable date.", valueType: "string" },
    minValue: { description: "Alias for startDate retained for documentation compatibility.", valueType: "string" },
    maxValue: { description: "Alias for endDate retained for documentation compatibility.", valueType: "string" },
    startText: { description: "Text displayed before the input.", valueType: "string" },
    startIcon: { description: "Icon displayed before the input.", valueType: "string" },
    endText: { description: "Text displayed after the input.", valueType: "string" },
    endIcon: { description: "Icon displayed after the input.", valueType: "string" },
    width: { description: "CSS width for the picker root.", valueType: "string" },
    locale: { description: "BCP 47 locale used for calendar labels.", valueType: "string", defaultValue: defaultProps.locale },
    timeZone: { description: "The time zone used for date calculations.", valueType: "string", defaultValue: defaultProps.timeZone },
    numOfMonths: { description: "The number of months displayed at once.", valueType: "number", defaultValue: defaultProps.numOfMonths },
    presets: { description: "Customizes range presets.", valueType: "any" },
    showPresets: { description: "Shows built-in range presets.", valueType: "boolean", defaultValue: defaultProps.showPresets },
    disabledDates: { description: "Optional date matchers that are disabled.", valueType: "any" },
    confirmRangeSelection: {
      description: "In range mode, show Cancel/Proceed controls before committing the selected range.",
      valueType: "boolean",
      defaultValue: defaultProps.confirmRangeSelection,
    },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    validationIconSuccess: { description: "Success validation icon.", valueType: "string" },
    validationIconError: { description: "Error validation icon.", valueType: "string" },
    invalidMessages: { description: "Invalid messages to display.", valueType: "string[]" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: { description: `Focus the ${COMP} component.`, signature: "focus(): void" },
    value: { description: "Returns the current date picker value.", signature: "get value(): any" },
    setValue: { description: `Sets the current ${COMP} value.`, signature: "setValue(value: string | { from?: string; to?: string }): void" },
    getValue: { description: `Return the current value of the ${COMP}.`, signature: "getValue(): string | { from?: string; to?: string } | undefined" },
  },
  contextVars: {
    value: { description: "Current value. Single mode returns a string; range mode returns `{ from, to }`." },
  },
  themeVars: extractScssThemeVars(datePickerStylesSource),
  defaultThemeVars: {
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`boxShadow-${COMP}`]: "none",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`fontSize-${COMP}`]: "$fontSize-base",
    [`minHeight-${COMP}`]: "$space-8",
    [`borderColor-${COMP}--hover`]: `$borderColor-${COMP}`,
    [`backgroundColor-${COMP}--hover`]: `$backgroundColor-${COMP}`,
    [`outlineWidth-${COMP}--focus`]: "2px",
    [`outlineColor-${COMP}--focus`]: "$color-primary-500",
    [`outlineStyle-${COMP}--focus`]: "solid",
    [`outlineOffset-${COMP}--focus`]: "0",
    [`textColor-placeholder-${COMP}`]: "$textColor-secondary",
    [`color-adornment-${COMP}`]: "$textColor-secondary",
    [`textColor-value-${COMP}`]: "$textColor-primary",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor-disabled",
    [`textColor-${COMP}--disabled`]: "$textColor-disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor-disabled",
    [`borderColor-${COMP}--error`]: "$color-danger-500",
    [`borderColor-${COMP}--warning`]: "$color-warn-500",
    [`borderColor-${COMP}--success`]: "$color-success-500",
    [`boxShadow-menu-${COMP}`]: "$boxShadow-md",
    [`backgroundColor-menu-${COMP}`]: "$color-surface-50",
    [`borderColor-menu-${COMP}`]: "$borderColor",
    [`borderRadius-menu-${COMP}`]: "$borderRadius",
    [`backgroundColor-item-${COMP}--hover`]: "$color-surface-100",
    [`backgroundColor-day-${COMP}--selected`]: "$color-primary-500",
    [`textColor-day-${COMP}--selected`]: "$color-surface-0",
    [`backgroundColor-day-${COMP}--rangeMiddle`]: "$color-primary-100",
    [`textColor-day-${COMP}--rangeMiddle`]: "$textColor-primary",
    [`backgroundColor-day-${COMP}--today`]: "transparent",
    [`textColor-day-${COMP}--today`]: "$textColor-primary",
    [`borderColor-day-${COMP}--today`]: "$color-secondary-300",
    [`borderWidth-day-${COMP}--today`]: "1px",
    [`borderStyle-day-${COMP}--today`]: "solid",
    [`backgroundColor-day-${COMP}--disabled`]: "transparent",
    [`textColor-day-${COMP}--disabled`]: "$color-secondary-300",
    [`textColor-weekday-${COMP}`]: "$color-secondary-300",
    [`borderColor-selectedItem-${COMP}`]: "$color-secondary-300",
    [`paddingHorizontal-${COMP}`]: "$space-3",
    [`paddingVertical-${COMP}`]: "$space-2",
  },
  limitThemeVarsToComponent: true,
});
