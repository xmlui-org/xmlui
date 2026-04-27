import * as fs from 'fs';
import * as path from 'path';
import { ExtensionContext, window, workspace } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

const CONFIG_SECTION = 'XMLUILanguageService';
const LOCAL_SERVER_PATH_KEY = 'localServerPath';

let client: LanguageClient | undefined;

export function activate(context: ExtensionContext) {
	startClient(context);

	// Restart the language client when the local server path setting changes.
	context.subscriptions.push(
		workspace.onDidChangeConfiguration(async (e) => {
			if (e.affectsConfiguration(`${CONFIG_SECTION}.${LOCAL_SERVER_PATH_KEY}`)) {
				await restartClient(context);
			}
		})
	);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	const stopping = client.stop();
	client = undefined;
	return stopping;
}

function startClient(context: ExtensionContext) {
	const { serverModule, source } = getPathToLangServer(context);
	console.log(`[xmlui] Using ${source} lang server: ${serverModule}`);
	window.showInformationMessage(
		`XMLUI Language Service: using ${source} server` +
			(source === 'bundled' ? '' : ` (${serverModule})`)
	);

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
		documentSelector: [{ language: 'xmlui' }]
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

async function restartClient(context: ExtensionContext) {
	if (client) {
		try {
			await client.stop();
		} catch (err) {
			console.error('[xmlui] Error stopping language client:', err);
		}
		client = undefined;
	}
	startClient(context);
}

type ServerSource = 'configured' | 'workspace' | 'bundled';

interface ResolvedServer {
	serverModule: string;
	source: ServerSource;
}

export function getPathToLangServer(context: ExtensionContext): ResolvedServer {
	// 1. Explicit config override.
	const config = workspace.getConfiguration(CONFIG_SECTION);
	const explicitPath = (config.get<string>(LOCAL_SERVER_PATH_KEY, '') || '').trim();
	if (explicitPath) {
		if (fs.existsSync(explicitPath)) {
			return { serverModule: explicitPath, source: 'configured' };
		}
		console.warn(
			`[xmlui] Configured ${CONFIG_SECTION}.${LOCAL_SERVER_PATH_KEY} not found on disk: ${explicitPath}. Falling back.`
		);
	}

	// 2. Probe workspace folders (and their parent directories, to handle monorepos)
	//    for a locally installed xmlui package.
	const folders = workspace.workspaceFolders;
	if (folders && folders.length > 0) {
		for (const folder of folders) {
			const found = findInAncestors(folder.uri.fsPath);
			if (found) {
				return { serverModule: found, source: 'workspace' };
			}
		}
	}

	// 3. Bundled fallback.
	const bundled = context.asAbsolutePath(path.join('dist', 'server.js'));
	return { serverModule: bundled, source: 'bundled' };
}

const SERVER_REL_PATH = path.join('node_modules', 'xmlui', 'dist', 'nodejs', 'server.js');

function findInAncestors(startDir: string): string | undefined {
	let current = startDir;
	// Walk up to the filesystem root looking for node_modules/xmlui/dist/nodejs/server.js.
	// This handles both single-package workspaces and monorepo setups where xmlui is
	// hoisted to a parent directory.
	while (true) {
		const candidate = path.join(current, SERVER_REL_PATH);
		if (fs.existsSync(candidate)) {
			return candidate;
		}
		const parent = path.dirname(current);
		if (parent === current) {
			return undefined;
		}
		current = parent;
	}
}
