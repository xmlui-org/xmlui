import type { ValueExtractor } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./TextBox.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import type { LookupActionOptions } from "@abstractions/ActionDefs";
import { ComponentDef, createMetadata, d } from "@abstractions/ComponentDefs";
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
import { TextBox } from "./TextBoxNative";

const COMP = "TextBox";

export const TextBoxMd = createMetadata({
  description: `The \`${COMP}\` is an input component that allows users to input and edit textual data.`,
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
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "radius-Input": "$radius",
    "color-text-Input": "$color-text-primary",
    "color-bg-Input--disabled": "$color-bg--disabled",
    "thickness-border-Input": "1px",
    "min-height-Input": "39px",
    "style-border-Input": "solid",
    "color-border-Input--disabled": "$color-border--disabled",
    "color-text-Input--disabled": "$color-text--disabled",
    "color-border-Input-error": "$color-border-Input-default--error",
    "color-border-Input-warning": "$color-border-Input-default--warning",
    "color-border-Input-success": "$color-border-Input-default--success",
    "color-placeholder-Input": "$color-text-subtitle",
    "color-adornment-Input": "$color-text-subtitle",

    "color-outline-Input--focus": "$color-outline--focus",
    "thickness-outline-Input--focus": "$thickness-outline--focus",
    "style-outline-Input--focus": "$style-outline--focus",
    "offset-outline-Input--focus": "$offset-outline--focus",

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
  registerComponentApi: (apiFn: Record<string, (...args: any[]) => void>) => void,
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

export const passwordInputComponentRenderer = createComponentRenderer(
  "PasswordInput",
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
      "password",
    );
  },
);
