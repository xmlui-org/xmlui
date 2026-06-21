import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { defaultProps } from "./TextArea.defaults";

const styles = {
  textAreaConciseFeedback: "textAreaConciseFeedback",
  textAreaContainer: "textAreaContainer",
  textAreaError: "textAreaError",
  textAreaInput: "textAreaInput",
  textAreaLabel: "textAreaLabel",
  textAreaLabeledItem: "textAreaLabeledItem",
  textAreaLabelRequired: "textAreaLabelRequired",
  textAreaResizeBoth: "textAreaResizeBoth",
  textAreaResizeHorizontal: "textAreaResizeHorizontal",
  textAreaResizeVertical: "textAreaResizeVertical",
  textAreaSuccess: "textAreaSuccess",
  textAreaWarning: "textAreaWarning",
} as const;

export type TextAreaProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoSize?: boolean;
  resize?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string | boolean;
  autoCorrect?: boolean;
  spellCheck?: boolean;
  autoCapitalize?: string;
  enterSubmits?: boolean;
  escResets?: boolean;
  tabIndex?: number;
  allowCopy?: boolean;
  verboseValidationFeedback?: boolean;
  validationStatus?: string;
  invalidMessages?: string[];
  onDidChange?: (value: string) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
};

export type TextAreaApi = {
  focus: () => void;
  insert: (value: unknown) => void;
  setValue: (value: unknown) => void;
  value: string;
};

export const TextAreaNative = memo(forwardRef<TextAreaApi, TextAreaProps>(function TextAreaNative(
  {
    id,
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    placeholder = defaultProps.placeholder,
    maxLength,
    rows = defaultProps.rows,
    minRows,
    maxRows,
    autoSize,
    resize,
    enabled = defaultProps.enabled,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    autoFocus = defaultProps.autoFocus,
    autoComplete = defaultProps.autoComplete,
    autoCorrect,
    spellCheck,
    autoCapitalize,
    enterSubmits = defaultProps.enterSubmits,
    escResets = false,
    tabIndex,
    allowCopy = defaultProps.allowCopy,
    verboseValidationFeedback = true,
    validationStatus = defaultProps.validationStatus,
    invalidMessages = defaultProps.invalidMessages,
    onDidChange,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const generatedInputId = useId();
  const controlled = value !== undefined;
  const [localValue, setLocalValue] = useState(() => stringifyTextAreaValue(value ?? initialValue));
  const [selectionAfterInsert, setSelectionAfterInsert] = useState<number | null>(null);

  useEffect(() => {
    if (controlled) {
      setLocalValue(stringifyTextAreaValue(value));
    }
  }, [controlled, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(stringifyTextAreaValue(initialValue));
    }
  }, [controlled, initialValue]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  useEffect(() => {
    if (selectionAfterInsert === null) {
      return;
    }
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.setSelectionRange(selectionAfterInsert, selectionAfterInsert);
    }
    setSelectionAfterInsert(null);
  }, [localValue, selectionAfterInsert]);

  const updateValue = useCallback((nextValue: unknown) => {
    const normalized = stringifyTextAreaValue(nextValue);
    setLocalValue(normalized);
    void onDidChange?.(normalized);
  }, [onDidChange]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (enabled) {
        textareaRef.current?.focus();
      }
    },
    insert: (insertedValue: unknown) => {
      const textarea = textareaRef.current;
      const insertedText = stringifyTextAreaValue(insertedValue);
      if (!textarea || !insertedText) {
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextValue = `${localValue.slice(0, start)}${insertedText}${localValue.slice(end)}`;
      updateValue(nextValue);
      setSelectionAfterInsert(start + insertedText.length);
    },
    setValue: updateValue,
    get value() {
      return localValue;
    },
  }), [enabled, localValue, updateValue]);

  useEffect(() => {
    if (!autoSize) {
      return;
    }
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [autoSize, localValue, rows, minRows, maxRows]);

  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const labelText = stringifyLabel(label);
  const textareaStyle = useMemo<CSSProperties>(() => ({
    ...(minRows ? { minHeight: `${minRows * 1.5}em` } : undefined),
    ...(maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined),
    ...(maxRows ? { overflowY: "auto" } : undefined),
  }), [maxRows, minRows]);
  const textarea = (
    <div
      {...(!hasLabel ? rest : undefined)}
      data-part-id="root"
      data-xmlui-part="root"
      className={cx(styles.textAreaContainer, !hasLabel ? className : undefined)}
      style={!hasLabel ? style : undefined}
    >
      <textarea
        id={inputId}
        ref={textareaRef}
        data-part-id="input"
        data-xmlui-part="input"
        className={cx(
          styles.textAreaInput,
          resize === "horizontal" ? styles.textAreaResizeHorizontal : undefined,
          resize === "vertical" ? styles.textAreaResizeVertical : undefined,
          resize === "both" ? styles.textAreaResizeBoth : undefined,
          validationStatus === "error" ? styles.textAreaError : undefined,
          validationStatus === "warning" ? styles.textAreaWarning : undefined,
          validationStatus === "valid" ? styles.textAreaSuccess : undefined,
        )}
        style={textareaStyle}
        value={localValue}
        placeholder={placeholder}
        maxLength={normalizeMaxLength(maxLength)}
        rows={normalizePositiveRows(rows)}
        disabled={!enabled}
        readOnly={readOnly}
        required={required}
        tabIndex={enabled ? tabIndex : -1}
        aria-multiline="true"
        aria-readonly={readOnly}
        autoComplete={normalizeAutoComplete(autoComplete)}
        autoCorrect={normalizeOnOff(autoCorrect)}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateValue(event.currentTarget.value)}
        onCopy={(event) => {
          if (!allowCopy) {
            event.preventDefault();
          }
        }}
        onFocus={(_event: FocusEvent<HTMLTextAreaElement>) => void onFocus?.()}
        onBlur={(_event: FocusEvent<HTMLTextAreaElement>) => void onBlur?.()}
        onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
          if (event.currentTarget.form && event.key.toLowerCase() === "enter" && enterSubmits && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form.requestSubmit();
          }
          if (event.currentTarget.form && event.key.toLowerCase() === "escape" && escResets && !event.shiftKey) {
            event.preventDefault();
            updateValue(initialValue);
            event.currentTarget.form.reset();
          }
        }}
      />
      {!verboseValidationFeedback && validationStatus && validationStatus !== "none" ? (
        <span
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          className={styles.textAreaConciseFeedback}
          title={invalidMessages?.join("\n")}
        >
          <span data-icon-name={validationStatus === "valid" ? "checkmark" : "error"} />
        </span>
      ) : null}
    </div>
  );

  if (!hasLabel) {
    return textarea;
  }

  return (
    <div {...rest} className={className} style={style}>
      <div className={styles.textAreaLabeledItem} data-part-id="labeledItem" data-xmlui-part="labeledItem">
        <label data-part-id="label" data-xmlui-part="label" htmlFor={inputId} className={styles.textAreaLabel}>
          <span>{labelText}{required ? "*" : ""}</span>
        </label>
        {textarea}
      </div>
    </div>
  );
}));

function stringifyTextAreaValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (Array.isArray(value)) {
    return "";
  }
  if (typeof value === "function") {
    return "";
  }
  if (typeof value === "object") {
    return String(value);
  }
  return String(value);
}

function stringifyLabel(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "function") {
    return "";
  }
  if (typeof value === "object") {
    return "";
  }
  return String(value);
}

function normalizePositiveRows(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : defaultProps.rows;
}

function normalizeMaxLength(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
}

function normalizeOnOff(value: boolean | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value ? "on" : "off";
}

function normalizeAutoComplete(value: string | boolean | undefined): string | undefined {
  return typeof value === "boolean" ? normalizeOnOff(value) : value;
}

function cx(...values: Array<string | undefined | false>): string | undefined {
  const className = values.filter(Boolean).join(" ");
  return className || undefined;
}
