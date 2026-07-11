import { createHash } from "node:crypto";
import path from "node:path";
import { createLogger, type CSSOptions, type Logger, type Plugin } from "vite";

export const xmluiCssOptions: CSSOptions = {
  modules: {
    generateScopedName(name, filename) {
      return shouldExposeLocalCssModuleName(filename) ? name : scopedCssModuleName(name, filename);
    },
  },
  preprocessorOptions: {
    scss: {
      silenceDeprecations: ["if-function"],
    },
  },
};

export function createXmluiLogger(): Logger {
  const logger = createLogger();
  const warn = logger.warn.bind(logger);
  const warnOnce = logger.warnOnce.bind(logger);

  logger.warn = (message, options) => {
    if (shouldSuppressWarning(message)) {
      return;
    }
    warn(message, options);
  };

  logger.warnOnce = (message, options) => {
    if (shouldSuppressWarning(message)) {
      return;
    }
    warnOnce(message, options);
  };

  return logger;
}

export function styleToJsInteropPlugin(compatPath = path.resolve("src/compat/styleToJs.ts")): Plugin {
  return {
    name: "xmlui-rs:style-to-js-interop",
    enforce: "pre",
    resolveId(id) {
      return id === "xmlui:style-to-js" ? compatPath : null;
    },
    transform(source, id) {
      if (!id.includes("hast-util-to-jsx-runtime/lib/index.js")) {
        return null;
      }
      return source.replace(/from\s+["']style-to-js["']/g, 'from "xmlui:style-to-js"');
    },
  };
}

function shouldExposeLocalCssModuleName(filename: string): boolean {
  const basename = path.basename(filename);
  return basename === "ExpandableItem.module.scss" ||
    basename === "FileUploadDropZone.module.scss";
}

function scopedCssModuleName(name: string, filename: string): string {
  const basename = path.basename(filename).replace(/\.module\.(scss|css)$/, "");
  const scope = createHash("sha1").update(filename).digest("base64url").slice(0, 6);
  return `_${basename}_${name}_${scope}`;
}

function shouldSuppressWarning(message: string): boolean {
  return (
    message.includes("[INVALID_ANNOTATION]") &&
    message.includes("react-helmet-async") &&
    message.includes("/*#__PURE__*/")
  );
}
