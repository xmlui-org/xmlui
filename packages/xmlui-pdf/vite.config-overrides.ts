import { createLogger } from "vite";
import type { Plugin, UserConfig, LogLevel } from "vite";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create custom logger that filters out "use client" warnings
const logger = createLogger();
const originalWarn = logger.warn;

logger.warn = (msg, options) => {
  // Suppress "use client" directive warnings
  if (
    msg.includes('Module level directives cause errors when bundled') &&
    msg.includes('"use client"')
  ) {
    return;
  }
  originalWarn(msg, options);
};

// Plugin to also suppress at Rollup level
const suppressUseClientWarnings = (): Plugin => ({
  name: "suppress-use-client-warnings",
  enforce: "post",
  configResolved(config) {
    const originalOnwarn = config.build.rollupOptions.onwarn;
    config.build.rollupOptions.onwarn = (warning, warn) => {
      // Suppress "use client" directive warnings
      if (
        warning.code === "MODULE_LEVEL_DIRECTIVE" &&
        warning.message?.includes('"use client"')
      ) {
        return;
      }
      if (originalOnwarn) {
        if (typeof originalOnwarn === 'function') {
          originalOnwarn(warning, warn);
        }
      } else {
        warn(warning);
      }
    };
  },
});

// Plugin to copy PDF.js WASM files to dist
const copyPdfjsWasmFiles = (): Plugin => ({
  name: "copy-pdfjs-wasm",
  closeBundle() {
    try {
      const distDir = resolve(__dirname, "dist");
      const wasmDir = resolve(distDir, "wasm");
      
      // Create wasm directory
      mkdirSync(wasmDir, { recursive: true });
      
      // Try both local node_modules and workspace root node_modules (for monorepos)
      const possibleWasmPaths = [
        resolve(__dirname, "node_modules/pdfjs-dist/wasm"),
        resolve(__dirname, "../..", "node_modules/pdfjs-dist/wasm"),
      ];
      
      const possibleDecoderPaths = [
        resolve(__dirname, "node_modules/pdfjs-dist/image_decoders"),
        resolve(__dirname, "../..", "node_modules/pdfjs-dist/image_decoders"),
      ];
      
      const pdfjsWasmPath = possibleWasmPaths.find(p => existsSync(p));
      const pdfjsDecoderPath = possibleDecoderPaths.find(p => existsSync(p));
      
      if (!pdfjsWasmPath) {
        console.warn("⚠ Warning: Could not find pdfjs-dist/wasm directory");
        return;
      }
      
      // Copy WASM files
      copyFileSync(resolve(pdfjsWasmPath, "openjpeg.wasm"), resolve(wasmDir, "openjpeg.wasm"));
      copyFileSync(resolve(pdfjsWasmPath, "qcms_bg.wasm"), resolve(wasmDir, "qcms_bg.wasm"));
      
      // Copy image decoder JS modules
      if (pdfjsDecoderPath) {
        const decoderFile = "pdf.image_decoders.min.mjs";
        const decoderSrc = resolve(pdfjsDecoderPath, decoderFile);
        if (existsSync(decoderSrc)) {
          copyFileSync(decoderSrc, resolve(wasmDir, decoderFile));
        }
      }
      
      console.log("✓ PDF.js WASM and decoder files copied to dist/wasm");
    } catch (error) {
      console.warn("Warning: Could not copy PDF.js files:", error);
    }
  },
});

const config: UserConfig = {
  customLogger: logger,
  plugins: [suppressUseClientWarnings(), copyPdfjsWasmFiles()],
};

export default config;
