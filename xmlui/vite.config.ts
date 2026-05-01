// @ts-ignore
import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import ViteYaml from "@modyfi/vite-plugin-yaml";
import { default as ViteXmlui } from "./src/nodejs/vite-xmlui-plugin";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import copy from "rollup-plugin-copy";
// @ts-ignore
import * as packageJson from "./package.json";

export default ({ mode = "lib" }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let lib;
  let define;
  const xmluiVersion = `${env.npm_package_version} (built ${new Date().toLocaleDateString("en-US")})`;
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
        "process.env.NODE_ENV": '"production"',
        "import.meta.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
        "import.meta.env.VITE_XMLUI_VERSION": JSON.stringify(xmluiVersion),
        "import.meta.env.VITE_XMLUI_BUILD_MODE": JSON.stringify("INLINE_ALL"),
        "import.meta.env.VITE_XMLUI_DEV_MODE": JSON.stringify("false"),
        "import.meta.env.VITE_MOCK_ENABLED": "true",
        "import.meta.env.VITE_MOCK_WORKER_LOCATION": JSON.stringify("mockApi.js"),
        "import.meta.env.VITE_USED_COMPONENTS_XmluiCodeHightlighter": JSON.stringify("false"),
        "import.meta.env.VITE_USED_COMPONENTS_TableEditor": JSON.stringify("false"),
        // "import.meta.env.VITE_USED_COMPONENTS_Charts": JSON.stringify("false"),
        // "import.meta.env.VITE_USER_COMPONENTS_Inspect": JSON.stringify("false"),
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
        "import.meta.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
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
        "import.meta.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
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
      // Framework-level: baked in at lib-build time.
      // Application-level: preserved as identity pass-throughs so app builds
      // (xmlui CLI or plain Vite + plugin) can replace them via env vars.
      define = {
        // --- framework-level ---
        "import.meta.env.VITE_XMLUI_VERSION": JSON.stringify(xmluiVersion),
        // --- application-level: mode flags ---
        "import.meta.env.VITE_XMLUI_DEV_MODE": "import.meta.env.DEV",
        "import.meta.env.VITE_XMLUI_BUILD_MODE": "import.meta.env.VITE_XMLUI_BUILD_MODE",
        // --- application-level: runtime flags ---
        "import.meta.env.VITE_MOCK_ENABLED": "import.meta.env.VITE_MOCK_ENABLED",
        "import.meta.env.VITE_MOCK_WORKER_LOCATION": "import.meta.env.VITE_MOCK_WORKER_LOCATION",
        "import.meta.env.VITE_INCLUDE_ALL_COMPONENTS":
          "import.meta.env.VITE_INCLUDE_ALL_COMPONENTS",
        "import.meta.env.VITE_USER_COMPONENTS_Inspect":
          "import.meta.env.VITE_USER_COMPONENTS_Inspect",
        "import.meta.env.VITE_APP_VERSION": "import.meta.env.VITE_APP_VERSION",
        "import.meta.env.VITE_INCLUDE_HTML_COMPONENTS":
          "import.meta.env.VITE_INCLUDE_HTML_COMPONENTS",
        "import.meta.env.VITE_INCLUDE_REST_COMPONENTS":
          "import.meta.env.VITE_INCLUDE_REST_COMPONENTS",
        // --- application-level: component tree-shaking flags ---
        "import.meta.env.VITE_USED_COMPONENTS_AccordionItem":
          "import.meta.env.VITE_USED_COMPONENTS_AccordionItem",
        "import.meta.env.VITE_USED_COMPONENTS_App": "import.meta.env.VITE_USED_COMPONENTS_App",
        "import.meta.env.VITE_USED_COMPONENTS_AppHeader":
          "import.meta.env.VITE_USED_COMPONENTS_AppHeader",
        "import.meta.env.VITE_USED_COMPONENTS_Avatar":
          "import.meta.env.VITE_USED_COMPONENTS_Avatar",
        "import.meta.env.VITE_USED_COMPONENTS_Badge": "import.meta.env.VITE_USED_COMPONENTS_Badge",
        "import.meta.env.VITE_USED_COMPONENTS_Button":
          "import.meta.env.VITE_USED_COMPONENTS_Button",
        "import.meta.env.VITE_USED_COMPONENTS_Card": "import.meta.env.VITE_USED_COMPONENTS_Card",
        "import.meta.env.VITE_USED_COMPONENTS_Chart": "import.meta.env.VITE_USED_COMPONENTS_Chart",
        "import.meta.env.VITE_USED_COMPONENTS_Charts":
          "import.meta.env.VITE_USED_COMPONENTS_Charts",
        "import.meta.env.VITE_USED_COMPONENTS_Checkbox":
          "import.meta.env.VITE_USED_COMPONENTS_Checkbox",
        "import.meta.env.VITE_USED_COMPONENTS_ColorPicker":
          "import.meta.env.VITE_USED_COMPONENTS_ColorPicker",
        "import.meta.env.VITE_USED_COMPONENTS_ContentSeparator":
          "import.meta.env.VITE_USED_COMPONENTS_ContentSeparator",
        "import.meta.env.VITE_USED_COMPONENTS_DatePicker":
          "import.meta.env.VITE_USED_COMPONENTS_DatePicker",
        "import.meta.env.VITE_USED_COMPONENTS_DotMenu":
          "import.meta.env.VITE_USED_COMPONENTS_DotMenu",
        "import.meta.env.VITE_USED_COMPONENTS_EmojiSelector":
          "import.meta.env.VITE_USED_COMPONENTS_EmojiSelector",
        "import.meta.env.VITE_USED_COMPONENTS_FileUploadDropZone":
          "import.meta.env.VITE_USED_COMPONENTS_FileUploadDropZone",
        "import.meta.env.VITE_USED_COMPONENTS_FlowLayout":
          "import.meta.env.VITE_USED_COMPONENTS_FlowLayout",
        "import.meta.env.VITE_USED_COMPONENTS_Footer":
          "import.meta.env.VITE_USED_COMPONENTS_Footer",
        "import.meta.env.VITE_USED_COMPONENTS_Form": "import.meta.env.VITE_USED_COMPONENTS_Form",
        "import.meta.env.VITE_USED_COMPONENTS_Fragment":
          "import.meta.env.VITE_USED_COMPONENTS_Fragment",
        "import.meta.env.VITE_USED_COMPONENTS_Heading":
          "import.meta.env.VITE_USED_COMPONENTS_Heading",
        "import.meta.env.VITE_USED_COMPONENTS_Icon": "import.meta.env.VITE_USED_COMPONENTS_Icon",
        "import.meta.env.VITE_USED_COMPONENTS_IFrame":
          "import.meta.env.VITE_USED_COMPONENTS_IFrame",
        "import.meta.env.VITE_USED_COMPONENTS_Image": "import.meta.env.VITE_USED_COMPONENTS_Image",
        "import.meta.env.VITE_USED_COMPONENTS_Items": "import.meta.env.VITE_USED_COMPONENTS_Items",
        "import.meta.env.VITE_USED_COMPONENTS_Link": "import.meta.env.VITE_USED_COMPONENTS_Link",
        "import.meta.env.VITE_USED_COMPONENTS_List": "import.meta.env.VITE_USED_COMPONENTS_List",
        "import.meta.env.VITE_USED_COMPONENTS_Logo": "import.meta.env.VITE_USED_COMPONENTS_Logo",
        "import.meta.env.VITE_USED_COMPONENTS_Markdown":
          "import.meta.env.VITE_USED_COMPONENTS_Markdown",
        "import.meta.env.VITE_USED_COMPONENTS_MessageListener":
          "import.meta.env.VITE_USED_COMPONENTS_MessageListener",
        "import.meta.env.VITE_USED_COMPONENTS_ModalDialog":
          "import.meta.env.VITE_USED_COMPONENTS_ModalDialog",
        "import.meta.env.VITE_USED_COMPONENTS_NavGroup":
          "import.meta.env.VITE_USED_COMPONENTS_NavGroup",
        "import.meta.env.VITE_USED_COMPONENTS_NavLink":
          "import.meta.env.VITE_USED_COMPONENTS_NavLink",
        "import.meta.env.VITE_USED_COMPONENTS_NavPanel":
          "import.meta.env.VITE_USED_COMPONENTS_NavPanel",
        "import.meta.env.VITE_USED_COMPONENTS_NoResult":
          "import.meta.env.VITE_USED_COMPONENTS_NoResult",
        "import.meta.env.VITE_USED_COMPONENTS_Option":
          "import.meta.env.VITE_USED_COMPONENTS_Option",
        "import.meta.env.VITE_USED_COMPONENTS_Pagination":
          "import.meta.env.VITE_USED_COMPONENTS_Pagination",
        "import.meta.env.VITE_USED_COMPONENTS_Pages": "import.meta.env.VITE_USED_COMPONENTS_Pages",
        "import.meta.env.VITE_USED_COMPONENTS_Pdf": "import.meta.env.VITE_USED_COMPONENTS_Pdf",
        "import.meta.env.VITE_USED_COMPONENTS_Redirect":
          "import.meta.env.VITE_USED_COMPONENTS_Redirect",
        "import.meta.env.VITE_USED_COMPONENTS_ResponsiveBar":
          "import.meta.env.VITE_USED_COMPONENTS_ResponsiveBar",
        "import.meta.env.VITE_USED_COMPONENTS_ScrollViewer":
          "import.meta.env.VITE_USED_COMPONENTS_ScrollViewer",
        "import.meta.env.VITE_USED_COMPONENTS_SelectionStore":
          "import.meta.env.VITE_USED_COMPONENTS_SelectionStore",
        "import.meta.env.VITE_USED_COMPONENTS_SimpleTooltip":
          "import.meta.env.VITE_USED_COMPONENTS_SimpleTooltip",
        "import.meta.env.VITE_USED_COMPONENTS_SpaceFiller":
          "import.meta.env.VITE_USED_COMPONENTS_SpaceFiller",
        "import.meta.env.VITE_USED_COMPONENTS_Stack": "import.meta.env.VITE_USED_COMPONENTS_Stack",
        "import.meta.env.VITE_USED_COMPONENTS_Step": "import.meta.env.VITE_USED_COMPONENTS_Step",
        "import.meta.env.VITE_USED_COMPONENTS_StepperForm":
          "import.meta.env.VITE_USED_COMPONENTS_StepperForm",
        "import.meta.env.VITE_USED_COMPONENTS_StickyBox":
          "import.meta.env.VITE_USED_COMPONENTS_StickyBox",
        "import.meta.env.VITE_USED_COMPONENTS_StickySection":
          "import.meta.env.VITE_USED_COMPONENTS_StickySection",
        "import.meta.env.VITE_USED_COMPONENTS_Switch":
          "import.meta.env.VITE_USED_COMPONENTS_Switch",
        "import.meta.env.VITE_USED_COMPONENTS_Table": "import.meta.env.VITE_USED_COMPONENTS_Table",
        "import.meta.env.VITE_USED_COMPONENTS_TableEditor":
          "import.meta.env.VITE_USED_COMPONENTS_TableEditor",
        "import.meta.env.VITE_USED_COMPONENTS_TabItem":
          "import.meta.env.VITE_USED_COMPONENTS_TabItem",
        "import.meta.env.VITE_USED_COMPONENTS_TabsForm":
          "import.meta.env.VITE_USED_COMPONENTS_TabsForm",
        "import.meta.env.VITE_USED_COMPONENTS_Textarea":
          "import.meta.env.VITE_USED_COMPONENTS_Textarea",
        "import.meta.env.VITE_USED_COMPONENTS_Text": "import.meta.env.VITE_USED_COMPONENTS_Text",
        "import.meta.env.VITE_USED_COMPONENTS_TileGrid":
          "import.meta.env.VITE_USED_COMPONENTS_TileGrid",
        "import.meta.env.VITE_USED_COMPONENTS_Tree": "import.meta.env.VITE_USED_COMPONENTS_Tree",
        "import.meta.env.VITE_USED_COMPONENTS_TreeDisplay":
          "import.meta.env.VITE_USED_COMPONENTS_TreeDisplay",
        "import.meta.env.VITE_USED_COMPONENTS_XmluiCodeHightlighter":
          "import.meta.env.VITE_USED_COMPONENTS_XmluiCodeHightlighter",
      };
    }
  }

  let plugins: PluginOption[] = [];
  if (mode === "metadata") {
    plugins = [ViteXmlui()];
  } else if (mode === "inspector-parser") {
    plugins = [dts({ rollupTypes: true }) as Plugin];
  } else {
    plugins = [
      react(),
      svgr(),
      ViteYaml(),
      ViteXmlui({}),
      libInjectCss(),
      dts({ rollupTypes: true }),
    ] as Plugin[];
  }

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
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["global-builtin", "import", "new-global"],
        },
      },
    },
    build: {
      minify: true,
      emptyOutDir: true,
      outDir: `dist/${distSubDirName}`,
      lib,
      sourcemap: true,
      rolldownOptions: {
        treeshake: mode === "metadata" ? { moduleSideEffects: false } : undefined,
        external:
          mode === "standalone" || mode === "inspector-parser"
            ? [] // Bundle everything for standalone builds
            : mode === "metadata"
              ? // immer must be bundled (not external) in metadata mode: rolldown's CJS interop
                // incorrectly wraps __esModule:true packages with a default=module object, so
                // calling produce() via w.default() fails at Node.js load time.
                [
                  ...Object.keys(packageJson.dependencies).filter((d) => d !== "immer"),
                  "react/jsx-runtime",
                  "@playwright/test",
                ]
              : [
                  ...Object.keys(packageJson.dependencies),
                  "react/jsx-runtime",
                  "react-dom/client",
                  "@playwright/test",
                ],
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
