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
import { defaultProps } from "./ColorPicker.defaults";
import { ColorPickerNative, type ColorPickerApi } from "./ColorPickerReact";

const COMP = "ColorPicker";

const colorPickerStylesSource = `
$borderRadius-ColorPicker: createThemeVar("borderRadius-ColorPicker");
$borderColor-ColorPicker: createThemeVar("borderColor-ColorPicker");
$borderWidth-ColorPicker: createThemeVar("borderWidth-ColorPicker");
$borderStyle-ColorPicker: createThemeVar("borderStyle-ColorPicker");
$boxShadow-ColorPicker: createThemeVar("boxShadow-ColorPicker");
$borderColor-ColorPicker--hover: createThemeVar("borderColor-ColorPicker--hover");
$boxShadow-ColorPicker--hover: createThemeVar("boxShadow-ColorPicker--hover");
$borderColor-ColorPicker--focus: createThemeVar("borderColor-ColorPicker--focus");
$boxShadow-ColorPicker--focus: createThemeVar("boxShadow-ColorPicker--focus");
$borderRadius-ColorPicker--error: createThemeVar("borderRadius-ColorPicker--error");
$borderColor-ColorPicker--error: createThemeVar("borderColor-ColorPicker--error");
$borderWidth-ColorPicker--error: createThemeVar("borderWidth-ColorPicker--error");
$borderStyle-ColorPicker--error: createThemeVar("borderStyle-ColorPicker--error");
$boxShadow-ColorPicker--error: createThemeVar("boxShadow-ColorPicker--error");
$borderColor-ColorPicker--error--hover: createThemeVar("borderColor-ColorPicker--error--hover");
$boxShadow-ColorPicker--error--hover: createThemeVar("boxShadow-ColorPicker--error--hover");
$borderColor-ColorPicker--error--focus: createThemeVar("borderColor-ColorPicker--error--focus");
$boxShadow-ColorPicker--error--focus: createThemeVar("boxShadow-ColorPicker--error--focus");
$borderRadius-ColorPicker--warning: createThemeVar("borderRadius-ColorPicker--warning");
$borderColor-ColorPicker--warning: createThemeVar("borderColor-ColorPicker--warning");
$borderWidth-ColorPicker--warning: createThemeVar("borderWidth-ColorPicker--warning");
$borderStyle-ColorPicker--warning: createThemeVar("borderStyle-ColorPicker--warning");
$boxShadow-ColorPicker--warning: createThemeVar("boxShadow-ColorPicker--warning");
$borderColor-ColorPicker--warning--hover: createThemeVar("borderColor-ColorPicker--warning--hover");
$boxShadow-ColorPicker--warning--hover: createThemeVar("boxShadow-ColorPicker--warning--hover");
$borderColor-ColorPicker--warning--focus: createThemeVar("borderColor-ColorPicker--warning--focus");
$boxShadow-ColorPicker--warning--focus: createThemeVar("boxShadow-ColorPicker--warning--focus");
$borderRadius-ColorPicker--success: createThemeVar("borderRadius-ColorPicker--success");
$borderColor-ColorPicker--success: createThemeVar("borderColor-ColorPicker--success");
$borderWidth-ColorPicker--success: createThemeVar("borderWidth-ColorPicker--success");
$borderStyle-ColorPicker--success: createThemeVar("borderStyle-ColorPicker--success");
$boxShadow-ColorPicker--success: createThemeVar("boxShadow-ColorPicker--success");
$borderColor-ColorPicker--success--hover: createThemeVar("borderColor-ColorPicker--success--hover");
$boxShadow-ColorPicker--success--hover: createThemeVar("boxShadow-ColorPicker--success--hover");
$borderColor-ColorPicker--success--focus: createThemeVar("borderColor-ColorPicker--success--focus");
$boxShadow-ColorPicker--success--focus: createThemeVar("boxShadow-ColorPicker--success--focus");
$backgroundColor-ColorPicker: createThemeVar("backgroundColor-ColorPicker");
$width-ColorPicker: createThemeVar("width-ColorPicker");
$height-ColorPicker: createThemeVar("height-ColorPicker");
`;

export const ColorPickerMd = createMetadata({
  status: "stable",
  description: "`ColorPicker` enables users to choose colors by specifying RGB, HSL, or HEX values.",
  parts: {
    input: { description: "The color picker input element." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    label: { description: "The label displayed for the color picker.", valueType: "string" },
    initialValue: dInitialValue(defaultProps.initialValue, "color"),
    value: { description: "Controlled color value.", valueType: "color" },
    enabled: dEnabled(defaultProps.enabled),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: defaultProps.validationStatus },
    bindTo: { description: "Binds the color picker to form data.", valueType: "string" },
    requireLabelMode: { description: "Controls required/optional label markers.", valueType: "string" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: { description: "Focuses the ColorPicker component.", signature: "focus(): void" },
    value: { description: "Returns the current color value.", signature: "get value(): string" },
    setValue: {
      description: "Sets the current color value.",
      signature: "setValue(value: string): void",
    },
  },
  themeVars: extractScssThemeVars(colorPickerStylesSource),
  defaultThemeVars: {
    [`width-${COMP}`]: "3em",
    [`height-${COMP}`]: "1.5em",
    [`backgroundColor-${COMP}`]: "transparent",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "$borderColor-Input-default",
    [`borderWidth-${COMP}`]: "1px",
    [`borderStyle-${COMP}`]: "solid",
    [`boxShadow-${COMP}`]: "none",
    [`borderColor-${COMP}--hover`]: "$borderColor-Input-default--hover",
    [`boxShadow-${COMP}--hover`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--focus`]: "$borderColor-Input-default--hover",
    [`boxShadow-${COMP}--focus`]: `$boxShadow-${COMP}`,
    [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--error`]: "$borderColor-Input-default--error",
    [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
    [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
    [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
    [`borderColor-${COMP}--error--focus`]: `$borderColor-${COMP}--error`,
    [`boxShadow-${COMP}--error--focus`]: `$boxShadow-${COMP}--error`,
    [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--warning`]: "$borderColor-Input-default--warning",
    [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
    [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
    [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
    [`borderColor-${COMP}--warning--focus`]: `$borderColor-${COMP}--warning`,
    [`boxShadow-${COMP}--warning--focus`]: `$boxShadow-${COMP}--warning`,
    [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--success`]: "$borderColor-Input-default--success",
    [`borderWidth-${COMP}--success`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--success`]: `$borderStyle-${COMP}`,
    [`boxShadow-${COMP}--success`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--success--hover`]: `$borderColor-${COMP}--success`,
    [`boxShadow-${COMP}--success--hover`]: `$boxShadow-${COMP}--success`,
    [`borderColor-${COMP}--success--focus`]: `$borderColor-${COMP}--success`,
    [`boxShadow-${COMP}--success--focus`]: `$boxShadow-${COMP}--success`,
  },
  limitThemeVarsToComponent: true,
});

export const colorPickerRenderer = wrapComponent({
  name: COMP,
  metadata: ColorPickerMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as ColorPickerApi | null };
    return (
      <ColorPickerNative
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
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
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
