import styles from "./FileUploadDropZone.module.scss";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { FileUploadDropZone } from "./FileUploadDropZoneNative";

const COMP = "FileUploadDropZone";

export const FileUploadDropZoneMd = createMetadata({
  description:
    `The \`${COMP}\` component allows users to upload files to a web application by dragging ` +
    `and dropping files from their local file system onto a designated area within the UI.`,
  props: {
    text: d(
      `With this property, you can change the default text ("Drop files here") to display when files ` +
        `are dragged over the drop zone.`,
    ),
    allowPaste: d(
      `This property indicates if the drop zone accepts files pasted from the clipboard (\`true\`) or ` +
        `only dragged files (\`false\`).`,
    ),
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
    "color-bg-FileUploadDropZone": "$color-bg",
    "color-bg-dropping-FileUploadDropZone": "$color-bg--selected",
    "opacity-dropping-FileUploadDropZone": "0.5",
    "color-text-FileUploadDropZone": "$color-text",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

export const fileUploadDropZoneComponentRenderer = createComponentRendererNew(
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
