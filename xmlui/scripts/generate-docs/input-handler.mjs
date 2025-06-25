import { readFile } from "fs/promises";
import { ErrorWithSeverity, LOGGER_LEVELS } from "./logger.mjs";
import { ERROR_MESSAGES } from "./constants.mjs";
import { configManager } from "./configuration-management.mjs";

// Backward compatibility wrapper - delegates to enhanced configuration manager
export default async function loadConfig(configPath) {
  return await configManager.loadConfig(configPath, null, {
    transform: (rawConfig) => {
      const { excludeComponentStatuses, ...data } = rawConfig;
      return {
        excludeComponentStatuses: excludeComponentStatuses?.map(status => status.toLowerCase()) || [],
        ...data,
      };
    }
  });
}
