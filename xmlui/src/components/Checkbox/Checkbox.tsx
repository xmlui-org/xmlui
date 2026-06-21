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
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Checkbox.defaults";
import { CheckboxNative, type CheckboxApi } from "./CheckboxReact";

const COMP = "Checkbox";

const checkboxStylesSource = `
$borderRadius-Checkbox: createThemeVar("borderRadius-Checkbox");
$borderColor-Checkbox: createThemeVar("borderColor-Checkbox");
$backgroundColor-Checkbox: createThemeVar("backgroundColor-Checkbox");
$outlineWidth-Checkbox--focus: createThemeVar("outlineWidth-Checkbox--focus");
$outlineColor-Checkbox--focus: createThemeVar("outlineColor-Checkbox--focus");
$outlineStyle-Checkbox--focus: createThemeVar("outlineStyle-Checkbox--focus");
$outlineOffset-Checkbox--focus: createThemeVar("outlineOffset-Checkbox--focus");
$outlineWidth-Checkbox: createThemeVar("outlineWidth-Checkbox");
$outlineColor-Checkbox: createThemeVar("outlineColor-Checkbox");
$outlineStyle-Checkbox: createThemeVar("outlineStyle-Checkbox");
$outlineOffset-Checkbox: createThemeVar("outlineOffset-Checkbox");
$borderRadius-Checkbox--error: createThemeVar("borderRadius-Checkbox--error");
$borderColor-Checkbox--error: createThemeVar("borderColor-Checkbox--error");
$backgroundColor-Checkbox--error: createThemeVar("backgroundColor-Checkbox--error");
$borderRadius-Checkbox--warning: createThemeVar("borderRadius-Checkbox--warning");
$borderColor-Checkbox--warning: createThemeVar("borderColor-Checkbox--warning");
$backgroundColor-Checkbox--warning: createThemeVar("backgroundColor-Checkbox--warning");
$borderRadius-Checkbox--success: createThemeVar("borderRadius-Checkbox--success");
$borderColor-Checkbox--success: createThemeVar("borderColor-Checkbox--success");
$backgroundColor-Checkbox--success: createThemeVar("backgroundColor-Checkbox--success");
$borderColor-Checkbox--hover: createThemeVar("borderColor-Checkbox--hover");
$backgroundColor-Checkbox--disabled: createThemeVar("backgroundColor-Checkbox--disabled");
$borderColor-Checkbox--disabled: createThemeVar("borderColor-Checkbox--disabled");
$borderColor-checked-Checkbox: createThemeVar("borderColor-checked-Checkbox");
$backgroundColor-checked-Checkbox: createThemeVar("backgroundColor-checked-Checkbox");
$borderColor-checked-Checkbox--error: createThemeVar("borderColor-checked-Checkbox--error");
$backgroundColor-checked-Checkbox--error: createThemeVar("backgroundColor-checked-Checkbox--error");
$borderColor-checked-Checkbox--warning: createThemeVar("borderColor-checked-Checkbox--warning");
$backgroundColor-checked-Checkbox--warning: createThemeVar("backgroundColor-checked-Checkbox--warning");
$borderColor-checked-Checkbox--success: createThemeVar("borderColor-checked-Checkbox--success");
$backgroundColor-checked-Checkbox--success: createThemeVar("backgroundColor-checked-Checkbox--success");
$backgroundColor-indicator-Checkbox: createThemeVar("backgroundColor-indicator-Checkbox");
`;

export const CheckboxMd = createMetadata({
  status: "stable",
  description:
    "`Checkbox` allows users to make binary choices with a clickable box that shows checked and unchecked states.",
  parts: {
    label: { description: "The label displayed for the checkbox." },
    input: { description: "The checkbox input area." },
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
    indeterminate: { description: "Sets the indeterminate state.", valueType: "boolean" },
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
    bindTo: { description: "Binds the checkbox to form data.", valueType: "string" },
  },
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Sets focus on the checkbox.",
      signature: "focus(): void",
    },
    value: {
      description: "Returns the current checkbox value.",
      signature: "get value(): boolean",
    },
    setValue: {
      description: "Sets the current checkbox value.",
      signature: "setValue(value: boolean): void",
      parameters: {
        value: "The new value to set.",
      },
    },
  },
  themeVars: extractScssThemeVars(checkboxStylesSource),
  defaultThemeVars: {
    [`borderColor-${COMP}`]: "$borderColor-Input-default",
    [`backgroundColor-${COMP}`]: "transparent",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",
    [`borderColor-${COMP}--disabled`]: "$borderColor--disabled",
    [`outlineWidth-${COMP}--focus`]: "2px",
    [`outlineColor-${COMP}--focus`]: "$color-primary-500",
    [`outlineOffset-${COMP}--focus`]: "2px",
    [`outlineStyle-${COMP}--focus`]: "solid",
    [`outlineWidth-${COMP}`]: "2px",
    [`outlineColor-${COMP}`]: "$color-primary-500",
    [`outlineOffset-${COMP}`]: "2px",
    [`outlineStyle-${COMP}`]: "solid",
    [`backgroundColor-indicator-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--error`]: "$borderColor-Input-default--error",
    [`backgroundColor-${COMP}--error`]: "$backgroundColor-Checkbox",
    [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--warning`]: "$borderColor-Input-default--warning",
    [`backgroundColor-${COMP}--warning`]: "$backgroundColor-Checkbox",
    [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--success`]: "$borderColor-Input-default--success",
    [`backgroundColor-${COMP}--success`]: "$backgroundColor-Checkbox",
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

export const checkboxRenderer = wrapComponent({
  name: COMP,
  metadata: CheckboxMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as CheckboxApi | null };
    return (
      <CheckboxNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition", "end")}
        labelBreak={adapter.booleanProp("labelBreak", false)}
        labelWidth={adapter.prop("labelWidth")}
        direction={adapter.stringProp("direction")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        indeterminate={adapter.booleanProp("indeterminate", defaultProps.indeterminate)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        onClick={(event) => {
          void adapter.event("click")(event);
        }}
        onDidChange={(value) => {
          void adapter.event("didChange")(value);
        }}
        onFocus={() => {
          void adapter.event("gotFocus")();
        }}
        onBlur={() => {
          void adapter.event("lostFocus")();
        }}
      />
    );
  },
});
