import type { CSSProperties } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from "./Toggle.module.scss";

export type ToggleApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: boolean;
};

export type ToggleControllerOptions = {
  value?: unknown;
  initialValue?: unknown;
  enabled?: boolean;
  autoFocus?: boolean;
  indeterminate?: boolean;
  suppressInitialTransition?: boolean;
  onDidChange?: (value: boolean) => void | Promise<void>;
};

export type ToggleController = {
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  checked: boolean;
  suppressTransition: boolean;
  updateValue: (value: unknown) => void;
  focus: () => void;
  api: ToggleApi;
};

export type ToggleProps = {
  value?: unknown;
  enabled?: boolean;
  variant?: "switch" | "checkbox" | string;
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: boolean) => void | Promise<void>;
};

export const Toggle = memo(forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  {
    value,
    enabled = true,
    variant = "checkbox",
    className,
    style,
    onDidChange,
  },
  forwardedRef,
) {
  const { inputRef, checked, updateValue } = useToggleController({
    value,
    enabled,
    onDidChange,
  });

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement, [inputRef]);

  return (
    <input
      ref={inputRef}
      className={[
        styles.resetAppearance,
        variant === "switch" ? styles.switch : styles.checkbox,
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      type="checkbox"
      role={variant === "switch" ? "switch" : undefined}
      checked={checked}
      disabled={!enabled}
      aria-checked={checked}
      onChange={(event) => updateValue(event.currentTarget.checked)}
    />
  );
}));

export function useToggleController({
  value,
  initialValue,
  enabled = true,
  autoFocus,
  indeterminate,
  suppressInitialTransition = false,
  onDidChange,
}: ToggleControllerOptions): ToggleController {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const controlled = value !== undefined;
  const initialChecked = transformToLegitValue(value ?? initialValue);
  const [checked, setChecked] = useState(() => initialChecked);
  const [suppressTransition, setSuppressTransition] = useState(
    () => suppressInitialTransition && initialChecked,
  );

  useEffect(() => {
    if (controlled) {
      setChecked(transformToLegitValue(value));
    }
  }, [controlled, value]);

  useEffect(() => {
    if (!controlled) {
      setChecked(transformToLegitValue(initialValue));
    }
  }, [controlled, initialValue]);

  useEffect(() => {
    if (inputRef.current && typeof indeterminate === "boolean") {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, checked]);

  useEffect(() => {
    if (!suppressTransition) {
      return;
    }
    const first = requestAnimationFrame(() => {
      const second = requestAnimationFrame(() => setSuppressTransition(false));
      return () => cancelAnimationFrame(second);
    });
    return () => cancelAnimationFrame(first);
  }, [suppressTransition]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  const updateValue = useCallback((nextValue: unknown) => {
    const normalized = transformToLegitValue(nextValue);
    if (checked !== normalized) {
      void onDidChange?.(normalized);
    }
    setChecked(normalized);
  }, [checked, onDidChange]);

  const focus = useCallback(() => {
    if (enabled) {
      inputRef.current?.focus();
    }
  }, [enabled]);

  return {
    inputRef,
    checked,
    suppressTransition,
    updateValue,
    focus,
    api: {
      focus,
      setValue: updateValue,
      get value() {
        return checked;
      },
    },
  };
}

export function transformToLegitValue(inp: unknown): boolean {
  if (typeof inp === "undefined" || inp === null) {
    return false;
  }
  if (typeof inp === "boolean") {
    return inp;
  }
  if (typeof inp === "number") {
    return Number.isNaN(inp) || Boolean(inp);
  }
  if (typeof inp === "string") {
    return inp.trim() !== "" && inp.toLowerCase() !== "false";
  }
  if (Array.isArray(inp)) {
    return inp.length > 0;
  }
  if (typeof inp === "object") {
    return Object.keys(inp).length > 0;
  }
  return false;
}
