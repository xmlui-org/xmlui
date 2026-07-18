import { createServer, type Plugin, type ViteDevServer } from "vite";
import type { XmluiComponentContract } from "../compiler/contracts/types";
import type { compileXmluiModuleWithSourceMap } from "../compiler/compileXmluiModule";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { rawScssModulePlugin } from "./rawScssModulePlugin";
import { svgReactPlugin } from "./svgReactPlugin";
import { styleToJsInteropPlugin, xmluiCssOptions, xmluiEnvironmentCssPlugin } from "../../vite.shared";

const XMLUI_RE = /\.xmlui$/;
const compilerModulePath = fileURLToPath(new URL("../compiler/compileXmluiModule.ts", import.meta.url));
const cssStubVirtualPrefix = "\0xmlui-build-compiler-css-stub:";

type CompilerModule = {
  compileXmluiModuleWithSourceMap: typeof compileXmluiModuleWithSourceMap;
};

export type XmluiPluginOptions = {
  extensions?: Iterable<any>;
  extensionComponents?: Iterable<XmluiComponentContract>;
};

export function xmluiPlugin(options: XmluiPluginOptions = {}): Plugin {
  let devServer: ViteDevServer | undefined;
  let buildCompilerServer: ViteDevServer | undefined;
  let buildCompilerModulePromise: Promise<CompilerModule> | undefined;

  async function loadCompilerModule(): Promise<CompilerModule> {
    if (devServer) {
      return devServer.ssrLoadModule(compilerModulePath) as Promise<CompilerModule>;
    }
    if (!buildCompilerModulePromise) {
      buildCompilerModulePromise = loadBuildCompilerModule();
    }
    return buildCompilerModulePromise;
  }

  async function loadBuildCompilerModule(): Promise<CompilerModule> {
    buildCompilerServer = await createServer({
      configFile: false,
      envFile: false,
      appType: "custom",
      logLevel: "silent",
      resolve: {
        alias: {
          "attr-accept": path.resolve("src/compat/attrAccept.ts"),
          papaparse: path.resolve("src/compat/papaParse.ts"),
          "react-qr-code": path.resolve("src/compat/reactQrCode.tsx"),
          "style-to-js": path.resolve("src/compat/styleToJs.ts"),
        },
      },
      css: xmluiCssOptions,
      environments: {
        ssr: {
          css: xmluiCssOptions,
        },
      },
      plugins: [
        xmluiEnvironmentCssPlugin(),
        styleToJsInteropPlugin(),
        rawScssModulePlugin(),
        svgReactPlugin(),
        buildCompilerCssStubPlugin(),
      ],
    });
    return buildCompilerServer.ssrLoadModule(compilerModulePath) as Promise<CompilerModule>;
  }

  return {
    name: "xmlui-rs:xmlui",
    enforce: "pre",
    configureServer(server) {
      devServer = server;
    },
    handleHotUpdate(ctx) {
      if (!isCompilerSource(ctx.file)) {
        return;
      }
      for (const module of ctx.server.moduleGraph.idToModuleMap.values()) {
        if (module.file && XMLUI_RE.test(module.file)) {
          ctx.server.moduleGraph.invalidateModule(module);
        }
      }
      ctx.server.ws.send({ type: "full-reload" });
      return [];
    },
    async buildEnd() {
      await buildCompilerServer?.close();
      buildCompilerServer = undefined;
      buildCompilerModulePromise = undefined;
    },
    async transform(source, id) {
      if (!XMLUI_RE.test(id)) {
        return null;
      }
      if (isPackageXmlui(id)) {
        if (/^\s*export\s+default\s+/.test(source)) {
          return null;
        }
        return {
          code: `export default ${JSON.stringify(source)};`,
          map: null,
        };
      }

      const { compileXmluiModuleWithSourceMap } = await loadCompilerModule();
      const compiled = compileXmluiModuleWithSourceMap({
        id,
        source,
        extensions: options.extensions as any,
        extensionComponents: options.extensionComponents,
      });
      return {
        code: compiled.code,
        map: compiled.map,
      };
    },
  };
}

function isPackageXmlui(id: string): boolean {
  const normalized = id.replaceAll("\\", "/");
  return normalized.includes("/packages/") || normalized.includes("/node_modules/");
}

function isCompilerSource(file: string): boolean {
  return file.replaceAll("\\", "/").includes("/src/compiler/");
}

function buildCompilerCssStubPlugin(): Plugin {
  return {
    name: "xmlui-rs:build-compiler-css-stub",
    enforce: "pre",
    resolveId(source, importer) {
      const [filename, query = ""] = source.split("?");
      if (!isStubbedCss(filename, query)) {
        return null;
      }
      const basedir = importer ? path.dirname(importer) : process.cwd();
      const resolved = path.resolve(basedir, filename);
      return `${cssStubVirtualPrefix}${Buffer.from(resolved).toString("base64url")}`;
    },
    load(id) {
      if (id.startsWith(cssStubVirtualPrefix)) {
        const filename = Buffer.from(id.slice(cssStubVirtualPrefix.length), "base64url").toString("utf8");
        return cssStubForFilename(filename);
      }
      const stub = cssStubForId(id);
      return stub;
    },
    transform(_source, id) {
      const stub = cssStubForId(id);
      return stub ? { code: stub, map: null } : null;
    },
  };
}

function cssStubForId(id: string): string | null {
  const [filename, query = ""] = id.split("?");
  if (!isStubbedCss(filename, query)) {
    return null;
  }
  return cssStubForFilename(filename);
}

function isStubbedCss(filename: string, query = ""): boolean {
  if (query.split("&").includes("xmlui-theme-vars") || query.split("&").includes("xmlui-css-module")) {
    return false;
  }
  return filename.endsWith(".module.scss") ||
    filename.endsWith(".module.css") ||
    filename.endsWith(".scss") ||
    filename.endsWith(".css");
}

function cssStubForFilename(filename: string): string {
  if (filename.endsWith(".module.scss") || filename.endsWith(".module.css")) {
    return "export default {};";
  }
  return "export default undefined;";
}
