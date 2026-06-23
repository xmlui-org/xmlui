import type { ClipboardEvent, CSSProperties, DragEvent, ReactNode } from "react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { defaultProps } from "./FileUploadDropZone.defaults";

const styles = {
  fileUploadDropZoneDropping: "fileUploadDropZoneDropping",
  fileUploadDropZoneIcon: "fileUploadDropZoneIcon",
  fileUploadDropZoneInput: "fileUploadDropZoneInput",
  fileUploadDropZonePlaceholder: "fileUploadDropZonePlaceholder",
  fileUploadDropZoneRoot: "fileUploadDropZoneRoot",
} as const;

export type FileUploadDropZoneApi = {
  open: () => void;
};

export type FileUploadDropZoneProps = {
  children?: ReactNode;
  text?: string;
  icon?: string;
  allowPaste?: boolean;
  enabled?: boolean;
  disabled?: boolean;
  acceptedFileTypes?: string;
  maxFiles?: number;
  className?: string;
  style?: CSSProperties;
  onUpload?: (files: File[]) => void | Promise<void>;
  registerApi?: (api: FileUploadDropZoneApi) => void;
  "data-testid"?: string;
};

export const FileUploadDropZoneNative = memo(forwardRef<FileUploadDropZoneApi, FileUploadDropZoneProps>(
  function FileUploadDropZoneNative(
    {
      children,
      text = defaultProps.text,
      icon = defaultProps.icon,
      allowPaste = defaultProps.allowPaste,
      enabled = defaultProps.enabled,
      disabled,
      acceptedFileTypes,
      maxFiles,
      className,
      style,
      onUpload,
      registerApi,
      "data-testid": dataTestId,
      ...rest
    },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const interactive = enabled && disabled !== true;
    const accept = normalizeAccept(acceptedFileTypes);

    const commitFiles = useCallback((incomingFiles: File[]) => {
      if (!interactive) {
        return;
      }
      const acceptedFiles = filterAcceptedFiles(incomingFiles, accept);
      const limitedFiles = typeof maxFiles === "number" && maxFiles > 0
        ? acceptedFiles.slice(0, maxFiles)
        : acceptedFiles;
      if (limitedFiles.length > 0) {
        void onUpload?.(limitedFiles);
      }
    }, [accept, interactive, maxFiles, onUpload]);

    const open = useCallback(() => {
      if (interactive) {
        inputRef.current?.click();
      }
    }, [interactive]);

    useImperativeHandle(ref, () => ({ open }), [open]);
    useEffect(() => {
      registerApi?.({ open });
    }, [open, registerApi]);

    const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
      commitFiles(Array.from(event.dataTransfer.files ?? []));
    }, [commitFiles]);

    const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
      if (!interactive) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDragActive(true);
    }, [interactive]);

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
      if (!interactive) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDragActive(true);
    }, [interactive]);

    const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setDragActive(false);
    }, []);

    const handleInputChange = useCallback(() => {
      commitFiles(Array.from(inputRef.current?.files ?? []));
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }, [commitFiles]);

    const handlePaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
      if (!allowPaste || !interactive || isTextEditingTarget(event.target)) {
        return;
      }
      const files = filesFromClipboard(event);
      if (files.length === 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      commitFiles(files);
    }, [allowPaste, commitFiles, interactive]);

    const hasChildren = Array.isArray(children)
      ? children.length > 0
      : children !== undefined && children !== null;

    return (
      <div
        {...rest}
        data-drop-enabled={String(interactive)}
        data-testid={dataTestId}
        className={cx(styles.fileUploadDropZoneRoot, className)}
        style={style}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
      >
        <input
          ref={inputRef}
          className={styles.fileUploadDropZoneInput}
          type="file"
          accept={acceptedFileTypes}
          multiple={maxFiles !== 1}
          disabled={!interactive}
          onChange={handleInputChange}
        />
        {children}
        {!hasChildren ? (
          <div
            data-part-id="dropPlaceholder"
            data-xmlui-part="dropPlaceholder"
            className={cx(
              styles.fileUploadDropZonePlaceholder,
              dragActive ? styles.fileUploadDropZoneDropping : undefined,
            )}
          >
            {icon ? <span aria-hidden="true" data-icon={icon} className={styles.fileUploadDropZoneIcon} /> : null}
            {text}
          </div>
        ) : null}
      </div>
    );
  },
));

function normalizeAccept(value: string | undefined): string[] {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? [];
}

function filterAcceptedFiles(files: File[], accept: string[]): File[] {
  if (accept.length === 0) {
    return files;
  }
  return files.filter((file) =>
    accept.some((entry) =>
      entry.endsWith("/*")
        ? file.type.startsWith(entry.slice(0, -1))
        : entry.startsWith(".")
          ? file.name.toLowerCase().endsWith(entry.toLowerCase())
          : file.type === entry,
    ),
  );
}

function isTextEditingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable);
}

function filesFromClipboard(event: ClipboardEvent): File[] {
  const items = Array.from(event.clipboardData?.items ?? []);
  const files = items
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
  return files.length > 0 ? files : Array.from(event.clipboardData?.files ?? []);
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
