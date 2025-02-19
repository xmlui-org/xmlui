import styles from "../Toggle/Toggle.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dAutoFocus,
  dClick,
  dDidChange,
  dEnabled,
  dGotFocus,
  dIndeterminate,
  dInitialValue,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dReadonly,
  dRequired,
  dSetValueApi,
  dValidationStatus,
  dValueApi,
} from "../../components/metadata-helpers";
import { Toggle } from "../Toggle/Toggle";
import { MemoizedItem } from "../container-helpers";
import { divide } from "lodash-es";

const COMP = "Checkbox";

export const CheckboxMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component allows users to make binary choices, typically between checked or ` +
    `unchecked. It consists of a small box that can be toggled on or off by clicking on it.`,
  props: {
    indeterminate: dIndeterminate(),
    label: dLabel(),
    labelPosition: dLabelPosition("end"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    required: dRequired(),
    initialValue: dInitialValue(false),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    description: d(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
    inputTemplate: d(""),
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
    light: {
      [`color-bg-indicator-${COMP}`]: "$color-bg-primary",
      [`color-border-checked-${COMP}`]: "$color-primary-500",
      [`color-bg-checked-${COMP}`]: "$color-primary-500",
      [`color-bg-${COMP}--disabled`]: "$color-surface-200",
    },
    dark: {
      [`color-bg-indicator-${COMP}`]: "$color-bg-primary",
      [`color-border-checked-${COMP}`]: "$color-primary-400",
      [`color-bg-checked-${COMP}`]: "$color-primary-400",
      [`color-bg-${COMP}--disabled`]: "$color-surface-800",
    },
  },
});

export const checkboxComponentRenderer = createComponentRenderer(
  COMP,
  CheckboxMd,
  ({
    node,
    extractValue,
    layoutCss,
    updateState,
    lookupEventHandler,
    state,
    registerComponentApi,
    renderChild,
    layoutContext,
  }) => {
    return (
      <Toggle
        inputRenderer={
          node.props?.inputTemplate
            ? (contextVars) => (
                <MemoizedItem
                  contextVars={contextVars}
                  node={node.props?.inputTemplate}
                  renderChild={renderChild}
                  layoutContext={layoutContext}
                />
              )
            : undefined
        }
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
        initialValue={extractValue.asOptionalBoolean(node.props.initialValue, false)}
        value={state?.value}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        indeterminate={extractValue.asOptionalBoolean(node.props.indeterminate)}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
