import { resolve } from "path";
import { existsSync } from "fs";

export function handleConfig(config) {
  const workingFolder = resolve(__dirname);
  let { sourceFolderPath, outFolderPath, entryPoints } = config;

  const _sourceFolder = resolve(workingFolder, sourceFolderPath);
  if (!existsSync(_sourceFolder)) {
    throw new Error(`Source folder ${_sourceFolder} does not exist.`);
  }

  const _outFolder = !outFolderPath ? workingFolder : resolve(workingFolder, outFolderPath);
  if (!existsSync(_outFolder)) {
    throw new Error(`Output folder ${_outFolder} does not exist.`);
  }

  return {
    workingFolder,
    sourceFolder: _sourceFolder,
    outFolder: _outFolder,
    entryPoints: [...new Set(entryPoints)] || [],
  };
}
