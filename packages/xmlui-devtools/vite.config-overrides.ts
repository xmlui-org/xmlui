export default async () => {
  try {
    const { default: vsixPlugin } = await import('@codingame/monaco-vscode-rollup-vsix-plugin');
    return { plugins: [vsixPlugin()] };
  } catch {
    return { plugins: [] };
  }
};