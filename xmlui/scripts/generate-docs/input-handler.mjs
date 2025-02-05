import { readFile } from "fs/promises";
import { ErrorWithSeverity } from "./utils.mjs";
import { LOGGER_LEVELS } from "./logger.mjs";

export default async function loadConfig(configPath) {
  if (!configPath) {
    throw new ErrorWithSeverity("No config path provided", LOGGER_LEVELS.error);
  }
  const fileContents = await readFile(configPath, "utf8");
  const { excludeComponentStatuses, ...data } = JSON.parse(fileContents);
  return {
    excludeComponentStatuses: excludeComponentStatuses.map((status) => status.toLowerCase()),
    ...data,
  };
}
