import styles from "./FileInput.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  d,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLabel,
  dLabelBreak,
  dLabelPosition,
  dLabelWidth,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../../components/metadata-helpers";
import { buttonThemeNames, buttonVariantNames, iconPositionNames, sizeMd } from "../abstractions";
import { Icon } from "../Icon/IconNative";
import { FileInput, isFileArray, defaultProps } from "./FileInputNative";

const COMP = "FileInput";
const DEFAULT_ICON = "browse:FileInput";

export const FileInputMd = createMetadata({
  status: "stable",
  description:
    "`FileInput` enables users to select files from their device's file system for " +
    "upload or processing. It combines a text field displaying selected files with " +
    "a customizable button that opens the system file browser. Use it for forms, " +
    "media uploads, and document processing workflows.",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    label: dLabel(),
    labelPosition: dLabelPosition("top"),
    labelWidth: dLabelWidth(COMP),
    labelBreak: dLabelBreak(COMP),
    buttonVariant: d("The button variant to use", buttonVariantNames),
    buttonLabel: d(`This property is an optional string to set a label for the button part.`),
    buttonIcon: d(
      `The ID of the icon to display in the button. You can change the default icon for all ${COMP} ` +
        `instances with the "icon.browse:FileInput" declaration in the app configuration file.`,
    ),
    buttonIconPosition: d(
      `This optional string determines the location of the button icon.`,
      iconPositionNames,
      "string",
      "start",
    ),
    acceptsFileType: d(
      `An optional list of file types the input controls accepts provided as a string array.`,
    ),
    multiple: {
      ...d(
        `This boolean property enables to add not just one (\`false\`), but multiple files to the field ` +
          `(\`true\`). This is done either by dragging onto the field or by selecting multiple files ` +
          `in the browser menu after clicking the input field button.`,
        null,
        "boolean",
      ),
      defaultValue: defaultProps.multiple,
    },
    directory: {
      ...d(
        `This boolean property indicates whether the component allows selecting directories (\`true\`) ` +
          `or files only (\`false\`).`,
        null,
        "boolean",
      ),
      defaultValue: defaultProps.directory,
    },
    buttonPosition: {
      ...d(`This property determines the position of the button relative to the input field.`, [
        "start",
        "end",
      ]),
      defaultValue: defaultProps.buttonPosition,
    },
    buttonSize: d("The size of the button (small, medium, large)", sizeMd),
    buttonThemeColor: d(
      "The button color scheme (primary, secondary, attention)",
      buttonThemeNames,
      "string",
      defaultProps.buttonThemeColor,
    ),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    value: {
      description: "This property holds the current value of the component, which is an array of files.",
      signature: "get value(): File[]",
    },
    setValue: {
      description: "This method sets the current value of the component.",
      signature: "setValue(files: File[]): void",
      parameters: {
        files: "An array of File objects to set as the current value of the component.",
      },
    },
    focus: {
      description: "This API command focuses the input field of the component.",
      signature: "focus(): void",
    },
    open: {
      description: "This API command triggers the file browsing dialog to open.",
      signature: "open(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const fileInputRenderer = createComponentRenderer(
  COMP,
  FileInputMd,
  ({ node, state, updateState, extractValue, lookupEventHandler, registerComponentApi }) => {
    const iconName = extractValue.asOptionalString(node.props.buttonIcon) || DEFAULT_ICON;
    return (
      <FileInput
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        variant={extractValue(node.props.buttonVariant)}
        buttonThemeColor={extractValue(node.props.buttonThemeColor)}
        buttonSize={extractValue(node.props.buttonSize)}
        buttonIcon={<Icon name={iconName} fallback="folder-open" />}
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
        placeholder={extractValue.asOptionalString(node.props.placeholder)}
        buttonPosition={extractValue.asOptionalString(node.props.buttonPosition)}
        initialValue={extractValue(node.props.initialValue)}
        acceptsFileType={extractValue(node.props.acceptsFileType)}
        label={extractValue.asOptionalString(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        labelWidth={extractValue.asOptionalString(node.props.labelWidth)}
        labelBreak={extractValue.asOptionalBoolean(node.props.labelBreak)}
        required={extractValue.asOptionalBoolean(node.props.required)}
      />
    );
  },
);
