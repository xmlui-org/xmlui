import styles from "../Toggle/Toggle.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dAutoFocus,
  dComponent,
  dDidChange,
  dEnabled,
  dGotFocus,
  dIndeterminate,
  dInitialValue,
  dInternal,
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
import { defaultProps, Toggle } from "../Toggle/Toggle";
import { MemoizedItem } from "../container-helpers";

const COMP = "Checkbox";

export const CheckboxMd = createMetadata({
  status: "stable",
  description:
    "`Checkbox` allows users to make binary choices with a clickable box that shows " +
    "checked/unchecked states. It's essential for settings, preferences, multi-select " +
    "lists, and accepting terms or conditions.",
  props: {
    indeterminate: dIndeterminate(defaultProps.indeterminate),
    label: dLabel(),
    labelPosition: dLabelPosition("end"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    required: dRequired(),
    initialValue: dInitialValue(defaultProps.initialValue),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
    description: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
    inputTemplate: dComponent(
      "This property is used to define a custom checkbox input template"
    ),
  },
  childrenAsTemplate: "inputTemplate",
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: `This method returns the current value of the ${COMP}.`,
      signature: "get value(): boolean",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: boolean): void",
      parameters: {
        value: "The new value to set for the checkbox.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`borderColor-checked-${COMP}-error`]: `$borderColor-${COMP}-error`,
    [`backgroundColor-checked-${COMP}-error`]: `$borderColor-${COMP}-error`,
    [`borderColor-checked-${COMP}-warning`]: `$borderColor-${COMP}-warning`,
    [`backgroundColor-checked-${COMP}-warning`]: `$borderColor-${COMP}-warning`,
    [`borderColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
    [`backgroundColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
    [`backgroundColor-indicator-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",
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
    const inputTemplate = node.props.inputTemplate;
    return (
      <Toggle
        inputRenderer={
          inputTemplate
            ? (contextVars) => (
                <MemoizedItem
                  contextVars={contextVars}
                  node={inputTemplate}
                  renderChild={renderChild}
                  layoutContext={layoutContext}
                />
              )
            : undefined
        }
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
        initialValue={extractValue.asOptionalBoolean(
          node.props.initialValue,
          defaultProps.initialValue,
        )}
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