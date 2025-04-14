import styles from "./NumberBox.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dSetValueApi,
  dStartIcon,
  dStartText,
  dValidationStatus,
  dValue,
} from "../metadata-helpers";
import { NumberBox2 } from "./NumberBox2Native";

const COMP = "NumberBox2";

export const NumberBoxMd2 = createMetadata({
  status: "experimental",
  description:
    `A \`${COMP}\` component allows users to input numeric values: either integer or floating ` +
    `point numbers. It also accepts empty values, where the stored value will be of type \`null\`.`,
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    hasSpinBox: {
      description: `This boolean prop shows (\`true\`) or hides (\`false\`) the spinner buttons for the input field.`,
      valueType: "boolean",
      defaultValue: true,
    },
    step: {
      description: `This prop governs how big the step when clicking on the spinner of the field.`,
      valueType: "number",
      defaultValue: 1,
    },
    integersOnly: {
      description:
        `This boolean property signs whether the input field accepts integers only (\`true\`) ` +
        `or not (\`false\`).`,
      valueType: "boolean",
      defaultValue: false,
    },
    maxFractionDigits: {
      description:
        `This prop sets the maximum number of decimal places allowed in the input field. ` +
        `If the number of decimal places is greater than this value, the value will be truncated to the maximum allowed decimal places. `,
      valueType: "number",
      defaultValue: 3,
    },
    zeroOrPositive: {
      description:
        `This boolean property determines whether the input value can only be 0 or positive numbers ` +
        `(\`true\`) or also negative (\`false\`).`,
      valueType: "boolean",
      defaultValue: false,
    },
    minValue: d(
      `The minimum value the input field allows. Can be a float or an integer if ` +
        `[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer.`,
    ),
    maxValue: d(
      `The maximum value the input field allows. Can be a float or an integer if ` +
        `[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer.`,
    ),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: dFocus(COMP),
    value: dValue(),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const numberBox2ComponentRenderer = createComponentRenderer(
  COMP,
  NumberBoxMd2,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    layoutCss,
    registerComponentApi,
  }) => {
    return (
      <NumberBox2
      style={layoutCss}
      value={state?.value}
      initialValue={extractValue.asOptionalString(node.props.initialValue)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      placeholder={extractValue.asOptionalString(node.props.placeholder)}
      validationStatus={extractValue(node.props.validationStatus)}
      updateState={updateState}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      registerComponentApi={registerComponentApi}
      hasSpinBox={extractValue.asOptionalBoolean(node.props.hasSpinBox)}
      step={extractValue(node.props.step)}
      integersOnly={extractValue.asOptionalBoolean(node.props.integersOnly)}
      zeroOrPositive={extractValue.asOptionalBoolean(node.props.zeroOrPositive)}
      maxFractionDigits={extractValue.asOptionalNumber(node.props.maxFractionDigits)}
      min={extractValue.asOptionalNumber(node.props.minValue)}
      max={extractValue.asOptionalNumber(node.props.maxValue)}
      startText={extractValue.asOptionalString(node.props.startText)}
      startIcon={extractValue.asOptionalString(node.props.startIcon)}
      endText={extractValue.asOptionalString(node.props.endText)}
      endIcon={extractValue.asOptionalString(node.props.endIcon)}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      //maxLength={extractValue(node.props.maxLength)}
      label={extractValue(node.props.label)}
      labelPosition={extractValue(node.props.labelPosition)}
      labelWidth={extractValue(node.props.labelWidth)}
      labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
      required={extractValue.asOptionalBoolean(node.props.required)}
      />
    );
  },
);
