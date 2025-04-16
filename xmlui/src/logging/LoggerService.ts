type LoggerCallback = (message: string) => void;

class LoggerService {
  private static instance: LoggerService;
  private callback?: LoggerCallback;

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public registerCallback(callback: LoggerCallback) {
    this.callback = callback;
  }

  public log(message: string) {
    console.log("[xmlui.log]", message);
    if (this.callback) {
      this.callback(message);
    }
  }

  public warn(message: string) {
    console.warn("[xmlui.warn]", message);
    if (this.callback) {
      this.callback(message);
    }
  }

  public info(message: string) {
    console.info("[xmlui.info]", message);
    if (this.callback) {
      this.callback(message);
    }
  }

  public error(message: string) {
    console.error("[xmlui.error]", message);
    if (this.callback) {
      this.callback(message);
    }
  }
}

export const loggerService = LoggerService.getInstance();
