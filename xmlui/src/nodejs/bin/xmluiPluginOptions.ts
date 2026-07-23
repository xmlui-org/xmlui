import { readFile } from "fs/promises";
import path from "path";
import type { PluginOptions } from "../vite-xmlui-plugin";

type NormalizeXmluiPluginOptionsOptions = {
  devServer?: boolean;
};

export function normalizeXmluiPluginOptions(
  config: Record<string, any>,
  options: NormalizeXmluiPluginOptionsOptions = {},
): PluginOptions {
  const xmluiConfig = config.xmluiConfig ?? {};
  const compileScripts = config.compileScripts ?? xmluiConfig.compileScripts;
  const compileBindings = config.compileBindings ?? xmluiConfig.compileBindings ?? compileScripts;
  const compileEventHandlers =
    config.compileEventHandlers ?? xmluiConfig.compileEventHandlers ?? compileScripts;
  const hasScriptCompilation =
    compileScripts === true || compileBindings === true || compileEventHandlers === true;
  const compiledScriptSourceMaps =
    config.compiledScriptSourceMaps ??
    xmluiConfig.compiledScriptSourceMaps ??
    (options.devServer && hasScriptCompilation ? "external" : undefined);
  return {
    analyze: config.analyze,
    reactiveCycles: config.reactiveCycles,
    accessibility: config.accessibility,
    typeContracts: config.typeContracts,
    compileScripts,
    compileBindings,
    compileEventHandlers,
    compiledScriptSourceMaps,
    logCompiledEventHandlerSource:
      config.logCompiledEventHandlerSource ?? xmluiConfig.logCompiledEventHandlerSource,
  };
}

export async function loadXmluiPluginOptions(
  options: NormalizeXmluiPluginOptionsOptions = {},
): Promise<PluginOptions> {
  try {
    const rawConfig = await readFile(path.join(process.cwd(), "xmlui.config.json"), "utf-8");
    return normalizeXmluiPluginOptions(JSON.parse(rawConfig), options);
  } catch {
    return {};
  }
}
