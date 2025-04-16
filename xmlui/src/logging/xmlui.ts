import { loggerService } from "./LoggerService";

export const xmlui = {
  log: (...args: any[]) => {
    loggerService.log(args);
  },
  warn: (...args: any[]) => {
    loggerService.warn(args);
  },
  info: (...args: any[]) => {
    loggerService.info(args);
  },
  error: (...args: any[]) => {
    loggerService.error(args);
  },
  trace: (...args: any[]) => {
    loggerService.trace(args);
  },
};
