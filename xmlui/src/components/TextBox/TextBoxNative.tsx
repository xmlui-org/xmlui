import { type CSSProperties, type ForwardedRef, forwardRef, useId, useState } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import classnames from "classnames";

import styles from "./TextBox.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import { Adornment } from "../Input/InputAdornment";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import type { ValidationStatus } from "../abstractions";

/**
 * TextBox component that supports text input with various configurations.
 * Features:
 * - Standard text, password, and search input types
 * - Input validation states
 * - Start/end adornments (icons and text)
 * - Password visibility toggle option
 */

type Props = {
  id?: string;
  type?: "text" | "password" | "search";
  value?: string;
  updateState?: UpdateStateFn;
  initialValue?: string;
  style?: CSSProperties;
  maxLength?: number;
  enabled?: boolean;
  placeholder?: string;
  validationStatus?: ValidationStatus;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  registerComponentApi?: RegisterComponentApiFn;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  gap?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  /**
   * When true and type is "password", displays a toggle icon to show/hide password text
   * Default: false
   */
  showPasswordToggle?: boolean;
  /**
   * The icon to show when the password is visible
   * Default: "eye"
   */
  passwordVisibleIcon?: string;
  /**
   * The icon to show when the password is hidden
   * Default: "eye-off"
   */
  passwordHiddenIcon?: string;
};

export const defaultProps: Pick<
  Props,
  | "type"
  | "value"
  | "initialValue"
  | "enabled"
  | "validationStatus"
  | "onDidChange"
  | "onFocus"
  | "onBlur"
  | "onKeyDown"
  | "updateState"
  | "passwordVisibleIcon"
  | "passwordHiddenIcon"
> = {
  type: "text",
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none",
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
  onKeyDown: noop,
  updateState: noop,
  passwordVisibleIcon: "eye",
  passwordHiddenIcon: "eye-off",
};

export const TextBox = forwardRef(function TextBox(
  {
    id,
    type = defaultProps.type,
    value = defaultProps.value,
    updateState = defaultProps.updateState,
    initialValue = defaultProps.initialValue,
    style,
    maxLength,
    enabled = defaultProps.enabled,
    placeholder,
    validationStatus = defaultProps.validationStatus,
    onDidChange = defaultProps.onDidChange,
    onFocus = defaultProps.onFocus,
    onBlur = defaultProps.onBlur,
    onKeyDown = defaultProps.onKeyDown,
    registerComponentApi,
    startText,
    startIcon,
    endText,
    endIcon,
    gap,
    autoFocus,
    readOnly,
    tabIndex,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required,
    showPasswordToggle,
    passwordVisibleIcon = defaultProps.passwordVisibleIcon,
    passwordHiddenIcon = defaultProps.passwordHiddenIcon,
  }: Props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const _id = useId();
  id = id || _id;
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State to control password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine the actual input type based on the password visibility toggle
  const actualType = (type === "password" && showPassword) ? "text" : type;
  
  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
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
    updateState({ value: initialValue }, { initial: true });
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
      id={id}
      labelPosition={labelPosition as any}
      label={label}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      style={style}
      ref={ref}
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
        onFocus={focus}
        style={{ gap }}
      >
        <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
        <input
          id={id}
          type={actualType}
          className={classnames(styles.input, { [styles.readOnly]: readOnly })}
          disabled={!enabled}
          value={localValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          onKeyDown={onKeyDown}
          ref={inputRef}
          readOnly={readOnly}
          autoFocus={autoFocus}
          tabIndex={enabled ? tabIndex : -1}
          required={required}
        />
        {type === "password" && showPasswordToggle ? (
          <Adornment
            iconName={showPassword ? passwordVisibleIcon : passwordHiddenIcon} 
            className={classnames(styles.adornment, styles.passwordToggle)}
            onClick={togglePasswordVisibility}
          />
        ) : (
          <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
        )}
      </div>
    </ItemWithLabel>
  );
});
