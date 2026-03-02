import React, { useCallback, useEffect, useRef } from "react";
import { forwardRef } from "react";
import Editor from "@monaco-editor/react";

/**
 * Pure React code editor. No XMLUI imports.
 * Receives `value`, `onChange`, `registerApi` from wrapCompound's StateWrapper.
 */
export const CodeEditorRender = forwardRef(({
  value, onChange, registerApi, className,
  language = "javascript",
  theme = "vs-dark",
  height = "300px",
  readOnly = false,
  minimap = true,
  lineNumbers = true,
  wordWrap = false,
  ...rest
}: any, ref: any) => {
  const editorRef = useRef<any>(null);

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    registerApi?.({
      focus: () => editorRef.current?.focus(),
      setValue: (v: any) => onChange?.(String(v ?? "")),
      getValue: () => editorRef.current?.getValue() ?? "",
    });
  }, [registerApi, onChange]);

  // Update Monaco options dynamically when props change
  useEffect(() => {
    editorRef.current?.updateOptions({
      readOnly,
      minimap: { enabled: minimap },
      lineNumbers: lineNumbers ? "on" : "off",
      wordWrap: wordWrap ? "on" : "off",
    });
  }, [readOnly, minimap, lineNumbers, wordWrap]);

  const handleChange = useCallback((newValue: string | undefined) => {
    if (readOnly) return;
    onChange(newValue ?? "");
  }, [onChange, readOnly]);

  return (
    <div ref={ref} className={className} {...rest}>
      <Editor
        height={height}
        language={language}
        theme={theme}
        value={value ?? ""}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: minimap },
          lineNumbers: lineNumbers ? "on" : "off",
          wordWrap: wordWrap ? "on" : "off",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
});

CodeEditorRender.displayName = "CodeEditorRender";
