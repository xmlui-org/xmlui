import type { CSSProperties, FocusEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./RatingInput.defaults";

const styles = {
  ratingInputDisabled: "ratingInputDisabled",
  ratingInputError: "ratingInputError",
  ratingInputPlaceholder: "ratingInputPlaceholder",
  ratingInputReadOnly: "ratingInputReadOnly",
  ratingInputRoot: "ratingInputRoot",
  ratingInputStar: "ratingInputStar",
  ratingInputStarActive: "ratingInputStarActive",
  ratingInputValid: "ratingInputValid",
  ratingInputWarning: "ratingInputWarning",
} as const;

export type RatingInputApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: number | undefined;
};

export type RatingInputProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  maxRating?: unknown;
  placeholder?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  validationStatus?: string;
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: number | undefined) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const RatingInputNative = memo(forwardRef<RatingInputApi, RatingInputProps>(function RatingInputNative(
  {
    id,
    value,
    initialValue = defaultProps.initialValue,
    maxRating = defaultProps.maxRating,
    placeholder,
    enabled = defaultProps.enabled,
    readOnly = defaultProps.readOnly,
    autoFocus,
    tabIndex,
    validationStatus = defaultProps.validationStatus,
    className,
    style,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);
  const controlled = value !== undefined;
  const max = useMemo(() => normalizeMaxRating(maxRating), [maxRating]);
  const [localValue, setLocalValue] = useState<number | undefined>(() =>
    normalizeRatingValue(controlled ? value : initialValue, max),
  );
  const visibleValue = controlled ? normalizeRatingValue(value, max) : localValue;
  const interactive = enabled && !readOnly;

  useEffect(() => {
    if (controlled) {
      setLocalValue(normalizeRatingValue(value, max));
    }
  }, [controlled, max, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(normalizeRatingValue(initialValue, max));
    }
  }, [controlled, initialValue, max]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => firstButtonRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  const updateValue = useCallback((nextValue: number | undefined) => {
    setLocalValue(nextValue);
    void onDidChange?.(nextValue);
  }, [onDidChange]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (enabled) {
        firstButtonRef.current?.focus();
      }
    },
    setValue: (nextValue) => {
      if (!interactive) {
        return;
      }
      updateValue(normalizeRatingValue(nextValue, max));
    },
    get value() {
      return visibleValue;
    },
  }), [enabled, interactive, max, updateValue, visibleValue]);

  return (
    <div
      {...rest}
      id={id}
      ref={rootRef}
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={dataTestId ?? id}
      className={cx(
        styles.ratingInputRoot,
        validationStatus === "error" ? styles.ratingInputError : undefined,
        validationStatus === "warning" ? styles.ratingInputWarning : undefined,
        validationStatus === "valid" ? styles.ratingInputValid : undefined,
        !enabled ? styles.ratingInputDisabled : undefined,
        readOnly ? styles.ratingInputReadOnly : undefined,
        className,
      )}
      style={style}
      aria-disabled={!interactive}
      onFocus={(_event: FocusEvent<HTMLDivElement>) => void onFocus?.()}
      onBlur={(_event: FocusEvent<HTMLDivElement>) => void onBlur?.()}
    >
      {visibleValue === undefined && placeholder ? (
        <span className={styles.ratingInputPlaceholder}>{placeholder}</span>
      ) : null}
      {Array.from({ length: max }, (_, index) => {
        const ratingValue = index + 1;
        const active = visibleValue !== undefined && ratingValue <= visibleValue;
        return (
          <button
            key={ratingValue}
            ref={ratingValue === 1 ? firstButtonRef : undefined}
            type="button"
            className={cx(styles.ratingInputStar, active ? styles.ratingInputStarActive : undefined)}
            disabled={!interactive}
            tabIndex={enabled ? tabIndex : -1}
            aria-label={`Set rating to ${ratingValue}`}
            onClick={() => {
              if (interactive) {
                updateValue(ratingValue);
              }
            }}
          >
            {active ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}));

function normalizeMaxRating(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return defaultProps.maxRating;
  }
  return Math.max(1, Math.min(10, Math.round(parsed)));
}

function normalizeRatingValue(value: unknown, max: number): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return Math.max(1, Math.min(max, Math.round(parsed)));
}

function cx(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}
