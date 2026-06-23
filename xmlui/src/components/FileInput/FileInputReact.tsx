import type { ChangeEvent, CSSProperties, DragEvent, FocusEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./FileInput.defaults";
import styles from "./FileInput.module.scss";

export type FileParseResult = {
  file: File;
  data: unknown[];
  error?: Error;
};

export type FileParseAsResult = {
  files: File[];
  parsedData: FileParseResult[];
};

export type FileInputValue = File[] | FileParseAsResult | undefined;

export type FileInputApi = {
  focus: () => void;
  open: () => void;
  setValue: (files: unknown) => void;
  getFields: () => string[] | undefined;
  inProgress: boolean;
  value: FileInputValue;
};

export type FileInputProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  acceptsFileType?: string | string[];
  multiple?: boolean;
  directory?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  buttonIcon?: string;
  buttonIconPosition?: string;
  buttonPosition?: "start" | "end" | string;
  buttonSize?: string;
  buttonThemeColor?: string;
  buttonVariant?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  validationStatus?: string;
  parseAs?: "csv" | "json" | string;
  csvOptions?: unknown;
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: FileInputValue) => void | Promise<void>;
  onParseError?: (error: Error, file: File) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
};

export const FileInputNative = memo(forwardRef<FileInputApi, FileInputProps>(function FileInputNative(
  {
    id,
    value,
    initialValue = defaultProps.initialValue,
    acceptsFileType,
    multiple = defaultProps.multiple,
    directory = defaultProps.directory,
    placeholder,
    buttonLabel = defaultProps.buttonLabel,
    buttonIcon = "browse:FileInput",
    buttonIconPosition = defaultProps.buttonIconPosition,
    buttonPosition = defaultProps.buttonPosition,
    buttonSize = defaultProps.buttonSize,
    buttonThemeColor = defaultProps.buttonThemeColor,
    buttonVariant = defaultProps.buttonVariant,
    enabled = defaultProps.enabled,
    readOnly = defaultProps.readOnly,
    required,
    autoFocus,
    validationStatus = defaultProps.validationStatus,
    parseAs,
    csvOptions,
    className,
    style,
    onDidChange,
    onParseError,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fieldButtonRef = useRef<HTMLButtonElement | null>(null);
  const browseButtonRef = useRef<HTMLButtonElement | null>(null);
  const controlled = value !== undefined;
  const [localValue, setLocalValue] = useState<FileInputValue>(() => normalizeValue(value ?? initialValue));
  const [fields, setFields] = useState<string[] | undefined>();
  const fieldsRef = useRef<string[] | undefined>();
  const [inProgress, setInProgress] = useState(false);
  const effectiveValue = controlled ? normalizeValue(value) : localValue;
  const displayedFiles = filesFromValue(effectiveValue);
  const interactive = enabled && !readOnly;
  const accept = normalizeAcceptsFileType(acceptsFileType, parseAs);

  useEffect(() => {
    if (controlled) {
      setLocalValue(normalizeValue(value));
    }
  }, [controlled, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(normalizeValue(initialValue));
    }
  }, [controlled, initialValue]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => browseButtonRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  const commitFiles = useCallback(async (incomingFiles: File[]) => {
    if (!interactive) {
      return;
    }
    const acceptedFiles = filterAcceptedFiles(incomingFiles, accept);
    const nextFiles = multiple || directory ? acceptedFiles : acceptedFiles.slice(0, 1);
    if (nextFiles.length === 0) {
      return;
    }

    if (parseAs === "csv" || parseAs === "json") {
      setInProgress(true);
      try {
        const parsedData = await Promise.all(nextFiles.map((file) => parseFile(file, parseAs, csvOptions)));
        const firstFields = parsedData.find((result) => result.data.length > 0)?.data[0];
        const nextFields = isPlainObject(firstFields) ? Object.keys(firstFields) : undefined;
        fieldsRef.current = nextFields;
        setFields(nextFields);
        for (const result of parsedData) {
          if (result.error) {
            void onParseError?.(result.error, result.file);
          }
        }
        const nextValue = { files: nextFiles, parsedData };
        setLocalValue(nextValue);
        void onDidChange?.(nextValue);
      } finally {
        setInProgress(false);
      }
      return;
    }

    setFields(undefined);
    fieldsRef.current = undefined;
    setLocalValue(nextFiles);
    void onDidChange?.(nextFiles);
  }, [accept, csvOptions, directory, interactive, multiple, onDidChange, onParseError, parseAs]);

  const open = useCallback(() => {
    if (interactive) {
      inputRef.current?.click();
    }
  }, [interactive]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (enabled) {
        browseButtonRef.current?.focus();
      }
    },
    open,
    setValue: (files) => {
      const nextFiles = normalizeFileArray(files);
      const nextValue = multiple || directory ? nextFiles : nextFiles.slice(0, 1);
      fieldsRef.current = undefined;
      setFields(undefined);
      setLocalValue(nextValue);
      void onDidChange?.(nextValue);
    },
    getFields: () => fieldsRef.current ?? fields,
    get inProgress() {
      return inProgress;
    },
    get value() {
      return effectiveValue;
    },
  }), [directory, effectiveValue, enabled, fields, inProgress, multiple, onDidChange, open]);

  const onInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    void commitFiles(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = "";
  }, [commitFiles]);

  const onDrop = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void commitFiles(Array.from(event.dataTransfer.files ?? []));
  }, [commitFiles]);

  const onDragOver = useCallback((event: DragEvent<HTMLButtonElement>) => {
    if (interactive) {
      event.preventDefault();
    }
  }, [interactive]);

  const handleFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      void onFocus?.();
    }
  }, [onFocus]);

  const handleBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      void onBlur?.();
    }
  }, [onBlur]);

  const displayText = displayedFiles.map((file) => file.name).join(", ");
  const hasDisplayText = displayText.length > 0;
  const normalizedButtonPosition = buttonPosition === "start" ? "start" : "end";
  const normalizedIconPosition = buttonIconPosition === "end" ? "end" : "start";
  const buttonContent = (
    <>
      {buttonIcon && normalizedIconPosition === "start" ? <span aria-hidden="true" data-icon={buttonIcon} className={styles.fileInputIcon} /> : null}
      {buttonLabel}
      {buttonIcon && normalizedIconPosition === "end" ? <span aria-hidden="true" data-icon={buttonIcon} className={styles.fileInputIcon} /> : null}
    </>
  );

  const directoryProps = directory ? { webkitdirectory: "true" } as Record<string, string> : undefined;

  return (
    <div
      {...rest}
      id={id}
      className={cx(
        styles.fileInputRoot,
        normalizedButtonPosition === "start" ? styles.fileInputButtonStart : styles.fileInputButtonEnd,
        !enabled ? styles.fileInputDisabled : undefined,
        readOnly ? styles.fileInputReadOnly : undefined,
        className,
      )}
      style={style}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <button
        ref={fieldButtonRef}
        type="button"
        data-part-id="input"
        data-xmlui-part="input"
        className={cx(
          styles.fileInputFieldButton,
          validationStatus === "error" ? styles.fileInputError : undefined,
          validationStatus === "warning" ? styles.fileInputWarning : undefined,
          validationStatus === "valid" ? styles.fileInputValid : undefined,
        )}
        disabled={!enabled}
        aria-readonly={readOnly || undefined}
        onClick={open}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <input
          ref={inputRef}
          className={styles.fileInputHiddenInput}
          type="file"
          accept={accept}
          multiple={multiple || directory}
          required={required}
          disabled={!interactive}
          onChange={onInputChange}
          {...directoryProps}
        />
        <span className={cx(styles.fileInputText, !hasDisplayText ? styles.fileInputPlaceholder : undefined)}>
          {hasDisplayText ? displayText : placeholder ?? ""}
        </span>
      </button>
      <button
        ref={browseButtonRef}
        type="button"
        className={styles.fileInputBrowseButton}
        disabled={!interactive}
        data-variant={buttonVariant || defaultProps.buttonVariant}
        data-theme-color={buttonThemeColor || defaultProps.buttonThemeColor}
        data-size={buttonSize || defaultProps.buttonSize}
        onClick={open}
      >
        {buttonContent}
      </button>
    </div>
  );
}));

export function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function isFileArray(value: unknown): value is File[] {
  return Array.isArray(value) && value.every(isFile);
}

function normalizeValue(value: unknown): FileInputValue {
  if (isFileArray(value)) {
    return value;
  }
  if (isParseAsResult(value)) {
    return value;
  }
  return undefined;
}

function normalizeFileArray(value: unknown): File[] {
  return isFileArray(value) ? value : [];
}

function filesFromValue(value: FileInputValue): File[] {
  if (isFileArray(value)) {
    return value;
  }
  if (isParseAsResult(value)) {
    return value.files;
  }
  return [];
}

function isParseAsResult(value: unknown): value is FileParseAsResult {
  return isPlainObject(value) &&
    isFileArray((value as FileParseAsResult).files) &&
    Array.isArray((value as FileParseAsResult).parsedData);
}

function normalizeAcceptsFileType(acceptsFileType: string | string[] | undefined, parseAs: unknown): string | undefined {
  if (Array.isArray(acceptsFileType)) {
    return acceptsFileType.join(",");
  }
  if (typeof acceptsFileType === "string" && acceptsFileType.trim() !== "") {
    return acceptsFileType;
  }
  if (parseAs === "csv") {
    return ".csv";
  }
  if (parseAs === "json") {
    return ".json";
  }
  return undefined;
}

function filterAcceptedFiles(files: File[], accept: string | undefined): File[] {
  const accepted = parseAcceptList(accept);
  if (accepted.length === 0) {
    return files;
  }
  return files.filter((file) =>
    accepted.some((entry) =>
      entry.endsWith("/*")
        ? file.type.startsWith(entry.slice(0, -1))
        : entry.startsWith(".")
          ? file.name.toLowerCase().endsWith(entry.toLowerCase())
          : file.type === entry,
    ),
  );
}

function parseAcceptList(value: string | undefined): string[] {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
}

async function parseFile(file: File, parseAs: "csv" | "json", csvOptions: unknown): Promise<FileParseResult> {
  try {
    const text = await file.text();
    if (text.trim() === "") {
      return { file, data: [] };
    }
    if (parseAs === "json") {
      const parsed = JSON.parse(text);
      return { file, data: Array.isArray(parsed) ? parsed : [parsed] };
    }
    return { file, data: parseCsv(text, csvOptions) };
  } catch (error) {
    return { file, data: [], error: error instanceof Error ? error : new Error(String(error)) };
  }
}

function parseCsv(text: string, csvOptions: unknown): unknown[] {
  const options = isPlainObject(csvOptions) ? csvOptions as Record<string, unknown> : {};
  const delimiter = typeof options.delimiter === "string" && options.delimiter.length > 0 ? options.delimiter : ",";
  const hasHeader = options.header !== false;
  const dynamicTyping = options.dynamicTyping === true;
  const rows = text
    .split(/\r?\n/)
    .map((line) => splitCsvLine(line, delimiter))
    .filter((row) => options.skipEmptyLines === false || row.some((cell) => cell.trim() !== ""));
  if (rows.length === 0) {
    return [];
  }
  if (!hasHeader) {
    return rows.map((row) => row.map((cell) => normalizeCsvCell(cell, dynamicTyping)));
  }
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, normalizeCsvCell(row[index] ?? "", dynamicTyping)])),
  );
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function normalizeCsvCell(value: string, dynamicTyping: boolean): unknown {
  const trimmed = value.trim();
  if (!dynamicTyping) {
    return trimmed;
  }
  if (trimmed === "true") {
    return true;
  }
  if (trimmed === "false") {
    return false;
  }
  if (trimmed !== "" && Number.isFinite(Number(trimmed))) {
    return Number(trimmed);
  }
  return trimmed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
