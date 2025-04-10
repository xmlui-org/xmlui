import React, { useMemo, useEffect, CSSProperties } from "react";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { createMonacoWrapperConfig } from "./config/monacoWrapperConfig.js";
import { BrowserMessageReader, BrowserMessageWriter } from "vscode-languageclient/browser.js";

import workerUrl from "xmlui/language-server-web-worker?worker&url";

export type EditorProps = {
  readOnly?: boolean;
  language?: string;
  style?: CSSProperties;
  value?: string;
  saveViewState?: boolean;
  onChange?: any;
  onMount?: any;
  activeThemeTone?: string;
};

function createWorkerSetup() {
  const worker = new Worker(workerUrl, {
    type: "module",
    name: "Xmlui Language Server",
  });
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);

  const { dispose: disposeMsgListener } = reader.listen((message) => {
    console.log("Received message from worker:", message);
  });

  return { worker, reader, writer, disposeMsgListener };
}

export function Editor(props: any) {
  const { worker, reader, writer, disposeMsgListener } = useMemo(() => createWorkerSetup(), []);

  useEffect(() => {
    return () => {
      disposeMsgListener();
      worker.terminate();
    };
  }, [worker, disposeMsgListener]);
  const wrapperConfig = useMemo(
    () =>
      createMonacoWrapperConfig({
        languageServerId: "xmlui",
        useLanguageClient: true,
        codeContent: {
          text: props.text,
          uri: "/workspace/example.xmlui",
        },
        worker,
        messageTransports: { reader, writer },
        htmlContainer: document.getElementById("monaco-editor-root")!,
      }),
    [worker, reader, writer, props.text],
  );

  return <MonacoEditorReactComp style={{ height: "100%" }} wrapperConfig={wrapperConfig} />;
}
