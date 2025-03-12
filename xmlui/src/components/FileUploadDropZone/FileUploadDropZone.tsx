import styles from "./FileUploadDropZone.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { FileUploadDropZone } from "./FileUploadDropZoneNative";

const COMP = "FileUploadDropZone";

export const FileUploadDropZoneMd = createMetadata({
  description:
    `The \`${COMP}\` component allows users to upload files to a web application by dragging ` +
    `and dropping files from their local file system onto a designated area within the UI.`,
  props: {
    text: {
      description:
        "With this property, you can change the default text to display when files " +
        "are dragged over the drop zone.",
      defaultValue: "Drop files here",
      type: "string",
    },
    allowPaste: {
      description:
        "This property indicates if the drop zone accepts files pasted from the " +
        "clipboard (\`true\`) or " +
        "only dragged files (\`false\`).",
      type: "boolean",
      defaultValue: true,
    },
    enabled: d(
      `If set to \`false\`, the drop zone will be disabled and users will not be able to upload files.`,
      null,
      "boolean",
      true,
    ),
  },
  events: {
    upload: d(
      `This component accepts files for upload but does not perform the actual operation. It fires ` +
        `the \`upload\` event and passes the list files to upload in the method's argument. You can ` +
        `use the passed file information to implement the upload (according to the protocol your ` +
        `backend supports).`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "backgroundColor-FileUploadDropZone": "$backgroundColor",
    "backgroundColor-dropping-FileUploadDropZone": "$backgroundColor--selected",
    "opacity-dropping-FileUploadDropZone": "0.5",
    "textColor-FileUploadDropZone": "$textColor",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const fileUploadDropZoneComponentRenderer = createComponentRenderer(
  COMP,
  FileUploadDropZoneMd,
  ({ node, extractValue, renderChild, lookupEventHandler, registerComponentApi, layoutCss }) => {
    return (
      <FileUploadDropZone
        onUpload={lookupEventHandler("upload")!}
        uid={extractValue(node.uid)}
        registerComponentApi={registerComponentApi}
        style={layoutCss}
        allowPaste={extractValue(node.props.allowPaste)}
        text={extractValue(node.props.text)}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
      >
        {renderChild(node.children, { type: "Stack" })}
      </FileUploadDropZone>
    );
  },
);
