import { wrapComponent } from "../../runtime/rendering/adapter";
import { FileUploadDropZoneMd } from "./FileUploadDropZone";
import { defaultProps } from "./FileUploadDropZone.defaults";
import { FileUploadDropZone } from "./FileUploadDropZoneReact";

const COMP = "FileUploadDropZone";

export const fileUploadDropZoneRenderer = wrapComponent({
  name: COMP,
  metadata: FileUploadDropZoneMd,
  renderer: ({ adapter }) => {
    const maxFilesValue = adapter.prop("maxFiles");
    const maxFiles =
      typeof maxFilesValue === "number"
        ? maxFilesValue
        : typeof maxFilesValue === "string" && maxFilesValue.trim() !== ""
          ? Number(maxFilesValue)
          : undefined;
    const renderedChildren = adapter.node.children.length > 0 ? adapter.renderChildren() : undefined;

    return (
      <FileUploadDropZone
        {...adapter.rootAttrs()}
        registerComponentApi={adapter.registerApi}
        updateState={(state) => adapter.registerApi(state as Record<string, unknown>)}
        text={adapter.stringProp("text", defaultProps.text)}
        icon={adapter.stringProp("icon", defaultProps.icon)}
        allowPaste={adapter.booleanProp("allowPaste", defaultProps.allowPaste)}
        disabled={!adapter.booleanProp("enabled", true)}
        acceptedFileTypes={adapter.stringProp("acceptedFileTypes")}
        maxFiles={Number.isFinite(maxFiles) ? maxFiles : undefined}
        onUpload={(files) => {
          return adapter.event("upload")(files) as Promise<void>;
        }}
      >
        {renderedChildren}
      </FileUploadDropZone>
    );
  },
});
