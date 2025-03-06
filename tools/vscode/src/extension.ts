import * as path from 'path';
import { ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  // const serverModule = context.asAbsolutePath(

  const serverModule = path.normalize(
    require.resolve('xmlui/xmlui-language-server')
    // tried, but not working
    // require.resolve('xmlui/dist/scripts/bin/language-server.js')
    // require.resolve('xmlui/xmlui-language-server')
    // require.resolve('xmlui/bin/xmlui-language-server')
    // require.resolve('xmlui/bin/language-server.js')
    // require.resolve('xmlui-language-server')
  );
  console.log({ serverModule });

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
  		{ scheme: 'untitled', language: 'xmlui' },
      { scheme: 'file', language: 'xmlui' },
      { scheme: 'file', language: 'plaintext' },
		]
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'XMLUILanguageService',
		'XMLUI Language Service',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
