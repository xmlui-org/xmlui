import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { Icon } from "@components/Icon/Icon";
import styles from "./FileInput.module.scss";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Button } from "@components/Button/Button";
import type { ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
import { noop } from "@components-core/constants";
import type { DropzoneRootProps } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { useEvent } from "@components-core/utils/misc";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { TextBox } from "@components/TextBox/TextBox";
import { parseScssVar } from "@components-core/theming/themeVars";
import { desc } from "@components-core/descriptorHelper";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentSize, ButtonThemeColor, ButtonVariant, IconPosition } from "@components/abstractions";

// ============================================================================
// React FileInput component implementation

type Props = {
  // General
  id?: string;
  enabled?: boolean;
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
};

export const FileInput = ({
  id,
  enabled = true,

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
}: Props) => {
  // Don't accept any (initial) value if it is not a File array explicitly
  const _initialValue: File[] | undefined = isFileArray(initialValue) ? initialValue : undefined;
  const _value: File[] | undefined = isFileArray(value) ? value : undefined;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const _acceptsFileType = typeof acceptsFileType === "string" ? acceptsFileType : acceptsFileType?.join(",");

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: _initialValue });
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
    <div className={styles.container}>
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
            {...getInputProps({ webkitdirectory: directory ? "true" : undefined } as DropzoneRootProps)}
            accept={_acceptsFileType}
          />
        </VisuallyHidden.Root>

        <TextBox
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
  );
};

// ============================================================================
// XMLUI FileInput component definition

/** @internal */
export interface FileInputComponentDef extends ComponentDef<"FileInput"> {
  props: {
    /** @descriptionRef */
    placeholder?: string;
    /** @descriptionRef */
    value?: string | string[];
    /** @descriptionRef */
    initialValue?: string | string[];
    /** @descriptionRef */
    autoFocus?: boolean;
    /** @descriptionRef */
    required?: boolean;
    /** @descriptionRef */
    readOnly?: boolean;
    /** @descriptionRef */
    allowCopy?: boolean;
    /**
     * Controls whether the input field is enabled (\`true\`) or disabled (\`false\`).
     * @descriptionRef
     */
    enabled?: string | boolean;
    /**
     * This prop is used to visually indicate status changes reacting to form field validation.
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
    /** @descriptionRef */
    buttonLabel?: string;
    /**
     * This property accepts an icon name.
     * The framework will render an icon if it recognizes the icon name.
     * @descriptionRef
     */
    buttonIcon?: string;
    /**
     * This optional string determines the location of the button icon.
     * @descriptionRef
     */
    buttonIconPosition?: IconPosition;
    /**
     * A list of file types the input controls accepts provided as a string array.
     * @descriptionRef
     */
    acceptsFileType?: string | string[];
    /**
     * This boolean property enables to add not just one (\`false\`), but multiple files to the field (\`true\`).
     * This is done either by dragging onto the field
     * or by selecting multiple files in the browser menu after clicking the input field button.
     * @descriptionRef
     */
    multiple?: boolean;
    /**
     * This boolean property indicates whether the component allows selecting directories (\`true\`)
     * or files only (\`false\`).
     * The default value is \`false\`.
     * @descriptionRef
     * @defaultValue \`false\`
     */
    directory?: boolean;
    /** This optional string property sets the size of the browse button (via paddings).
     * @descriptionRef
     */
    buttonSize?: ComponentSize;
    /**
     * The value of this optional property sets the string to provide a color scheme for the button.
     * @descriptionRef
     */
    buttonThemeColor?: ButtonThemeColor;
    /**
     * The value of this optional property determines the fundamental style of the button.
     * @descriptionRef
     */
    variant?: ButtonVariant;
  };
  events: {
    /**
     * This event is triggered after the user has changed the field value.
     * @descriptionRef
     */
    didChange?: string;
    /**
     * This event is triggered when the \`FileInput\` receives focus.
     * @descriptionRef
     */
    gotFocus?: string;
    /**
     * This event is triggered when the \`FileInput\` loses focus.
     * @descriptionRef
     */
    lostFocus?: string;
  };
  api: {
    /**
     * By setting an ID for the component, you can refer to the value of the field if set.
     * If no value is set, the value will be undefined.
     * @descriptionRef
     */
    value?: string | string[];
    /** @internal */
    setValue?: (newValue: string | string[]) => void; // NOTE: Not implemented yet
    /**
     * This API command triggers a focus event on the input field.
     * @descriptionRef
     */
    focus?: () => void;
    /**
     * This API command triggers the file browsing dialog to open.
     * @descriptionRef
     */
    open?: () => void;
  };
}

const metadata: ComponentDescriptor<FileInputComponentDef> = {
  displayName: "FileInputBox",
  description: "Represents an input component for textual data entry",
  props: {
    ...inputComponentPropertyDescriptors,
    variant: desc("The button variant (solid, outlined, ghost) to use"),
    buttonLabel: desc("The label of the button that opens the file dialog"),
    buttonIcon: desc("The ID of the icon to display in the button"),
    buttonIconPosition: desc("The position of the icon within the button (left, right)"),
    acceptsFileType: desc("A list of file types the open dialog accepts"),
    multiple: desc("Allow selecting multiple files?"),
    directory: desc("Allow selecting a directory?"),
    buttonSize: desc("The size of the button"),
    buttonThemeColor: desc("The theme color of the button"),
  },
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
};

export const fileInputRenderer = createComponentRenderer<FileInputComponentDef>(
  "FileInput",
  ({ node, state, updateState, extractValue, lookupEventHandler, registerComponentApi }) => {
    const iconName = extractValue.asString(node.props.buttonIcon);
    return (
      <FileInput
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        variant={extractValue(node.props.variant)}
        buttonThemeColor={extractValue(node.props.buttonThemeColor)}
        buttonSize={extractValue(node.props.buttonSize)}
        buttonIcon={<Icon name={iconName} />}
        buttonIconPosition={extractValue(node.props.buttonIconPosition)}
        buttonLabel={extractValue.asOptionalString(node.props.buttonLabel)}
        updateState={updateState}
        value={isFileArray(state?.value) ? state?.value : undefined}
        autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        validationStatus={extractValue(node.props.validationStatus)}
        registerComponentApi={registerComponentApi}
        multiple={extractValue.asOptionalBoolean(node.props.multiple)}
        directory={extractValue.asOptionalBoolean(node.props.directory)}
        initialValue={extractValue(node.props.initialValue)}
        acceptsFileType={extractValue(node.props.acceptsFileType)}
      />
    );
  },
  metadata,
);

function isFile(value: any): value is File {
  return value instanceof File;
}

function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.every(isFile);
}
