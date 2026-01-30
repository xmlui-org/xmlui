import styles from "./FileUploadDropZone.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { FileUploadDropZone, defaultProps } from "./FileUploadDropZoneNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "FileUploadDropZone";

export const FileUploadDropZoneMd = createMetadata({
  status: "stable",
  description:
    "`FileUploadDropZone` enables users to upload files by dragging and dropping " +
    "files from their local file system onto a designated area within the UI.",
  props: {
    text: {
      description: "With this property, you can change the default text to display in the drop zone.",
      defaultValue: defaultProps.text,
      type: "string",
    },
    allowPaste: {
      description:
        "This property indicates if the drop zone accepts files pasted from the " +
        "clipboard (\`true\`) or " +
        "only dragged files (\`false\`).",
      type: "boolean",
      defaultValue: defaultProps.allowPaste,
    },
    enabled: d(
      `If set to \`false\`, the drop zone will be disabled and users will not be able to upload files.`,
      null,
      "boolean",
      true,
    ),
    acceptedFileTypes: d(`Accepted file MIME types, separated by commas. For example: 'image/*,application/pdf'.`),
    maxFiles: d(`The maximum number of files that can be selected.`),
  },
  events: {
    upload: {
      description:
        `This component accepts files for upload but does not perform the actual operation. It fires ` +
        `the \`upload\` event and passes the list files to upload in the method's argument. You can ` +
        `use the passed file information to implement the upload (according to the protocol your ` +
        `backend supports).`,
      signature: "upload(files: File[]): void",
      parameters: {
        files: "An array of File objects to be uploaded.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "backgroundColor-FileUploadDropZone": "$backgroundColor",
    "backgroundColor-dropping-FileUploadDropZone": "$backgroundColor--selected",
    "opacity-dropping-FileUploadDropZone": "0.3",
    "textColor-FileUploadDropZone": "$textColor-secondary",
    "textColor-dropping-FileUploadDropZone": "$color-primary-700",
    "borderStyle-FileUploadDropZone": "dashed",
    "borderColor-FileUploadDropZone": "$color-secondary-200",
    "borderWidth-FileUploadDropZone": "2px",
    "borderRadius-FileUploadDropZone": "$borderRadius",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      "backgroundColor-dropping-FileUploadDropZone": "$color-primary-300",
    },
  },
});

export const fileUploadDropZoneComponentRenderer = createComponentRenderer(
  COMP,
  FileUploadDropZoneMd,
  ({ node, extractValue, updateState, renderChild, lookupEventHandler, registerComponentApi, className }) => {
    return (
      <FileUploadDropZone
        onUpload={lookupEventHandler("upload")!}
        uid={extractValue(node.uid)}
        registerComponentApi={registerComponentApi}
        className={className}
        allowPaste={extractValue(node.props.allowPaste)}
        text={extractValue(node.props.text)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
        updateState={updateState}
        acceptedFileTypes={extractValue.asOptionalString(node.props.acceptedFileTypes)}
        maxFiles={extractValue.asOptionalNumber(node.props.maxFiles)}
      >
        {renderChild(node.children, { type: "Stack" })}
      </FileUploadDropZone>
    );
  },
);
