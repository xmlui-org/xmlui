import { Slider, defaultProps } from "./SliderReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import styles from "./Slider.module.scss";
import { wrapComponent } from "../../components-core/wrapComponent";
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
    "Hover over the component to see the tooltip with the current value. On mobile, tap the thumb to see the tooltip.",
  parts: {
    label: {
      description: "The label displayed for the slider.",
    },
    track: {
      description: "The track element of the slider.",
    },
    thumb: {
      description: "The thumb elements of the slider.",
    },
  },
  props: {
    initialValue: dInitialValue(),
    minValue: {
      description: `This property specifies the minimum value of the allowed input range.`,
      valueType: "number",
      defaultValue: defaultProps.min,
    },
    maxValue: {
      description: `This property specifies the maximum value of the allowed input range.`,
      valueType: "number",
      defaultValue: defaultProps.max,
    },
    step: {
      description: `This property defines the increment value for the slider, determining the allowed intervals between selectable values.`,
      valueType: "number",
      defaultValue: defaultProps.step,
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
    [`borderRadius-${COMP}`]: "$borderRadius",
    [`borderColor-${COMP}`]: "transparent",
    [`borderWidth-${COMP}`]: "0",
    [`borderStyle-${COMP}`]: "solid",
    [`boxShadow-${COMP}`]: "none",

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

type ThemedSliderProps = React.ComponentPropsWithoutRef<typeof Slider>;

export const ThemedSlider = React.forwardRef<React.ElementRef<typeof Slider>, ThemedSliderProps>(
  function ThemedSlider({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(SliderMd);
    return (
      <Slider
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const sliderComponentRenderer = wrapComponent(COMP, Slider, SliderMd, {
  // minValue, maxValue, minStepsBetweenThumbs are number-typed in metadata — asOptionalNumber throws
  // for non-numeric strings (e.g. "invalid"). invalidMessages is handled by form wrappers and should
  // not leak to the underlying slider DOM.
  exclude: ["minValue", "maxValue", "minStepsBetweenThumbs", "invalidMessages"],
  customRender: (props, { node, extractValue, lookupEventHandler, lookupSyncCallback, classes, updateState, state, registerComponentApi }) => {
    const {
      invalidMessages: _invalidMessages,
      labelPosition: _labelPosition,
      requireLabelMode: _requireLabelMode,
      ...sliderProps
    } = props;

    return (
      <Slider
        {...sliderProps}
        value={state.value}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        classes={classes}
        validationStatus={extractValue(node.props.validationStatus)}
        minStepsBetweenThumbs={extractValue(node.props?.minStepsBetweenThumbs)}
        min={extractValue(node.props?.minValue)}
        max={extractValue(node.props?.maxValue)}
        valueFormat={lookupSyncCallback(node.props?.valueFormat)}
      />
    );
  },
});
