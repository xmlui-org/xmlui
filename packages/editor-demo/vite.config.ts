/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import { defineConfig } from 'vite';
import fs from 'node:fs';
import * as path from 'node:path';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';
import react from '@vitejs/plugin-react';

export const definedViteConfig = defineConfig({
    build: {
        target: 'ES2022',
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
            }
        }
    },
    resolve: {
        // not needed here, see https://github.com/TypeFox/monaco-languageclient#vite-dev-server-troubleshooting
        // dedupe: ['vscode']
    },
    server: {
        port: 20001,
        cors: {
            origin: '*'
        },
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
        watch: {
            ignored: [
                '**/.chrome/**/*'
            ]
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                importMetaUrlPlugin
            ]
        },
        include: [
            '@testing-library/react',
            'vscode/localExtensionHost',
            'vscode-textmate',
            'vscode-oniguruma'
        ]
    },
    plugins: [
        vsixPlugin(),
        react()
    ],
    define: {
        rootDirectory: JSON.stringify(__dirname),
    },
    worker: {
        format: 'es'
    }
});

export default definedViteConfig;
