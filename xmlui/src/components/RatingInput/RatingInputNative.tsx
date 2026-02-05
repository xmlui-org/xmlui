import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./RatingInput.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { PART_INPUT } from "../../components-core/parts";
import type { ValidationStatus } from "../abstractions";
import { noop } from "../../components-core/constants";
import { Part } from "../Part/Part";

type Props = {
  validationStatus?: ValidationStatus;
  validationIconSuccess?: string;
  validationIconError?: string;
  verboseValidationFeedback?: boolean;
  invalidMessages?: string[];
  autoFocus?: boolean;
  required?: boolean;
  placeholder?: string;
  initialValue?: number;
  id?: string;
  value?: number;
  maxRating?: number;
  enabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onDidChange?: (value: number) => void;
  updateState?: UpdateStateFn;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
};

const DEFAULT_MAX_RATING = 5;
const DEFAULT_VALIDATION_ICON_SUCCESS = "checkmark";
const DEFAULT_VALIDATION_ICON_ERROR = "error";
const DEFAULT_INVALID_MESSAGES: string[] = [];

export const defaultProps: {
  maxRating: number;
  enabled: boolean;
  readOnly: boolean;
  className?: string;
  updateState: UpdateStateFn;
  onFocus: () => void;
  onBlur: () => void;
  onDidChange: (value: number) => void;
  initialValue?: number;
  value?: number;
  validationStatus: ValidationStatus;
  invalidMessages: string[];
} = {
  maxRating: DEFAULT_MAX_RATING,
  enabled: true,
  readOnly: false,
  className: undefined,
  updateState: noop,
  onFocus: noop,
  onBlur: noop,
  onDidChange: noop,
  initialValue: undefined,
  value: undefined,
  validationStatus: "none",
  invalidMessages: DEFAULT_INVALID_MESSAGES,
};

export function RatingInput({
  id,
  value,
  maxRating = defaultProps.maxRating,
  enabled = defaultProps.enabled,
  readOnly = defaultProps.readOnly,
  className,
  updateState = defaultProps.updateState,
  onFocus = defaultProps.onFocus,
  onBlur = defaultProps.onBlur,
  onDidChange = defaultProps.onDidChange,
  initialValue = defaultProps.initialValue,
  validationStatus = defaultProps.validationStatus,
  invalidMessages = defaultProps.invalidMessages,
  placeholder,
  autoFocus,
  validationIconSuccess,
  validationIconError,
  verboseValidationFeedback,
  registerComponentApi,
  ...rest
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const max = useMemo(() => {
    const numericMax = typeof maxRating === "number" ? maxRating : DEFAULT_MAX_RATING;
    const safeMax = Number.isFinite(numericMax) ? numericMax : DEFAULT_MAX_RATING;
    const result = Math.max(1, Math.min(Math.round(safeMax), 10));
    return Number.isFinite(result) ? result : DEFAULT_MAX_RATING;
  }, [maxRating]);

  const currentValue = Number(value ?? 0);
  const isInteractive = enabled && !readOnly;

  useEffect(() => {
    if (initialValue === undefined || initialValue === null) {
      return;
    }
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  const [localValue, setLocalValue] = useState<number | undefined>(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const updateValue = useCallback(
    (nextValue: number) => {
      setLocalValue(nextValue);
      updateState({ value: nextValue });
      onDidChange(nextValue);
    },
    [onDidChange, updateState],
  );

  const handleSelect = (nextValue: number) => {
    if (!isInteractive) return;
    updateValue(nextValue);
  };

  const focus = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  const setValue = useEvent((newValue: number | string) => {
    if (!isInteractive) return;
    const numericValue =
      typeof newValue === "number"
        ? newValue
        : typeof newValue === "string" && newValue.trim() !== ""
          ? Number(newValue)
          : undefined;
    if (numericValue === undefined || Number.isNaN(numericValue)) {
      return;
    }
    updateValue(numericValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
      value: localValue,
    });
  }, [focus, localValue, registerComponentApi, setValue]);

  useEffect(() => {
    if (!autoFocus) return;
    setTimeout(() => {
      focus();
    }, 0);
  }, [autoFocus, focus]);

  const finalVerboseValidationFeedback = verboseValidationFeedback ?? true;
  const finalValidationIconSuccess = validationIconSuccess ?? DEFAULT_VALIDATION_ICON_SUCCESS;
  const finalValidationIconError = validationIconError ?? DEFAULT_VALIDATION_ICON_ERROR;

  return (
    <Part partId={PART_INPUT}>
      <div
        id={id}
        ref={containerRef}
        className={[
          styles.container,
          className,
          !enabled ? styles.disabled : "",
          readOnly ? styles.readOnly : "",
          validationStatus === "error" ? styles.error : "",
          validationStatus === "warning" ? styles.warning : "",
          validationStatus === "valid" ? styles.valid : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onFocus={isInteractive ? onFocus : undefined}
        onBlur={isInteractive ? onBlur : undefined}
        aria-disabled={!isInteractive}
        tabIndex={-1}
        {...rest}
      >
        {(localValue === undefined || localValue === null) && placeholder && (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        {Array.from({ length: max }, (_, index) => {
          const ratingValue = index + 1;
          const isActive = ratingValue <= currentValue;
          const label = `Set rating to ${ratingValue}`;

          return (
            <button
              role="button"
              key={ratingValue}
              type="button"
              className={[
                styles.star,
                isActive ? styles.starActive : "",
                !isInteractive ? styles.disabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(ratingValue)}
              disabled={!isInteractive}
              aria-label={label}
            >
              {isActive ? "★" : "☆"}
            </button>
          );
        })}
        {!finalVerboseValidationFeedback &&
          (finalValidationIconSuccess || finalValidationIconError || invalidMessages?.length) && (
            <span aria-hidden="true" />
          )}
      </div>
    </Part>
  );
}
