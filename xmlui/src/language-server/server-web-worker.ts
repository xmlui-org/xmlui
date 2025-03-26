import { createConnection, BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser';
import * as serverCommon from "./server-common"

/// <reference lib="WebWorker" />

// declare const self: DedicatedWorkerGlobalScope;
const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);
const connection = createConnection(messageReader, messageWriter);
serverCommon.start(connection)
