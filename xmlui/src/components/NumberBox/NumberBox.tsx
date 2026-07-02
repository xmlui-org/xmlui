import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
} from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./NumberBox.defaults";

const COMP = "NumberBox";

const numberBoxStylesSource = `
$backgroundColor-NumberBox--disabled: createThemeVar("backgroundColor-NumberBox--disabled");
$borderRadius-NumberBox: createThemeVar("borderRadius-NumberBox");
$borderColor-NumberBox: createThemeVar("borderColor-NumberBox");
$borderColor-NumberBox--error: createThemeVar("borderColor-NumberBox--error");
$borderColor-NumberBox--warning: createThemeVar("borderColor-NumberBox--warning");
$borderColor-NumberBox--success: createThemeVar("borderColor-NumberBox--success");
$borderWidth-NumberBox: createThemeVar("borderWidth-NumberBox");
$borderWidth-NumberBox--error: createThemeVar("borderWidth-NumberBox--error");
$borderWidth-NumberBox--warning: createThemeVar("borderWidth-NumberBox--warning");
$borderWidth-NumberBox--success: createThemeVar("borderWidth-NumberBox--success");
$borderStyle-NumberBox: createThemeVar("borderStyle-NumberBox");
$borderStyle-NumberBox--error: createThemeVar("borderStyle-NumberBox--error");
$borderStyle-NumberBox--warning: createThemeVar("borderStyle-NumberBox--warning");
$borderStyle-NumberBox--success: createThemeVar("borderStyle-NumberBox--success");
$fontSize-NumberBox: createThemeVar("fontSize-NumberBox");
$fontSize-NumberBox--error: createThemeVar("fontSize-NumberBox--error");
$fontSize-NumberBox--warning: createThemeVar("fontSize-NumberBox--warning");
$fontSize-NumberBox--success: createThemeVar("fontSize-NumberBox--success");
$backgroundColor-NumberBox: createThemeVar("backgroundColor-NumberBox");
$backgroundColor-NumberBox--error: createThemeVar("backgroundColor-NumberBox--error");
$backgroundColor-NumberBox--warning: createThemeVar("backgroundColor-NumberBox--warning");
$backgroundColor-NumberBox--success: createThemeVar("backgroundColor-NumberBox--success");
$boxShadow-NumberBox: createThemeVar("boxShadow-NumberBox");
$boxShadow-NumberBox--error: createThemeVar("boxShadow-NumberBox--error");
$boxShadow-NumberBox--warning: createThemeVar("boxShadow-NumberBox--warning");
$boxShadow-NumberBox--success: createThemeVar("boxShadow-NumberBox--success");
$textColor-NumberBox: createThemeVar("textColor-NumberBox");
$textColor-NumberBox--error: createThemeVar("textColor-NumberBox--error");
$textColor-NumberBox--warning: createThemeVar("textColor-NumberBox--warning");
$textColor-NumberBox--success: createThemeVar("textColor-NumberBox--success");
$borderColor-NumberBox--hover: createThemeVar("borderColor-NumberBox--hover");
$backgroundColor-NumberBox--hover: createThemeVar("backgroundColor-NumberBox--hover");
$boxShadow-NumberBox--hover: createThemeVar("boxShadow-NumberBox--hover");
$textColor-NumberBox--hover: createThemeVar("textColor-NumberBox--hover");
$borderColor-NumberBox--error--hover: createThemeVar("borderColor-NumberBox--error--hover");
$borderColor-NumberBox--warning--hover: createThemeVar("borderColor-NumberBox--warning--hover");
$borderColor-NumberBox--success--hover: createThemeVar("borderColor-NumberBox--success--hover");
$backgroundColor-NumberBox--error--hover: createThemeVar("backgroundColor-NumberBox--error--hover");
$backgroundColor-NumberBox--warning--hover: createThemeVar("backgroundColor-NumberBox--warning--hover");
$backgroundColor-NumberBox--success--hover: createThemeVar("backgroundColor-NumberBox--success--hover");
$boxShadow-NumberBox--error--hover: createThemeVar("boxShadow-NumberBox--error--hover");
$boxShadow-NumberBox--warning--hover: createThemeVar("boxShadow-NumberBox--warning--hover");
$boxShadow-NumberBox--success--hover: createThemeVar("boxShadow-NumberBox--success--hover");
$textColor-NumberBox--error--hover: createThemeVar("textColor-NumberBox--error--hover");
$textColor-NumberBox--warning--hover: createThemeVar("textColor-NumberBox--warning--hover");
$textColor-NumberBox--success--hover: createThemeVar("textColor-NumberBox--success--hover");
$borderColor-NumberBox--focus: createThemeVar("borderColor-NumberBox--focus");
$backgroundColor-NumberBox--focus: createThemeVar("backgroundColor-NumberBox--focus");
$boxShadow-NumberBox--focus: createThemeVar("boxShadow-NumberBox--focus");
$textColor-NumberBox--focus: createThemeVar("textColor-NumberBox--focus");
$outlineWidth-NumberBox--focus: createThemeVar("outlineWidth-NumberBox--focus");
$outlineColor-NumberBox--focus: createThemeVar("outlineColor-NumberBox--focus");
$outlineStyle-NumberBox--focus: createThemeVar("outlineStyle-NumberBox--focus");
$outlineOffset-NumberBox--focus: createThemeVar("outlineOffset-NumberBox--focus");
$textColor-placeholder-NumberBox: createThemeVar("textColor-placeholder-NumberBox");
$fontSize-placeholder-NumberBox: createThemeVar("fontSize-placeholder-NumberBox");
$color-adornment-NumberBox: createThemeVar("color-adornment-NumberBox");
$minHeight-NumberBox: createThemeVar("minHeight-NumberBox");
$gap-adornment-NumberBox: createThemeVar("gap-adornment-NumberBox");
$textColor-NumberBox--disabled: createThemeVar("textColor-NumberBox--disabled");
$borderColor-NumberBox--disabled: createThemeVar("borderColor-NumberBox--disabled");
$paddingHorizontal-NumberBox: createThemeVar("paddingHorizontal-NumberBox");
$paddingVertical-NumberBox: createThemeVar("paddingVertical-NumberBox");
$paddingLeft-NumberBox: createThemeVar("paddingLeft-NumberBox");
$paddingRight-NumberBox: createThemeVar("paddingRight-NumberBox");
$paddingTop-NumberBox: createThemeVar("paddingTop-NumberBox");
$paddingBottom-NumberBox: createThemeVar("paddingBottom-NumberBox");
`;

export const NumberBoxMd = createMetadata({
  status: "stable",
  description: "`NumberBox` provides a numeric input field with spinner buttons and validation-oriented state.",
  parts: {
    label: { description: "The label displayed for the number box." },
    startAdornment: { description: "The adornment displayed at the start of the number box." },
    endAdornment: { description: "The adornment displayed at the end of the number box." },
    input: { description: "The number box input area." },
    spinnerUp: { description: "The spinner button for incrementing the value." },
    spinnerDown: { description: "The spinner button for decrementing the value." },
    conciseValidationFeedback: { description: "The concise validation feedback indicator." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    label: dLabel(),
    labelPosition: {
      description: "Controls the label position.",
      valueType: "string",
      availableValues: ["start", "end", "top", "bottom"],
      defaultValue: "top",
    },
    labelWidth: { description: "Sets the label width.", valueType: "length" },
    requireLabelMode: {
      description: "Controls required/optional label markers.",
      valueType: "string",
      availableValues: ["markRequired", "markOptional", "markBoth"],
      defaultValue: "markRequired",
    },
    direction: { description: "Sets the input direction.", valueType: "string" },
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(defaultProps.initialValue, "number"),
    value: { description: "Controlled value.", valueType: "number" },
    maxLength: { description: "Maximum input length.", valueType: "number" },
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: { description: "Validation status.", valueType: "string" },
    invalidMessages: { description: "Invalid messages.", valueType: "string[]" },
    startText: { description: "Start text adornment.", valueType: "string" },
    startIcon: { description: "Start icon adornment.", valueType: "icon" },
    endText: { description: "End text adornment.", valueType: "string" },
    endIcon: { description: "End icon adornment.", valueType: "icon" },
    gap: { description: "Gap between adornments and input.", valueType: "length" },
    hasSpinBox: { description: "Shows or hides the spinner buttons.", valueType: "boolean", defaultValue: defaultProps.hasSpinBox },
    spinnerUpIcon: { description: "Icon for the increment spinner.", valueType: "icon" },
    spinnerDownIcon: { description: "Icon for the decrement spinner.", valueType: "icon" },
    step: { description: "The step used by spinner buttons and arrow keys.", valueType: "number", defaultValue: defaultProps.step },
    integersOnly: { description: "Allows only integer values.", valueType: "boolean", defaultValue: defaultProps.integersOnly },
    zeroOrPositive: { description: "Allows only zero or positive values.", valueType: "boolean", defaultValue: defaultProps.zeroOrPositive },
    minValue: { description: "The minimum accepted value.", valueType: "number", defaultValue: defaultProps.min },
    maxValue: { description: "The maximum accepted value.", valueType: "number", defaultValue: defaultProps.max },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    tooltip: { description: "The tooltip text.", valueType: "string" },
    tooltipMarkdown: { description: "The markdown tooltip text.", valueType: "string" },
    animation: { description: "The animation definition.", valueType: "any" },
    variant: { description: "The variant value.", valueType: "string" },
    bindTo: { description: "Binds the number box value to form data.", valueType: "string" },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Sets the focus on the NumberBox component.",
      signature: "focus(): void",
    },
    value: {
      description: "Returns the current component value.",
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: "Sets the current component value.",
      signature: "setValue(value: number | undefined): void",
    },
  },
  themeVars: extractScssThemeVars(numberBoxStylesSource),
  defaultThemeVars: {
    "backgroundColor-Input": "transparent",
    "borderRadius-Input": "$borderRadius",
    "textColor-Input": "$textColor-primary",
    "backgroundColor-Input--disabled": "$backgroundColor--disabled",
    "borderWidth-Input": "1px",
    "minHeight-Input": "2.5rem",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
    "gap-adornment-Input": "$space-2",
    "borderStyle-Input": "solid",
    "borderColor-Input--disabled": "$borderColor--disabled",
    "textColor-Input--disabled": "$textColor--disabled",
    "borderColor-Input": "$borderColor-Input-default",
    "borderColor-Input--hover": "$borderColor-Input-default--hover",
    "borderColor-Input--error": "$borderColor-Input-default--error",
    "borderColor-Input--warning": "$borderColor-Input-default--warning",
    "borderColor-Input--success": "$borderColor-Input-default--success",
    "textColor-placeholder-Input": "$textColor-subtitle",
    "color-adornment-Input": "$textColor-subtitle",
    "outlineColor-Input--focus": "$outlineColor--focus",
    "outlineWidth-Input--focus": "$outlineWidth--focus",
    "outlineStyle-Input--focus": "$outlineStyle--focus",
    "outlineOffset-Input--focus": "$outlineOffset--focus",
    [`backgroundColor-${COMP}`]: "$backgroundColor-Input",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor-Input--disabled",
    [`borderRadius-${COMP}`]: "$borderRadius-Input",
    [`borderColor-${COMP}`]: "$borderColor-Input",
    [`borderWidth-${COMP}`]: "$borderWidth-Input",
    [`borderStyle-${COMP}`]: "$borderStyle-Input",
    [`fontSize-${COMP}`]: "inherit",
    [`boxShadow-${COMP}`]: "none",
    [`textColor-${COMP}`]: "$textColor-Input",
    [`borderColor-${COMP}--hover`]: "$borderColor-Input--hover",
    [`backgroundColor-${COMP}--hover`]: "$backgroundColor-Input",
    [`boxShadow-${COMP}--hover`]: "none",
    [`textColor-${COMP}--hover`]: "$textColor-Input",
    [`borderColor-${COMP}--focus`]: `$borderColor-${COMP}`,
    [`backgroundColor-${COMP}--focus`]: "$backgroundColor-Input",
    [`boxShadow-${COMP}--focus`]: "none",
    [`textColor-${COMP}--focus`]: "$textColor-Input",
    [`outlineColor-${COMP}--focus`]: "$outlineColor-Input--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth-Input--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle-Input--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset-Input--focus",
    [`textColor-placeholder-${COMP}`]: "$textColor-placeholder-Input",
    [`color-adornment-${COMP}`]: "$color-adornment-Input",
    [`minHeight-${COMP}`]: "$minHeight-Input",
    [`gap-adornment-${COMP}`]: "$gap-adornment-Input",
    [`textColor-${COMP}--disabled`]: "$textColor-Input--disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor-Input--disabled",
    [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
    [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
    [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--error`]: "$borderColor-Input--error",
    [`borderColor-${COMP}--warning`]: "$borderColor-Input--warning",
    [`borderColor-${COMP}--success`]: "$borderColor-Input--success",
    [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
    [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
    [`borderWidth-${COMP}--success`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
    [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
    [`borderStyle-${COMP}--success`]: `$borderStyle-${COMP}`,
    [`fontSize-${COMP}--error`]: `$fontSize-${COMP}`,
    [`fontSize-${COMP}--warning`]: `$fontSize-${COMP}`,
    [`fontSize-${COMP}--success`]: `$fontSize-${COMP}`,
    [`backgroundColor-${COMP}--error`]: `$backgroundColor-${COMP}`,
    [`backgroundColor-${COMP}--warning`]: `$backgroundColor-${COMP}`,
    [`backgroundColor-${COMP}--success`]: `$backgroundColor-${COMP}`,
    [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
    [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
    [`boxShadow-${COMP}--success`]: `$boxShadow-${COMP}`,
    [`textColor-${COMP}--error`]: `$textColor-${COMP}`,
    [`textColor-${COMP}--warning`]: `$textColor-${COMP}`,
    [`textColor-${COMP}--success`]: `$textColor-${COMP}`,
    [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
    [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
    [`borderColor-${COMP}--success--hover`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-${COMP}--error--hover`]: `$backgroundColor-${COMP}--error`,
    [`backgroundColor-${COMP}--warning--hover`]: `$backgroundColor-${COMP}--warning`,
    [`backgroundColor-${COMP}--success--hover`]: `$backgroundColor-${COMP}--success`,
    [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
    [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
    [`boxShadow-${COMP}--success--hover`]: `$boxShadow-${COMP}--success`,
    [`textColor-${COMP}--error--hover`]: `$textColor-${COMP}--error`,
    [`textColor-${COMP}--warning--hover`]: `$textColor-${COMP}--warning`,
    [`textColor-${COMP}--success--hover`]: `$textColor-${COMP}--success`,
  },
});
