import {
  createMetadata,
  dEnabled,
} from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./FileUploadDropZone.defaults";
import { FileUploadDropZoneNative } from "./FileUploadDropZoneReact";

const COMP = "FileUploadDropZone";

const fileUploadDropZoneStylesSource = `
$borderRadius-FileUploadDropZone: createThemeVar("borderRadius-FileUploadDropZone");
$borderColor-FileUploadDropZone: createThemeVar("borderColor-FileUploadDropZone");
$borderWidth-FileUploadDropZone: createThemeVar("borderWidth-FileUploadDropZone");
$borderStyle-FileUploadDropZone: createThemeVar("borderStyle-FileUploadDropZone");
$backgroundColor-FileUploadDropZone: createThemeVar("backgroundColor-FileUploadDropZone");
$textColor-FileUploadDropZone: createThemeVar("textColor-FileUploadDropZone");
$textColor-dropping-FileUploadDropZone: createThemeVar("textColor-dropping-FileUploadDropZone");
$backgroundColor-dropping-FileUploadDropZone: createThemeVar("backgroundColor-dropping-FileUploadDropZone");
$opacity-dropping-FileUploadDropZone: createThemeVar("opacity-dropping-FileUploadDropZone");
`;

export const FileUploadDropZoneMd = createMetadata({
  status: "stable",
  description:
    "`FileUploadDropZone` enables users to upload files by dragging and dropping files onto a designated area.",
  parts: {
    dropPlaceholder: { description: "The default drop-zone placeholder shown when no children are supplied." },
  },
  defaultPart: "root",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    text: {
      description: "The default text displayed in the drop zone.",
      defaultValue: defaultProps.text,
      valueType: "string",
    },
    icon: {
      description: "The icon name displayed in the default drop-zone placeholder.",
      defaultValue: defaultProps.icon,
      valueType: "icon",
    },
    allowPaste: {
      description: "Indicates whether the drop zone accepts pasted files.",
      valueType: "boolean",
      defaultValue: defaultProps.allowPaste,
    },
    enabled: dEnabled(defaultProps.enabled),
    acceptedFileTypes: {
      description: "Accepted file MIME types, separated by commas.",
      valueType: "string",
    },
    maxFiles: {
      description: "The maximum number of files that can be accepted.",
      valueType: "integer",
    },
  },
  events: {
    upload: {
      description: "Fired when files are accepted by the drop zone.",
      signature: "upload(files: File[]): void",
      parameters: {
        files: "An array of File objects to be uploaded.",
      },
    },
  },
  apis: {
    open: {
      description: "Triggers the file browsing dialog to open.",
      signature: "open(): void",
    },
  },
  themeVars: extractScssThemeVars(fileUploadDropZoneStylesSource),
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
  },
});

export const fileUploadDropZoneRenderer = wrapComponent({
  name: COMP,
  metadata: FileUploadDropZoneMd,
  renderer: ({ adapter }) => (
    <FileUploadDropZoneNative
      {...adapter.rootAttrs()}
      registerApi={adapter.registerApi as (api: { open: () => void }) => void}
      text={adapter.stringProp("text", defaultProps.text)}
      icon={adapter.stringProp("icon", defaultProps.icon)}
      allowPaste={adapter.booleanProp("allowPaste", defaultProps.allowPaste)}
      enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
      acceptedFileTypes={adapter.stringProp("acceptedFileTypes")}
      maxFiles={adapter.numberProp("maxFiles", 0)}
      onUpload={(files) => {
        void adapter.event("upload")(files);
      }}
    >
      {adapter.renderChildren()}
    </FileUploadDropZoneNative>
  ),
});
