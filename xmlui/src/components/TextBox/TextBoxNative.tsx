import { type CSSProperties, type ForwardedRef, forwardRef, useId, useState } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import classnames from "classnames";

import styles from "./TextBox.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import { Adornment } from "../Input/InputAdornment";
import type { ValidationStatus } from "../abstractions";
import { PART_START_ADORNMENT, PART_INPUT, PART_END_ADORNMENT, PART_VERBOSE_VALIDATION_FEEDBACK } from "../../components-core/parts";
import { Part } from "../Part/Part";
import { useFormContextPart } from "../Form/FormContext";
import { VerboseValidationFeedback } from "../VerboseValidationFeedback/VerboseValidationFeedback";

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
  className?: string;
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
  verboseValidationFeedback?: boolean;
  validationIconSuccess?: string;
  validationIconError?: string;
  invalidMessage?: string;
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
    className,
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
    required,
    showPasswordToggle,
    passwordVisibleIcon = defaultProps.passwordVisibleIcon,
    passwordHiddenIcon = defaultProps.passwordHiddenIcon,
    verboseValidationFeedback,
    validationIconSuccess,
    validationIconError,
    invalidMessage,
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const inputRef = useRef<HTMLInputElement>(null);

  // State to control password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Determine the actual input type based on the password visibility toggle
  const actualType = type === "password" && showPassword ? "text" : type;

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const contextVerboseValidationFeedback = useFormContextPart((ctx) => ctx?.verboseValidationFeedback);
  const contextValidationIconSuccess = useFormContextPart((ctx) => ctx?.validationIconSuccess);
  const contextValidationIconError = useFormContextPart((ctx) => ctx?.validationIconError);

  const finalVerboseValidationFeedback = verboseValidationFeedback ?? contextVerboseValidationFeedback;
  const finalValidationIconSuccess = validationIconSuccess ?? contextValidationIconSuccess ?? "check";
  const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "error";

  // Track if the field was ever invalid during this editing session
  const [wasEverInvalid, setWasEverInvalid] = useState(false);

  // Update wasEverInvalid when validationStatus changes to error
  useEffect(() => {
    if (validationStatus === "error") {
      setWasEverInvalid(true);
    }
  }, [validationStatus]);

  // Determine which validation icon to show and its status for styling
  let validationIcon = null;
  let feedbackStatus = validationStatus;
  if (finalVerboseValidationFeedback) {
    if (validationStatus === "error") {
      // Always show error icon when there's an error
      validationIcon = finalValidationIconError;
    } else if (wasEverInvalid && validationStatus !== "warning") {
      // Show success icon if the field was previously invalid and now it's valid or none
      // (validationStatus can be "valid" or "none" when the error is cleared)
      validationIcon = finalValidationIconSuccess;
      // Force "valid" status for styling when showing success icon
      feedbackStatus = "valid";
    }
  }

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus, inputRef]);

  // --- NOTE: This is a workaround for the jumping caret issue.
  // --- Local state can sync up values that can get set asynchronously outside the component.
  const [localValue, setLocalValue] = React.useState(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  // --- End NOTE

  // --- Initialize the related field with the input's initial value
  // Normalize null/undefined to empty string
  const normalizedInitialValue = initialValue ?? "";
  useEffect(() => {
    updateState({ value: normalizedInitialValue }, { initial: true });
  }, [normalizedInitialValue, updateState]);

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
    <div
      {...rest}
      ref={ref}
      className={classnames(className, styles.inputRoot, {
        [styles.disabled]: !enabled,
        [styles.readOnly]: readOnly,
        [styles.error]: validationStatus === "error",
        [styles.warning]: validationStatus === "warning",
        [styles.valid]: validationStatus === "valid",
      })}
      tabIndex={-1}
      onFocus={focus}
      style={{ ...style, gap }}
    >
      <Part partId={PART_START_ADORNMENT}>
        <Adornment text={startText} iconName={startIcon} className={classnames(styles.adornment)} />
      </Part>
      <Part partId={PART_INPUT}>
        <input
          id={id}
          ref={inputRef}
          type={actualType}
          className={classnames(styles.input, {
            [styles.readOnly]: readOnly,
          })}
          disabled={!enabled}
          value={localValue}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          onKeyDown={onKeyDown}
          readOnly={readOnly}
          autoFocus={autoFocus}
          tabIndex={enabled ? tabIndex : -1}
          required={required}
        />
      </Part>
      {!readOnly && enabled && type == "search" && localValue?.length > 0 && (
        <Part partId={PART_END_ADORNMENT}>
          <Adornment
            iconName="close"
            className={styles.adornment}
            onClick={() => updateValue("")}
          />
        </Part>
      )}
      {finalVerboseValidationFeedback && (
        <Part partId={PART_VERBOSE_VALIDATION_FEEDBACK}>
          <VerboseValidationFeedback
            icon={validationIcon}
            message={validationStatus === "error" ? invalidMessage : undefined}
            validationStatus={feedbackStatus}
          />
        </Part>
      )}
      {type === "password" && showPasswordToggle ? (
        <Part partId={PART_END_ADORNMENT}>
          <Adornment
            iconName={showPassword ? passwordVisibleIcon : passwordHiddenIcon}
            className={classnames(styles.adornment, styles.passwordToggle)}
            onClick={togglePasswordVisibility}
          />
        </Part>
      ) : (
        <Part partId={PART_END_ADORNMENT}>
          <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
        </Part>
      )}
    </div>
  );
});
