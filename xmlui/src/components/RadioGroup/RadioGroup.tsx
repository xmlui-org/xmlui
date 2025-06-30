import styles from "./RadioGroup.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
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
  description:
    "`RadioGroup` creates a mutually exclusive selection interface where users can " +
    "choose only one option from a group of radio buttons. It manages the selection " +
    "state and ensures that selecting one option automatically deselects all others in " +
    "the group.",
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
    [`borderWidth-RadioGroupOption-validation`]: `2px`,

    [`borderColor-${RGOption}-default`]: "$color-surface-500",
    [`borderColor-${RGOption}-default--hover`]: "$color-surface-700",
    [`borderColor-${RGOption}-default--active`]: "$color-primary-500",

    [`backgroundColor-RadioGroupOption--disabled`]: "$backgroundColor--disabled",

    [`backgroundColor-RadioGroupOption-checked`]: "$color-primary-500",
    [`backgroundColor-RadioGroupOption-checked--disabled`]: `$textColor--disabled`,
    [`backgroundColor-RadioGroupOption-checked-indicator`]: `transparent`,
    [`backgroundColor-RadioGroupOption-checked-indicator--disabled`]: `transparent`,

    [`backgroundColor-checked-${RGOption}-error`]: `$borderColor-error`,
    [`backgroundColor-checked-${RGOption}-warning`]: `$borderColor-warning`,
    [`backgroundColor-checked-${RGOption}-success`]: `$borderColor-success`,
    
    [`fontSize-${RGOption}`]: "$fontSize-small",
    [`fontWeight-${RGOption}`]: "$fontWeight-bold",
    
    [`textColor-${RGOption}-error`]: `$borderColor-${RGOption}-error`,
    [`textColor-${RGOption}-warning`]: `$borderColor-${RGOption}-warning`,
    [`textColor-${RGOption}-success`]: `$borderColor-${RGOption}-success`,
  },
});

export const radioGroupRenderer = createComponentRenderer(
  COMP,
  RadioGroupMd,
  ({
    node,
    extractValue,
    layoutCss,
    state,
    updateState,
    lookupEventHandler,
    renderChild,
    registerComponentApi,
  }) => {
    return (
      <RadioGroup
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
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
      >
        {renderChild(node.children)}
      </RadioGroup>
    );
  },
);
