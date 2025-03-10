import styles from "./TextBox.module.scss";

import type {RegisterComponentApiFn, ValueExtractor} from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { LookupActionOptions } from "../../abstractions/ActionDefs";
import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
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
} from "../metadata-helpers";
import { TextBox } from "./TextBoxNative";

const COMP = "TextBox";

export const TextBoxMd = createMetadata({
  status: "experimental",
  description: `The \`${COMP}\` is an input component that allows users to input and edit textual data.`,
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
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "radius-Input": "$radius",
    "color-text-Input": "$color-text-primary",
    "color-bg-Input--disabled": "$color-bg--disabled",
    "thickness-border-Input": "1px",
    "min-height-Input": "39px",
    "padding-Input": "$space-2",
    "style-border-Input": "solid",
    "color-border-Input--disabled": "$color-border--disabled",
    "color-text-Input--disabled": "$color-text--disabled",
    "color-border-Input-error": "$color-border-Input-default--error",
    "color-border-Input-warning": "$color-border-Input-default--warning",
    "color-border-Input-success": "$color-border-Input-default--success",
    "color-placeholder-Input": "$color-text-subtitle",
    "color-adornment-Input": "$color-text-subtitle",

    "outlineColor-Input--focus": "$outlineColor--focus",
    "outlineWidth-Input--focus": "$outlineWidth--focus",
    "outlineStyle-Input--focus": "$outlineStyle--focus",
    "outlineOffset-Input--focus": "$outlineOffset--focus",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

type TextBoxComponentDef = ComponentDef<typeof TextBoxMd>;

function renderTextBox(
  layoutCss: React.CSSProperties,
  state: any,
  updateState: (componentState: any) => void,
  extractValue: ValueExtractor,
  node: TextBoxComponentDef,
  lookupEventHandler: (
    eventName: keyof NonNullable<TextBoxComponentDef["events"]>,
    actionOptions?: LookupActionOptions,
  ) => AsyncFunction | undefined,
  registerComponentApi: RegisterComponentApiFn,
  type: "text" | "password" = "text",
) {
  return (
    <TextBox
      type={type}
      style={layoutCss}
      value={state.value}
      updateState={updateState}
      initialValue={extractValue(node.props.initialValue)}
      maxLength={extractValue(node.props.maxLength)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      placeholder={extractValue.asOptionalString(node.props.placeholder)}
      validationStatus={extractValue(node.props.validationStatus)}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      registerComponentApi={registerComponentApi}
      startText={extractValue.asOptionalString(node.props.startText)}
      startIcon={extractValue.asOptionalString(node.props.startIcon)}
      endText={extractValue.asOptionalString(node.props.endText)}
      endIcon={extractValue.asOptionalString(node.props.endIcon)}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      label={extractValue.asOptionalString(node.props.label)}
      labelPosition={extractValue(node.props.labelPosition)}
      labelWidth={extractValue.asOptionalString(node.props.labelWidth)}
      labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
      required={extractValue.asOptionalBoolean(node.props.required)}
    />
  );
}

export const textBoxComponentRenderer = createComponentRenderer(
  COMP,
  TextBoxMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    layoutCss,
    registerComponentApi,
  }) => {
    return renderTextBox(
      layoutCss,
      state,
      updateState,
      extractValue,
      node as TextBoxComponentDef,
      lookupEventHandler,
      registerComponentApi,
    );
  },
);

export const PasswordMd = createMetadata({
  ...TextBoxMd,
  description:
    "The \`Password\` component is a specialized version of the \`TextBox\` component that " + 
    "allows users to input and edit passwords.",
});

export const passwordInputComponentRenderer = createComponentRenderer(
  "PasswordInput",
  PasswordMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    layoutCss,
    registerComponentApi,
  }) => {
    return renderTextBox(
      layoutCss,
      state,
      updateState,
      extractValue,
      node as TextBoxComponentDef,
      lookupEventHandler,
      registerComponentApi,
      "password",
    );
  },
);
