import styles from "./NumberBox.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  d,
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
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { NumberBox } from "./NumberBoxNative";

const COMP = "NumberBox";

export const NumberBoxMd = createMetadata({
  status: "stable",
  description:
    "`NumberBox` provides a specialized input field for numeric values with built-in " +
    "validation, spinner buttons, and flexible formatting options. It supports both " +
    "integer and floating-point numbers, handles empty states as null values, and " +
    "integrates seamlessly with form validation.",
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
    gap: {
      description: "This property defines the gap between the adornments and the input area.",
    },
    hasSpinBox: {
      description: `This boolean prop shows (\`true\`) or hides (\`false\`) the spinner buttons for the input field.`,
      valueType: "boolean",
      defaultValue: true,
    },
    spinnerUpIcon: d(
      `Allows setting an alternate icon displayed in the ${COMP} spinner for incrementing values. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.spinnerUp:NumberBox" declaration in the ` +
        `app configuration file.`,
    ),
    spinnerDownIcon: d(
      `Allows setting an alternate icon displayed in the ${COMP} spinner for decrementing values. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.spinnerDown:NumberBox" declaration in the ` +
        `app configuration file.`,
    ),
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
    zeroOrPositive: {
      description:
        `This boolean property determines whether the input value can only be 0 or positive numbers ` +
        `(\`true\`) or also negative (\`false\`).`,
      valueType: "boolean",
      defaultValue: false,
    },
    minValue: d(
      "The minimum value the input field allows. Can be a float or an integer if " +
        "[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer." +
        "If not set, no minimum value check is done.",
    ),
    maxValue: d(
      "The maximum value the input field allows. Can be a float or an integer if " +
        "[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer." +
        "If not set, no maximum value check is done.",
    ),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This API focuses the input field of the \`${COMP}\`. You can use it to programmatically focus the field.`,
      signature: "focus(): void",
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: number | undefined): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const numberBoxComponentRenderer = createComponentRenderer(
  COMP,
  NumberBoxMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    layoutCss,
    registerComponentApi,
  }) => {
    // --- Handle initial value as a number
    let extractedInitialValue = extractValue(node.props.initialValue);
    if (typeof extractedInitialValue === "string" && !isNaN(parseFloat(extractedInitialValue))) {
      extractedInitialValue = Number(extractedInitialValue);
    }
    return (
      <NumberBox
        style={layoutCss}
        value={state?.value}
        initialValue={extractedInitialValue}
        step={extractValue(node.props.step)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        hasSpinBox={extractValue.asOptionalBoolean(node.props.hasSpinBox)}
        integersOnly={extractValue.asOptionalBoolean(node.props.integersOnly)}
        zeroOrPositive={extractValue.asOptionalBoolean(node.props.zeroOrPositive)}
        min={extractValue.asOptionalNumber(node.props.minValue)}
        max={extractValue.asOptionalNumber(node.props.maxValue)}
        startText={extractValue.asOptionalString(node.props.startText)}
        startIcon={extractValue.asOptionalString(node.props.startIcon)}
        endText={extractValue.asOptionalString(node.props.endText)}
        gap={extractValue.asOptionalString(node.props.gap)}
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
        spinnerUpIcon={extractValue.asOptionalString(node.props.spinnerUpIcon)}
        spinnerDownIcon={extractValue.asOptionalString(node.props.spinnerDownIcon)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        maxLength={extractValue(node.props.maxLength)}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
      />
    );
  },
);
