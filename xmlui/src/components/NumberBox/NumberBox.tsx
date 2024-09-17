import { createComponentRenderer } from "@components-core/renderers";
import styles from "./NumberBox.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { NumberBox } from "./NumberBoxNative";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLabelId,
  dLostFocus,
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dSetValueApi,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "@components/metadata-helpers";

const COMP = "NumberBox";

export const NumberBoxMd = createMetadata({
  description:
    `A \`${COMP}\` component allows users to input numeric values: either integer or floating ` +
    `point numbers. It also accepts empty values, where the stored value will be of type \`null\`.`,
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    labelId: dLabelId(),
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
    hasSpinBox: d(
      `This boolean prop shows (\`true\`) or hides (\`false\`) the spinner buttons for the input field.`,
    ),
    step: d(`This prop governs how big the step when clicking on the spinner of the field.`),
    integersOnly: d(
      `This boolean property signs whether the input field accepts integers only (\`true\`) ` +
        `or not (\`false\`).`,
    ),
    zeroOrPositive: d(
      `This boolean property determines whether the input value can only be 0 or positive numbers ` +
        `(\`true\`) or also negative (\`false\`).`,
    ),
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
    value: d(
      `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
    ),
    setValue: dSetValueApi(),
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
    return (
      <NumberBox
        style={layoutCss}
        value={state?.value}
        initialValue={extractValue.asOptionalString(node.props.initialValue)}
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
        endIcon={extractValue.asOptionalString(node.props.endIcon)}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        maxLength={extractValue(node.props.maxLength)}
      />
    );
  },
);
