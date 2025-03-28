import { defineConfig } from 'vite'
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vsixPlugin(),
    react()],
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
  server: {
    cors: {
      origin: '*'
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  worker: {
    format: 'es'
  }
})
