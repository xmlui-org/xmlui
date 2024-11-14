import type { ValidationStatus } from "@components/abstractions";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import type { CSSProperties } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./TextBox.module.scss";
import { noop } from "@components-core/constants";
import { Adornment } from "@components/Input/InputAdornment";
import { useEvent } from "@components-core/utils/misc";
import { ItemWithLabel } from "@components/FormItem/ItemWithLabel";

type Props = {
  id?: string;
  type?: "text" | "password";
  value?: string;
  updateState?: (newState: any) => void;
  initialValue?: string;
  style?: CSSProperties;
  maxLength?: number;
  enabled?: boolean;
  placeholder?: string;
  validationStatus?: ValidationStatus;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
};

export const TextBox = ({
  id,
  type = "text",
  value = "",
  updateState = noop,
  initialValue = "",
  style,
  maxLength,
  enabled = true,
  placeholder,
  validationStatus = "none",
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  startText,
  startIcon,
  endText,
  endIcon,
  autoFocus,
  readOnly,
  tabIndex,
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  required
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // --- NOTE: This is a workaround for the jumping caret issue.
  // --- Local state can sync up values that can get set asynchronously outside the component.
  const [localValue, setLocalValue] = React.useState(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  // --- End NOTE

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const updateValue = useCallback(
    (value: string) => {
      setLocalValue(value);
      updateState({ value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

  // --- Handle the value change events for this input
  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(event.target.value);
    },
    [updateValue],
  );

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const setValue = useEvent((newValue) => {
    updateValue(newValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  return (
    <ItemWithLabel
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
      <div
        className={classnames(styles.inputRoot, {
          [styles.disabled]: !enabled,
          [styles.readOnly]: readOnly,
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
        })}
        tabIndex={-1}
        onFocus={() => {
          inputRef.current?.focus();
        }}
        style={style}
      >
        <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
        <input
          id={id}
          type={type}
          className={classnames(styles.input, { [styles.readOnly]: readOnly })}
          disabled={!enabled}
          value={localValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          ref={inputRef}
          readOnly={readOnly}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
        />
        <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
      </div>
    </ItemWithLabel>
  );
};
