#!/usr/bin/env node

import { createServer, loadEnv } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Get the absolute path to index.ts
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const indexTsPath = resolve(__dirname, "index.ts");

async function run() {
  // Dynamically import vite-node modules
  const { ViteNodeServer } = await import("vite-node/server");
  const { ViteNodeRunner } = await import("vite-node/client");
  const { installSourcemapsSupport } = await import("vite-node/source-map");
  const { createHotContext, handleMessage, viteNodeHmrPlugin } = await import("vite-node/hmr");

  const options = {
    watch: false,
    root: process.cwd(),
    mode: process.env.NODE_ENV || "development",
  };

  // Adjust process.argv similar to --script mode
  process.argv = [process.argv[0], indexTsPath, ...process.argv.slice(2)];

  const server = await createServer({
    logLevel: "error",
    root: options.root,
    mode: options.mode,
    server: {
      hmr: !!options.watch,
      watch: options.watch ? undefined : null,
    },
    plugins: [options.watch && viteNodeHmrPlugin()],
  });

  // Initialize the server
  await server.pluginContainer.buildStart({});

  // Load environment variables
  const env = loadEnv(server.config.mode, server.config.envDir, "");
  for (const key in env) {
    process.env[key] ??= env[key];
  }

  const node = new ViteNodeServer(server, {
    // Server options can be customized here
  });

  installSourcemapsSupport({
    getSourceMap: (source) => node.getSourceMap(source),
  });

  const runner = new ViteNodeRunner({
    root: server.config.root,
    base: server.config.base,
    fetchModule(id) {
      return node.fetchModule(id);
    },
    resolveId(id, importer) {
      return node.resolveId(id, importer);
    },
    createHotContext(runner, url) {
      return createHotContext(runner, server.emitter, [indexTsPath], url);
    },
  });

  // Provide the vite define variable in this context
  await runner.executeId("/@vite/env");

  // Execute the index.ts file
  await runner.executeFile(indexTsPath);

  if (!options.watch) {
    await server.close();
  }

  // Handle HMR messages
  server.emitter?.on("message", (payload) => {
    handleMessage(runner, server.emitter, [indexTsPath], payload);
  });

  if (options.watch) {
    process.on("uncaughtException", (err) => {
      console.error("[vite-node] Failed to execute file: \n", err);
    });
  }
}

// Run the bootstrap
run().catch((err) => {
  console.error("Failed to bootstrap:", err);
  process.exit(1);
});
