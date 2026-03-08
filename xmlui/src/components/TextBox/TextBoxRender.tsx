import React, { useCallback, useEffect, useRef, useState } from "react";
import { forwardRef } from "react";
import classnames from "classnames";
import styles from "./TextBox.module.scss";
import { Adornment } from "../Input/InputAdornment";
import { Part } from "../Part/Part";
import { useFormContextPart } from "../Form/FormContext";
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";
import { PART_START_ADORNMENT, PART_INPUT, PART_END_ADORNMENT, PART_CONCISE_VALIDATION_FEEDBACK } from "../../components-core/parts";

/**
 * Pure TextBox render component. No XMLUI state management imports.
 *
 * Receives `value`, `onChange`, and `registerApi` from wrapCompound's
 * StateWrapper. Everything else is native React props.
 */
export const TextBoxRender = forwardRef(({
  value, onChange, registerApi, className,
  id, type = "text", enabled = true, placeholder, maxLength,
  readOnly, autoFocus, tabIndex, required,
  validationStatus = "none", invalidMessages = [],
  startText, startIcon, endText, endIcon, gap,
  showPasswordToggle, passwordVisibleIcon = "eye", passwordHiddenIcon = "eye-off",
  verboseValidationFeedback, validationIconSuccess, validationIconError,
  style,
  onFocus, onBlur, onKeyDown,
  ...rest
}: any, ref: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const actualType = type === "password" && showPassword ? "text" : type;

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const contextVerboseValidationFeedback = useFormContextPart((ctx: any) => ctx?.verboseValidationFeedback);
  const contextValidationIconSuccess = useFormContextPart((ctx: any) => ctx?.validationIconSuccess);
  const contextValidationIconError = useFormContextPart((ctx: any) => ctx?.validationIconError);

  const finalVerboseValidationFeedback = verboseValidationFeedback ?? contextVerboseValidationFeedback ?? true;
  const finalValidationIconSuccess = validationIconSuccess ?? contextValidationIconSuccess ?? "checkmark";
  const finalValidationIconError = validationIconError ?? contextValidationIconError ?? "error";

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // Workaround for jumping caret: local state syncs with external value
  const [localValue, setLocalValue] = useState(value ?? "");
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const updateValue = useCallback(
    (newVal: string) => {
      setLocalValue(newVal);
      onChange?.(newVal);
    },
    [onChange],
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(event.target.value);
    },
    [updateValue],
  );

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    registerApi?.({
      focus,
      setValue: (v: string) => updateValue(v),
    });
  }, [registerApi, focus, updateValue]);

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
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          readOnly={readOnly}
          autoFocus={autoFocus}
          tabIndex={enabled ? tabIndex : -1}
          required={required}
        />
      </Part>
      {!readOnly && enabled && type === "search" && localValue?.length > 0 && (
        <Part partId={PART_END_ADORNMENT}>
          <Adornment
            iconName="close"
            className={styles.adornment}
            onClick={() => updateValue("")}
          />
        </Part>
      )}
      {!finalVerboseValidationFeedback && (
        <Part partId={PART_CONCISE_VALIDATION_FEEDBACK}>
          <ConciseValidationFeedback
            validationStatus={validationStatus}
            invalidMessages={invalidMessages}
            successIcon={finalValidationIconSuccess}
            errorIcon={finalValidationIconError}
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

TextBoxRender.displayName = "TextBoxRender";
