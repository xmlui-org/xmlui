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
import { defaultProps } from "./TimeInput.defaults";
import { TimeInputNative, type TimeInputApi } from "./TimeInputReact";

const COMP = "TimeInput";

const timeInputStylesSource = `
$borderRadius-TimeInput: createThemeVar("borderRadius-TimeInput");
$borderColor-TimeInput: createThemeVar("borderColor-TimeInput");
$borderWidth-TimeInput: createThemeVar("borderWidth-TimeInput");
$borderStyle-TimeInput: createThemeVar("borderStyle-TimeInput");
$fontSize-TimeInput: createThemeVar("fontSize-TimeInput");
$backgroundColor-TimeInput: createThemeVar("backgroundColor-TimeInput");
$boxShadow-TimeInput: createThemeVar("boxShadow-TimeInput");
$textColor-TimeInput: createThemeVar("textColor-TimeInput");
$borderColor-TimeInput--hover: createThemeVar("borderColor-TimeInput--hover");
$backgroundColor-TimeInput--hover: createThemeVar("backgroundColor-TimeInput--hover");
$boxShadow-TimeInput--hover: createThemeVar("boxShadow-TimeInput--hover");
$textColor-TimeInput--hover: createThemeVar("textColor-TimeInput--hover");
$borderColor-TimeInput--focus: createThemeVar("borderColor-TimeInput--focus");
$backgroundColor-TimeInput--focus: createThemeVar("backgroundColor-TimeInput--focus");
$boxShadow-TimeInput--focus: createThemeVar("boxShadow-TimeInput--focus");
$textColor-TimeInput--focus: createThemeVar("textColor-TimeInput--focus");
$outlineWidth-TimeInput--focus: createThemeVar("outlineWidth-TimeInput--focus");
$outlineColor-TimeInput--focus: createThemeVar("outlineColor-TimeInput--focus");
$outlineStyle-TimeInput--focus: createThemeVar("outlineStyle-TimeInput--focus");
$outlineOffset-TimeInput--focus: createThemeVar("outlineOffset-TimeInput--focus");
$borderRadius-TimeInput--error: createThemeVar("borderRadius-TimeInput--error");
$borderColor-TimeInput--error: createThemeVar("borderColor-TimeInput--error");
$borderWidth-TimeInput--error: createThemeVar("borderWidth-TimeInput--error");
$borderStyle-TimeInput--error: createThemeVar("borderStyle-TimeInput--error");
$fontSize-TimeInput--error: createThemeVar("fontSize-TimeInput--error");
$backgroundColor-TimeInput--error: createThemeVar("backgroundColor-TimeInput--error");
$boxShadow-TimeInput--error: createThemeVar("boxShadow-TimeInput--error");
$textColor-TimeInput--error: createThemeVar("textColor-TimeInput--error");
$borderColor-TimeInput--error--hover: createThemeVar("borderColor-TimeInput--error--hover");
$backgroundColor-TimeInput--error--hover: createThemeVar("backgroundColor-TimeInput--error--hover");
$boxShadow-TimeInput--error--hover: createThemeVar("boxShadow-TimeInput--error--hover");
$textColor-TimeInput--error--hover: createThemeVar("textColor-TimeInput--error--hover");
$borderRadius-TimeInput--warning: createThemeVar("borderRadius-TimeInput--warning");
$borderColor-TimeInput--warning: createThemeVar("borderColor-TimeInput--warning");
$borderWidth-TimeInput--warning: createThemeVar("borderWidth-TimeInput--warning");
$borderStyle-TimeInput--warning: createThemeVar("borderStyle-TimeInput--warning");
$fontSize-TimeInput--warning: createThemeVar("fontSize-TimeInput--warning");
$backgroundColor-TimeInput--warning: createThemeVar("backgroundColor-TimeInput--warning");
$boxShadow-TimeInput--warning: createThemeVar("boxShadow-TimeInput--warning");
$textColor-TimeInput--warning: createThemeVar("textColor-TimeInput--warning");
$borderColor-TimeInput--warning--hover: createThemeVar("borderColor-TimeInput--warning--hover");
$backgroundColor-TimeInput--warning--hover: createThemeVar("backgroundColor-TimeInput--warning--hover");
$boxShadow-TimeInput--warning--hover: createThemeVar("boxShadow-TimeInput--warning--hover");
$textColor-TimeInput--warning--hover: createThemeVar("textColor-TimeInput--warning--hover");
$borderRadius-TimeInput--success: createThemeVar("borderRadius-TimeInput--success");
$borderColor-TimeInput--success: createThemeVar("borderColor-TimeInput--success");
$borderWidth-TimeInput--success: createThemeVar("borderWidth-TimeInput--success");
$borderStyle-TimeInput--success: createThemeVar("borderStyle-TimeInput--success");
$fontSize-TimeInput--success: createThemeVar("fontSize-TimeInput--success");
$backgroundColor-TimeInput--success: createThemeVar("backgroundColor-TimeInput--success");
$boxShadow-TimeInput--success: createThemeVar("boxShadow-TimeInput--success");
$textColor-TimeInput--success: createThemeVar("textColor-TimeInput--success");
$borderColor-TimeInput--success--hover: createThemeVar("borderColor-TimeInput--success--hover");
$backgroundColor-TimeInput--success--hover: createThemeVar("backgroundColor-TimeInput--success--hover");
$boxShadow-TimeInput--success--hover: createThemeVar("boxShadow-TimeInput--success--hover");
$textColor-TimeInput--success--hover: createThemeVar("textColor-TimeInput--success--hover");
$color-divider-TimeInput: createThemeVar("color-divider-TimeInput");
$spacing-divider-TimeInput: createThemeVar("spacing-divider-TimeInput");
$width-input-TimeInput: createThemeVar("width-input-TimeInput");
$minWidth-input-TimeInput: createThemeVar("minWidth-input-TimeInput");
$padding-input-TimeInput: createThemeVar("padding-input-TimeInput");
$textAlign-input-TimeInput: createThemeVar("textAlign-input-TimeInput");
$fontSize-input-TimeInput: createThemeVar("fontSize-input-TimeInput");
$borderRadius-input-TimeInput: createThemeVar("borderRadius-input-TimeInput");
$backgroundColor-input-TimeInput-invalid: createThemeVar("backgroundColor-input-TimeInput-invalid");
$padding-button-TimeInput: createThemeVar("padding-button-TimeInput");
$borderRadius-button-TimeInput: createThemeVar("borderRadius-button-TimeInput");
$hoverColor-button-TimeInput: createThemeVar("hoverColor-button-TimeInput");
$disabledColor-button-TimeInput: createThemeVar("disabledColor-button-TimeInput");
$outlineColor-button-TimeInput--focused: createThemeVar("outlineColor-button-TimeInput--focused");
$outlineWidth-button-TimeInput--focused: createThemeVar("outlineWidth-button-TimeInput--focused");
$outlineOffset-button-TimeInput--focused: createThemeVar("outlineOffset-button-TimeInput--focused");
$minWidth-ampm-TimeInput: createThemeVar("minWidth-ampm-TimeInput");
$fontSize-ampm-TimeInput: createThemeVar("fontSize-ampm-TimeInput");
$opacity-TimeInput--disabled: createThemeVar("opacity-TimeInput--disabled");
$backgroundColor-TimeInput--disabled: createThemeVar("backgroundColor-TimeInput--disabled");
$textColor-TimeInput--disabled: createThemeVar("textColor-TimeInput--disabled");
$borderColor-TimeInput--disabled: createThemeVar("borderColor-TimeInput--disabled");
$minHeight-TimeInput: createThemeVar("minHeight-TimeInput");
$gap-adornment-TimeInput: createThemeVar("gap-adornment-TimeInput");
`;

export const TimeInputMd = createMetadata({
  status: "experimental",
  description:
    "`TimeInput` provides time input with support for 12-hour and 24-hour formats and configurable precision.",
  parts: {
    hour: { description: "The hour input field." },
    minute: { description: "The minute input field." },
    second: { description: "The second input field." },
    ampm: { description: "The AM/PM indicator." },
    clearButton: { description: "The button to clear the time input." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    initialValue: dInitialValue(null, "string"),
    value: { description: "Controlled value.", valueType: "string" },
    label: { description: "The input label.", valueType: "string" },
    labelWidth: { description: "The label width.", valueType: "string" },
    labelPosition: { description: "The label position.", valueType: "string" },
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    required: dRequired(),
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: defaultProps.validationStatus },
    hour24: {
      description: "Whether to use 24-hour format.",
      valueType: "boolean",
      defaultValue: defaultProps.hour24,
    },
    seconds: {
      description: "Whether to show seconds.",
      valueType: "boolean",
      defaultValue: defaultProps.seconds,
    },
    minTime: { description: "Minimum selectable time.", valueType: "string" },
    maxTime: { description: "Maximum selectable time.", valueType: "string" },
    clearable: { description: "Whether to show a clear button.", valueType: "boolean", defaultValue: defaultProps.clearable },
    clearIcon: { description: "Icon name for the clear button.", valueType: "string" },
    clearToInitialValue: {
      description: "Whether clearing resets to the initial value.",
      valueType: "boolean",
      defaultValue: defaultProps.clearToInitialValue,
    },
    startText: { description: "Text displayed before the input.", valueType: "string" },
    startIcon: { description: "Icon displayed before the input.", valueType: "string" },
    endText: { description: "Text displayed after the input.", valueType: "string" },
    endIcon: { description: "Icon displayed after the input.", valueType: "string" },
    gap: { description: "The gap between input elements.", valueType: "string" },
    emptyCharacter: {
      description: "Character used to create placeholder text for empty input fields.",
      valueType: "string",
      defaultValue: defaultProps.emptyCharacter,
    },
    bindTo: { description: "Binds the input to form data.", valueType: "string" },
    requireLabelMode: { description: "Controls required/optional label markers.", valueType: "string" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    invalidTime: {
      description: "Fired when the user enters an invalid time.",
      signature: "invalidTime(value: string): void",
      parameters: { value: "The invalid time value that was entered." },
    },
  },
  apis: {
    focus: { description: `Focus the ${COMP} component.`, signature: "focus(): void" },
    value: { description: "Returns the current time value.", signature: "get value(): any" },
    setValue: { description: `Sets the current ${COMP} value.`, signature: "setValue(value: any): void" },
    isoValue: {
      description: "Gets the current time value formatted as HH:MM:SS.",
      signature: "isoValue(): string | null",
    },
  },
  themeVars: extractScssThemeVars(timeInputStylesSource),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    [`color-divider-${COMP}`]: "$textColor-secondary",
    [`spacing-divider-${COMP}`]: "1px 0",
    [`width-input-${COMP}`]: "1.8em",
    [`minWidth-input-${COMP}`]: "0.54em",
    [`padding-input-${COMP}`]: "0 2px",
    [`textAlign-input-${COMP}`]: "center",
    [`fontSize-input-${COMP}`]: "inherit",
    [`borderRadius-input-${COMP}`]: "$borderRadius",
    [`backgroundColor-input-${COMP}-invalid`]: "rgba(220, 53, 69, 0.15)",
    [`padding-button-${COMP}`]: "4px 4px",
    [`borderRadius-button-${COMP}`]: "$borderRadius",
    [`hoverColor-button-${COMP}`]: "$color-surface-800",
    [`disabledColor-button-${COMP}`]: "$textColor-disabled",
    [`outlineColor-button-${COMP}--focused`]: "$color-accent-500",
    [`outlineWidth-button-${COMP}--focused`]: "2px",
    [`outlineOffset-button-${COMP}--focused`]: "0",
    [`minWidth-ampm-${COMP}`]: "2.2em",
    [`fontSize-ampm-${COMP}`]: "inherit",
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
    [`borderColor-${COMP}--error`]: "$color-danger-500",
    [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
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

export const timeInputRenderer = wrapComponent({
  name: COMP,
  metadata: TimeInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => (
    <TimeInputNative
      {...adapter.rootAttrs("input")}
      ref={(api: TimeInputApi | null) => {
        if (api) {
          adapter.registerApi(api as unknown as Record<string, unknown>);
        }
      }}
      id={adapter.stringProp("id")}
      value={adapter.prop("value")}
      initialValue={adapter.prop("initialValue")}
      label={adapter.prop("label")}
      labelWidth={adapter.stringProp("labelWidth")}
      labelPosition={adapter.stringProp("labelPosition")}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
      required={adapter.booleanProp("required", defaultProps.required)}
      autoFocus={adapter.booleanProp("autoFocus", defaultProps.autoFocus)}
      validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
      hour24={adapter.booleanProp("hour24", defaultProps.hour24)}
      seconds={adapter.booleanProp("seconds", defaultProps.seconds)}
      minTime={adapter.stringProp("minTime")}
      maxTime={adapter.stringProp("maxTime")}
      clearable={adapter.booleanProp("clearable", defaultProps.clearable)}
      clearIcon={adapter.stringProp("clearIcon")}
      clearToInitialValue={adapter.booleanProp("clearToInitialValue", defaultProps.clearToInitialValue)}
      startText={adapter.prop("startText")}
      startIcon={adapter.prop("startIcon")}
      endText={adapter.prop("endText")}
      endIcon={adapter.prop("endIcon")}
      gap={adapter.stringProp("gap")}
      emptyCharacter={adapter.stringProp("emptyCharacter", defaultProps.emptyCharacter)}
      onDidChange={(value) => { void adapter.event("didChange")(value); }}
      onFocus={() => { void adapter.event("gotFocus")(); }}
      onBlur={() => { void adapter.event("lostFocus")(); }}
      onInvalidChange={(value) => { void adapter.event("invalidTime")(value); }}
    />
  ),
});
