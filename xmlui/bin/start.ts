import { createServer, InlineConfig } from "vite";
import {getViteConfig} from "./viteConfig";

type XmlUiStartOptions = {
  port?: number;
  withMock?: boolean;
  withLegacyParser?: boolean;
}

export const start = async ({port, withMock = true, withLegacyParser = false}: XmlUiStartOptions) => {
  console.log("Starting with options:", {
    withMock,
    withLegacyParser
  });

  try {
    const server = await createServer({
      ...getViteConfig({withLegacyParser}),
      server: {
        port,
      },
      define: {
        'process.env.VITE_BUILD_MODE': JSON.stringify("ALL"),
        'process.env.VITE_DEV_MODE': true,
        'process.env.VITE_STANDALONE': process.env.VITE_STANDALONE,
        'process.env.VITE_MOCK_ENABLED': withMock,
        "process.env.VITE_INCLUDE_ALL_COMPONENTS": JSON.stringify("true"),
        "process.env.VITE_LEGACY_PARSER": withLegacyParser,
      }
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
