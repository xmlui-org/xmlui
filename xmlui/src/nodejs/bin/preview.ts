import { preview as vitePreview } from "vite";
import { getViteConfig } from "./viteConfig";

export const preview = async ({ port, proxy }: { port?: number; proxy?: string }) => {
  try {
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
    const server = await vitePreview({
      ...(await getViteConfig()),
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
    process.exit(1);
  }
};
