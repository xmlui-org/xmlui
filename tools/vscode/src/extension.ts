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
  const serverModule = getPathToLangServer();

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
		documentSelector: [ { language: 'xmlui' } ]
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

function getPathToLangServer() {
  const localLangServPath = null;
  if (!localLangServPath){
    const bundledLangServPath = path.normalize(require.resolve('xmlui/xmlui-language-server'));
    return bundledLangServPath;
  }
  return localLangServPath;
}
