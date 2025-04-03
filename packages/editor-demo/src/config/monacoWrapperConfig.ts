/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import { LogLevel } from '@codingame/monaco-vscode-api';
import { MessageTransports } from 'vscode-languageclient';
import type { CodeContent, LanguageClientConfigs, WrapperConfig } from 'monaco-editor-wrapper';
import { configureDefaultWorkerFactory } from 'monaco-editor-wrapper/workers/workerLoaders';

// cannot be imported with assert as json contains comments
import xmluiLanguageConfig from './language-configuration.json?raw';
import xmluiTmGrammar from '../syntaxes/xmlui.tmLanguage.json?raw';

export const createMonacoWrapperConfig = (params: {
    languageServerId: string,
    useLanguageClient: boolean,
    codeContent: CodeContent,
    worker?: Worker,
    messagePort?: MessagePort,
    messageTransports?: MessageTransports,
    htmlContainer: HTMLElement
}): WrapperConfig => {
    const extensionFilesOrContents = new Map<string, string | URL>();
    extensionFilesOrContents.set(`/${params.languageServerId}-xmlui-configuration.json`, xmluiLanguageConfig);
    extensionFilesOrContents.set(`/${params.languageServerId}-xmlui-grammar.json`, xmluiTmGrammar);

    const languageClientConfigs: LanguageClientConfigs | undefined = params.useLanguageClient && params.worker ? {
        configs: {
          xmlui: {
              clientOptions: {
                  documentSelector: ['xmlui']
              },
              connection: {
                  options: {
                      $type: 'WorkerDirect',
                      worker: params.worker,
                      messagePort: params.messagePort,
                  },
                  messageTransports: params.messageTransports
              }
          },
        }
    } : undefined;

    return {
        $type: 'extended',
        htmlContainer: params.htmlContainer,
        logLevel: LogLevel.Debug,
        vscodeApiConfig: {
            serviceOverrides: {
                ...getKeybindingsServiceOverride(),
                ...getLifecycleServiceOverride(),
                ...getLocalizationServiceOverride(createDefaultLocaleConfiguration()),
            },
            userConfiguration: {
                json: JSON.stringify({
                    'workbench.colorTheme': 'Default Dark Modern',
                    'editor.guides.bracketPairsHorizontal': 'active',
                    'editor.wordBasedSuggestions': 'off',
                    'editor.experimental.asyncTokenization': true
                })
            },
        },
        extensions: [{
            config: {
                name: 'xmlui-vscode',
                publisher: 'norbidotdev',
                version: '0.0.1',
                engines: {
                    vscode: '*'
                },
                contributes: {
                    languages: [{
                        id: 'xmlui',
                        extensions: ['.xmlui'],
                        aliases: ['Xmlui', 'XMLUI'],
                        configuration: `./${params.languageServerId}-xmlui-configuration.json`
                    }],
                    grammars: [{
                        language: 'xmlui',
                        scopeName: 'source.xmlui',
                        path: `./${params.languageServerId}-xmlui-grammar.json`,
                        embeddedLanguages: {
                          "meta.embedded.block.javascrip": "javascript"
                        }
                    }]
                }
            },
            filesOrContents: extensionFilesOrContents
        }],
        editorAppConfig: {
            codeResources: {
                modified: params.codeContent
            },
            monacoWorkerFactory: configureDefaultWorkerFactory
        },
        languageClientConfigs
    };
};
