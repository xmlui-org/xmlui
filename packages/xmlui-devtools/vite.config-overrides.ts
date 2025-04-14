import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';

export default {
  optimizeDeps: {
      esbuildOptions: {
          plugins: [
              importMetaUrlPlugin
          ]
      },
      include: [
          'vscode/localExtensionHost',
          'vscode-textmate',
          'vscode-oniguruma'
      ]
  },
  plugins: [vsixPlugin()]
}
