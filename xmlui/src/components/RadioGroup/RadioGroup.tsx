import styles from "./RadioGroup.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dInternal,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { RadioGroup, defaultProps } from "./RadioGroupNative";

const COMP = "RadioGroup";
const RGOption = `RadioGroupOption`;

export const RadioGroupMd = createMetadata({
  status: "stable",
  description:
    "`RadioGroup` creates a mutually exclusive selection interface where users can " +
    "choose only one option from a group of radio buttons. It manages the selection " +
    "state and ensures that selecting one option automatically deselects all others in " +
    "the group." +
    "\n\n" +
    "Radio options store their values as strings. Numbers and booleans are converted to strings " +
    "when assigned, while objects, functions and arrays default to an empty string unless resolved " +
    "via binding expressions.",
  props: {
    initialValue: {
      ...dInitialValue(),
      defaultValue: defaultProps.initialValue,
    },
    autoFocus: dAutoFocus(),
    required: {
      ...dRequired(),
      defaultValue: defaultProps.required,
    },
    readOnly: dReadonly(),
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    orientation: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This property sets the orientation of the ` +
        `options within the radio group.`,
    ),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${RGOption}`]: "$space-1_5",
    [`borderWidth-${RGOption}`]: "1px",
    [`borderWidth-${RGOption}-validation`]: `2px`,

    [`borderColor-${RGOption}-default`]: "$color-surface-500",
    [`borderColor-checked-${RGOption}`]: "$color-primary-500",
    [`borderColor-${RGOption}-default--hover`]: "$color-surface-700",
    [`borderColor-${RGOption}-default--active`]: "$color-primary-500",
    [`borderColor-${RGOption}-error`]: `$borderColor-Input-default--error`,
    [`borderColor-${RGOption}-warning`]: `$borderColor-Input-default--warning`,
    [`borderColor-${RGOption}-success`]: `$borderColor-Input-default--success`,

    [`backgroundColor-${RGOption}--disabled`]: "$backgroundColor--disabled",
    [`backgroundColor-checked-${RGOption}`]: "$color-primary-500",
    [`backgroundColor-checked-${RGOption}--disabled`]: `$textColor--disabled`,
    
    [`fontSize-${RGOption}`]: "$fontSize-sm",
    [`fontWeight-${RGOption}`]: "$fontWeight-bold",
  },
});

export const radioGroupRenderer = createComponentRenderer(
  COMP,
  RadioGroupMd,
  ({
    node,
    extractValue,
    className,
    state,
    updateState,
    lookupEventHandler,
    renderChild,
    registerComponentApi,
  }) => {
    return (
      <RadioGroup
        autofocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        className={className}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
        updateState={updateState}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        label={extractValue.asOptionalString(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue(node.props.labelWidth)}
        labelBreak={extractValue(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      >
        {renderChild(node.children)}
      </RadioGroup>
    );
  },
);
