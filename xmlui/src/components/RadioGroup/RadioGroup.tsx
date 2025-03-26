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
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { RadioGroup } from "./RadioGroupNative";

const COMP = "RadioGroup";
const RGOption = `RadioGroupOption`;

export const RadioGroupMd = createMetadata({
  description:
    `The \`${COMP}\` input component is a group of radio buttons ` +
    `([\`RadioGroupOption\`](./RadioGroupOption.mdx) components) that allow users to select ` +
    `only one option from the group at a time.`,
  props: {
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    orientation: d(
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
    [`borderWidth-${RGOption}`]: "2px",
    [`backgroundColor-checked-${RGOption}--disabled]`]: `$borderColor-${RGOption}--disabled`,
    [`backgroundColor-checked-${RGOption}-error`]: `$borderColor-${RGOption}-error`,
    [`backgroundColor-checked-${RGOption}-warning`]: `$borderColor-${RGOption}-warning`,
    [`backgroundColor-checked-${RGOption}-success`]: `$borderColor-${RGOption}-success`,
    [`fontSize-${RGOption}`]: "$fontSize-small",
    [`fontWeight-${RGOption}`]: "$fontWeight-bold",
    [`textColor-${RGOption}-error`]: `$borderColor-${RGOption}-error`,
    [`textColor-${RGOption}-warning`]: `$borderColor-${RGOption}-warning`,
    [`textColor-${RGOption}-success`]: `$borderColor-${RGOption}-success`,
    [`backgroundColor-checked-${RGOption}-default`]: "$color-primary-500",
    [`borderColor-${RGOption}-default`]: "$color-surface-500",
    [`borderColor-${RGOption}-default--hover`]: "$color-surface-700",
    [`borderColor-${RGOption}-default--active`]: "$color-primary-500",
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
