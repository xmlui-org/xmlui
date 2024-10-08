import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
// @ts-ignore
import * as packageJson from "./package.json";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let lib;
  switch (mode) {
    case "standalone": {
      lib = {
        entry: [path.resolve("src", "index-standalone.ts")],
        name: "xmlui-standalone",
        formats: ["umd"],
        fileName: (format) => `xmlui-standalone.${format}.js`,
      };
      break;
    }
    case "metadata": {
      lib = {
        entry: [path.resolve("src", "components", "collectedComponentMetadata.ts")],
        name: "xmlui-metadata",
        fileName: "xmlui-metadata",
      };
      break;
    }
    default: {
      lib = {
        entry: [path.resolve("src", "index.ts")],
          name: "xmlui",
          fileName: "xmlui",
      };
    }
  }
  return defineConfig({
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "./src/components"),
        "@components-core": path.resolve(__dirname, "./src/components-core"),
        "@abstractions": path.resolve(__dirname, "./src/abstractions"),
        "@core": path.resolve(__dirname, "./src/core"),
        "@parsers": path.resolve(__dirname, "./src/parsers"),
      },
    },
    define:
      mode === "standalone" || mode === "metadata"
        ? {
            "process.env": {
                'NODE_ENV': env.NODE_ENV,
                'VITE_MOCK_ENABLED': true
            }
        } : undefined,
        esbuild: {
            target: "es2020",
        },
        optimizeDeps: {
            esbuildOptions: {
                target: "es2020",
            },
        },
        build: {
            emptyOutDir: false,
            outDir: "dist",
            lib: lib,
            rollupOptions: {
                treeshake: mode === "metadata" ? "smallest" : undefined,
                external: mode === 'standalone' ? [] : [
                    ...Object.keys(packageJson.dependencies),
                    "react/jsx-runtime",
                ],
                output: {
                    globals: {
                        react: "React",
                        "react-dom": "ReactDOM",
                        'react/jsx-runtime': 'react/jsx-runtime',
                    },
                },
            },
        },
      plugins: mode === "metadata" ? [dts({ rollupTypes: true })] : [react(), svgr(), ViteYaml(), libInjectCss(), dts({ rollupTypes: true })],
    })
};
