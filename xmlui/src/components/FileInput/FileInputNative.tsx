import type React from "react";
import { type CSSProperties, useCallback, useEffect, useId, useRef, useState } from "react";
import type { DropzoneRootProps } from "react-dropzone";
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
import { Button } from "../Button/ButtonNative";
import { TextBox } from "../TextBox/TextBoxNative";

// https://github.com/react-dropzone/react-dropzone/issues/1259
const { useDropzone } = dropzone;

// ============================================================================
// React FileInput component implementation

// Parse result type for multiple files
export type ParseResult = {
  file: File;
  data: any[];
  error?: Error;
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
  onDidChange?: (newValue: File[] | any[] | ParseResult[]) => void;
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

  // Auto-infer file types based on parseAs
  const inferredFileType = parseAs === "csv" ? ".csv" : parseAs === "json" ? ".json" : undefined;
  const _acceptsFileType = acceptsFileType
    ? (typeof acceptsFileType === "string" ? acceptsFileType : acceptsFileType?.join(","))
    : inferredFileType;

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

              const defaultCsvOptions: Papa.ParseConfig = {
                header: true,
                skipEmptyLines: true,
                ...csvOptions,
              };

              loggerService.log(["[FileInput] CSV parse options:", defaultCsvOptions]);

              return new Promise<ParseResult>((resolve) => {
                Papa.parse(file, {
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

      // For single files, return just the data array; for multiple files, return ParseResult[]
      if (multiple || directory) {
        loggerService.log(["[FileInput] Multiple files mode - returning ParseResult[]"]);
        loggerService.log(["[FileInput] Calling updateState with results"]);
        updateState({ value: results });
        loggerService.log(["[FileInput] Calling onDidChange with results"]);
        onDidChange(results);
      } else {
        const singleResult = results[0];
        loggerService.log(["[FileInput] Single file mode - returning data array for:", singleResult.file.name]);
        loggerService.log(["[FileInput] Data array length:", singleResult.data.length]);
        loggerService.log(["[FileInput] Calling updateState with data"]);
        updateState({ value: singleResult.data });
        loggerService.log(["[FileInput] Calling onDidChange with data"]);
        onDidChange(singleResult.data);
      }

      loggerService.log(["[FileInput] onDrop completed"]);

      // Stop loading spinner
      setIsLoading(false);
    },
    [updateState, onDidChange, parseAs, csvOptions, onParseError, multiple, directory],
  );

  const { getRootProps, getInputProps, open } = useDropzone({
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

  useEffect(() => {
    registerComponentApi?.({
      focus,
      open: doOpen,
      get inProgress() {
        return isLoading;
      },
    });
  }, [focus, doOpen, registerComponentApi, isLoading]);

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
            value={_value?.map((v) => v.name).join(", ") || ""}
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
