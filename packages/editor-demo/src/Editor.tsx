import React from "react";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { createMonacoWrapperConfig } from "./config/monacoWrapperConfig.js";
import { BrowserMessageReader, BrowserMessageWriter } from "vscode-languageclient/browser.js";

import workerUrl from "xmlui/language-server-web-worker?worker&url";

export default function Editor(props: any) {
  const worker = new Worker(workerUrl, {
    type: "module",
    name: "Xmlui Language Server",
  });
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);
  reader.listen((message) => {
    console.log("Received message from worker:", message);
  });
  const wrapperConfig = createMonacoWrapperConfig({
    languageServerId: "xmlui",
    useLanguageClient: true,
    codeContent: {
      text: props.text,
      uri: "/workspace/example.xmlui",
    },
    worker,
    messageTransports: { reader, writer },
    htmlContainer: document.getElementById("monaco-editor-root")!,
  });
  return <MonacoEditorReactComp style={{ height: "100%" }} wrapperConfig={wrapperConfig} />;
}
