import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dRequired,
} from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./DateInput.defaults";
import { DateInputNative, dateFormats, DateInputModeValues, type DateInputApi, WeekDays } from "./DateInputReact";

const COMP = "DateInput";

const dateInputStylesSource = `
$borderRadius-DateInput: createThemeVar("borderRadius-DateInput");
$borderColor-DateInput: createThemeVar("borderColor-DateInput");
$borderWidth-DateInput: createThemeVar("borderWidth-DateInput");
$borderStyle-DateInput: createThemeVar("borderStyle-DateInput");
$fontSize-DateInput: createThemeVar("fontSize-DateInput");
$backgroundColor-DateInput: createThemeVar("backgroundColor-DateInput");
$boxShadow-DateInput: createThemeVar("boxShadow-DateInput");
$textColor-DateInput: createThemeVar("textColor-DateInput");
$borderColor-DateInput--hover: createThemeVar("borderColor-DateInput--hover");
$backgroundColor-DateInput--hover: createThemeVar("backgroundColor-DateInput--hover");
$boxShadow-DateInput--hover: createThemeVar("boxShadow-DateInput--hover");
$textColor-DateInput--hover: createThemeVar("textColor-DateInput--hover");
$borderColor-DateInput--focus: createThemeVar("borderColor-DateInput--focus");
$backgroundColor-DateInput--focus: createThemeVar("backgroundColor-DateInput--focus");
$boxShadow-DateInput--focus: createThemeVar("boxShadow-DateInput--focus");
$textColor-DateInput--focus: createThemeVar("textColor-DateInput--focus");
$outlineWidth-DateInput--focus: createThemeVar("outlineWidth-DateInput--focus");
$outlineColor-DateInput--focus: createThemeVar("outlineColor-DateInput--focus");
$outlineStyle-DateInput--focus: createThemeVar("outlineStyle-DateInput--focus");
$outlineOffset-DateInput--focus: createThemeVar("outlineOffset-DateInput--focus");
$borderRadius-DateInput--error: createThemeVar("borderRadius-DateInput--error");
$borderColor-DateInput--error: createThemeVar("borderColor-DateInput--error");
$borderWidth-DateInput--error: createThemeVar("borderWidth-DateInput--error");
$borderStyle-DateInput--error: createThemeVar("borderStyle-DateInput--error");
$fontSize-DateInput--error: createThemeVar("fontSize-DateInput--error");
$backgroundColor-DateInput--error: createThemeVar("backgroundColor-DateInput--error");
$boxShadow-DateInput--error: createThemeVar("boxShadow-DateInput--error");
$textColor-DateInput--error: createThemeVar("textColor-DateInput--error");
$borderColor-DateInput--error--hover: createThemeVar("borderColor-DateInput--error--hover");
$backgroundColor-DateInput--error--hover: createThemeVar("backgroundColor-DateInput--error--hover");
$boxShadow-DateInput--error--hover: createThemeVar("boxShadow-DateInput--error--hover");
$textColor-DateInput--error--hover: createThemeVar("textColor-DateInput--error--hover");
$borderColor-DateInput--error--focus: createThemeVar("borderColor-DateInput--error--focus");
$backgroundColor-DateInput--error--focus: createThemeVar("backgroundColor-DateInput--error--focus");
$boxShadow-DateInput--error--focus: createThemeVar("boxShadow-DateInput--error--focus");
$textColor-DateInput--error--focus: createThemeVar("textColor-DateInput--error--focus");
$outlineWidth-DateInput--error--focus: createThemeVar("outlineWidth-DateInput--error--focus");
$outlineColor-DateInput--error--focus: createThemeVar("outlineColor-DateInput--error--focus");
$outlineStyle-DateInput--error--focus: createThemeVar("outlineStyle-DateInput--error--focus");
$outlineOffset-DateInput--error--focus: createThemeVar("outlineOffset-DateInput--error--focus");
$borderRadius-DateInput--warning: createThemeVar("borderRadius-DateInput--warning");
$borderColor-DateInput--warning: createThemeVar("borderColor-DateInput--warning");
$borderWidth-DateInput--warning: createThemeVar("borderWidth-DateInput--warning");
$borderStyle-DateInput--warning: createThemeVar("borderStyle-DateInput--warning");
$fontSize-DateInput--warning: createThemeVar("fontSize-DateInput--warning");
$backgroundColor-DateInput--warning: createThemeVar("backgroundColor-DateInput--warning");
$boxShadow-DateInput--warning: createThemeVar("boxShadow-DateInput--warning");
$textColor-DateInput--warning: createThemeVar("textColor-DateInput--warning");
$borderColor-DateInput--warning--hover: createThemeVar("borderColor-DateInput--warning--hover");
$backgroundColor-DateInput--warning--hover: createThemeVar("backgroundColor-DateInput--warning--hover");
$boxShadow-DateInput--warning--hover: createThemeVar("boxShadow-DateInput--warning--hover");
$textColor-DateInput--warning--hover: createThemeVar("textColor-DateInput--warning--hover");
$borderColor-DateInput--warning--focus: createThemeVar("borderColor-DateInput--warning--focus");
$backgroundColor-DateInput--warning--focus: createThemeVar("backgroundColor-DateInput--warning--focus");
$boxShadow-DateInput--warning--focus: createThemeVar("boxShadow-DateInput--warning--focus");
$textColor-DateInput--warning--focus: createThemeVar("textColor-DateInput--warning--focus");
$outlineWidth-DateInput--warning--focus: createThemeVar("outlineWidth-DateInput--warning--focus");
$outlineColor-DateInput--warning--focus: createThemeVar("outlineColor-DateInput--warning--focus");
$outlineStyle-DateInput--warning--focus: createThemeVar("outlineStyle-DateInput--warning--focus");
$outlineOffset-DateInput--warning--focus: createThemeVar("outlineOffset-DateInput--warning--focus");
$borderRadius-DateInput--success: createThemeVar("borderRadius-DateInput--success");
$borderColor-DateInput--success: createThemeVar("borderColor-DateInput--success");
$borderWidth-DateInput--success: createThemeVar("borderWidth-DateInput--success");
$borderStyle-DateInput--success: createThemeVar("borderStyle-DateInput--success");
$fontSize-DateInput--success: createThemeVar("fontSize-DateInput--success");
$backgroundColor-DateInput--success: createThemeVar("backgroundColor-DateInput--success");
$boxShadow-DateInput--success: createThemeVar("boxShadow-DateInput--success");
$textColor-DateInput--success: createThemeVar("textColor-DateInput--success");
$borderColor-DateInput--success--hover: createThemeVar("borderColor-DateInput--success--hover");
$backgroundColor-DateInput--success--hover: createThemeVar("backgroundColor-DateInput--success--hover");
$boxShadow-DateInput--success--hover: createThemeVar("boxShadow-DateInput--success--hover");
$textColor-DateInput--success--hover: createThemeVar("textColor-DateInput--success--hover");
$borderColor-DateInput--success--focus: createThemeVar("borderColor-DateInput--success--focus");
$backgroundColor-DateInput--success--focus: createThemeVar("backgroundColor-DateInput--success--focus");
$boxShadow-DateInput--success--focus: createThemeVar("boxShadow-DateInput--success--focus");
$textColor-DateInput--success--focus: createThemeVar("textColor-DateInput--success--focus");
$outlineWidth-DateInput--success--focus: createThemeVar("outlineWidth-DateInput--success--focus");
$outlineColor-DateInput--success--focus: createThemeVar("outlineColor-DateInput--success--focus");
$outlineStyle-DateInput--success--focus: createThemeVar("outlineStyle-DateInput--success--focus");
$outlineOffset-DateInput--success--focus: createThemeVar("outlineOffset-DateInput--success--focus");
$color-divider-DateInput: createThemeVar("color-divider-DateInput");
$spacing-divider-DateInput: createThemeVar("spacing-divider-DateInput");
$width-input-DateInput: createThemeVar("width-input-DateInput");
$minWidth-input-DateInput: createThemeVar("minWidth-input-DateInput");
$padding-input-DateInput: createThemeVar("padding-input-DateInput");
$textAlign-input-DateInput: createThemeVar("textAlign-input-DateInput");
$borderRadius-input-DateInput: createThemeVar("borderRadius-input-DateInput");
$backgroundColor-input-DateInput-invalid: createThemeVar("backgroundColor-input-DateInput-invalid");
$padding-button-DateInput: createThemeVar("padding-button-DateInput");
$borderRadius-button-DateInput: createThemeVar("borderRadius-button-DateInput");
$hoverColor-button-DateInput: createThemeVar("hoverColor-button-DateInput");
$disabledColor-button-DateInput: createThemeVar("disabledColor-button-DateInput");
$outlineColor-button-DateInput--focused: createThemeVar("outlineColor-button-DateInput--focused");
$outlineWidth-button-DateInput--focused: createThemeVar("outlineWidth-button-DateInput--focused");
$outlineOffset-button-DateInput--focused: createThemeVar("outlineOffset-button-DateInput--focused");
$opacity-DateInput--disabled: createThemeVar("opacity-DateInput--disabled");
$backgroundColor-DateInput--disabled: createThemeVar("backgroundColor-DateInput--disabled");
$textColor-DateInput--disabled: createThemeVar("textColor-DateInput--disabled");
$borderColor-DateInput--disabled: createThemeVar("borderColor-DateInput--disabled");
$minHeight-DateInput: createThemeVar("minHeight-DateInput");
$gap-adornment-DateInput: createThemeVar("gap-adornment-DateInput");
`;

export const DateInputMd = createMetadata({
  status: "experimental",
  description:
    "`DateInput` provides a text-based date input interface for selecting single dates or date ranges.",
  parts: {
    day: { description: "The day input field." },
    month: { description: "The month input field." },
    year: { description: "The year input field." },
    clearButton: { description: "The button to clear the date input." },
    conciseValidationFeedback: {
      description: "The concise validation feedback indicator shown when verboseValidationFeedback is false.",
    },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    initialValue: dInitialValue(null, "string"),
    value: { description: "Controlled value.", valueType: "string" },
    label: { description: "The input label.", valueType: "string" },
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    required: dRequired(),
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: defaultProps.validationStatus },
    invalidMessages: { description: "Invalid messages to display.", valueType: "string[]" },
    mode: {
      description: "The mode of the date input.",
      valueType: "string",
      availableValues: DateInputModeValues,
      defaultValue: defaultProps.mode,
    },
    dateFormat: {
      description: "The format of the date displayed in the input field.",
      valueType: "string",
      availableValues: dateFormats,
      defaultValue: defaultProps.dateFormat,
    },
    emptyCharacter: {
      description: "Character used to create placeholder text for empty input fields.",
      valueType: "string",
      defaultValue: defaultProps.emptyCharacter,
    },
    showWeekNumber: { description: "DatePicker-compatible property.", valueType: "boolean", defaultValue: defaultProps.showWeekNumber },
    weekStartsOn: {
      description: "DatePicker-compatible first day of week.",
      valueType: "number",
      defaultValue: defaultProps.weekStartsOn,
      availableValues: [
        { value: WeekDays.Sunday, description: "Sunday" },
        { value: WeekDays.Monday, description: "Monday" },
        { value: WeekDays.Tuesday, description: "Tuesday" },
        { value: WeekDays.Wednesday, description: "Wednesday" },
        { value: WeekDays.Thursday, description: "Thursday" },
        { value: WeekDays.Friday, description: "Friday" },
        { value: WeekDays.Saturday, description: "Saturday" },
      ],
    },
    minValue: { description: "The optional start date of the selectable date range.", valueType: "string" },
    maxValue: { description: "The optional end date of the selectable date range.", valueType: "string" },
    disabledDates: { description: "DatePicker-compatible disabled date list.", valueType: "any" },
    inline: { description: "DatePicker-compatible inline flag.", valueType: "boolean", defaultValue: defaultProps.inline },
    clearable: { description: "Whether to show a clear button.", valueType: "boolean", defaultValue: defaultProps.clearable },
    clearIcon: { description: "Icon name for the clear button.", valueType: "string" },
    clearToInitialValue: {
      description: "Whether clearing resets to the initial value or null.",
      valueType: "boolean",
      defaultValue: defaultProps.clearToInitialValue,
    },
    startText: { description: "Text displayed before the input.", valueType: "string" },
    startIcon: { description: "Icon displayed before the input.", valueType: "string" },
    endText: { description: "Text displayed after the input.", valueType: "string" },
    endIcon: { description: "Icon displayed after the input.", valueType: "string" },
    gap: { description: "The gap between input elements.", valueType: "string" },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    validationIconSuccess: { description: "Success validation icon.", valueType: "string" },
    validationIconError: { description: "Error validation icon.", valueType: "string" },
    bindTo: { description: "Binds the input to form data.", valueType: "string" },
    requireLabelMode: { description: "Controls required/optional label markers.", valueType: "string" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: { description: `Focus the ${COMP} component.`, signature: "focus(): void" },
    value: { description: "Returns the current date value.", signature: "get value(): any" },
    setValue: { description: `Sets the current ${COMP} value.`, signature: "setValue(value: any): void" },
    isoValue: {
      description: "Gets the current date value formatted as YYYY-MM-DD.",
      signature: "isoValue(): string | null",
    },
  },
  themeVars: extractScssThemeVars(dateInputStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "0 0.25rem",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "start",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 6px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "2px",
    [`opacity-${COMP}--disabled`]: "0.5",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor-disabled",
    [`textColor-${COMP}--disabled`]: "$textColor-disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor-disabled",
    [`minHeight-${COMP}`]: "$space-8",
    [`gap-adornment-${COMP}`]: "$space-2",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`fontSize-${COMP}`]: "$fontSize-base",
    [`boxShadow-${COMP}`]: "none",
    [`textColor-${COMP}`]: "$textColor-primary",
    [`borderColor-${COMP}--hover`]: `$borderColor-${COMP}`,
    [`backgroundColor-${COMP}--hover`]: `$backgroundColor-${COMP}`,
    [`boxShadow-${COMP}--hover`]: `$boxShadow-${COMP}`,
    [`textColor-${COMP}--hover`]: `$textColor-${COMP}`,
    [`borderColor-${COMP}--focus`]: "$color-primary-500",
    [`backgroundColor-${COMP}--focus`]: `$backgroundColor-${COMP}`,
    [`boxShadow-${COMP}--focus`]: `$boxShadow-${COMP}`,
    [`textColor-${COMP}--focus`]: `$textColor-${COMP}`,
    [`outlineWidth-${COMP}--focus`]: "0",
    [`outlineColor-${COMP}--focus`]: "$color-primary-500",
    [`outlineStyle-${COMP}--focus`]: "solid",
    [`outlineOffset-${COMP}--focus`]: "0",
    [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--error`]: "$color-danger-500",
    [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
    [`fontSize-${COMP}--error`]: `$fontSize-${COMP}`,
    [`backgroundColor-${COMP}--error`]: `$backgroundColor-${COMP}`,
    [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
    [`textColor-${COMP}--error`]: `$textColor-${COMP}`,
    [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
    [`backgroundColor-${COMP}--error--hover`]: `$backgroundColor-${COMP}--error`,
    [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
    [`textColor-${COMP}--error--hover`]: `$textColor-${COMP}--error`,
    [`borderColor-${COMP}--warning`]: "$color-warn-500",
    [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
    [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
    [`fontSize-${COMP}--warning`]: `$fontSize-${COMP}`,
    [`backgroundColor-${COMP}--warning`]: `$backgroundColor-${COMP}`,
    [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
    [`textColor-${COMP}--warning`]: `$textColor-${COMP}`,
    [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
    [`backgroundColor-${COMP}--warning--hover`]: `$backgroundColor-${COMP}--warning`,
    [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
    [`textColor-${COMP}--warning--hover`]: `$textColor-${COMP}--warning`,
    [`borderColor-${COMP}--success`]: "$color-success-500",
    [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
    [`borderWidth-${COMP}--success`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--success`]: `$borderStyle-${COMP}`,
    [`fontSize-${COMP}--success`]: `$fontSize-${COMP}`,
    [`backgroundColor-${COMP}--success`]: `$backgroundColor-${COMP}`,
    [`boxShadow-${COMP}--success`]: `$boxShadow-${COMP}`,
    [`textColor-${COMP}--success`]: `$textColor-${COMP}`,
    [`borderColor-${COMP}--success--hover`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-${COMP}--success--hover`]: `$backgroundColor-${COMP}--success`,
    [`boxShadow-${COMP}--success--hover`]: `$boxShadow-${COMP}--success`,
    [`textColor-${COMP}--success--hover`]: `$textColor-${COMP}--success`,
  },
  limitThemeVarsToComponent: true,
});

export const dateInputRenderer = wrapComponent({
  name: COMP,
  metadata: DateInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <DateInputNative
      {...adapter.rootAttrs("input")}
      ref={(api: DateInputApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue")}
      label={adapter.prop("label")}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      required={adapter.booleanProp("required", defaultProps.required)}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      mode={adapter.stringProp("mode", defaultProps.mode)}
      dateFormat={adapter.stringProp("dateFormat", defaultProps.dateFormat)}
      showWeekNumber={adapter.booleanProp("showWeekNumber", defaultProps.showWeekNumber)}
      weekStartsOn={Number(adapter.prop("weekStartsOn", defaultProps.weekStartsOn))}
      minValue={adapter.stringProp("minValue")}
      maxValue={adapter.stringProp("maxValue")}
      disabledDates={adapter.prop("disabledDates")}
      inline={adapter.booleanProp("inline", defaultProps.inline)}
      clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
      clearIcon={adapter.stringProp("clearIcon")}
      clearToInitialValue={adapter.booleanProp("clearToInitialValue", defaultProps.clearToInitialValue)}
      emptyCharacter={adapter.stringProp("emptyCharacter", defaultProps.emptyCharacter)}
      startText={adapter.prop("startText")}
      startIcon={adapter.prop("startIcon")}
      endText={adapter.prop("endText")}
      endIcon={adapter.prop("endIcon")}
      gap={adapter.stringProp("gap")}
      verboseValidationFeedback={adapter.booleanProp("verboseValidationFeedback", true)}
      validationIconSuccess={adapter.stringProp("validationIconSuccess")}
      validationIconError={adapter.stringProp("validationIconError")}
      invalidMessages={adapter.prop("invalidMessages") as string[] | undefined}
      onDidChange={(value) => {
        void adapter.event("didChange")(value);
      }}
      onFocus={() => {
        void adapter.event("gotFocus")();
        void adapter.event("focus")();
      }}
      onBlur={() => {
        void adapter.event("lostFocus")();
      }}
      onInvalidChange={() => {
        void adapter.event("invalidChange")();
      }}
    />
  ),
});
