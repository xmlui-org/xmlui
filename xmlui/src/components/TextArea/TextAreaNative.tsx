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
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import TextAreaResizable from "./TextAreaResizable";

export const resizeOptionKeys = ["horizontal", "vertical", "both"] as const;
export type ResizeOptions = (typeof resizeOptionKeys)[number];

const resizeMap = {
  horizontal: styles.resizeHorizontal,
  vertical: styles.resizeVertical,
  both: styles.resizeBoth,
};

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
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
};

export const TextArea = forwardRef(function TextArea(
  {
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
    label,
    labelPosition,
    labelWidth,
    labelBreak,
  }: Props,
  forwardedRef: ForwardedRef<HTMLTextAreaElement>,
) {
  // --- The component is initially unfocused
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [focused, setFocused] = React.useState(false);

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

  const textareaProps: TextareaHTMLAttributes<HTMLTextAreaElement> &
    React.RefAttributes<HTMLTextAreaElement> = {
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
      <ItemWithLabel
        ref={forwardedRef as any}
        labelPosition={labelPosition as any}
        label={label}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
      >
        <TextAreaResizable
          {...textareaProps}
          style={style as any}
          maxRows={maxRows}
          minRows={minRows}
          rows={rows}
        />
      </ItemWithLabel>
    );
  }
  if (autoSize || !isNil(maxRows) || !isNil(minRows)) {
    return (
      <ItemWithLabel
        ref={forwardedRef as any}
        labelPosition={labelPosition as any}
        label={label}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
      >
        <TextareaAutosize
          {...textareaProps}
          style={style as any}
          maxRows={maxRows}
          minRows={minRows}
          rows={rows}
        />
      </ItemWithLabel>
    );
  }

  return (
    <ItemWithLabel
      ref={forwardedRef as any}
      labelPosition={labelPosition as any}
      label={label}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
    >
      <textarea {...textareaProps} rows={rows} />
    </ItemWithLabel>
  );
});
