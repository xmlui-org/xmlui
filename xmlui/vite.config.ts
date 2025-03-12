// @ts-ignore
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
  let define;
  switch (mode) {
    case "standalone": {
      lib = {
        entry: [path.resolve("src", "index-standalone.ts")],
        name: "xmlui",
        formats: ["umd"],
        fileName: (format) => `xmlui-standalone.${format}.js`,
      };
      define = {
        "process.env": {
          NODE_ENV: env.NODE_ENV,
          VITE_MOCK_ENABLED: true,
          VITE_MOCK_WORKER_LOCATION: "mockApi.js",
          VITE_USED_COMPONENTS_Pdf: "false",
          VITE_USED_COMPONENTS_Chart: "false",
          VITE_USER_COMPONENTS_XmluiCodeHightlighter: "false",
          VITE_USED_COMPONENTS_Tree: "false",
          // VITE_USER_COMPONENTS_Inspect: "false",
          VITE_XMLUI_VERSION: `${env.npm_package_version} (built ${new Date().toLocaleDateString("en-US")})`,
        },
      };
      break;
    }
    case "metadata": {
      lib = {
        entry: [path.resolve("src", "components", "collectedComponentMetadata.ts")],
        name: "xmlui-metadata",
        fileName: "xmlui-metadata",
      };
      define = {
        "process.env": {
          NODE_ENV: env.NODE_ENV,
        },
      };
      break;
    }
    default: {
      lib = {
        entry: {
          xmlui: path.resolve("src", "index.ts"),
          "xmlui-parser": path.resolve("src", "parsers", "xmlui-parser", "index.ts"),
          "language-server": path.resolve("src", "language-server", "server.ts"),
        },
        formats: ["es"],
      };
    }
  }
  return defineConfig({
    resolve: {
      alias: {
        lodash: "lodash-es",
      },
    },
    define,
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
      // minify: false,
      rollupOptions: {
        treeshake: mode === "metadata" ? "smallest" : undefined,
        external:
          mode === "standalone"
            ? []
            : [...Object.keys(packageJson.dependencies), "react/jsx-runtime"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "react/jsx-runtime",
          },
        },
      },
    },
    plugins:
      mode === "metadata"
        ? []
        : [react(), svgr(), ViteYaml(), libInjectCss(), dts({ rollupTypes: true })],
  });
};
