import { loggerService } from "./LoggerService";

export const xmlui = {
  log: (msg: string) => {
    loggerService.log(msg);
  },
  warn: (msg: string) => {
    loggerService.warn(msg);
  },
  info: (msg: string) => {
    loggerService.info(msg);
  },
  error: (msg: string) => {
    loggerService.error(msg);
  },
};
