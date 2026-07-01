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
import { defaultProps } from "./TextBox.defaults";

const COMP = "TextBox";

const textBoxStylesSource = `
$backgroundColor-TextBox--disabled: createThemeVar("backgroundColor-TextBox--disabled");
$borderRadius-TextBox: createThemeVar("borderRadius-TextBox");
$borderColor-TextBox: createThemeVar("borderColor-TextBox");
$borderColor-TextBox--error: createThemeVar("borderColor-TextBox--error");
$borderColor-TextBox--warning: createThemeVar("borderColor-TextBox--warning");
$borderColor-TextBox--success: createThemeVar("borderColor-TextBox--success");
$borderWidth-TextBox: createThemeVar("borderWidth-TextBox");
$borderWidth-TextBox--error: createThemeVar("borderWidth-TextBox--error");
$borderWidth-TextBox--warning: createThemeVar("borderWidth-TextBox--warning");
$borderWidth-TextBox--success: createThemeVar("borderWidth-TextBox--success");
$borderStyle-TextBox: createThemeVar("borderStyle-TextBox");
$borderStyle-TextBox--error: createThemeVar("borderStyle-TextBox--error");
$borderStyle-TextBox--warning: createThemeVar("borderStyle-TextBox--warning");
$borderStyle-TextBox--success: createThemeVar("borderStyle-TextBox--success");
$fontSize-TextBox: createThemeVar("fontSize-TextBox");
$fontSize-TextBox--error: createThemeVar("fontSize-TextBox--error");
$fontSize-TextBox--warning: createThemeVar("fontSize-TextBox--warning");
$fontSize-TextBox--success: createThemeVar("fontSize-TextBox--success");
$backgroundColor-TextBox: createThemeVar("backgroundColor-TextBox");
$backgroundColor-TextBox--error: createThemeVar("backgroundColor-TextBox--error");
$backgroundColor-TextBox--warning: createThemeVar("backgroundColor-TextBox--warning");
$backgroundColor-TextBox--success: createThemeVar("backgroundColor-TextBox--success");
$boxShadow-TextBox: createThemeVar("boxShadow-TextBox");
$boxShadow-TextBox--error: createThemeVar("boxShadow-TextBox--error");
$boxShadow-TextBox--warning: createThemeVar("boxShadow-TextBox--warning");
$boxShadow-TextBox--success: createThemeVar("boxShadow-TextBox--success");
$textColor-TextBox: createThemeVar("textColor-TextBox");
$textColor-TextBox--error: createThemeVar("textColor-TextBox--error");
$textColor-TextBox--warning: createThemeVar("textColor-TextBox--warning");
$textColor-TextBox--success: createThemeVar("textColor-TextBox--success");
$borderColor-TextBox--hover: createThemeVar("borderColor-TextBox--hover");
$borderColor-TextBox--error--hover: createThemeVar("borderColor-TextBox--error--hover");
$borderColor-TextBox--warning--hover: createThemeVar("borderColor-TextBox--warning--hover");
$borderColor-TextBox--success--hover: createThemeVar("borderColor-TextBox--success--hover");
$backgroundColor-TextBox--hover: createThemeVar("backgroundColor-TextBox--hover");
$backgroundColor-TextBox--error--hover: createThemeVar("backgroundColor-TextBox--error--hover");
$backgroundColor-TextBox--warning--hover: createThemeVar("backgroundColor-TextBox--warning--hover");
$backgroundColor-TextBox--success--hover: createThemeVar("backgroundColor-TextBox--success--hover");
$boxShadow-TextBox--hover: createThemeVar("boxShadow-TextBox--hover");
$boxShadow-TextBox--error--hover: createThemeVar("boxShadow-TextBox--error--hover");
$boxShadow-TextBox--warning--hover: createThemeVar("boxShadow-TextBox--warning--hover");
$boxShadow-TextBox--success--hover: createThemeVar("boxShadow-TextBox--success--hover");
$textColor-TextBox--hover: createThemeVar("textColor-TextBox--hover");
$textColor-TextBox--error--hover: createThemeVar("textColor-TextBox--error--hover");
$textColor-TextBox--warning--hover: createThemeVar("textColor-TextBox--warning--hover");
$textColor-TextBox--success--hover: createThemeVar("textColor-TextBox--success--hover");
$borderColor-TextBox--focus: createThemeVar("borderColor-TextBox--focus");
$backgroundColor-TextBox--focus: createThemeVar("backgroundColor-TextBox--focus");
$boxShadow-TextBox--focus: createThemeVar("boxShadow-TextBox--focus");
$textColor-TextBox--focus: createThemeVar("textColor-TextBox--focus");
$outlineWidth-TextBox--focus: createThemeVar("outlineWidth-TextBox--focus");
$outlineColor-TextBox--focus: createThemeVar("outlineColor-TextBox--focus");
$outlineStyle-TextBox--focus: createThemeVar("outlineStyle-TextBox--focus");
$outlineOffset-TextBox--focus: createThemeVar("outlineOffset-TextBox--focus");
$textColor-placeholder-TextBox: createThemeVar("textColor-placeholder-TextBox");
$fontSize-placeholder-TextBox: createThemeVar("fontSize-placeholder-TextBox");
$color-adornment-TextBox: createThemeVar("color-adornment-TextBox");
$color-passwordToggle-TextBox: createThemeVar("color-passwordToggle-TextBox");
$paddingLeft-passwordToggle-TextBox: createThemeVar("paddingLeft-passwordToggle-TextBox");
$paddingRight-passwordToggle-TextBox: createThemeVar("paddingRight-passwordToggle-TextBox");
$color-passwordToggle-TextBox--hover: createThemeVar("color-passwordToggle-TextBox--hover");
$color-passwordToggle-TextBox--focus: createThemeVar("color-passwordToggle-TextBox--focus");
$minHeight-TextBox: createThemeVar("minHeight-TextBox");
$gap-adornment-TextBox: createThemeVar("gap-adornment-TextBox");
$textColor-TextBox--disabled: createThemeVar("textColor-TextBox--disabled");
$borderColor-TextBox--disabled: createThemeVar("borderColor-TextBox--disabled");
$paddingHorizontal-TextBox: createThemeVar("paddingHorizontal-TextBox");
$paddingVertical-TextBox: createThemeVar("paddingVertical-TextBox");
$paddingLeft-TextBox: createThemeVar("paddingLeft-TextBox");
$paddingRight-TextBox: createThemeVar("paddingRight-TextBox");
$paddingTop-TextBox: createThemeVar("paddingTop-TextBox");
$paddingBottom-TextBox: createThemeVar("paddingBottom-TextBox");
`;

export const TextBoxMd = createMetadata({
  status: "stable",
  description: "`TextBox` captures user text input for forms, search fields, and data entry.",
  parts: {
    label: { description: "The label displayed for the text box." },
    startAdornment: { description: "The adornment displayed at the start of the text box." },
    endAdornment: { description: "The adornment displayed at the end of the text box." },
    input: { description: "The text box input area." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    type: {
      description: "Sets the HTML input type.",
      valueType: "string",
      availableValues: ["text", "password", "search", "email"],
      isStrictEnum: true,
      defaultValue: defaultProps.type,
    },
    label: dLabel(),
    labelPosition: {
      description: "Controls the label position.",
      valueType: "string",
      availableValues: ["start", "end", "top", "bottom"],
      defaultValue: "top",
    },
    labelBreak: { description: "Allows line breaks in the label.", valueType: "boolean" },
    labelWidth: { description: "Sets the label width.", valueType: "length" },
    requireLabelMode: {
      description: "Controls required/optional label markers.",
      valueType: "string",
      availableValues: ["markRequired", "markOptional", "markBoth"],
      defaultValue: "markRequired",
    },
    direction: { description: "Sets the input direction.", valueType: "string" },
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(defaultProps.initialValue, "string"),
    value: { description: "Controlled value.", valueType: "string" },
    maxLength: { description: "Maximum input length.", valueType: "number" },
    autoFocus: dAutoFocus(),
    autoComplete: { description: "Sets the autocomplete attribute.", valueType: "any" },
    autoCorrect: { description: "Sets the autocorrect attribute.", valueType: "boolean" },
    spellCheck: { description: "Sets the spellcheck attribute.", valueType: "boolean" },
    autoCapitalize: { description: "Sets the autocapitalize attribute.", valueType: "string" },
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
    showPasswordToggle: { description: "Shows a password visibility toggle.", valueType: "boolean" },
    passwordVisibleIcon: { description: "Icon used when the password is visible.", valueType: "icon" },
    passwordHiddenIcon: { description: "Icon used when the password is hidden.", valueType: "icon" },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    tooltip: { description: "The tooltip text.", valueType: "string" },
    tooltipMarkdown: { description: "The markdown tooltip text.", valueType: "string" },
    animation: { description: "The animation definition.", valueType: "any" },
    variant: { description: "The variant value.", valueType: "string" },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Sets the focus on the TextBox component.",
      signature: "focus(): void",
    },
    value: {
      description: "Returns the current component value.",
      signature: "get value(): string | undefined",
    },
    setValue: {
      description: "Sets the current component value.",
      signature: "setValue(value: string): void",
      parameters: {
        value: "The new value to set.",
      },
    },
  },
  themeVars: extractScssThemeVars(textBoxStylesSource),
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
    "color-passwordToggle-Input": "$textColor-subtitle",
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
    [`color-passwordToggle-${COMP}`]: "$color-passwordToggle-Input",
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
export const PasswordInputMd = createMetadata({
  ...TextBoxMd,
  description:
    "`PasswordInput` is a specialized TextBox for entering password values.",
  props: {
    ...TextBoxMd.props,
    type: {
      ...TextBoxMd.props?.type,
      description: TextBoxMd.props?.type?.description ?? "The native input type used by the text box.",
      defaultValue: "password",
    },
  },
});
