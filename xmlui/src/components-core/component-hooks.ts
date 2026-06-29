import { useMemo } from "react";

import styles from "../components/Stack/Stack.module.scss";
import { capitalizeFirstLetter } from "./utils/misc";

export function useContentAlignment(orientation: string, horizontal?: string, vertical?: string) {
  return useMemo(() => {
    return orientation === "horizontal"
      ? {
          horizontal: horizontal && styles[`justifyItems${capitalizeFirstLetter(horizontal)}`],
          vertical: vertical && styles[`alignItems${capitalizeFirstLetter(vertical)}`],
        }
      : {
          horizontal: horizontal && styles[`alignItems${capitalizeFirstLetter(horizontal)}`],
          vertical: vertical && styles[`justifyItems${capitalizeFirstLetter(vertical)}`],
        };
  }, [orientation, horizontal, vertical]);
}
