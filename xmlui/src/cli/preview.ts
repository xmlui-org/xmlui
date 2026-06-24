import { preview as vitePreview } from "vite";
import react from "@vitejs/plugin-react";
import { xmluiPlugin } from "../vite-plugin/xmluiPlugin";
import { rawScssModulePlugin } from "../vite-plugin/rawScssModulePlugin";
import type { XmluiPluginOptions } from "../vite-plugin/xmluiPlugin";
import * as path from "node:path";
import { readFile } from "node:fs/promises";

export type PreviewOptions = {
  port?: number;
  proxy?: string;
};

async function loadXmluiPluginOptions(): Promise<XmluiPluginOptions> {
  try {
    const rawConfig = await readFile(
      path.join(process.cwd(), "xmlui.config.json"),
      "utf-8",
    );
    const config = JSON.parse(rawConfig);
    return {
      extensions: config.extensions ?? [],
    };
  } catch {
    return {};
  }
}

export async function preview({ port, proxy }: PreviewOptions): Promise<void> {
  let proxyDef;
  if (proxy) {
    const splitProxy = proxy.split("->");
    if (splitProxy.length !== 2) {
      console.error(
        "Invalid proxy definition. Example: /api->http://localhost:3000",
      );
    } else {
      proxyDef = {
        [splitProxy[0]]: {
          target: splitProxy[1],
          changeOrigin: true,
        },
      };
    }
  }

  const pluginOptions = await loadXmluiPluginOptions();
  const xmlui = xmluiPlugin(pluginOptions);

  try {
    const server = await vitePreview({
      plugins: [rawScssModulePlugin(), xmlui, react()],
      resolve: {
        extensions: [
          ".js",
          ".ts",
          ".jsx",
          ".tsx",
          ".json",
          ".xmlui",
          ".xmlui.xs",
          ".xs",
        ],
      },
      optimizeDeps: {
        extensions: [".xmlui", ".xmlui.xs", ".xs"],
        rolldownOptions: {
          plugins: [xmlui],
          moduleTypes: {
            ".xmlui": "js",
            ".xs": "js",
          },
        },
      },
      server: {
        proxy: proxyDef,
      },
      preview: {
        port,
      },
    });

    if (!server.httpServer) {
      throw new Error("HTTP server not available");
    }

    server.printUrls();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
