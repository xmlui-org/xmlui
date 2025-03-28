import type {
  TextContents,
  // WrapperConfig,
  // MonacoEditorLanguageClientWrapper,
} from "monaco-editor-wrapper";
import { createLangiumGlobalConfig } from "./config/wrapperStatemachineConfig";
import workerUrl from "./worker/statemachine-server?worker&url";
// import workerUrl from "xmlui/language-server-web-worker?worker&url";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { BrowserMessageReader, BrowserMessageWriter } from "vscode-languageclient/browser.js";

const worker = new Worker(workerUrl, {
  type: "module",
  name: "Statemachine Server Regular",
});
const reader = new BrowserMessageReader(worker);
const writer = new BrowserMessageWriter(worker);

const wrapperConfig = createLangiumGlobalConfig({
  languageServerId: "react",
  useLanguageClient: true,
  codeContent: {
    text: "<Button >hi</Button>",
    uri: "/workspace/Main.statemachine",
  },
  worker,
  messageTransports: { reader, writer },
  //Maybe no need for it
  htmlContainer: document.getElementById("monaco-editor-root")!,
});

const onTextChanged = (textChanges: TextContents) => {
  console.log(`text: ${textChanges.modified}\ntextOriginal: ${textChanges.original}`);
};
export const Editor = () => {
  return (
    <MonacoEditorReactComp
      style={{ height: "100%" }}
      wrapperConfig={wrapperConfig}
      onTextChanged={onTextChanged}
    />
  );
};
