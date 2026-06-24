import type { ChangeEvent, FocusEvent, KeyboardEvent, Ref, RefObject } from "react";
import { useCallback, useMemo } from "react";

import styles from "./PartialInput.module.scss";

export type BlurDirection = "next" | "previous" | "external";

export type PartialInputProps = {
  value?: string | null;
  placeholder?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (direction: BlurDirection, event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement }) => void;
  emptyCharacter?: string;
  placeholderLength?: number;
  max: number;
  min: number;
  maxLength?: number;
  validateFn?: (value: string) => boolean;
  onBeep?: () => void;
  nextInputRef?: RefObject<HTMLInputElement | null>;
  nextButtonRef?: RefObject<HTMLButtonElement | null>;
  id?: string;
  name: string;
  ariaLabel?: string;
  className?: string;
  invalidClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  step?: number;
  isInvalid?: boolean;
};

export function PartialInput({
  value,
  placeholder,
  onChange,
  onBlur,
  onKeyDown,
  emptyCharacter,
  placeholderLength = 2,
  max,
  min,
  maxLength = 2,
  validateFn,
  onBeep,
  nextInputRef,
  nextButtonRef,
  id,
  name,
  ariaLabel,
  className,
  invalidClassName,
  disabled,
  readOnly,
  required,
  autoFocus,
  inputRef,
  step = 1,
  isInvalid = false,
  ...restProps
}: PartialInputProps) {
  const processedEmptyCharacter = useMemo(() => {
    if (!emptyCharacter || emptyCharacter.length === 0) {
      return "-";
    }
    if (emptyCharacter.length > 1) {
      return [...emptyCharacter][0];
    }
    return emptyCharacter;
  }, [emptyCharacter]);

  const finalPlaceholder = useMemo(() => {
    if (placeholder !== undefined) {
      return placeholder;
    }
    return processedEmptyCharacter.repeat(placeholderLength);
  }, [placeholder, processedEmptyCharacter, placeholderLength]);

  const handleInternalFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChange?.(event);

      if (newValue.length === maxLength && /^\d+$/.test(newValue) && !isInvalid) {
        const isValueInvalid = validateFn ? validateFn(newValue) : false;
        if (!isValueInvalid) {
          setTimeout(() => {
            if (nextInputRef?.current) {
              nextInputRef.current.focus();
              nextInputRef.current.select();
            } else if (nextButtonRef?.current) {
              nextButtonRef.current.focus();
            }
          }, 0);
        } else {
          onBeep?.();
        }
      }
    },
    [isInvalid, maxLength, nextButtonRef, nextInputRef, onBeep, onChange, validateFn],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      let direction: BlurDirection = "external";

      if (relatedTarget) {
        if (nextInputRef?.current === relatedTarget || nextButtonRef?.current === relatedTarget) {
          direction = "next";
        } else if (relatedTarget.getAttribute("data-input") === "true") {
          direction = "previous";
        }
      }

      onBlur?.(direction, event);
    },
    [nextButtonRef, nextInputRef, onBlur],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        return;
      }
      onKeyDown?.(event as KeyboardEvent<HTMLInputElement> & { target: HTMLInputElement });
    },
    [onKeyDown],
  );

  return (
    <input
      {...restProps}
      id={id}
      aria-label={ariaLabel}
      autoComplete="off"
      autoFocus={autoFocus}
      className={cx(styles.partialInput, className, isInvalid && invalidClassName)}
      data-input="true"
      disabled={disabled}
      inputMode="numeric"
      max={max}
      maxLength={maxLength}
      min={min}
      name={name}
      onBlur={handleBlur}
      onChange={handleInputChange}
      onFocus={handleInternalFocus}
      onKeyDown={handleKeyDown}
      placeholder={finalPlaceholder}
      readOnly={readOnly}
      ref={inputRef as Ref<HTMLInputElement>}
      required={required}
      step={step}
      type="number"
      value={value ?? ""}
    />
  );
}

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
