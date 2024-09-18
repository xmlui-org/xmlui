import { Icon } from "@components/Icon/IconNative";
import styles from "./FileInput.module.scss";
import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import {
  buttonThemeNames,
  buttonVariantNames,
  iconPositionNames,
  sizeMd,
} from "@components/abstractions";
import { FileInput, isFileArray } from "./FileInputNative";
import {
  dAutoFocus,
  dDidChange,
  dEnabled,
  dFocus,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "@components/metadata-helpers";

const COMP = "FileInput";

export const FileInputMd = createMetadata({
  description:
    `The \`${COMP}\` is a user interface component that allows users to select files from their ` +
    `device's file system for upload (or processing its content otherwise).`,
  status: "experimental",
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    buttonVariant: d("The button variant to use", buttonVariantNames),
    buttonLabel: d(`This property is an optional string to set a label for the button part.`),
    buttonIcon: d("The ID of the icon to display in the button"),
    buttonIconPosition: d(
      `This optional string determines the location of the button icon.`,
      iconPositionNames,
    ),
    acceptsFileType: d(
      `A list of file types the input controls accepts provided as a string array.`,
    ),
    multiple: d(
      `This boolean property enables to add not just one (\`false\`), but multiple files to the field ` +
        `(\`true\`). This is done either by dragging onto the field or by selecting multiple files ` +
        `in the browser menu after clicking the input field button.`,
      null,
      "boolean",
      false,
    ),
    directory: d(
      `This boolean property indicates whether the component allows selecting directories (\`true\`) ` +
        `or files only (\`false\`).`,
      null,
      "boolean",
      false,
    ),
    buttonSize: d("The size of the button (small, medium, large)", sizeMd),
    buttonThemeColor: d(
      "The button color scheme (primary, secondary, attention)",
      buttonThemeNames,
    ),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    value: d(
      `By setting an ID for the component, you can refer to the value of the field if set. ` +
        `If no value is set, the value will be undefined.`,
    ),
    setValue: d(
      `(**NOT IMPLEMENTED YET**) You can use this method to set the component's ` +
        `current value programmatically.`,
    ),
    focus: dFocus(COMP),
    open: d(`This API command triggers the file browsing dialog to open.`),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const fileInputRenderer = createComponentRenderer(
  COMP,
  FileInputMd,
  ({ node, state, updateState, extractValue, lookupEventHandler, registerComponentApi }) => {
    const iconName = extractValue.asString(node.props.buttonIcon);
    return (
      <FileInput
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        variant={extractValue(node.props.buttonVariant)}
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
);
