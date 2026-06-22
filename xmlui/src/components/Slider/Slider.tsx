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
import { defaultProps } from "./Slider.defaults";
import { SliderNative, type SliderApi } from "./SliderReact";

const COMP = "Slider";

const sliderStylesSource = `
$borderRadius-Slider: createThemeVar("borderRadius-Slider");
$borderColor-Slider: createThemeVar("borderColor-Slider");
$borderWidth-Slider: createThemeVar("borderWidth-Slider");
$borderStyle-Slider: createThemeVar("borderStyle-Slider");
$boxShadow-Slider: createThemeVar("boxShadow-Slider");
$borderColor-Slider--hover: createThemeVar("borderColor-Slider--hover");
$boxShadow-Slider--hover: createThemeVar("boxShadow-Slider--hover");
$borderColor-Slider--focus: createThemeVar("borderColor-Slider--focus");
$boxShadow-Slider--focus: createThemeVar("boxShadow-Slider--focus");
$borderRadius-Slider--error: createThemeVar("borderRadius-Slider--error");
$borderColor-Slider--error: createThemeVar("borderColor-Slider--error");
$borderWidth-Slider--error: createThemeVar("borderWidth-Slider--error");
$borderStyle-Slider--error: createThemeVar("borderStyle-Slider--error");
$boxShadow-Slider--error: createThemeVar("boxShadow-Slider--error");
$borderColor-Slider--error--hover: createThemeVar("borderColor-Slider--error--hover");
$boxShadow-Slider--error--hover: createThemeVar("boxShadow-Slider--error--hover");
$borderColor-Slider--error--focus: createThemeVar("borderColor-Slider--error--focus");
$boxShadow-Slider--error--focus: createThemeVar("boxShadow-Slider--error--focus");
$borderRadius-Slider--warning: createThemeVar("borderRadius-Slider--warning");
$borderColor-Slider--warning: createThemeVar("borderColor-Slider--warning");
$borderWidth-Slider--warning: createThemeVar("borderWidth-Slider--warning");
$borderStyle-Slider--warning: createThemeVar("borderStyle-Slider--warning");
$boxShadow-Slider--warning: createThemeVar("boxShadow-Slider--warning");
$borderColor-Slider--warning--hover: createThemeVar("borderColor-Slider--warning--hover");
$boxShadow-Slider--warning--hover: createThemeVar("boxShadow-Slider--warning--hover");
$borderColor-Slider--warning--focus: createThemeVar("borderColor-Slider--warning--focus");
$boxShadow-Slider--warning--focus: createThemeVar("boxShadow-Slider--warning--focus");
$borderRadius-Slider--success: createThemeVar("borderRadius-Slider--success");
$borderColor-Slider--success: createThemeVar("borderColor-Slider--success");
$borderWidth-Slider--success: createThemeVar("borderWidth-Slider--success");
$borderStyle-Slider--success: createThemeVar("borderStyle-Slider--success");
$boxShadow-Slider--success: createThemeVar("boxShadow-Slider--success");
$borderColor-Slider--success--hover: createThemeVar("borderColor-Slider--success--hover");
$boxShadow-Slider--success--hover: createThemeVar("boxShadow-Slider--success--hover");
$borderColor-Slider--success--focus: createThemeVar("borderColor-Slider--success--focus");
$boxShadow-Slider--success--focus: createThemeVar("boxShadow-Slider--success--focus");
$backgroundColor-track-Slider: createThemeVar("backgroundColor-track-Slider");
$backgroundColor-track-Slider--disabled: createThemeVar("backgroundColor-track-Slider--disabled");
$backgroundColor-range-Slider: createThemeVar("backgroundColor-range-Slider");
$backgroundColor-range-Slider--disabled: createThemeVar("backgroundColor-range-Slider--disabled");
$borderWidth-thumb-Slider: createThemeVar("borderWidth-thumb-Slider");
$borderStyle-thumb-Slider: createThemeVar("borderStyle-thumb-Slider");
$borderColor-thumb-Slider: createThemeVar("borderColor-thumb-Slider");
$backgroundColor-thumb-Slider: createThemeVar("backgroundColor-thumb-Slider");
$boxShadow-thumb-Slider: createThemeVar("boxShadow-thumb-Slider");
$backgroundColor-thumb-Slider--focus: createThemeVar("backgroundColor-thumb-Slider--focus");
$boxShadow-thumb-Slider--focus: createThemeVar("boxShadow-thumb-Slider--focus");
$backgroundColor-thumb-Slider--hover: createThemeVar("backgroundColor-thumb-Slider--hover");
$boxShadow-thumb-Slider--hover: createThemeVar("boxShadow-thumb-Slider--hover");
$backgroundColor-thumb-Slider--active: createThemeVar("backgroundColor-thumb-Slider--active");
$boxShadow-thumb-Slider--active: createThemeVar("boxShadow-thumb-Slider--active");
`;

export const SliderMd = createMetadata({
  status: "stable",
  description: "`Slider` provides an interactive control for selecting numeric values within a range.",
  parts: {
    label: { description: "The label displayed for the slider." },
    track: { description: "The track element of the slider." },
    thumb: { description: "The thumb elements of the slider." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    label: { description: "The label displayed for the slider.", valueType: "string" },
    labelPosition: {
      description: "Controls the label position.",
      valueType: "string",
      availableValues: ["start", "end", "top", "bottom"],
      defaultValue: "top",
    },
    labelBreak: { description: "Allows line breaks in the label.", valueType: "boolean" },
    labelWidth: { description: "Sets the label width.", valueType: "length" },
    initialValue: { ...dInitialValue(undefined, "any"), valueType: "any" },
    value: { description: "Controlled value.", valueType: "any" },
    minValue: { description: "The minimum allowed value.", valueType: "number", defaultValue: defaultProps.min },
    maxValue: { description: "The maximum allowed value.", valueType: "number", defaultValue: defaultProps.max },
    step: { description: "The increment value.", valueType: "number", defaultValue: defaultProps.step },
    minStepsBetweenThumbs: {
      description: "The minimum number of steps between thumbs.",
      valueType: "number",
      defaultValue: defaultProps.minStepsBetweenThumbs,
    },
    inverted: { description: "Reverses the visual direction of the slider.", valueType: "boolean" },
    enabled: dEnabled(defaultProps.enabled),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: { description: "Validation status.", valueType: "string", defaultValue: "none" },
    rangeStyle: { description: "Custom range style.", valueType: "hash" },
    thumbStyle: { description: "Custom thumb style.", valueType: "hash" },
    showValues: { description: "Shows tooltip values.", valueType: "boolean", defaultValue: defaultProps.showValues },
    valueFormat: { description: "Formats displayed values.", valueType: "any" },
    requireLabelMode: { description: "Controls required/optional label markers.", valueType: "string" },
    bindTo: { description: "Binds the slider to form data.", valueType: "string" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: { description: "Sets focus on the slider.", signature: "focus(): void" },
    value: {
      description: "Returns the current slider value.",
      signature: "get value(): number | number[]",
    },
    setValue: {
      description: "Sets the current slider value.",
      signature: "setValue(value: number | number[] | undefined): void",
    },
  },
  themeVars: extractScssThemeVars(sliderStylesSource),
  defaultThemeVars: {
    [`backgroundColor-track-${COMP}`]: "$color-surface-200",
    [`backgroundColor-range-${COMP}`]: "$color-primary",
    [`borderWidth-thumb-${COMP}`]: "2px",
    [`borderStyle-thumb-${COMP}`]: "solid",
    [`borderColor-thumb-${COMP}`]: "$color-surface-50",
    [`backgroundColor-thumb-${COMP}`]: "$color-primary",
    [`boxShadow-thumb-${COMP}`]: "none",
    [`backgroundColor-thumb-${COMP}--focus`]: "$color-primary",
    [`boxShadow-thumb-${COMP}--focus`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${COMP}--hover`]: "$color-primary",
    [`boxShadow-thumb-${COMP}--hover`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${COMP}--active`]: "$color-primary-400",
    [`boxShadow-thumb-${COMP}--active`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "transparent",
    [`borderWidth-${COMP}`]: "0",
    [`borderStyle-${COMP}`]: "solid",
    [`boxShadow-${COMP}`]: "none",
    [`borderColor-${COMP}--hover`]: `$borderColor-${COMP}`,
    [`boxShadow-${COMP}--hover`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--focus`]: `$borderColor-${COMP}`,
    [`boxShadow-${COMP}--focus`]: `$boxShadow-${COMP}`,
    [`backgroundColor-track-${COMP}--disabled`]: "$color-surface-300",
    [`backgroundColor-range-${COMP}--disabled`]: "$color-surface-400",
    [`borderRadius-${COMP}--error`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--error`]: "$color-danger-500",
    [`borderWidth-${COMP}--error`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--error`]: `$borderStyle-${COMP}`,
    [`boxShadow-${COMP}--error`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--error--hover`]: `$borderColor-${COMP}--error`,
    [`boxShadow-${COMP}--error--hover`]: `$boxShadow-${COMP}--error`,
    [`borderColor-${COMP}--error--focus`]: `$borderColor-${COMP}--error`,
    [`boxShadow-${COMP}--error--focus`]: `$boxShadow-${COMP}--error`,
    [`borderRadius-${COMP}--warning`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--warning`]: "$color-warn-500",
    [`borderWidth-${COMP}--warning`]: `$borderWidth-${COMP}`,
    [`borderStyle-${COMP}--warning`]: `$borderStyle-${COMP}`,
    [`boxShadow-${COMP}--warning`]: `$boxShadow-${COMP}`,
    [`borderColor-${COMP}--warning--hover`]: `$borderColor-${COMP}--warning`,
    [`boxShadow-${COMP}--warning--hover`]: `$boxShadow-${COMP}--warning`,
    [`borderColor-${COMP}--warning--focus`]: `$borderColor-${COMP}--warning`,
    [`boxShadow-${COMP}--warning--focus`]: `$boxShadow-${COMP}--warning`,
    [`borderRadius-${COMP}--success`]: `$borderRadius-${COMP}`,
    [`borderColor-${COMP}--success`]: "$color-success-500",
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

export const sliderRenderer = wrapComponent({
  name: COMP,
  metadata: SliderMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as SliderApi | null };
    return (
      <SliderNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue")}
        min={adapter.prop("minValue", defaultProps.min)}
        max={adapter.prop("maxValue", defaultProps.max)}
        step={adapter.prop("step", defaultProps.step)}
        minStepsBetweenThumbs={adapter.prop("minStepsBetweenThumbs", defaultProps.minStepsBetweenThumbs)}
        inverted={adapter.prop("inverted", false)}
        label={adapter.prop("label")}
        labelPosition={adapter.stringProp("labelPosition", "top")}
        labelBreak={adapter.booleanProp("labelBreak", false)}
        labelWidth={adapter.prop("labelWidth")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", false)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        showValues={adapter.booleanProp("showValues", defaultProps.showValues)}
        valueFormat={adapter.prop("valueFormat")}
        title={adapter.stringProp("title")}
        rangeStyle={adapter.prop("rangeStyle")}
        thumbStyle={adapter.prop("thumbStyle")}
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
