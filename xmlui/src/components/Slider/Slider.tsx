import styles from "./Slider.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dSetValueApi, dValidationStatus,
  dValue,
} from "../metadata-helpers";
import { Slider } from "./SliderNative";

const COMP = "Slider";

export const SliderMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component allows you to select a numeric value ` +
    `between a range specified by minimum and maximum values.`,
  props: {
    initialValue: dInitialValue(),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    minValue: d(
      `This property specifies the minimum value of the allowed input range.`,
      null,
      "number",
      0,
    ),
    maxValue: d(
      `This property specifies the maximum value of the allowed input range.`,
      null,
      "number",
      10,
    ),
    step: d(
      `This property defines the increment value for the slider, determining the allowed intervals between selectable values.`,
    ),
    minStepsBetweenThumbs: d(
      `This property sets the minimum number of steps required between multiple thumbs on the slider, ensuring they maintain a specified distance.`,
    ),
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: dValidationStatus(),
    rangeStyle: d(`This property allows you to apply custom styles to the range element of the slider.`),
    thumbStyle: d(`This property allows you to apply custom styles to the thumb elements of the slider.`),
    showValues: d(
      `This property controls whether the slider shows the current values of the thumbs.`,
      null,
      "boolean",
      true
    ),
    valueFormat: d(
      `This property allows you to customize how the values are displayed.`,
      null,
      "any"
    )
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    value: dValue(),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-track-${COMP}`]: "$color-surface-200",
    [`backgroundColor-range-${COMP}`]: "$color-primary",
    [`borderWidth-thumb-${COMP}`]: "2px",
    [`borderStyle-thumb-${COMP}`]: "solid",
    [`borderColor-thumb-${COMP}`]: "$color-surface-50",
    [`backgroundColor-thumb-${COMP}`]: "$color-primary",
    [`boxShadow-thumb-${COMP}`]: "$boxShadow-md",
    [`boxShadow-thumb-${COMP}--hover`]: "$boxShadow-lg",
    [`boxShadow-thumb-${COMP}--focus`]: "$boxShadow-xl",
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
    layoutCss,
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
        style={layoutCss}
        step={extractValue(node.props?.step)}
        min={extractValue(node.props?.minValue)}
        max={extractValue(node.props?.maxValue)}
        enabled={extractValue.asOptionalBoolean(node.props?.enabled)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        label={extractValue.asOptionalString(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue.asOptionalString(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        rangeStyle={extractValue(node.props?.rangeStyle)}
        thumbStyle={extractValue(node.props?.thumbStyle)}
        showValues={extractValue.asOptionalBoolean(node.props?.showValues)}
        valueFormat={lookupSyncCallback(node.props?.valueFormat)}
      />
    );
  },
);