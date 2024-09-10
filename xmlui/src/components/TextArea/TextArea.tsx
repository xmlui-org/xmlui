import React, {
  type ChangeEventHandler,
  type CSSProperties,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./TextArea.module.scss";
import classnames from "@components-core/utils/classnames";
import type { ValidationStatus } from "@components/Input/input-abstractions";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { noop } from "@components-core/constants";
import TextAreaResizable from "./TextAreaResizable";
import TextareaAutosize from "react-textarea-autosize";
import { isNil } from "lodash-es";
import { parseScssVar } from "@components-core/theming/themeVars";
import { useEvent } from "@components-core/utils/misc";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { desc } from "@components-core/descriptorHelper";

// =====================================================================================================================
// Helper types

const ResizeOptionKeys = ["horizontal", "vertical", "both"] as const;
type ResizeOptions = (typeof ResizeOptionKeys)[number];
const isResizeOption = (str: string): str is ResizeOptions => ResizeOptionKeys.indexOf(str as any) !== -1;
const resizeMap = {
  horizontal: styles.resizeHorizontal,
  vertical: styles.resizeVertical,
  both: styles.resizeBoth,
};

// =====================================================================================================================
// React component definition

type Props = {
  id?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  allowCopy?: boolean;
  updateState?: UpdateStateFn;
  validationStatus?: ValidationStatus;
  autoFocus?: boolean;
  initialValue?: string;
  resize?: ResizeOptions;
  enterSubmits?: boolean;
  escResets?: boolean;
  onDidChange?: (e: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  controlled?: boolean;
  style?: CSSProperties;
  registerComponentApi?: RegisterComponentApiFn;
  autoSize?: boolean;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  rows?: number;
  enabled?: boolean;
};

export const TextArea = ({
  id,
  value = "",
  placeholder = "",
  required = false,
  readOnly = false,
  allowCopy = true,
  updateState = noop,
  validationStatus,
  autoFocus = false,
  initialValue = "",
  resize,
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  controlled = true,
  enterSubmits = true,
  escResets,
  style,
  registerComponentApi,
  autoSize,
  maxRows,
  minRows,
  maxLength,
  rows = 2,
  enabled = true,
}: Props) => {
  // --- The component is initially unfocused
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [focused, setFocused] = React.useState(false);

  const updateValue = useCallback(
    (value: string) => {
      updateState({ value: value });
      onDidChange(value);
    },
    [onDidChange, updateState]
  );

  const onInputChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      updateValue(event.target.value);
    },
    [updateValue]
  );

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  // --- Execute this function when the user copies the value
  const handleCopy = (event: React.SyntheticEvent) => {
    if (allowCopy) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  };

  // --- Manage obtaining and losing the focus
  const handleOnFocus = () => {
    setFocused(true);
    onFocus?.();
  };
  const handleOnBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const focus = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const insert = useCallback(
    (text: any) => {
      const input = inputRef?.current;
      if (input && text) {
        const start = input.selectionStart;
        const value = input.value;
        onInputChange({
          // @ts-ignore
          target: {
            value: value.substring(0, start) + text + value.substring(start),
          },
        });
        setCursorPosition(start + text.length);
      }
    },
    [inputRef, onInputChange]
  );

  const setValue = useEvent((val: string) => {
    updateValue(val);
  });

  useEffect(() => {
    if (cursorPosition) {
      const input = inputRef?.current;
      if (input) {
        input.setSelectionRange(cursorPosition, cursorPosition);
        setCursorPosition(null);
      }
    }
  }, [value, cursorPosition, inputRef]);

  useEffect(() => {
    registerComponentApi?.({
      focus,
      insert,
      setValue,
    });
  }, [focus, insert, registerComponentApi, setValue]);

  // --- Handle the Enter key press
  const handleEnter = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (enterSubmits && e.key.toLowerCase() === "enter" && !e.shiftKey) {
        // -- Do not generate a new line
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
      if (escResets && e.key.toLowerCase() === "escape" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.reset();
      }
    },
    [enterSubmits, escResets]
  );

  const textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement> = {
    className: classnames(styles.textarea, resize ? resizeMap[resize] : "", {
      [styles.focused]: focused,
      [styles.disabled]: !enabled,
      [styles.error]: validationStatus === "error",
      [styles.warning]: validationStatus === "warning",
      [styles.valid]: validationStatus === "valid",
    }),
    ref: inputRef,
    style: style as any,
    value: controlled ? value || "" : undefined,
    disabled: !enabled,
    autoFocus,
    id: id,
    name: id,
    placeholder,
    required,
    maxLength,
    "aria-multiline": true,
    "aria-readonly": readOnly,
    readOnly: readOnly,
    onChange: onInputChange,
    onCopy: handleCopy,
    onFocus: handleOnFocus,
    onBlur: handleOnBlur,
    onKeyDown: handleEnter,
    autoComplete: "off",
  };

  if (resize === "both" || resize === "horizontal" || resize === "vertical") {
    return (
      <TextAreaResizable {...textareaProps} style={style as any} maxRows={maxRows} minRows={minRows} rows={rows} />
    );
  }
  if (autoSize || !isNil(maxRows) || !isNil(minRows)) {
    return <TextareaAutosize {...textareaProps} style={style as any} maxRows={maxRows} minRows={minRows} rows={rows} />;
  }

  return <textarea {...textareaProps} rows={rows} />;
};

// =====================================================================================================================
// TextArea definition

/**
 * \`TextArea\` is a component that provides a multiline text input area.
 *
 * The \`TextArea\` is an input control component and is often used in forms.
 * See the [Using Forms](../learning/forms.mdx) guide for details.
 *
 * To add new lines to the input field press \`Shift\` + \`Enter\`.
 */
export interface TextAreaComponentDef extends ComponentDef<"TextArea"> {
  props: {
    /** @descriptionRef */
    resize?: ResizeOptions;
    enterSubmits?: boolean;
    /**
     * This boolean property indicates whether the TextArea contents should be reset when pressing the ESC key.
     * The default is \`true\`.
     */
    escResets?: boolean;
    /** @descriptionRef */
    maxRows?: number;
    /** @descriptionRef */
    minRows?: number;
    /** @descriptionRef */
    rows?: number;
    /** 
     * If set to \`true\`, this boolean property enables the \`TextArea\`
     * to resize automatically based on the number of lines inside it.
     * @descriptionRef
     */
    autoSize?: boolean;
    /** 
     * A placeholder text that is visible in the input field when its empty.
     * @descriptionRef
     */
    placeholder?: string;
    /** @descriptionRef */
    initialValue?: string | string[];
    /**
     * You can specify the identifier of a component acting as its label. When you click the label,
     * the component behaves as you clicked it.
     * @descriptionRef
     */
    labelId?: string;
    /**
     * This property sets the maximum number of characters you can type into the component's text.
     * @descriptionRef
     */
    maxLength?: number;
    /** 
     * If this boolean prop is set to \`true\`, the \`TextArea\` input will be focused when appearing on the UI.
     * @descriptionRef
     */
    autoFocus?: boolean;
    /**
     * Set this property to \`true\` to indicate it must have a value before submitting the containing form.
     * @descriptionRef
     */
    required?: boolean;
    /** 
     * This boolean determines whether the input field can be written.
     * @descriptionRef
     */
    readOnly?: boolean;
    /**
     * This boolean property indicates if the component's contents can be copied to the clipboard.
     * Default: \`true\`.
     */
    allowCopy?: boolean;
    /** 
     * This property indicates whether the input can be written into (\`true\`) or not (\`false\`).
     * The default value is \`true\`.
     * @descriptionRef
     */
    enabled?: string | boolean;
    /**
     * With this property, you can set the checkbox's validation status to "none", "error", "warning", or "valid".
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
  };
  events: {
    /** 
     * This event is triggered after the user has changed the field value.
     * @descriptionRef
     */
    didChange?: string;
    /** 
     * This event is triggered when the `TextArea` receives focus.
     * @descriptionRef
     */
    gotFocus?: string;
    /** 
     * This event is triggered when the `TextArea` loses focus.
     * 
     * See the example in the [gotFocus event section](#gotfocus).
     */
    lostFocus?: string;
  };
  api: {
    /**
     * This API command triggers a focus event on the input field.
     */
    focus: () => void;
    /**
     * By setting an ID for the component, you can refer to the value of the field if set.
     * If no value is set, the value will be undefined.
     * @descriptionRef
     */
    value: string;
    /**
     * This API method programmatically sets the value of the field.
     * The same rules apply as for the [\`initialValue\`](#initialvalue) property.
     * @descriptionRef
     */
    setValue: (value: string) => void;
  };
}

/**
 * This object defines the hints for TextArea
 */
export const TextAreaMd: ComponentDescriptor<TextAreaComponentDef> = {
  displayName: "TextArea",
  description: "Provide a multiple-line text editing area for plain text content",
  themeVars: parseScssVar(styles.themeVars),
  props: {
    enterSubmits: desc("If set to `true`, pressing the Enter key submits the form."),
    escResets: desc("If set to `true`, pressing the ESC key resets the form."),
    maxRows: desc("The maximum number of rows the TextArea can have."),
    minRows: desc("The minimum number of rows the TextArea can have."),
    rows: desc("The number of rows the TextArea should have."),
    autoSize: desc("If set to `true`, the TextArea automatically resizes based on the number of lines inside it."),
    placeholder: desc("The placeholder text that appears in the input field when it is empty."),
    initialValue: desc("The initial value of the TextArea."),
    labelId: desc("The ID of the label component."),
    maxLength: desc("The maximum number of characters that can be entered into the TextArea."),
    autoFocus: desc("If set to `true`, the TextArea is focused when it appears on the UI."),
    required: desc("If set to `true`, the TextArea must have a value before submitting the containing form."),
    readOnly: desc("If set to `true`, the TextArea is read-only."),
    allowCopy: desc("If set to `true`, the TextArea contents can be copied to the clipboard."),
    enabled: desc("If set to `true`, the TextArea can be written into."),
    validationStatus: desc("The validation status of the TextArea."),
    resize: {
      isValid: (p) =>
        isResizeOption(p)
          ? null
          : `Resize option must be one of these values: ${[...ResizeOptionKeys].join(", ")}. Current value: '${p}'`,
    },
  },
};

/**
 * This function defines the renderer for the TextArea component.
 */
export const textAreaComponentRenderer = createComponentRenderer<TextAreaComponentDef>(
  "TextArea",
  ({ node, extractValue, state, updateState, layoutCss, registerComponentApi, lookupEventHandler }) => {
    const initialValue = extractValue(node.props.initialValue);
    return (
      <TextArea
        key={`${node.uid}-${initialValue}`}
        value={state?.value}
        initialValue={initialValue}
        updateState={updateState}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        placeholder={extractValue(node.props.placeholder)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        resize={node.props.resize}
        enterSubmits={extractValue.asOptionalBoolean(node.props.enterSubmits)}
        escResets={extractValue.asOptionalBoolean(node.props.escResets)}
        style={layoutCss}
        registerComponentApi={registerComponentApi}
        maxRows={extractValue.asOptionalNumber(node.props.maxRows)}
        minRows={extractValue.asOptionalNumber(node.props.minRows)}
        maxLength={extractValue.asOptionalNumber(node.props.maxLength)}
        rows={extractValue.asOptionalNumber(node.props.rows)}
        autoSize={extractValue.asOptionalBoolean(node.props.autoSize)}
        validationStatus={extractValue(node.props.validationStatus)}
      />
    );
  },
  TextAreaMd
);
