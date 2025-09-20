import type React from "react";
import { type CSSProperties, useCallback, useEffect, useId, useRef, useState } from "react";
import type { DropzoneRootProps } from "react-dropzone";
import * as dropzone from "react-dropzone";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import classnames from "classnames";

import styles from "./FileInput.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import type { ButtonThemeColor, ButtonVariant, SizeType, IconPosition } from "../abstractions";
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
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  required,
  ...rest
}: Props) => {
  const _id = useId();
  id = id || _id;
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
      {...rest}
      id={id}
      labelPosition={labelPosition as any}
      label={label}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      style={style}
      className={className}
      isInputTemplateUsed={true}
    >
      <div
        className={classnames(styles.container, {
          [styles.buttonStart]: buttonPosition === "start",
          [styles.buttonEnd]: buttonPosition === "end",
        })}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        tabIndex={-1}
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
    </ItemWithLabel>
  );
};

export function isFile(value: any): value is File {
  return value instanceof File;
}

export function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.every(isFile);
}
