import { createLogger } from "vite";
import type { Plugin, UserConfig, LogLevel } from "vite";

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

const config: UserConfig = {
  customLogger: logger,
  plugins: [suppressUseClientWarnings()],
};

export default config;
