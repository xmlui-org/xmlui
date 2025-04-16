import { useLogger } from "./LoggerContext";
import { useEffect } from "react";
import { loggerService } from "./LoggerService";

export const LoggerInitializer = () => {
  const { addLog } = useLogger();

  useEffect(() => {
    loggerService.registerCallback(addLog);
  }, [addLog]);

  return null;
};
