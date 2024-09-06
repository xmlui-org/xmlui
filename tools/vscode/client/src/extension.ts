import * as path from "path";
import { ExtensionContext } from "vscode";

import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // ======================
  // commented out, the language server isn't ready for release
  // ======================
  // // The server path.
  // const serverModule = context.asAbsolutePath(
  //   path.join('server', 'out', 'server.js'),
  // );
  // // If the extension is launched in debug mode then the debug server options are used.
  // // Otherwise the run options are used.
  // const serverOptions: ServerOptions = {
  //   run: { module: serverModule, transport: TransportKind.ipc },
  //   debug: {
  //     module: serverModule,
  //     transport: TransportKind.ipc,
  //   },
  // };
  //
  // // Options to control the language client.
  // const clientOptions: LanguageClientOptions = {
  //   documentSelector: [
  //     { scheme: 'untitled', language: 'xmlui' },
  //     { scheme: 'file', language: 'xmlui' },
  //   ],
  // };
  //
  // // Create the language client.
  // client = new LanguageClient(
  //   'vscodeXMLUILanguageservice',
  //   'VSCode XMLUI Languageservice',
  //   serverOptions,
  //   clientOptions,
  // );
  //
  // // Start the client. This will also launch the server.
  // client.start();
  //
  // // Send the extension path to the server.
  // void client.sendRequest('SET_EXTENSION_PATH', context.extensionPath);
}

// export function deactivate(): Thenable<void> | undefined {
export function deactivate() {
  // if (!client) {
  //   return undefined;
  // }
  // return client.stop();
}
