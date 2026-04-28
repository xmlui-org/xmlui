import type { InlineConfig } from "vite";
import { createServer } from "vite";
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
        "import.meta.env.VITE_BUILD_MODE": '"ALL"',
        "import.meta.env.VITE_DEV_MODE": true,
        "import.meta.env.VITE_STANDALONE": process.env.VITE_STANDALONE,
        "import.meta.env.VITE_MOCK_ENABLED": withMock,
        "import.meta.env.VITE_INCLUDE_ALL_COMPONENTS": '"true"',
        "import.meta.env.VITE_USER_COMPONENTS_Inspect": '"true"',
        // Pre-built lib replacements: the lib build remaps import.meta.env.VITE_* to
        // these opaque identifiers so they survive Rolldown's static analysis.
        __XMLUI_BUILD_MODE__: '"ALL"',
        __XMLUI_DEV_MODE__: "true",
        __XMLUI_STANDALONE__: "false",
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
