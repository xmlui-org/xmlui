import { Slider } from "./SliderNative";
import styles from "./Slider.module.scss";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  d,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";

const COMP = "Slider";

export const SliderMd = createMetadata({
  status: "stable",
  description:
    "`Slider` provides an interactive control for selecting numeric values within " +
    "a defined range, supporting both single value selection and range selection with " +
    "multiple thumbs. It offers precise control through customizable steps and visual " +
    "feedback with formatted value display." +
    "\n\n" +
    "Hover over the component to see the tooltip with the current value. On mobile, tap the thumb to see the tooltip.",
  props: {
    initialValue: dInitialValue(),
    minValue: {
      description: `This property specifies the minimum value of the allowed input range.`,
      valueType: "number",
      defaultValue: 0,
    },
    maxValue: {
      description: `This property specifies the maximum value of the allowed input range.`,
      valueType: "number",
      defaultValue: 10,
    },
    step: {
      description: `This property defines the increment value for the slider, determining the allowed intervals between selectable values.`,
      defaultValue: 1,
    },
    minStepsBetweenThumbs: d(
      `This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.`,
      undefined,
      "number",
      1,
    ),
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: "none",
    },
    rangeStyle: d(
      `This optional property allows you to apply custom styles to the range element of the slider.`,
    ),
    thumbStyle: d(
      `This optional property allows you to apply custom styles to the thumb elements of the slider.`,
    ),
    showValues: {
      description: `This property controls whether the slider shows the current values of the thumbs.`,
      valueType: "boolean",
      defaultValue: true,
    },
    valueFormat: {
      description: `This property allows you to customize how the values are displayed.`,
      valueType: "any",
      defaultValue: "(value) => value.toString()",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `This method sets the focus on the slider component.`,
      signature: "focus(): void",
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): number | [number, number] | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: number | [number, number] | undefined): void",
      parameters: {
        value: "The new value to set. Can be a single value or an array of values for range sliders.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-track-${COMP}`]: "$color-surface-200",
    [`backgroundColor-range-${COMP}`]: "$color-primary",
    [`borderWidth-thumb-${COMP}`]: "2px",
    [`borderStyle-thumb-${COMP}`]: "solid",
    [`borderColor-thumb-${COMP}`]: "$color-surface-50",
    [`backgroundColor-thumb-${COMP}`]: "$color-primary",
    [`backgroundColor-thumb-${COMP}--focus`]: "$color-primary",
    [`boxShadow-thumb-${COMP}--focus`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${COMP}--hover`]: "$color-primary",
    [`boxShadow-thumb-${COMP}--hover`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`backgroundColor-thumb-${COMP}--active`]: "$color-primary-400",
    [`boxShadow-thumb-${COMP}--active`]: "0 0 0 6px rgb(from $color-primary r g b / 0.4)",
    [`borderRadius-${COMP}-default`]: "$borderRadius",
    [`borderColor-${COMP}-default`]: "transparent",
    [`borderWidth-${COMP}-default`]: "0",
    [`borderStyle-${COMP}-default`]: "solid",
    [`boxShadow-${COMP}-default`]: "none",

    light: {
      [`backgroundColor-track-${COMP}--disabled`]: "$color-surface-300",
      [`backgroundColor-range-${COMP}--disabled`]: "$color-surface-400",
      [`backgroundColor-thumb-${COMP}`]: "$color-primary-500",
      [`borderColor-thumb-${COMP}`]: "$color-surface-50",
    },
    dark: {
      [`backgroundColor-track-${COMP}--disabled`]: "$color-surface-600",
      [`backgroundColor-range-${COMP}--disabled`]: "$color-surface-800",
      [`backgroundColor-thumb-${COMP}`]: "$color-primary-400",
      [`borderColor-thumb-${COMP}`]: "$color-surface-950",
    },
  },
});

export const sliderComponentRenderer = createComponentRenderer(
  COMP,
  SliderMd,
  ({
    node,
    extractValue,
    lookupEventHandler,
    lookupSyncCallback,
    className,
    updateState,
    state,
    registerComponentApi,
  }) => {
    return (
      <Slider
        validationStatus={extractValue(node.props.validationStatus)}
        minStepsBetweenThumbs={extractValue(node.props?.minStepsBetweenThumbs)}
        value={state.value}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        className={className}
        step={extractValue(node.props?.step)}
        min={extractValue(node.props?.minValue)}
        max={extractValue(node.props?.maxValue)}
        enabled={extractValue.asOptionalBoolean(node.props?.enabled)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        rangeStyle={extractValue(node.props?.rangeStyle)}
        thumbStyle={extractValue(node.props?.thumbStyle)}
        showValues={extractValue.asOptionalBoolean(node.props?.showValues)}
        valueFormat={lookupSyncCallback(node.props?.valueFormat)}
      />
    );
  },
);
