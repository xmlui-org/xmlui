type LoggerCallback = (args: any[]) => void;

class LoggerService {
  private static instance: LoggerService;
  private callback?: LoggerCallback;
  private isDev: boolean;

  private constructor() {
    this.isDev = process.env.NODE_ENV === "development" || !!process.env.VITE_DEV_MODE;
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public registerCallback(callback: LoggerCallback) {
    if (this.isDev) {
      this.callback = callback;
    }
  }

  public log(args: any[]) {
    if (!this.isDev) return;
    console.log("[xmlui.log]", ...args);
    if (this.callback) {
      this.callback(args);
    }
  }

  public warn(args: any[]) {
    if (!this.isDev) return;
    console.warn("[xmlui.warn]", ...args);
    if (this.callback) {
      this.callback(args);
    }
  }

  public info(args: any[]) {
    if (!this.isDev) return;
    console.info("[xmlui.info]", ...args);
    if (this.callback) {
      this.callback(args);
    }
  }

  public error(args: any[]) {
    if (!this.isDev) return;
    console.error("[xmlui.error]", ...args);
    if (this.callback) {
      this.callback(args);
    }
  }

  public trace(args: any[]) {
    if (!this.isDev) return;
    console.trace("[xmlui.trace]", ...args);
    if (this.callback) {
      this.callback(args);
    }
  }
}

export const loggerService = LoggerService.getInstance();
