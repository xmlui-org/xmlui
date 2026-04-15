import { logger, LOGGER_LEVELS } from "./logger.mjs";

logger.setLevels(LOGGER_LEVELS.warning, LOGGER_LEVELS.error);
logger.info("Generating summary files...");
logger.info("Nothing to generate.");

