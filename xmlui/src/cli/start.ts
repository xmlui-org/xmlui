import type { InlineConfig, Plugin } from "vite";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { xmluiPlugin } from "../vite-plugin/xmluiPlugin";
import { rawScssModulePlugin } from "../vite-plugin/rawScssModulePlugin";
import { svgReactPlugin } from "../vite-plugin/svgReactPlugin";
import { rawPackageXmluiSourcePlugin } from "../vite-plugin/rawXmluiSourcePlugin";
import type { XmluiPluginOptions } from "../vite-plugin/xmluiPlugin";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { XmluiComponentContract } from "../compiler/contracts";

const reactQrCodeCompatPath = fileURLToPath(new URL("../compat/reactQrCode.tsx", import.meta.url));

type StartOptions = {
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
      extensionComponents: await loadExtensionContracts(config.extensions ?? []),
    };
  } catch {
    return {};
  }
}

async function loadExtensionContracts(extensionNames: string[]): Promise<XmluiComponentContract[]> {
  const artifacts = await Promise.all(extensionNames.map(async (name) => {
    const filename = path.resolve(process.cwd(), "..", "packages", name, "dist-metadata", `${name}-metadata.json`);
    return JSON.parse(await readFile(filename, "utf-8"));
  }));
  return artifacts.flatMap((artifact) =>
    (artifact.components ?? [])
      .filter((component: any) => component.kind === "extension")
      .map(metadataComponentToContract),
  );
}

function metadataComponentToContract(component: any): XmluiComponentContract {
  const commonProps = [
    "id",
    "testId",
    "className",
    "style",
    "width",
    "height",
    "minWidth",
    "maxWidth",
    "minHeight",
    "maxHeight",
    "padding",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "margin",
    "marginLeft",
    "marginRight",
    "marginTop",
    "marginBottom",
    "backgroundColor",
    "color",
  ];
  return {
    name: component.name,
    kind: "extension",
    acceptsArbitraryProps: component.acceptsArbitraryProps,
    allowsChildren: component.allowsChildren ?? true,
    declarations: component.declarations ?? { local: true },
    props: Object.fromEntries([
      ...commonProps.map((name) => [name, { name }]),
      ...(component.props ?? []).map((member: any) => [member.name, { name: member.name }]),
    ]),
    events: Object.fromEntries((component.events ?? []).map((member: any) => [
      member.name,
      { name: member.name, attributeName: member.attributeName ?? `on${member.name.slice(0, 1).toUpperCase()}${member.name.slice(1)}` },
    ])),
    templates: Object.fromEntries((component.templates ?? []).map((member: any) => [member.name, { name: member.name }])),
    contextVariables: Object.fromEntries((component.contextVariables ?? []).map((member: any) => [member.name, { name: member.name }])),
    apis: Object.fromEntries((component.apis ?? []).map((member: any) => [member.name, { name: member.name }])),
  };
}

export async function start({ port, proxy }: StartOptions): Promise<void> {
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
  const xmlui = xmluiPlugin(pluginOptions) as Plugin;

  try {
    const server = await createServer({
      plugins: [rawPackageXmluiSourcePlugin(), rawScssModulePlugin(), svgReactPlugin(), xmlui, react()],
      server: {
        port,
        proxy: proxyDef,
      },
      resolve: {
        alias: {
          "react-qr-code": reactQrCodeCompatPath,
        },
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
        include: ["react-qr-code"],
        extensions: [".xmlui", ".xmlui.xs", ".xs"],
        rolldownOptions: {
          plugins: [rawPackageXmluiSourcePlugin(), xmlui],
          moduleTypes: {
            ".xmlui": "js",
            ".xs": "js",
          },
        },
      },
    } as InlineConfig);

    if (!server.httpServer) {
      throw new Error("HTTP server not available");
    }

    await server.listen();
    server.printUrls();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
