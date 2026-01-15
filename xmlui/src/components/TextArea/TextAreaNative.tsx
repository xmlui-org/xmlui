import React, {
  type ChangeEventHandler,
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { isNil } from "lodash-es";

import styles from "./TextArea.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import TextAreaResizable from "./TextAreaResizable";
import { PART_INPUT } from "../../components-core/parts";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";
import { Part } from "../Part/Part";
import { useFormContextPart } from "../Form/FormContext";

const PART_VERBOSE_VALIDATION_FEEDBACK = "verboseValidationFeedback";

export const resizeOptionKeys = ["horizontal", "vertical", "both"] as const;
export type ResizeOptions = (typeof resizeOptionKeys)[number];

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
  className?: string;
  registerComponentApi?: RegisterComponentApiFn;
  autoSize?: boolean;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  rows?: number;
  enabled?: boolean;
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessages?: string[];
};

export const defaultProps = {
  value: "",
  placeholder: "",
  required: false,
  readOnly: false,
  allowCopy: true,
  updateState: noop,
  autoFocus: false,
  initialValue: "",
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
  controlled: true,
  enterSubmits: true,
  rows: 2,
  enabled: true,
};

export const TextArea = forwardRef(function TextArea(
  {
    id,
    value = defaultProps.value,
    placeholder = defaultProps.placeholder,
    required = defaultProps.required,
    readOnly = defaultProps.readOnly,
    allowCopy = defaultProps.allowCopy,
    updateState = defaultProps.updateState,
    validationStatus,
    autoFocus = defaultProps.autoFocus,
    initialValue = defaultProps.initialValue,
    resize,
    onDidChange = defaultProps.onDidChange,
    onFocus = defaultProps.onFocus,
    onBlur = defaultProps.onBlur,
    controlled = defaultProps.controlled,
    enterSubmits = defaultProps.enterSubmits,
    escResets,
    style,
    className,
    registerComponentApi,
    autoSize,
    maxRows,
    minRows,
    maxLength,
    rows = defaultProps.rows,
    enabled = defaultProps.enabled,
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
    invalidMessages,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLTextAreaElement>,
) {
  // --- The component is initially unfocused
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const ref = forwardRef ? composeRefs(forwardedRef, inputRef) : inputRef;
  const [cursorPosition, setCursorPosition] = useState(null);
  const [focused, setFocused] = React.useState(false);

  const contextVerboseValidationFeedback = useFormContextPart((ctx) => ctx?.verboseValidationFeedback);
  const contextValidationIconSuccess = useFormContextPart((ctx) => ctx?.validationIconSuccess);
  const contextValidationIconError = useFormContextPart((ctx) => ctx?.validationIconError);

  const finalVerboseValidationFeedback = verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true;
  const finalValidationIconSuccess = validationIconSuccess ?? contextValidationIconSuccess ?? "check";
  const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "close";

  let validationIcon = null;
  if (!finalVerboseValidationFeedback) {
    if (validationStatus === "valid") {
      validationIcon = finalValidationIconSuccess;
    } else if (validationStatus === "error") {
      validationIcon = finalValidationIconError;
    }
  }

  const updateValue = useCallback(
    (value: string) => {
      updateState({ value: value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

  const onInputChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      updateValue(event.target.value);
    },
    [updateValue],
  );

  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

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
    [inputRef, onInputChange],
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
      if (e.currentTarget.form && enterSubmits && e.key.toLowerCase() === "enter" && !e.shiftKey) {
        // -- Do not generate a new line
        e.preventDefault();
        e.currentTarget.form?.requestSubmit();
      }
      if (e.currentTarget.form && escResets && e.key.toLowerCase() === "escape" && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.form?.reset();
      }
    },
    [enterSubmits, escResets],
  );

  let classes = classnames(className, styles.textarea, {
    [styles.resizeHorizontal]: resize === "horizontal",
    [styles.resizeVertical]: resize === "vertical",
    [styles.resizeBoth]: resize === "both",
    [styles.focused]: focused,
    [styles.disabled]: !enabled,
    [styles.error]: validationStatus === "error",
    [styles.warning]: validationStatus === "warning",
    [styles.valid]: validationStatus === "valid",
  });
  const textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> &
    React.RefAttributes<HTMLTextAreaElement> = {
    ...rest,
    id,
    className: classes,
    ref,
    style: style as any,
    value: controlled ? value || "" : undefined,
    disabled: !enabled,
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

  const renderConciseFeedback = () => (
    !finalVerboseValidationFeedback && (
      <Part partId={PART_VERBOSE_VALIDATION_FEEDBACK}>
        <div className={styles.floatingFeedback}>
          <ConciseValidationFeedback
            validationStatus={validationStatus}
            invalidMessages={invalidMessages}
            successIcon={finalValidationIconSuccess}
            errorIcon={finalValidationIconError}
          />
        </div>
      </Part>
    )
  );

  if (resize === "both" || resize === "horizontal" || resize === "vertical") {
    return (
      <div className={styles.container}>
        <Part partId={PART_INPUT}>
          <TextAreaResizable
            {...textareaProps}
            style={style as any}
            className={classnames(classes)}
            maxRows={maxRows}
            minRows={minRows}
            rows={rows}
          />
        </Part>
        {renderConciseFeedback()}
      </div>
    );
  }
  if (autoSize || !isNil(maxRows) || !isNil(minRows)) {
    return (
      <div className={styles.container}>
        <Part partId={PART_INPUT}>
          <TextareaAutosize
            {...textareaProps}
            style={style as any}
            className={classnames(classes)}
            maxRows={maxRows}
            minRows={minRows}
            rows={rows}
          />
        </Part>
        {renderConciseFeedback()}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Part partId={PART_INPUT}>
        <textarea {...textareaProps} rows={rows} className={classnames(classes)} />
      </Part>
      {renderConciseFeedback()}
    </div>
  );
});
