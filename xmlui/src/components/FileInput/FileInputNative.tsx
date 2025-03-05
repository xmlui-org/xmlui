import type React from "react";
import { type CSSProperties, useCallback, useEffect, useRef } from "react";
import type { DropzoneRootProps } from "react-dropzone";
import * as dropzone from "react-dropzone";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import classnames from "classnames";

import styles from "./FileInput.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import type { ButtonThemeColor, ButtonVariant, ComponentSize, IconPosition } from "../abstractions";
import { Button } from "../Button/ButtonNative";
import { TextBox } from "../TextBox/TextBoxNative";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";

// https://github.com/react-dropzone/react-dropzone/issues/1259
const { useDropzone } = dropzone;

// ============================================================================
// React FileInput component implementation

type Props = {
  // General
  id?: string;
  enabled?: boolean;
  style?: CSSProperties;
  // Button styles
  buttonLabel?: string;
  variant?: ButtonVariant;
  buttonThemeColor?: ButtonThemeColor;
  buttonSize?: ComponentSize;
  buttonIcon?: React.ReactNode;
  buttonIconPosition?: IconPosition;
  // Input props
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: File[]) => void;
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
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  placeholder?: string;
  buttonPosition?: "start" | "end";
};

export const FileInput = ({
  id,
  enabled = true,
  style,
  placeholder,
  buttonPosition = "end",
  buttonLabel = "Browse",
  buttonIcon,
  buttonIconPosition,
  variant,
  buttonThemeColor,
  buttonSize,

  autoFocus,
  validationStatus,
  updateState = noop,
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  value,
  initialValue,
  acceptsFileType,
  multiple = false,
  directory = false,
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  required,
}: Props) => {
  // Don't accept any (initial) value if it is not a File array explicitly
  const _initialValue: File[] | undefined = isFileArray(initialValue) ? initialValue : undefined;
  const _value: File[] | undefined = isFileArray(value) ? value : undefined;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const _acceptsFileType =
    typeof acceptsFileType === "string" ? acceptsFileType : acceptsFileType?.join(",");

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

  const handleOnBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  const focus = useCallback(() => {
    buttonRef.current?.focus();
  }, []);

  // --- Handle the value change events for this input
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      updateState({ value: acceptedFiles });
      onDidChange(acceptedFiles);
    },
    [updateState, onDidChange],
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

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const doOpen = useEvent(() => {
    open();
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      open: doOpen,
    });
  }, [focus, doOpen, registerComponentApi]);

  // Solution source: https://stackoverflow.com/questions/1084925/input-type-file-show-only-button
  return (
    <ItemWithLabel
      labelPosition={labelPosition as any}
      label={label}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
    >
      <div
        className={classnames(styles.container, {
          [styles.buttonStart]: buttonPosition === "start",
          [styles.buttonEnd]: buttonPosition === "end",
        })}
      >
        <button
          {...getRootProps({
            tabIndex: 0,
            onFocus: handleOnFocus,
            onBlur: handleOnBlur,
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
          id={id}
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
    </ItemWithLabel>
  );
};

export function isFile(value: any): value is File {
  return value instanceof File;
}

export function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.every(isFile);
}
