import { createLogger, type CSSOptions, type Logger } from "vite";

export const xmluiCssOptions: CSSOptions = {
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

function shouldSuppressWarning(message: string): boolean {
  return (
    message.includes("[INVALID_ANNOTATION]") &&
    message.includes("react-helmet-async") &&
    message.includes("/*#__PURE__*/")
  );
}
