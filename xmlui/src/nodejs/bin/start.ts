import type { InlineConfig } from "vite";
import { createServer } from "vite";
import { createXmluiAppDefines } from "./xmluiEnv";
import { getViteConfig } from "./viteConfig";

type XmlUiStartOptions = {
  port?: number;
  withMock?: boolean;
  proxy?: string;
};

export const start = async ({ port, withMock = true, proxy }: XmlUiStartOptions) => {
  console.log("Starting with options:", {
    withMock,
    withProxy: proxy,
  });

  let proxyDef;
  if (proxy) {
    const splitProxy = proxy.split("->");
    if (splitProxy.length !== 2) {
      console.error("Invalid proxy definition. Example: /api->http://localhost:3000");
    } else {
      proxyDef = {
        [splitProxy[0]]: {
          target: splitProxy[1],
          changeOrigin: true,
        },
      };
    }
  }

  try {
    let viteConfig = await getViteConfig({});
    const server = await createServer({
      ...viteConfig,
      server: {
        port,
        proxy: proxyDef,
      },
      define: {
        ...viteConfig.define,
        ...createXmluiAppDefines({
          buildMode: "ALL",
          devMode: true,
          mockEnabled: withMock,
          includeAllComponents: true,
          inspectUserComponents: true,
        }),
      },
    } as InlineConfig);

    // server.

    if (!server.httpServer) {
      throw new Error("HTTP server not available");
    }

    await server.listen();
    server.printUrls();
  } catch (e) {
    process.exit(1);
  }
};
