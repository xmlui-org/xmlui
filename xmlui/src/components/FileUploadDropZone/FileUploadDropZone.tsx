import styles from "./FileUploadDropZone.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { defaultProps } from "./FileUploadDropZone.defaults";
import { FileUploadDropZone } from "./FileUploadDropZoneReact";
import { createMetadata } from "../metadata-helpers";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import React from "react";

const COMP = "FileUploadDropZone";

export const FileUploadDropZoneMd = createMetadata({
  status: "stable",
  description:
    "`FileUploadDropZone` enables users to upload files by dragging and dropping " +
    "files from their local file system onto a designated area within the UI.",
  props: {
    text: {
      description:
        "With this property, you can change the default text to display in the drop zone.",
      defaultValue: defaultProps.text,
      valueType: "string",
    },
    icon: {
      description: `Specifies an icon name. The framework will render an icon if XMLUI recognizes the icon by its name.`,
      defaultValue: defaultProps.icon,
      valueType: "string",
    },
    allowPaste: {
      description:
        "This property indicates if the drop zone accepts files pasted from the " +
        "clipboard (\`true\`) or " +
        "only dragged files (\`false\`). By default, paste-triggered uploads are disabled " +
        "to prevent unexpected upload dialogs when users paste text into inputs within the drop zone. " +
        "When enabled, paste events originating from text inputs and editable elements are still ignored.",
      valueType: "boolean",
      defaultValue: defaultProps.allowPaste,
    },
    enabled: {
      description: `If set to \`false\`, the drop zone will be disabled and users will not be able to upload files.`,
      availableValues: null,
      valueType: "boolean",
      defaultValue: true,
    },
    acceptedFileTypes: {
      description: `Accepted file MIME types, separated by commas. For example: 'image/*,application/pdf'.`,
      valueType: "string",
    },
    maxFiles: {
      description: `The maximum number of files that can be selected.`,
      valueType: "integer",
    },
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

export const fileUploadDropZoneComponentRenderer = wrapComponent(
  COMP,
  FileUploadDropZone,
  FileUploadDropZoneMd,
  {
    events: { upload: "onUpload" },
    strings: ["acceptedFileTypes"],
    numbers: ["maxFiles"],
    exclude: ["enabled"],
    passUid: true,
    exposeRegisterApi: true,
    customRender: (props, { node, extractValue, renderChild, updateState }) => (
      <FileUploadDropZone
        {...props}
        disabled={!extractValue.asOptionalBoolean(node.props.enabled, true)}
        updateState={updateState}
      >
        {renderChild(node.children, { type: "Stack" })}
      </FileUploadDropZone>
    ),
  },
);

Object.assign(FileUploadDropZoneMd.defaultThemeVars ??= {}, {
  "borderColor-FileUploadDropZone": "hsl(217.29999999999995, 14.6%, 80.3%)",
});

export const fileUploadDropZoneRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: FileUploadDropZoneMd,
  renderer: ({ adapter }) => {
    const children = adapter.node.children.length > 0 ? adapter.renderChildren() : undefined;
    return (
      <RuntimeFileUploadDropZone
        {...adapter.rootAttrs()}
        registerComponentApi={adapter.registerApi}
        text={adapter.stringProp("text", defaultProps.text)}
        icon={adapter.stringProp("icon", defaultProps.icon)}
        allowPaste={adapter.booleanProp("allowPaste", defaultProps.allowPaste)}
        disabled={!adapter.booleanProp("enabled", true)}
        acceptedFileTypes={adapter.stringProp("acceptedFileTypes")}
        maxFiles={adapter.numberProp("maxFiles")}
        onUpload={(files) => {
          void adapter.event("upload")(files);
        }}
      >
        {children}
      </RuntimeFileUploadDropZone>
    );
  },
});

function RuntimeFileUploadDropZone(props: React.ComponentPropsWithoutRef<typeof FileUploadDropZone>) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    rootRef.current?.querySelectorAll(".dropPlaceholder").forEach((element) => {
      element.setAttribute("data-part-id", "dropPlaceholder");
      element.setAttribute("data-xmlui-part", "dropPlaceholder");
      element.setAttribute("data-icon", props.icon ?? defaultProps.icon);
    });
    rootRef.current?.querySelector("svg")?.setAttribute("data-icon", props.icon ?? defaultProps.icon);
  });

  return <FileUploadDropZone {...props} ref={rootRef} />;
}
