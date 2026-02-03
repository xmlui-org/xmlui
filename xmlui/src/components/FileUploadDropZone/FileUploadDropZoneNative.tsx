import type * as React from "react";
import type { CSSProperties, ForwardedRef, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import * as dropzone from "react-dropzone";

import styles from "./FileUploadDropZone.module.scss";
import classnames from "classnames";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { asyncNoop } from "../../components-core/constants";
import { Icon } from "../Icon/IconNative";
import { getComposedRef } from "../component-utils";

// https://github.com/react-dropzone/react-dropzone/issues/1259
const { useDropzone } = dropzone;

// =====================================================================================================================
// React FileUploadDropZone component implementation

type Props = {
  children: ReactNode;
  onUpload: (files: File[]) => void;
  uid?: string;
  registerComponentApi: RegisterComponentApiFn;
  style?: CSSProperties;
  className?: string;
  allowPaste?: boolean;
  text?: string;
  icon?: string;
  disabled?: boolean;
  updateState?: UpdateStateFn;
  acceptedFileTypes?: string;
  maxFiles?: number;
};

export const defaultProps: Pick<
  Props,
  "onUpload" | "uid" | "allowPaste" | "text" | "icon" | "disabled"
> = {
  onUpload: asyncNoop,
  uid: "fileUploadDialog",
  allowPaste: true,
  text: "Drop files here",
  icon: "upload",
  disabled: false,
};

export const FileUploadDropZone = forwardRef(function FileUploadDropZone(
  {
    children,
    onUpload = defaultProps.onUpload,
    uid = defaultProps.uid,
    registerComponentApi,
    style,
    className,
    allowPaste = defaultProps.allowPaste,
    text = defaultProps.text,
    disabled = defaultProps.disabled,
    updateState,
    acceptedFileTypes,
    maxFiles,
    icon = defaultProps.icon,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  //accept is in the format {'image/*': [], 'video/*': []} see https://react-dropzone.js.org/#section-accepting-specific-file-types
  const accept = acceptedFileTypes
    ? acceptedFileTypes.split(",").reduce((acc, type) => ({ ...acc, [type.trim()]: [] }), {})
    : undefined;

  // Store the trace ID that was active when the file picker was opened
  // so we can restore it when onDrop fires (which happens asynchronously after the user selects files)
  const pendingTraceIdRef = useRef<string | undefined>(undefined);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }

      // Restore the trace ID that was active when open() was called
      let prevTrace: string | undefined;
      if (typeof window !== "undefined" && pendingTraceIdRef.current) {
        const w = window as any;
        prevTrace = w._xsCurrentTrace;
        w._xsCurrentTrace = pendingTraceIdRef.current;
      }

      try {
        updateState?.({
          value: acceptedFiles,
        });
        // Must await onUpload since it's an async handler - otherwise our finally
        // block runs before the handler code executes
        await onUpload?.(acceptedFiles);
      } finally {
        // Restore the previous trace
        if (typeof window !== "undefined" && pendingTraceIdRef.current) {
          const w = window as any;
          w._xsCurrentTrace = prevTrace;
          pendingTraceIdRef.current = undefined;
        }
      }
    },
    [onUpload, updateState],
  );

  const { getRootProps, getInputProps, isDragActive, open, inputRef, isDragAccept } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    noDragEventsBubbling: true,
    disabled,
    accept,
    maxFiles,
  });

  const doOpen = useEvent(() => {
    // Capture the current trace ID before opening the file picker
    // The file picker is async - onDrop will fire later when the user selects files
    if (typeof window !== "undefined") {
      pendingTraceIdRef.current = (window as any)._xsCurrentTrace;
    }
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

          // Capture any active trace before dispatching the change event
          // The change event may be handled asynchronously by react-dropzone
          if (typeof window !== "undefined") {
            pendingTraceIdRef.current = (window as any)._xsCurrentTrace;
          }

          //stolen from here: https://github.com/react-dropzone/react-dropzone/issues/1210#issuecomment-1537862105
          (inputRef.current as unknown as HTMLInputElement).files = event.clipboardData.files;
          inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    },
    [allowPaste, inputRef],
  );

  useEffect(() => {
    registerComponentApi({
      open: doOpen,
    });
  }, [doOpen, registerComponentApi, uid]);

  const { ref, ...rootProps } = getRootProps({
    ...rest,
    style,
    className: classnames(styles.wrapper, className),
    onPaste: handleOnPaste,
  } as React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>);

  const rootRef = getComposedRef(ref, forwardedRef);
  return (
    <div {...rootProps} data-drop-enabled={!disabled} ref={rootRef}>
      <input {...getInputProps()} />
      {children}
      {!children && !isDragActive && (
        <div className={classnames(styles.dropPlaceholder)}>
          <Icon name={icon}></Icon>
          {text}
        </div>
      )}
      {isDragActive && isDragAccept && (
        <div className={classnames(styles.dropPlaceholder, styles.onDragActive)}>
          <Icon name={icon}></Icon>
          {text}
        </div>
      )}
    </div>
  );
});
