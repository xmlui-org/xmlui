import type { InlineConfig } from "vite";
import { build as viteBuild } from "vite";
import react from "@vitejs/plugin-react";
import * as dotenv from "dotenv";
import { xmluiPlugin } from "../vite-plugin/xmluiPlugin";
import { rawScssModulePlugin } from "../vite-plugin/rawScssModulePlugin";
import type { XmluiPluginOptions } from "../vite-plugin/xmluiPlugin";
import * as path from "node:path";
import { readFile } from "node:fs/promises";

// Load environment files before anything else (matches old CLI behaviour).
// Vite also loads .env files internally, but dotenv here ensures all
// process.env vars are available early for define/config use.
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local"), override: true });

export type BuildOptions = {
  buildMode?: string;
  flatDist?: boolean;
  withMock?: boolean;
  withHostingMetaFiles?: boolean;
  withRelativeRoot?: boolean;
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

export async function build({
  buildMode,
  flatDist = false,
  withMock = false,
  withHostingMetaFiles = false,
  withRelativeRoot = false,
}: BuildOptions): Promise<void> {
  console.log("Building with options:", {
    buildMode,
    flatDist,
    withMock,
    withHostingMetaFiles,
    withRelativeRoot,
  });

  const pluginOptions = await loadXmluiPluginOptions();
  // Single plugin instance for both main pipeline and dep-scanner pipeline,
  // matching the pattern used in the start command.
  const xmlui = xmluiPlugin(pluginOptions);

  const flatDistUiPrefix = "ui_";

  await viteBuild({
    plugins: [rawScssModulePlugin(), xmlui, react()],
    base: withRelativeRoot ? "" : undefined,
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
    build: {
      rolldownOptions: {
        input: path.resolve(process.cwd(), "index.html"),
        output: {
          assetFileNames: (assetInfo: { name?: string }) => {
            const extType = assetInfo.name?.split(".").pop();
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
              return flatDist
                ? `${flatDistUiPrefix}internal_img_[name].[hash][extname]`
                : `internal/img/[name].[hash][extname]`;
            }
            if (assetInfo.name === "index.css") {
              return flatDist
                ? `${flatDistUiPrefix}internal_[name].[hash][extname]`
                : `internal/[name].[hash][extname]`;
            }
            return flatDist
              ? `${flatDistUiPrefix}internal_chunks_[name].[hash][extname]`
              : `internal/chunks/[name].[hash][extname]`;
          },
          chunkFileNames: flatDist
            ? `${flatDistUiPrefix}internal_chunks_[name].[hash].js`
            : "internal/chunks/[name].[hash].js",
          entryFileNames: flatDist
            ? `${flatDistUiPrefix}internal_[name].[hash].js`
            : "internal/[name].[hash].js",
        },
      },
    },
  } as InlineConfig);

  // Post-build cleanup (matches old CLI behaviour).
  // In CONFIG_ONLY mode the old CLI writes theme files and config.json;
  // we skip that for now since themes/config discovery needs more scaffolding.
  // The core build (vite bundling with xmlui plugin) is the primary deliverable.

  if (flatDist) {
    const { rm } = await import("node:fs/promises");
    try {
      await rm(path.join(process.cwd(), "dist", "resources"), {
        recursive: true,
        force: true,
      });
    } catch {
      // ignore if doesn't exist
    }
  }

  if (!withMock) {
    const { rm } = await import("node:fs/promises");
    try {
      await rm(path.join(process.cwd(), "dist", "mockServiceWorker.js"));
    } catch {
      // ignore if doesn't exist
    }
  }

  if (!withHostingMetaFiles) {
    const { rm } = await import("node:fs/promises");
    const distPath = path.join(process.cwd(), "dist");
    for (const file of ["serve.json", "web.config", "_redirects"]) {
      try {
        await rm(path.join(distPath, file));
      } catch {
        // ignore if doesn't exist
      }
    }
  }

  console.log("Build complete");
}
