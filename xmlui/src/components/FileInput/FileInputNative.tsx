import type React from "react";
import { type CSSProperties, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Accept, DropzoneRootProps } from "react-dropzone";
import * as dropzone from "react-dropzone";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import classnames from "classnames";
import Papa from "papaparse";

import styles from "./FileInput.module.scss";
import { loggerService } from "../../logging/LoggerService";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import type { ButtonThemeColor, ButtonVariant, SizeType, IconPosition } from "../abstractions";
import { ThemedButton as Button } from "../Button/Button";
import { TextBox } from "../TextBox/TextBoxNative";

// https://github.com/react-dropzone/react-dropzone/issues/1259
const { useDropzone } = dropzone;

/**
 * Convert a file type string (e.g., ".csv" or ".txt,.jpg") to react-dropzone's Accept format
 */
function toDropzoneAccept(acceptsFileType: string | undefined): Accept | undefined {
  if (!acceptsFileType) return undefined;

  const extensions = acceptsFileType.split(",").map(ext => ext.trim());
  // Use a wildcard MIME type to accept any file with the specified extensions
  return { "application/octet-stream": extensions };
}

// ============================================================================
// React FileInput component implementation

// Parse result type for individual files
export type ParseResult = {
  file: File;
  data: any[];
  error?: Error;
};

// Result type when parseAs is set
export type ParseAsResult = {
  files: File[];
  parsedData: ParseResult[];
};

type Props = {
  // General
  id?: string;
  enabled?: boolean;
  style?: CSSProperties;
  className?: string;
  // Button styles
  buttonLabel?: string;
  variant?: ButtonVariant;
  buttonThemeColor?: ButtonThemeColor;
  buttonSize?: SizeType;
  buttonIcon?: React.ReactNode;
  buttonIconPosition?: IconPosition;
  // Input props
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: File[] | ParseAsResult) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  validationStatus?: ValidationStatus;
  autoFocus?: boolean;
  // Component-specific props
  value?: any;
  initialValue?: any;
  acceptsFileType?: string | string[];
  multiple?: boolean;
  directory?: boolean;
  required?: boolean;
  placeholder?: string;
  buttonPosition?: "start" | "end";
  // Parsing props
  parseAs?: "csv" | "json";
  csvOptions?: Papa.ParseConfig;
  onParseError?: (error: Error, file: File) => void;
};

export const defaultProps: Pick<
  Props,
  | "enabled"
  | "buttonPosition"
  | "buttonLabel"
  | "multiple"
  | "directory"
  | "updateState"
  | "onDidChange"
  | "onFocus"
  | "onBlur"
  | "buttonThemeColor"
> = {
  enabled: true,
  buttonPosition: "end",
  buttonLabel: "Browse",
  multiple: false,
  directory: false,
  buttonThemeColor: "primary",
  updateState: noop,
  onDidChange: noop,
  onFocus: noop,
  onBlur: noop,
};

export const FileInput = ({
  id,
  enabled = defaultProps.enabled,
  style,
  className,
  placeholder,
  buttonPosition = defaultProps.buttonPosition,
  buttonLabel = defaultProps.buttonLabel,
  buttonIcon,
  buttonIconPosition,
  variant,
  buttonThemeColor,
  buttonSize,

  autoFocus,
  validationStatus,
  updateState = defaultProps.updateState,
  onDidChange = defaultProps.onDidChange,
  onFocus = defaultProps.onFocus,
  onBlur = defaultProps.onBlur,
  registerComponentApi,
  value,
  initialValue,
  acceptsFileType,
  multiple = defaultProps.multiple,
  directory = defaultProps.directory,
  required,
  parseAs,
  csvOptions,
  onParseError,
  ...rest
}: Props) => {
  const _id = useId();
  id = id || _id;
  // Don't accept any (initial) value if it is not a File array explicitly
  const _initialValue: File[] | undefined = isFileArray(initialValue) ? initialValue : undefined;
  const _value: File[] | undefined = isFileArray(value) ? value : undefined;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedFiles, setDisplayedFiles] = useState<File[]>([]);
  const [parseFields, setParseFields] = useState<string[] | undefined>(undefined);

  // Auto-infer file types based on parseAs
  const inferredFileType = parseAs === "csv" ? ".csv" : parseAs === "json" ? ".json" : undefined;
  const _acceptsFileType = acceptsFileType
    ? (typeof acceptsFileType === "string" ? acceptsFileType : acceptsFileType?.join(","))
    : inferredFileType;
  const dropzoneAccept = useMemo(() => toDropzoneAccept(_acceptsFileType), [_acceptsFileType]);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: _initialValue }, { initial: true });
  }, [_initialValue, updateState]);

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback((e: React.FocusEvent) => {
    // Only fire onFocus if focus is coming from outside the component
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onFocus?.();
    }
  }, [onFocus]);

  const handleOnBlur = useCallback((e: React.FocusEvent) => {
    // Only fire onBlur if focus is leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onBlur?.();
    }
  }, [onBlur]);

  const focus = useCallback(() => {
    buttonRef.current?.focus();
  }, []);

  // --- Handle the value change events for this input
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      loggerService.log(["[FileInput] onDrop called", { parseAs, fileCount: acceptedFiles.length, files: acceptedFiles.map(f => f.name) }]);

      if (!acceptedFiles.length) {
        loggerService.log(["[FileInput] No files accepted, returning"]);
        return;
      }

      // Store files for display purposes (file names in TextBox)
      setDisplayedFiles(acceptedFiles);

      // If no parsing is needed, just pass the files through
      if (!parseAs) {
        loggerService.log(["[FileInput] No parseAs specified, passing files through"]);
        updateState({ value: acceptedFiles });
        onDidChange(acceptedFiles);
        return;
      }

      // Start loading spinner
      setIsLoading(true);
      loggerService.log(["[FileInput] parseAs =", parseAs, "- starting file parsing"]);

      // Helper function to parse a single file
      const parseFile = async (file: File): Promise<ParseResult> => {
        loggerService.log(["[FileInput] parseFile called for:", file.name]);

        try {
          switch (parseAs) {
            case "csv": {
              loggerService.log(["[FileInput] Entering CSV parse branch for:", file.name]);

              // Check for empty file before parsing
              const text = await file.text();
              if (text.trim() === "") {
                loggerService.log(["[FileInput] Empty CSV file, returning empty array"]);
                return { file, data: [], error: undefined };
              }

              const defaultCsvOptions: Papa.ParseConfig = {
                header: true,
                skipEmptyLines: true,
                ...csvOptions,
              };

              loggerService.log(["[FileInput] CSV parse options:", defaultCsvOptions]);

              return new Promise<ParseResult>((resolve) => {
                Papa.parse(text, {
                  ...defaultCsvOptions,
                  complete: (results: Papa.ParseResult<any>) => {
                    loggerService.log(["[FileInput] Papa.parse complete callback called for:", file.name]);
                    loggerService.log(["[FileInput] results.data.length:", results.data.length]);
                    loggerService.log(["[FileInput] results.errors.length:", results.errors.length]);

                    // Log sample row structure
                    if (results.data.length > 0) {
                      const sampleRow = results.data[0];
                      loggerService.log(["[FileInput] Sample row keys:", Object.keys(sampleRow)]);
                      loggerService.log(["[FileInput] Sample row:", sampleRow]);
                    }

                    if (results.errors && results.errors.length > 0) {
                      loggerService.log(["[FileInput] First 3 errors:", results.errors.slice(0, 3)]);
                      const firstFewErrors = results.errors.slice(0, 3).map(e => e.message).join(", ");
                      const errorSummary = results.errors.length > 3
                        ? `${firstFewErrors} (and ${results.errors.length - 3} more)`
                        : firstFewErrors;
                      const error = new Error(errorSummary);
                      loggerService.error(["[FileInput] CSV parse errors detected:", errorSummary]);
                      resolve({ file, data: [], error });
                    } else {
                      loggerService.log(["[FileInput] CSV parse successful, row count:", results.data.length]);
                      loggerService.log(["[FileInput] CSV meta fields:", results.meta.fields]);
                      setParseFields(results.meta.fields);
                      resolve({ file, data: results.data, error: undefined });
                    }
                  },
                  error: (error: Error) => {
                    loggerService.error(["[FileInput] Papa.parse error callback called:", error.message]);
                    resolve({ file, data: [], error });
                  },
                });
              });
            }

            case "json": {
              loggerService.log(["[FileInput] Entering JSON parse branch for:", file.name]);

              const text = await file.text();
              loggerService.log(["[FileInput] Read file text, length:", text.length]);

              // Handle empty files gracefully
              if (text.trim() === "") {
                loggerService.log(["[FileInput] Empty JSON file, returning empty array"]);
                return { file, data: [], error: undefined };
              }

              const data = JSON.parse(text);
              const arrayData = Array.isArray(data) ? data : [data];
              loggerService.log(["[FileInput] JSON.parse successful, array length:", arrayData.length]);

              return { file, data: arrayData, error: undefined };
            }

            default:
              loggerService.error(["[FileInput] Unknown parseAs value:", parseAs]);
              return { file, data: [], error: undefined };
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          loggerService.error(["[FileInput] Exception during file parsing:", err.message, "for file:", file.name]);
          return { file, data: [], error: err };
        }
      };

      // Parse all files
      loggerService.log(["[FileInput] Starting to parse", acceptedFiles.length, "file(s)"]);
      const results = await Promise.all(acceptedFiles.map(parseFile));
      loggerService.log(["[FileInput] All files parsed, total rows:", results.reduce((sum, r) => sum + r.data.length, 0)]);

      // Handle errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        loggerService.log(["[FileInput] Found", errors.length, "error(s) during parsing"]);
        errors.forEach(({ file, error }) => {
          if (error) {
            loggerService.error(["[FileInput] Parse error for", file.name + ":", error.message]);
            if (onParseError) {
              loggerService.log(["[FileInput] Calling onParseError for:", file.name]);
              onParseError(error, file);
            } else {
              loggerService.error(["[FileInput] No onParseError handler, logging to console:", error]);
              console.error(`Failed to parse ${file.name}:`, error);
            }
          }
        });
      }

      // Return { files, parsedData } when parseAs is set for consistent access to both
      const parseAsResult: ParseAsResult = {
        files: acceptedFiles,
        parsedData: results,
      };
      loggerService.log(["[FileInput] Returning ParseAsResult with", results.length, "parsed file(s)"]);
      loggerService.log(["[FileInput] Calling updateState with parseAsResult"]);
      updateState({ value: parseAsResult });
      loggerService.log(["[FileInput] Calling onDidChange with parseAsResult"]);
      onDidChange(parseAsResult);

      loggerService.log(["[FileInput] onDrop completed"]);

      // Stop loading spinner and restore focus
      setIsLoading(false);
      buttonRef.current?.focus();
    },
    [updateState, onDidChange, parseAs, csvOptions, onParseError],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: dropzoneAccept,
    disabled: !enabled,
    multiple: multiple || directory,
    onDrop,
    noClick: true,
    noKeyboard: true,
    noDragEventsBubbling: true,
    useFsAccessApi: directory === false,
  });

  const doOpen = useEvent(() => {
    open();
  });

  const getFields = useCallback(() => parseFields, [parseFields]);

  useEffect(() => {
    registerComponentApi?.({
      focus,
      open: doOpen,
      get inProgress() {
        return isLoading;
      },
      getFields,
    });
  }, [focus, doOpen, registerComponentApi, isLoading, getFields]);

  // Solution source: https://stackoverflow.com/questions/1084925/input-type-file-show-only-button
  return (
      <div
        className={classnames(styles.container, className, {
          [styles.buttonStart]: buttonPosition === "start",
          [styles.buttonEnd]: buttonPosition === "end",
        })}
        style={style}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        tabIndex={-1}
        {...rest}
      >
        <button
          id={id}
          {...getRootProps({
            tabIndex: 0,
            disabled: !enabled,
            className: styles.textBoxWrapper,
            onClick: open,
            ref: buttonRef,
            type: "button",
          })}
        >
          <VisuallyHidden.Root>
            <input
              {...getInputProps({
                webkitdirectory: directory ? "true" : undefined,
              } as DropzoneRootProps)}
              accept={_acceptsFileType}
            />
          </VisuallyHidden.Root>

          <TextBox
            placeholder={placeholder}
            enabled={enabled}
            value={displayedFiles?.map((v) => v.name).join(", ") || ""}
            validationStatus={validationStatus}
            readOnly
            tabIndex={-1}
          />
        </button>
        <Button
          disabled={!enabled}
          type="button"
          onClick={open}
          icon={buttonIcon}
          iconPosition={buttonIconPosition}
          variant={variant}
          themeColor={buttonThemeColor}
          size={buttonSize}
          className={styles.button}
          autoFocus={autoFocus}
        >
          {buttonLabel}
        </Button>
      </div>
  );
};

export function isFile(value: any): value is File {
  return value instanceof File;
}

export function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.every(isFile);
}
