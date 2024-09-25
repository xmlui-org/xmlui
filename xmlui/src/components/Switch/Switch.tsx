import { createComponentRenderer } from "@components-core/renderers";
import { Toggle } from "@components/Toggle/Toggle";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "@components/Toggle/Toggle.module.scss";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import {
  dAutoFocus,
  dClick,
  dDidChange,
  dEnabled,
  dGotFocus,
  dIndeterminate,
  dInitialValue,
  dLabel,
  dLabelId,
  dLabelPosition,
  dLostFocus,
  dReadonly,
  dSetValueApi,
  dValidationStatus,
  dValueApi,
} from "@components/metadata-helpers";

const COMP = "Switch";

export const SwitchMd = createMetadata({
  description:
    `The \`${COMP}\` component is a user interface element that allows users to toggle between two states: ` +
    `on and off. It consists of a small rectangular or circular button that can be moved left or right to ` +
    `change its state.`,
  props: {
    indeterminate: dIndeterminate(),
    label: dLabel(),
    labelPosition: dLabelPosition("right"),
    initialValue: dInitialValue(false),
    labelId: dLabelId(),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    description: d(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
  },
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: dValueApi(),
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-border-checked-${COMP}-error`]: `$color-border-${COMP}-error`,
    [`color-bg-checked-${COMP}-error`]: `$color-border-${COMP}-error`,
    [`color-border-checked-${COMP}-warning`]: `$color-border-${COMP}-warning`,
    [`color-bg-checked-${COMP}-warning`]: `$color-border-${COMP}-warning`,
    [`color-border-checked-${COMP}-success`]: `$color-border-${COMP}-success`,
    [`color-bg-checked-${COMP}-success`]: `$color-border-${COMP}-success`,
    /* light: {
      [`color-bg-${COMP}`]: "$color-surface-400",
      [`color-border-${COMP}`]: "$color-surface-400",
      [`color-bg-indicator-${COMP}`]: "$color-bg-primary",
      [`color-border-checked-${COMP}`]: "$color-primary-500",
      [`color-bg-checked-${COMP}`]: "$color-primary-500",
      [`color-bg-${COMP}--disabled`]: "$color-surface-200",
    },
    dark: {
      [`color-bg-${COMP}`]: "$color-surface-500",
      [`color-border-${COMP}`]: "$color-surface-500",
      [`color-bg-indicator-${COMP}`]: "$color-bg-primary",
      [`color-border-checked-${COMP}`]: "$color-primary-400",
      [`color-bg-checked-${COMP}`]: "$color-primary-400",
      [`color-bg-${COMP}--disabled`]: "$color-surface-800",
    }, */
  },
});

export const switchComponentRenderer = createComponentRenderer(
  "Switch",
  SwitchMd,
  ({
    node,
    extractValue,
    layoutCss,
    updateState,
    state,
    lookupEventHandler,
    registerComponentApi,
  }) => {
    return (
      <Toggle
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
        initialValue={extractValue.asOptionalBoolean(node.props.initialValue) || false}
        value={state?.value}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        variant="switch"
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
