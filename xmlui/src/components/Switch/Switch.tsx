import {
  createMetadata,
  dAutoFocus,
  dClick,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLostFocus,
  dReadonly,
  dRequired,
} from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Switch.defaults";

const COMP = "Switch";

const switchStylesSource = `
$borderColor-Switch--hover: createThemeVar("borderColor-Switch--hover");
$backgroundColor-Switch--disabled: createThemeVar("backgroundColor-Switch--disabled");
$borderColor-Switch--disabled: createThemeVar("borderColor-Switch--disabled");
$borderColor-checked-Switch: createThemeVar("borderColor-checked-Switch");
$backgroundColor-checked-Switch: createThemeVar("backgroundColor-checked-Switch");
$borderColor-checked-Switch--error: createThemeVar("borderColor-checked-Switch--error");
$backgroundColor-checked-Switch--error: createThemeVar("backgroundColor-checked-Switch--error");
$borderColor-checked-Switch--warning: createThemeVar("borderColor-checked-Switch--warning");
$backgroundColor-checked-Switch--warning: createThemeVar("backgroundColor-checked-Switch--warning");
$borderColor-checked-Switch--success: createThemeVar("borderColor-checked-Switch--success");
$backgroundColor-checked-Switch--success: createThemeVar("backgroundColor-checked-Switch--success");
$backgroundColor-Switch: createThemeVar("backgroundColor-Switch");
$borderColor-Switch: createThemeVar("borderColor-Switch");
$backgroundColor-indicator-Switch: createThemeVar("backgroundColor-indicator-Switch");
$backgroundColor-indicator-checked-Switch: createThemeVar("backgroundColor-indicator-checked-Switch");
$backgroundColor-Switch-indicator--disabled: createThemeVar("backgroundColor-Switch-indicator--disabled");
$outlineWidth-Switch--focus: createThemeVar("outlineWidth-Switch--focus");
$outlineColor-Switch--focus: createThemeVar("outlineColor-Switch--focus");
$outlineStyle-Switch--focus: createThemeVar("outlineStyle-Switch--focus");
$outlineOffset-Switch--focus: createThemeVar("outlineOffset-Switch--focus");
$outlineWidth-Switch: createThemeVar("outlineWidth-Switch");
$outlineColor-Switch: createThemeVar("outlineColor-Switch");
$outlineStyle-Switch: createThemeVar("outlineStyle-Switch");
$outlineOffset-Switch: createThemeVar("outlineOffset-Switch");
$borderColor-Switch--error: createThemeVar("borderColor-Switch--error");
$borderColor-Switch--warning: createThemeVar("borderColor-Switch--warning");
$borderColor-Switch--success: createThemeVar("borderColor-Switch--success");
`;

export const SwitchMd = createMetadata({
  status: "stable",
  description: "`Switch` enables users to toggle between two states: on and off.",
  parts: {
    label: { description: "The label displayed for the switch." },
    input: { description: "The switch input area." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    label: dLabel(),
    labelPosition: {
      description: "Controls the label position.",
      valueType: "string",
      availableValues: ["start", "end", "top", "bottom", "before", "after"],
      defaultValue: "end",
    },
    labelBreak: { description: "Allows line breaks in the label.", valueType: "boolean" },
    labelWidth: { description: "Sets the label width.", valueType: "length" },
    direction: { description: "Sets the input direction.", valueType: "string" },
    initialValue: dInitialValue(defaultProps.initialValue, "boolean"),
    value: { description: "Controlled checked value.", valueType: "boolean" },
    required: dRequired(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: { description: "Validation status.", valueType: "string" },
    tooltip: { description: "The tooltip text.", valueType: "string" },
    tooltipMarkdown: { description: "The markdown tooltip text.", valueType: "string" },
    animation: { description: "The animation definition.", valueType: "any" },
    variant: { description: "The variant value.", valueType: "string" },
    requireLabelMode: { description: "Controls required/optional label markers.", valueType: "string" },
    bindTo: { description: "Binds the switch to form data.", valueType: "string" },
  },
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Sets focus on the switch.",
      signature: "focus(): void",
    },
    value: {
      description: "Returns the current switch value.",
      signature: "get value(): boolean",
    },
    setValue: {
      description: "Sets the current switch value.",
      signature: "setValue(value: boolean): void",
      parameters: {
        value: "The new value to set.",
      },
    },
  },
  themeVars: extractScssThemeVars(switchStylesSource),
  defaultThemeVars: {
    [`borderColor-${COMP}`]: "$borderColor-Input-default",
    [`borderWidth-${COMP}`]: "1px",
    [`outlineWidth-${COMP}--focus`]: `$outlineWidth-${COMP}`,
    [`outlineColor-${COMP}--focus`]: `$outlineColor-${COMP}`,
    [`outlineOffset-${COMP}--focus`]: `$outlineOffset-${COMP}`,
    [`outlineStyle-${COMP}--focus`]: `$outlineStyle-${COMP}`,
    [`outlineWidth-${COMP}`]: "$outlineWidth--focus",
    [`outlineColor-${COMP}`]: "$outlineColor--focus",
    [`outlineOffset-${COMP}`]: "$outlineOffset--focus",
    [`outlineStyle-${COMP}`]: "$outlineStyle--focus",
    [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`backgroundColor-${COMP}`]: "$color-surface-0",
    [`backgroundColor-indicator-${COMP}`]: "$color-surface-400",
    [`backgroundColor-${COMP}-indicator--disabled`]: "$backgroundColor-primary",
    [`backgroundColor-indicator-checked-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`borderColor-${COMP}--error`]: "$borderColor-Input-default--error",
    [`borderColor-${COMP}--warning`]: "$borderColor-Input-default--warning",
    [`borderColor-${COMP}--success`]: "$borderColor-Input-default--success",
    [`borderColor-checked-${COMP}--error`]: `$borderColor-${COMP}--error`,
    [`backgroundColor-checked-${COMP}--error`]: `$borderColor-${COMP}--error`,
    [`borderColor-checked-${COMP}--warning`]: `$borderColor-${COMP}--warning`,
    [`backgroundColor-checked-${COMP}--warning`]: `$borderColor-${COMP}--warning`,
    [`borderColor-checked-${COMP}--success`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-checked-${COMP}--success`]: `$borderColor-${COMP}--success`,
  },
  compactInlineLabel: true,
  limitThemeVarsToComponent: true,
});
