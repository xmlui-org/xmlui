import { readFile } from "fs/promises";
import { ErrorWithSeverity, LOGGER_LEVELS } from "./logger.mjs";
import { ERROR_MESSAGES } from "./constants.mjs";

export default async function loadConfig(configPath) {
  if (!configPath) {
    throw new ErrorWithSeverity(ERROR_MESSAGES.NO_CONFIG_PATH, LOGGER_LEVELS.error);
  }
  
  try {
    const fileContents = await readFile(configPath, "utf8");
    const { excludeComponentStatuses, ...data } = JSON.parse(fileContents);
    return {
      excludeComponentStatuses: excludeComponentStatuses.map((status) => status.toLowerCase()),
      ...data,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new ErrorWithSeverity(`Configuration file not found: ${configPath}`, LOGGER_LEVELS.error);
    } else if (error instanceof SyntaxError) {
      throw new ErrorWithSeverity(`Invalid JSON in configuration file: ${configPath}`, LOGGER_LEVELS.error);
    } else {
      throw new ErrorWithSeverity(`${ERROR_MESSAGES.CONFIG_VALIDATION_ERROR}: ${error.message}`, LOGGER_LEVELS.error);
    }
  }
}
