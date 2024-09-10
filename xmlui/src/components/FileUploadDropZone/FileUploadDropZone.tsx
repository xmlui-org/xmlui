import { CSSProperties, ReactNode, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@components/Icon/Icon";
import styles from "./FileUploadDropZone.module.scss";
import { useEvent } from "@components-core/utils/misc";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { asyncNoop } from "@components-core/constants";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// =====================================================================================================================
// React FileUploadDropZone component implementation

type Props = {
  children: ReactNode;
  onUpload: (files: File[]) => void;
  uid?: string;
  registerComponentApi: RegisterComponentApiFn;
  style?: CSSProperties;
  allowPaste?: boolean;
  text?: string;
  disabled?: boolean;
};

function FileUploadDropZone({
  children,
  onUpload = asyncNoop,
  uid = "fileUploadDialog",
  registerComponentApi,
  style,
  allowPaste = true,
  text = "Drop files here",
  disabled = false,
}: Props) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }
      onUpload?.(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, open, inputRef } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    noDragEventsBubbling: true,
    disabled,
  });

  const doOpen = useEvent(() => {
    open();
  });

  const handleOnPaste = useCallback(
    (event: React.ClipboardEvent) => {
      if (!allowPaste) {
        return;
      }
      if (!inputRef.current) {
        return;
      }
      if (event.clipboardData?.files) {
        const items = event.clipboardData?.items || [];
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file !== null) {
              files.push(file);
            }
          }
        }
        if (files.length > 0) {
          //the clipboardData.files doesn't necessarily contains files... so we have to double check it
          event.stopPropagation(); //it's for nested file upload dropzones
          event.preventDefault(); // and this one is for preventing to paste in the file name, if we a have stored file on the clipboard (copied from finder/windows explorer for example)

          //stolen from here: https://github.com/react-dropzone/react-dropzone/issues/1210#issuecomment-1537862105
          (inputRef.current as unknown as HTMLInputElement).files = event.clipboardData.files;
          inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    },
    [allowPaste, inputRef]
  );

  useEffect(() => {
    registerComponentApi({
      open: doOpen,
    });
  }, [doOpen, registerComponentApi, uid]);

  return (
    <div {...getRootProps()} style={style} className={styles.wrapper} onPaste={handleOnPaste}>
      <input {...getInputProps()} />
      {children}
      {isDragActive && (
        <div className={styles.dropPlaceholder}>
          <Icon name={"upload"}></Icon>
          {text}
        </div>
      )}
    </div>
  );
}

// =====================================================================================================================
// XMLUI AppHeader component definition

/**
 * The \`FileUploadDropZone\` component allows users to upload files to a web application by dragging 
 * and dropping files from their local file system onto a designated area within the UI.
 */
export interface FileUploadDropZoneComponentDef extends ComponentDef<"FileUploadDropZone"> {
  props: {
    /**
     * With this property, you can change the default text ("Drop files here") to display when 
     * files are dragged over the drop zone.
     */
    text?: string;
    /** @descriptionRef */
    allowPaste?: boolean;
    /**
     * If set to \`false\`, the drop zone will be disabled and users will not be able to upload files.
     */
    enabled?: boolean;
  };
  events: {
    /**
     * This component accepts files for upload but does not perform the actual operation. It fires the 
     * \`upload\` event and passes the list files to upload in the method's argument. You can use the 
     * passed file information to implement the upload (according to the protocol your backend supports).
     *
     * Each item passed in the event argument is an instance of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).
     */
    upload: string;
  };
}

export const FileUploadDropZoneMd: ComponentDescriptor<FileUploadDropZoneComponentDef> = {
  displayName: "FileUploadDropZone",
  description: "A screen area to drop files to upload",
  props: {
    text: desc("Text to display"),
    allowPaste: desc("Allow paste files?"),
    enabled: desc("Is the drop zone enabled?"),
  },
  events: {
    upload: desc("Triggered when a file is about to upload"),
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
};

export const fileUploadDropZoneComponentRenderer = createComponentRenderer<FileUploadDropZoneComponentDef>(
  "FileUploadDropZone",
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
        {renderChild(node.children, { type: "Stack"})}
      </FileUploadDropZone>
    );
  },
  FileUploadDropZoneMd
);
