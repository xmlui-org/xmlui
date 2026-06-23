import { wrapComponent } from "../../runtime/rendering/adapter";
import { FileUploadDropZoneMd } from "./FileUploadDropZone";
import { defaultProps } from "./FileUploadDropZone.defaults";
import { FileUploadDropZoneNative } from "./FileUploadDropZoneReact";

const COMP = "FileUploadDropZone";

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
