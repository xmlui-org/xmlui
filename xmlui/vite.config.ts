// @ts-ignore
import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { default as ViteXmlui } from "./bin/vite-xmlui-plugin";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import copy from "rollup-plugin-copy";
// @ts-ignore
import * as packageJson from "./package.json";

export default ({ mode = "lib" }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let lib;
  let define;
  let distSubDirName = "";
  switch (mode) {
    case "standalone": {
      distSubDirName = "standalone";
      lib = {
        entry: [path.resolve("src", "index-standalone.ts")],
        name: "xmlui",
        formats: ["umd"] as any,
        fileName: (format: any) => `xmlui-standalone.${format}.js`,
      };
      define = {
        "process.env": {
          NODE_ENV: env.NODE_ENV,
          VITE_MOCK_ENABLED: true,
          VITE_MOCK_WORKER_LOCATION: "mockApi.js",
          VITE_USED_COMPONENTS_XmluiCodeHightlighter: "false",
          VITE_USED_COMPONENTS_Tree: "false",
          VITE_USED_COMPONENTS_TableEditor: "false",
          // VITE_USED_COMPONENTS_Charts: "false",
          // VITE_USER_COMPONENTS_Inspect: "false",
          VITE_XMLUI_VERSION: `${env.npm_package_version} (built ${new Date().toLocaleDateString("en-US")})`,
        },
      };
      break;
    }
    case "inspector-parser": {
      // Standalone XMLUI parser for browser use (e.g., Inspector viewer)
      // Minimal bundle with no React/component dependencies
      distSubDirName = "inspector";
      lib = {
        entry: [path.resolve("src", "parsers", "xmlui-parser-standalone", "index.ts")],
        name: "XmluiParser",
        formats: ["es", "umd"] as any,
        fileName: (format: any) => `xmlui-parser.${format}.js`,
      };
      define = {
        "process.env": {
          NODE_ENV: env.NODE_ENV,
        },
      };
      break;
    }
    case "metadata": {
      distSubDirName = "metadata";
      lib = {
        entry: {
          "xmlui-metadata": path.resolve("src", "components", "collectedComponentMetadata.ts"),
          icons: path.resolve("src", "components", "icons-abstractions.ts"),
          behaviors: path.resolve(
            "src",
            "components-core",
            "behaviors",
            "collectedBehaviorMetadata.ts",
          ),
          "behavior-evaluator": path.resolve(
            "src",
            "components-core",
            "behaviors",
            "behaviorConditionEvaluator.ts",
          ),
          "metadata-utils": path.resolve(
            "src",
            "language-server",
            "services",
            "common",
            "metadata-utils.ts",
          ),
        },
        name: "xmlui-metadata",
      };
      define = {
        "process.env": {
          NODE_ENV: env.NODE_ENV,
        },
      };
      break;
    }
    default: {
      distSubDirName = "lib";
      lib = {
        entry: {
          xmlui: path.resolve("src", "index.ts"),
          "xmlui-parser": path.resolve("src", "parsers", "xmlui-parser", "index.ts"),
          "syntax-monaco": path.resolve("src", "syntax", "monaco", "index.ts"),
          "syntax-textmate": path.resolve("src", "syntax", "textMate", "index.ts"),
          testing: path.resolve("src", "testing", "index.ts"),
        },
        formats: ["es"] as any,
      };
    }
  }
  let plugins =
    mode === "metadata"
      ? [ViteXmlui({})]
      : mode === "inspector-parser"
        ? [dts({ rollupTypes: true, exclude: ["src/testing/infrastructure/dist/**"] })] // Minimal plugins for standalone parser
        : [react(), svgr(), ViteYaml(), ViteXmlui({}), libInjectCss(), dts({ rollupTypes: true, exclude: ["src/testing/infrastructure/dist/**"] })];

  if (mode === "lib") {
    plugins.push(
      copy({
        hook: "writeBundle",
        targets: [
          {
            src: ["src/**/*.scss", "!src/**/*.module.scss"],
            dest: "dist/lib/scss",
            rename: (name, extension, fullPath) => {
              //we do this to preserve the folder structure of the scss files
              // e.g. src/components/button/Button.scss should be copied to dist/lib/scss/components/button/Button.scss
              // and not to dist/lib/scss/Button.scss
              // fullPath will be something like 'src/components/button/Button.scss'
              // We want to remove the 'src/' prefix to get the relative path
              const relativePath = fullPath.replace("src/", "");

              // This returns 'components/button/Button.scss'
              return relativePath;
            },
          },
        ],
      }),
    );
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
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["global-builtin", "import", "new-global"],
        },
      },
    },
    build: {
      minify: "terser",
      emptyOutDir: true,
      outDir: `dist/${distSubDirName}`,
      lib,
      rollupOptions: {
        treeshake: mode === "metadata" ? "smallest" : undefined,
        external:
          mode === "standalone" || mode === "inspector-parser"
            ? [] // Bundle everything for standalone builds
            : [...Object.keys(packageJson.dependencies), "react/jsx-runtime", "@playwright/test"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "react/jsx-runtime": "react/jsx-runtime",
          },
        },
      },
    },
    plugins: plugins,
  });
};
