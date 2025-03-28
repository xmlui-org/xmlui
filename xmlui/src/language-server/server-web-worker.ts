import { createConnection, BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser';
import * as serverCommon from "./server-common"

/// <reference lib="WebWorker" />

// declare const self: DedicatedWorkerGlobalScope;
const messageReader = new BrowserMessageReader(self);
messageReader.listen((message) => {
    console.log('Received message from main thread:', message);
});
const messageWriter = new BrowserMessageWriter(self);
const connection = createConnection(messageReader, messageWriter);
console.log("starting lang server")
serverCommon.start(connection)
