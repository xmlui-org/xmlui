import styles from "./TextArea.module.scss";

import { type PropertyValueDescription } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  d,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dSetValueApi,
  dValidationStatus,
} from "../metadata-helpers";
import { type ResizeOptions, TextArea, defaultProps } from "./TextAreaNative";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";

const COMP = "TextArea";

export const resizeOptionsMd: PropertyValueDescription[] = [
  { value: "(undefined)", description: "No resizing" },
  { value: "horizontal", description: "Can only resize horizontally" },
  { value: "vertical", description: "Can only resize vertically" },
  { value: "both", description: "Can resize in both dimensions" },
];

export const TextAreaMd = createMetadata({
  status: "stable",
  description: "`TextArea` provides a multiline text input area.",
  parts: {
    label: {
      description: "The label displayed for the text area.",
    },
    startAdornment: {
      description: "The adornment displayed at the start of the text area.",
    },
    endAdornment: {
      description: "The adornment displayed at the end of the text area.",
    },
    input: {
      description: "The text area input.",
    },
  },
  props: {
    enterSubmits: {
      description:
        "This optional boolean property indicates whether pressing the \`Enter\` key on the " +
        "keyboard prompts the parent \`Form\` component to submit.",
      valueType: "boolean",
      defaultValue: defaultProps.enterSubmits,
    },
    escResets: {
      description:
        `This boolean property indicates whether the ${COMP} contents should be reset when pressing ` +
        `the ESC key.`,
      valueType: "boolean",
      defaultValue: false,
    },
    maxRows: d(
      `This optional property sets the maximum number of text rows the \`${COMP}\` ` +
        "can grow. If not set, the number of rows is unlimited.",
    ),
    minRows: d(
      `This optional property sets the minimum number of text rows the \`${COMP}\` can shrink. ` +
        `If not set, the minimum number of rows is 1.`,
    ),
    rows: {
      description: `Specifies the number of rows the component initially has.`,
      valueType: "number",
      defaultValue: defaultProps.rows,
    },
    autoSize: {
      description:
        `If set to \`true\`, this boolean property enables the \`${COMP}\` to resize ` +
        `automatically based on the number of lines inside it.`,
      valueType: "boolean",
      defaultValue: false,
    },
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    resize: {
      description:
        `This optional property specifies in which dimensions can the \`TextArea\` ` +
        `be resized by the user.`,
      availableValues: resizeOptionsMd,
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      type: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      type: "string",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      type: "string",
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This method sets the focus on the \`${COMP}\` component.`,
      signature: "focus(): void",
    },
    value: {
      description: `You can query the component's value. If no value is set, it will retrieve \`undefined\`.`,
      signature: "get value(): string | undefined",
    },
    setValue: dSetValueApi(),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
  },
});

type ThemedTextAreaProps = React.ComponentPropsWithoutRef<typeof TextArea>;

export const ThemedTextArea = React.forwardRef<React.ElementRef<typeof TextArea>, ThemedTextAreaProps>(
  function ThemedTextArea({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(TextAreaMd);
    return (
      <TextArea
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const textAreaComponentRenderer = createComponentRenderer(
  COMP,
  TextAreaMd,
  ({
    node,
    extractValue,
    state,
    updateState,
    className,
    registerComponentApi,
    lookupEventHandler,
  }) => {
    return (
      <TextArea
        value={state?.value}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue(node.props.placeholder)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        resize={node.props.resize as ResizeOptions}
        enterSubmits={extractValue.asOptionalBoolean(node.props.enterSubmits)}
        escResets={extractValue.asOptionalBoolean(node.props.escResets)}
        className={className}
        registerComponentApi={registerComponentApi}
        maxRows={extractValue.asOptionalNumber(node.props.maxRows)}
        minRows={extractValue.asOptionalNumber(node.props.minRows)}
        maxLength={extractValue.asOptionalNumber(node.props.maxLength)}
        rows={extractValue.asOptionalNumber(node.props.rows)}
        autoSize={extractValue.asOptionalBoolean(node.props.autoSize)}
        validationStatus={extractValue(node.props.validationStatus)}
        required={extractValue.asOptionalBoolean(node.props.required)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(node.props.verboseValidationFeedback)}
        validationIconSuccess={extractValue.asOptionalString(node.props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(node.props.validationIconError)}
      />
    );
  },
);
