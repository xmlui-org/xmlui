/**
 * Logger class.
 * - severity indicates message importance
 * - levels control what messages will be logged
 */
export class Logger {
  // TODO: make class a singleton
  
  static severity = {
    info: "info",
    warning: "warning",
    error: "error",
  };

  constructor(...levels) {
    this.setLevels(...levels);
  }

  isValidSeverity(severity) {
    return Object.keys(Logger.severity).includes(severity);
  }

  static levels = {
    ...Logger.severity,
    all: "all",
    none: "none",
  };

  isValidLevel(level) {
    return Object.keys(Logger.levels).includes(level);
  }

  defaultSeverity = Logger.severity.error;
  defaultLogLevel = Logger.levels.all;

  setLevels(...levels) {
    levels = Array.from(new Set(levels));
    let validLevels = levels.filter((level) => this.isValidLevel(level));
    if (validLevels.length === 0) {
      this._logError(
        `No valid log levels provided. Using defaults: ${this.defaultLogLevel}.`
      );
      validLevels = [this.defaultLogLevel];
    }

    this.info = this._noop;
    this.warning = this._noop;
    this.error = this._noop;

    if (validLevels.find((level) => level === Logger.levels.none)) {
      return;
    }
    if (validLevels.find((level) => level === Logger.levels.all)) {
      this.info = this._logInfo;
      this.warning = this._logWarning;
      this.error = this._logError;
      return;
    }
    for (const level of validLevels) {
      this[level] = this[`_log${level.charAt(0).toUpperCase() + level.slice(1)}`];
    }
  }

  log(severity = Logger.severity.info, ...args) {
    if (!this.isValidSeverity(severity)) {
      this.warning(
        `Invalid log severity: ${severity}. Defaulting to message severity: ${this.defaultSeverity}.`
      );
      severity = this.defaultSeverity;
    }
    if (severity === Logger.severity.info) {
      this.info(...args);
    } else if (severity === Logger.severity.warning) {
      this.warning(...args);
    } else if (severity === Logger.severity.error) {
      this.error(...args);
    }
  }

  info(...args) {}
  warning(...args) {}
  error(...args) {}

  _logInfo(...args) {
    console.log("[INFO]", ...args);
  }

  _logWarning(...args) {
    console.log("[WARN]", ...args);
  }

  _logError(...args) {
    console.error("[ERR]", ...args);
  }

  _noop(...args) {}
}
// --- Usable logger instance
export const logger = new Logger(Logger.levels.all);

export class ErrorWithSeverity extends Error {
  constructor(message, severity = Logger.severity.error) {
    super(message);
    this.name = "ErrorWithSeverity";
    this.severity = severity;
  }
}
