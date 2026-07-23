import { readFile } from "fs/promises";
import path from "path";
import type { PluginOptions } from "../vite-xmlui-plugin";

export function normalizeXmluiPluginOptions(config: Record<string, any>): PluginOptions {
  const xmluiConfig = config.xmluiConfig ?? {};
  return {
    analyze: config.analyze,
    reactiveCycles: config.reactiveCycles,
    accessibility: config.accessibility,
    typeContracts: config.typeContracts,
    compileEventHandlers: config.compileEventHandlers ?? xmluiConfig.compileEventHandlers,
    logCompiledEventHandlerSource:
      config.logCompiledEventHandlerSource ?? xmluiConfig.logCompiledEventHandlerSource,
  };
}

export async function loadXmluiPluginOptions(): Promise<PluginOptions> {
  try {
    const rawConfig = await readFile(path.join(process.cwd(), "xmlui.config.json"), "utf-8");
    return normalizeXmluiPluginOptions(JSON.parse(rawConfig));
  } catch {
    return {};
  }
}
