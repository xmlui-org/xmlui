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
import { defaultProps } from "./TextArea.defaults";

const COMP = "TextArea";

const textAreaStylesSource = `
$borderRadius-TextArea: createThemeVar("borderRadius-TextArea");
$borderColor-TextArea: createThemeVar("borderColor-TextArea");
$borderWidth-TextArea: createThemeVar("borderWidth-TextArea");
$borderStyle-TextArea: createThemeVar("borderStyle-TextArea");
$fontSize-TextArea: createThemeVar("fontSize-TextArea");
$backgroundColor-TextArea: createThemeVar("backgroundColor-TextArea");
$boxShadow-TextArea: createThemeVar("boxShadow-TextArea");
$textColor-TextArea: createThemeVar("textColor-TextArea");
$borderColor-TextArea--hover: createThemeVar("borderColor-TextArea--hover");
$backgroundColor-TextArea--hover: createThemeVar("backgroundColor-TextArea--hover");
$boxShadow-TextArea--hover: createThemeVar("boxShadow-TextArea--hover");
$textColor-TextArea--hover: createThemeVar("textColor-TextArea--hover");
$borderColor-TextArea--focus: createThemeVar("borderColor-TextArea--focus");
$backgroundColor-TextArea--focus: createThemeVar("backgroundColor-TextArea--focus");
$boxShadow-TextArea--focus: createThemeVar("boxShadow-TextArea--focus");
$textColor-TextArea--focus: createThemeVar("textColor-TextArea--focus");
$outlineWidth-TextArea--focus: createThemeVar("outlineWidth-TextArea--focus");
$outlineColor-TextArea--focus: createThemeVar("outlineColor-TextArea--focus");
$outlineStyle-TextArea--focus: createThemeVar("outlineStyle-TextArea--focus");
$outlineOffset-TextArea--focus: createThemeVar("outlineOffset-TextArea--focus");
$textColor-placeholder-TextArea: createThemeVar("textColor-placeholder-TextArea");
$fontSize-placeholder-TextArea: createThemeVar("fontSize-placeholder-TextArea");
$borderRadius-TextArea--error: createThemeVar("borderRadius-TextArea--error");
$borderColor-TextArea--error: createThemeVar("borderColor-TextArea--error");
$borderWidth-TextArea--error: createThemeVar("borderWidth-TextArea--error");
$borderStyle-TextArea--error: createThemeVar("borderStyle-TextArea--error");
$fontSize-TextArea--error: createThemeVar("fontSize-TextArea--error");
$backgroundColor-TextArea--error: createThemeVar("backgroundColor-TextArea--error");
$boxShadow-TextArea--error: createThemeVar("boxShadow-TextArea--error");
$textColor-TextArea--error: createThemeVar("textColor-TextArea--error");
$borderColor-TextArea--error--hover: createThemeVar("borderColor-TextArea--error--hover");
$backgroundColor-TextArea--error--hover: createThemeVar("backgroundColor-TextArea--error--hover");
$boxShadow-TextArea--error--hover: createThemeVar("boxShadow-TextArea--error--hover");
$textColor-TextArea--error--hover: createThemeVar("textColor-TextArea--error--hover");
$borderRadius-TextArea--warning: createThemeVar("borderRadius-TextArea--warning");
$borderColor-TextArea--warning: createThemeVar("borderColor-TextArea--warning");
$borderWidth-TextArea--warning: createThemeVar("borderWidth-TextArea--warning");
$borderStyle-TextArea--warning: createThemeVar("borderStyle-TextArea--warning");
$fontSize-TextArea--warning: createThemeVar("fontSize-TextArea--warning");
$backgroundColor-TextArea--warning: createThemeVar("backgroundColor-TextArea--warning");
$boxShadow-TextArea--warning: createThemeVar("boxShadow-TextArea--warning");
$textColor-TextArea--warning: createThemeVar("textColor-TextArea--warning");
$borderColor-TextArea--warning--hover: createThemeVar("borderColor-TextArea--warning--hover");
$backgroundColor-TextArea--warning--hover: createThemeVar("backgroundColor-TextArea--warning--hover");
$boxShadow-TextArea--warning--hover: createThemeVar("boxShadow-TextArea--warning--hover");
$textColor-TextArea--warning--hover: createThemeVar("textColor-TextArea--warning--hover");
$borderRadius-TextArea--success: createThemeVar("borderRadius-TextArea--success");
$borderColor-TextArea--success: createThemeVar("borderColor-TextArea--success");
$borderWidth-TextArea--success: createThemeVar("borderWidth-TextArea--success");
$borderStyle-TextArea--success: createThemeVar("borderStyle-TextArea--success");
$fontSize-TextArea--success: createThemeVar("fontSize-TextArea--success");
$backgroundColor-TextArea--success: createThemeVar("backgroundColor-TextArea--success");
$boxShadow-TextArea--success: createThemeVar("boxShadow-TextArea--success");
$textColor-TextArea--success: createThemeVar("textColor-TextArea--success");
$borderColor-TextArea--success--hover: createThemeVar("borderColor-TextArea--success--hover");
$backgroundColor-TextArea--success--hover: createThemeVar("backgroundColor-TextArea--success--hover");
$boxShadow-TextArea--success--hover: createThemeVar("boxShadow-TextArea--success--hover");
$textColor-TextArea--success--hover: createThemeVar("textColor-TextArea--success--hover");
$backgroundColor-TextArea--disabled: createThemeVar("backgroundColor-TextArea--disabled");
$textColor-TextArea--disabled: createThemeVar("textColor-TextArea--disabled");
$borderColor-TextArea--disabled: createThemeVar("borderColor-TextArea--disabled");
$paddingHorizontal-TextArea: createThemeVar("paddingHorizontal-TextArea");
$paddingVertical-TextArea: createThemeVar("paddingVertical-TextArea");
`;

export const TextAreaMd = createMetadata({
  status: "stable",
  description: "`TextArea` provides a multiline text input area.",
  parts: {
    label: { description: "The label displayed for the text area." },
    input: { description: "The text area input." },
    conciseValidationFeedback: { description: "The concise validation feedback indicator." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    label: dLabel(),
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(defaultProps.initialValue, "string"),
    value: { description: "Controlled value.", valueType: "string" },
    maxLength: { description: "Maximum input length.", valueType: "number" },
    maxRows: { description: "Maximum autosize rows.", valueType: "number" },
    minRows: { description: "Minimum autosize rows.", valueType: "number" },
    rows: { description: "Initial number of visible text rows.", valueType: "number", defaultValue: defaultProps.rows },
    autoSize: { description: "Automatically resize the text area to its content.", valueType: "boolean" },
    resize: {
      description: "Specifies in which dimensions the text area can be resized.",
      valueType: "string",
      availableValues: ["horizontal", "vertical", "both"],
      isStrictEnum: true,
    },
    enterSubmits: { description: "Submits the parent form when Enter is pressed.", valueType: "boolean", defaultValue: defaultProps.enterSubmits },
    escResets: { description: "Resets the parent form when Escape is pressed.", valueType: "boolean" },
    autoFocus: dAutoFocus(),
    autoComplete: { description: "Sets the native autocomplete attribute.", valueType: "any", defaultValue: defaultProps.autoComplete },
    autoCorrect: { description: "Sets the native autocorrect attribute.", valueType: "boolean" },
    spellCheck: { description: "Sets the native spellcheck attribute.", valueType: "boolean" },
    autoCapitalize: { description: "Sets the native autocapitalize attribute.", valueType: "string" },
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: { description: "Validation status.", valueType: "string" },
    invalidMessages: { description: "Invalid messages.", valueType: "string[]" },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    tooltip: { description: "The tooltip text.", valueType: "string" },
    tooltipMarkdown: { description: "The markdown tooltip text.", valueType: "string" },
    animation: { description: "The animation definition.", valueType: "any" },
    variant: { description: "The variant value.", valueType: "string" },
    bindTo: { description: "Binds the text area value to form data.", valueType: "string" },
    requireLabelMode: { description: "Controls required/optional label indicators.", valueType: "string" },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: { description: "Sets focus on the TextArea component.", signature: "focus(): void" },
    insert: { description: "Inserts text at the current cursor position.", signature: "insert(value: string): void" },
    value: { description: "Returns the current component value.", signature: "get value(): string | undefined" },
    setValue: {
      description: "Sets the current component value.",
      signature: "setValue(value: string): void",
      parameters: { value: "The new value to set." },
    },
  },
  themeVars: extractScssThemeVars(textAreaStylesSource),
  defaultThemeVars: {
    "backgroundColor-Input": "transparent",
    "borderRadius-Input": "$borderRadius",
    "textColor-Input": "$textColor-primary",
    "backgroundColor-Input--disabled": "$backgroundColor--disabled",
    "borderWidth-Input": "1px",
    "borderStyle-Input": "solid",
    "borderColor-Input--disabled": "$borderColor--disabled",
    "textColor-Input--disabled": "$textColor--disabled",
    "borderColor-Input": "$borderColor-Input-default",
    "borderColor-Input--hover": "$borderColor-Input-default--hover",
    "borderColor-Input--error": "$borderColor-Input-default--error",
    "borderColor-Input--warning": "$borderColor-Input-default--warning",
    "borderColor-Input--success": "$borderColor-Input-default--success",
    "textColor-placeholder-Input": "$textColor-subtitle",
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
    [`fontSize-placeholder-${COMP}`]: "inherit",
    [`textColor-${COMP}--disabled`]: "$textColor-Input--disabled",
    [`borderColor-${COMP}--disabled`]: "$borderColor-Input--disabled",
    [`paddingHorizontal-${COMP}`]: "$space-2",
    [`paddingVertical-${COMP}`]: "$space-2",
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
