import React from "react";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { createLangiumGlobalConfig } from "./config/wrapperStatemachineConfig.js";
import { BrowserMessageReader, BrowserMessageWriter } from "vscode-languageclient/browser.js";

import workerUrl from "xmlui/language-server-web-worker?worker&url";

const text = "<Button />";
export default function Editor() {
  const worker = new Worker(workerUrl, {
    type: "module",
    name: "Xmlui Language Server",
  });
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);
  reader.listen((message) => {
    console.log("Received message from worker:", message);
  });
  const wrapperConfig = createLangiumGlobalConfig({
    languageServerId: "react",
    useLanguageClient: true,
    codeContent: {
      text,
      uri: "/workspace/example.statemachine",
    },
    worker,
    messageTransports: { reader, writer },
    htmlContainer: document.getElementById("monaco-editor-root")!,
  });
  return <MonacoEditorReactComp style={{ height: "100%" }} wrapperConfig={wrapperConfig} />;
}
