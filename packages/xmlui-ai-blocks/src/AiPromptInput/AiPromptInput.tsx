import React from "react";
import { createMetadata, parseScssVar, useComponentThemeClass, wrapComponent } from "xmlui";

import styles from "./AiPromptInput.module.scss";
import { AiPromptInputNative, defaultProps } from "./AiPromptInputNative";

const COMP = "AiPromptInput";

export const AiPromptInputMd = createMetadata({
  status: "experimental",
  description:
    "`AiPromptInput` renders a modern AI chat composer with a multiline prompt, model selector, and send/stop actions.",
  props: {
    initialValue: {
      description: "Initial prompt text.",
      valueType: "string",
    },
    initialModel: {
      description: "Initial selected model value. Defaults to the first model when omitted.",
      valueType: "string",
    },
    models: {
      description: "Model options. Items may be strings or objects with `value` and optional `label`.",
      valueType: "any",
    },
    placeholder: {
      description: "Placeholder text shown when the prompt is empty.",
      valueType: "string",
      defaultValue: defaultProps.placeholder,
    },
    rows: {
      description: "Initial visible row count for the prompt textarea.",
      valueType: "number",
      defaultValue: defaultProps.rows,
    },
    minRows: {
      description: "Minimum visual height expressed in text rows.",
      valueType: "number",
    },
    maxRows: {
      description: "Maximum visual height expressed in text rows.",
      valueType: "number",
    },
    maxLength: {
      description: "Maximum number of characters allowed in the prompt.",
      valueType: "number",
    },
    running: {
      description: "Shows the stop action and disables submission while the backing request is running.",
      valueType: "boolean",
      defaultValue: defaultProps.running,
    },
    enabled: {
      description: "Whether the composer accepts input.",
      valueType: "boolean",
      defaultValue: defaultProps.enabled,
    },
    readOnly: {
      description: "Whether the composer is read-only.",
      valueType: "boolean",
      defaultValue: defaultProps.readOnly,
    },
    autoFocus: {
      description: "Whether the prompt textarea receives focus after mount.",
      valueType: "boolean",
    },
    clearOnSubmit: {
      description: "Clears the prompt after a successful submit event.",
      valueType: "boolean",
      defaultValue: defaultProps.clearOnSubmit,
    },
    enterSubmits: {
      description: "Submits on Enter. Shift+Enter still inserts a newline.",
      valueType: "boolean",
      defaultValue: defaultProps.enterSubmits,
    },
    sendLabel: {
      description: "Accessible and visible label for the send action.",
      valueType: "string",
      defaultValue: defaultProps.sendLabel,
    },
    stopLabel: {
      description: "Accessible and visible label for the stop action.",
      valueType: "string",
      defaultValue: defaultProps.stopLabel,
    },
    modelLabel: {
      description: "Accessible label for the model selector.",
      valueType: "string",
      defaultValue: defaultProps.modelLabel,
    },
  },
  events: {
    submit: {
      description: "Fires when the prompt is submitted.",
      signature: "submit(value: { value: string; model?: string }): void",
      parameters: {
        value: "The submitted prompt and selected model.",
      },
    },
    stop: {
      description: "Fires when the stop action is pressed.",
      signature: "stop(): void",
    },
    didChange: {
      description: "Fires when the prompt text changes.",
      signature: "didChange(value: string): void",
      parameters: {
        value: "The new prompt text.",
      },
    },
    modelChange: {
      description: "Fires when the selected model changes.",
      signature: "modelChange(value: { model?: string }): void",
      parameters: {
        value: "The selected model value.",
      },
    },
  },
  apis: {
    focus: {
      description: "Focuses the prompt textarea.",
      signature: "focus(): void",
    },
    value: {
      description: "The current prompt text.",
      signature: "get value(): string",
    },
    model: {
      description: "The current selected model.",
      signature: "get model(): string | undefined",
    },
    setValue: {
      description: "Sets the prompt text.",
      signature: "setValue(value: string): void",
      parameters: {
        value: "The new prompt text.",
      },
    },
    clear: {
      description: "Clears the prompt text.",
      signature: "clear(): void",
    },
    submit: {
      description: "Submits the current prompt.",
      signature: "submit(): void",
    },
    stop: {
      description: "Triggers the stop action.",
      signature: "stop(): void",
    },
    setModel: {
      description: "Sets the selected model.",
      signature: "setModel(model: string): void",
      parameters: {
        model: "The model value to select.",
      },
    },
  },
  parts: {
    input: { description: "The prompt textarea." },
    footer: { description: "The bottom tool row." },
    tools: { description: "The left-side tool area." },
    actions: { description: "The right-side action area." },
    modelSelect: { description: "The model selector." },
    sendButton: { description: "The send button." },
    stopButton: { description: "The stop button." },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor-Input",
    [`backgroundColor-${COMP}--hover`]: "$backgroundColor-Input",
    [`backgroundColor-${COMP}--focus`]: "$backgroundColor-Input",
    [`backgroundColor-${COMP}--disabled`]: "$backgroundColor-Input--disabled",
    [`borderColor-${COMP}`]: "$borderColor-Input",
    [`borderColor-${COMP}--hover`]: "$borderColor-Input--hover",
    [`borderColor-${COMP}--focus`]: "$borderColor-Input-default--focus",
    [`borderColor-${COMP}--disabled`]: "$borderColor-Input--disabled",
    [`borderRadius-${COMP}`]: "$borderRadius-Input",
    [`borderWidth-${COMP}`]: "$borderWidth-Input",
    [`borderStyle-${COMP}`]: "$borderStyle-Input",
    [`boxShadow-${COMP}`]: "$boxShadow-Input",
    [`boxShadow-${COMP}--hover`]: "$boxShadow-Input",
    [`boxShadow-${COMP}--focus`]: "$boxShadow-Input",
    [`textColor-${COMP}`]: "$textColor-Input",
    [`textColor-${COMP}--hover`]: "$textColor-Input",
    [`textColor-${COMP}--focus`]: "$textColor-Input",
    [`textColor-${COMP}--disabled`]: "$textColor-Input--disabled",
    [`textColor-placeholder-${COMP}`]: "$textColor-placeholder-Input",
    [`outlineColor-${COMP}--focus`]: "$outlineColor-Input--focus",
    [`outlineWidth-${COMP}--focus`]: "$outlineWidth-Input--focus",
    [`outlineStyle-${COMP}--focus`]: "$outlineStyle-Input--focus",
    [`outlineOffset-${COMP}--focus`]: "$outlineOffset-Input--focus",
    [`backgroundColor-control-${COMP}`]: "$backgroundColor-Input",
    [`backgroundColor-control-${COMP}--hover`]: "$backgroundColor-Input",
    [`backgroundColor-control-${COMP}--focus`]: "$backgroundColor-Input",
    [`backgroundColor-control-${COMP}--disabled`]: "$backgroundColor-Input--disabled",
    [`borderColor-control-${COMP}`]: "$borderColor-Input",
    [`borderColor-control-${COMP}--hover`]: "$borderColor-Input--hover",
    [`borderColor-control-${COMP}--focus`]: "$borderColor-Input-default--focus",
    [`borderColor-control-${COMP}--disabled`]: "$borderColor-Input--disabled",
    [`borderRadius-control-${COMP}`]: "$borderRadius-Input",
    [`borderWidth-control-${COMP}`]: "$borderWidth-Input",
    [`borderStyle-control-${COMP}`]: "$borderStyle-Input",
    [`textColor-control-${COMP}`]: "$textColor-Input",
    [`textColor-control-${COMP}--hover`]: "$textColor-Input",
    [`textColor-control-${COMP}--focus`]: "$textColor-Input",
    [`textColor-control-${COMP}--disabled`]: "$textColor-Input--disabled",
    [`minHeight-control-${COMP}`]: "2.5rem",
    [`minWidth-control-${COMP}`]: "$space-16",
    [`boxShadow-control-${COMP}`]: "$boxShadow-Input",
    [`boxShadow-control-${COMP}--hover`]: "$boxShadow-Input",
    [`boxShadow-control-${COMP}--focus`]: "$boxShadow-Input",
    [`outlineColor-control-${COMP}--focus`]: "$outlineColor-Input--focus",
    [`outlineWidth-control-${COMP}--focus`]: "$outlineWidth-Input--focus",
    [`outlineStyle-control-${COMP}--focus`]: "$outlineStyle-Input--focus",
    [`outlineOffset-control-${COMP}--focus`]: "$outlineOffset-Input--focus",
    [`backgroundColor-send-${COMP}`]: "$color-primary-600",
    [`backgroundColor-send-${COMP}--hover`]: "$color-primary-500",
    [`textColor-send-${COMP}`]: "$color-surface-0",
    [`backgroundColor-stop-${COMP}`]: "$color-surface-0",
    [`backgroundColor-stop-${COMP}--hover`]: "$color-surface-100",
    [`textColor-stop-${COMP}`]: "$textColor-primary",
    [`padding-${COMP}`]: "$space-3",
    [`gap-${COMP}`]: "$space-3",
    [`minHeight-input-${COMP}`]: "4.75rem",
    dark: {
      [`backgroundColor-${COMP}`]: "$color-surface-100",
      [`backgroundColor-stop-${COMP}`]: "$color-surface-200",
      [`backgroundColor-stop-${COMP}--hover`]: "$color-surface-300",
    },
  },
});

type ThemedAiPromptInputProps = React.ComponentProps<typeof AiPromptInputNative>;

const ThemedAiPromptInput = React.forwardRef<HTMLDivElement, ThemedAiPromptInputProps>(
  function ThemedAiPromptInput({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(AiPromptInputMd);
    return (
      <AiPromptInputNative
        {...props}
        ref={ref}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
      />
    );
  },
);

export const aiPromptInputComponentRenderer = wrapComponent(COMP, ThemedAiPromptInput, AiPromptInputMd, {
  stateful: true,
  exposeRegisterApi: true,
  customRender: (
    _props,
    { node, extractValue, state, updateState, classes, registerComponentApi, lookupEventHandler },
  ) => (
    <ThemedAiPromptInput
      value={state?.value}
      model={state?.model}
      initialValue={extractValue.asOptionalString(node.props.initialValue)}
      initialModel={extractValue.asOptionalString(node.props.initialModel)}
      models={extractValue(node.props.models)}
      placeholder={extractValue.asOptionalString(node.props.placeholder) ?? defaultProps.placeholder}
      rows={extractValue.asOptionalNumber(node.props.rows) ?? defaultProps.rows}
      minRows={extractValue.asOptionalNumber(node.props.minRows)}
      maxRows={extractValue.asOptionalNumber(node.props.maxRows)}
      maxLength={extractValue.asOptionalNumber(node.props.maxLength)}
      running={extractValue.asOptionalBoolean(node.props.running) ?? defaultProps.running}
      enabled={extractValue.asOptionalBoolean(node.props.enabled) ?? defaultProps.enabled}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly) ?? defaultProps.readOnly}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      clearOnSubmit={
        extractValue.asOptionalBoolean(node.props.clearOnSubmit) ?? defaultProps.clearOnSubmit
      }
      enterSubmits={extractValue.asOptionalBoolean(node.props.enterSubmits) ?? defaultProps.enterSubmits}
      sendLabel={extractValue.asOptionalString(node.props.sendLabel) ?? defaultProps.sendLabel}
      stopLabel={extractValue.asOptionalString(node.props.stopLabel) ?? defaultProps.stopLabel}
      modelLabel={extractValue.asOptionalString(node.props.modelLabel) ?? defaultProps.modelLabel}
      updateState={updateState}
      registerComponentApi={registerComponentApi}
      onSubmit={lookupEventHandler("submit")}
      onStop={lookupEventHandler("stop")}
      onDidChange={lookupEventHandler("didChange")}
      onModelChange={lookupEventHandler("modelChange")}
      classes={classes}
    />
  ),
});

export type {
  AiPromptInputModel,
  AiPromptInputModelChangePayload,
  AiPromptInputSubmitPayload,
} from "./AiPromptInputNative";
